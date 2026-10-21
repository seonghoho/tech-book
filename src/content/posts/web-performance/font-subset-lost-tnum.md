---
title: "폰트 서브셋을 만들었더니 tabular-nums가 조용히 꺼진 이유"
date: "2026-11-04"
description: "Pretendard를 pyftsubset으로 서브셋해 폰트 전송량을 86% 줄였는데, 숫자 자릿수를 맞추던 font-variant-numeric: tabular-nums가 앱 전체에서 효과가 없어졌습니다. --layout-features가 기본 기능 목록을 대체하면서 tnum이 빠진 것이었습니다. 원인과 수정, 다시 놓치지 않게 넓힌 검증을 정리했습니다."
tags: ["Performance", "Web Font", "Pretendard", "pyftsubset", "CSS"]
draft: true
---

# 폰트 서브셋을 만들었더니 tabular-nums가 조용히 꺼진 이유

[앞선 글](/posts/web-performance/pretendard-dynamic-subset-lcp)에서는 이 블로그의 Pretendard를 공식 dynamic subset으로 바꾼 과정을 적었습니다. 사이드 프로젝트에서는 다른 방식을 골랐는데, 그 과정에서 눈에 잘 띄지 않는 문제를 하나 겪었습니다.

## 서브셋을 직접 만든 이유

사이드 프로젝트의 홈 화면을 점검해 보니 폰트가 전체 전송량의 88%를 차지하고 있었습니다(3,481KB 중 3,049KB). 굵기별 전체 글리프 파일을 받고 있어서, 이 블로그와 같은 상황이었습니다.

이 프로젝트는 `next/font`로 폰트 파일을 미리 불러오는(preload) 구조였습니다. 글꼴, 굵기 구성, 불러오는 방식은 그대로 두고 파일만 바꾸기로 해서, 자주 쓰는 글자만 남긴 서브셋 파일 하나를 직접 만들었습니다.

- **글자 범위:** KS X 1001 완성형 한글 2,350자, 호환 자모 51자, 기본 라틴 95자, 추가 기호 70자를 합친 2,566자
- **파일 형식:** 굵기별 정적 파일 4개로 서브셋하면 합계 673.5KiB라 목표(500KB)를 넘었습니다. 굵기 축을 가진 가변 폰트 파일 하나로 서브셋하니 428.6KiB였습니다.
- **도구:** fontTools의 `pyftsubset`

결과는 기대한 대로였습니다. 폰트 전송량이 3,048KiB에서 약 429KiB로 86% 줄었고, CLS는 그대로 0이었습니다. 화면에 보이는 것이 하나도 바뀌지 않는 것을 성공 조건으로 두었고, 첫 검증에서는 통과한 것으로 보였습니다.

## 리뷰에서 찾은 tnum 유실

서브셋을 넣은 뒤 리뷰에서, 만들어진 폰트 파일에 `tnum` 기능이 없다는 것을 찾았습니다. 영향을 받는 곳은 추천 비교표, 비용 내역, 랭킹 막대의 라벨, 손익분기 차트처럼 숫자를 세로로 맞춰 읽어야 하는 화면들이었습니다.

이 화면들은 모두 숫자에 `font-variant-numeric: tabular-nums`를 걸어 두었습니다. 이 속성은 폰트의 `tnum` 기능을 켜서 숫자를 모두 같은 폭의 글리프로 바꿉니다. 그래야 `1,111`과 `4,444`가 같은 너비가 되어 표에서 자릿수가 맞습니다. 프로젝트 전체에서 이 속성을 쓰는 곳은 소스 파일 29개에 45곳, 그리고 전역 유틸 클래스 몇 개였습니다.

Pretendard의 기본 숫자는 폭이 제각각인 비례폭 숫자입니다. 폰트 단위로 `1`은 898, `4`는 1278로 42% 차이가 납니다. `tnum`이 꺼지면 이 차이가 그대로 화면에 나옵니다.

## 원인: --layout-features는 기본 목록을 대체한다

서브셋 스크립트는 이렇게 되어 있었습니다.

```sh
pyftsubset PretendardVariable.ttf \
  --text-file=charset.txt \
  --layout-features='kern,liga,calt,ccmp,locl,mark,mkmk' \
  --flavor=woff2 \
  --output-file=PretendardVariable.subset.woff2
```

`--layout-features`를 쓴 이유는 자간(`kern`)을 확실히 남기기 위해서였습니다. 자간이 빠지면 화면이 달라지니까요. 이때 `--layout-features`가 기본 목록에 **추가**하는 옵션이라고 생각했는데, 실제로는 기본 목록을 **대체**합니다. 목록에 적지 않은 기능은 모두 빠집니다. `tnum`은 목록에 없었고, 그대로 사라졌습니다.

만들어진 파일을 확인해 보니 글자를 바꾸는 기능(GSUB) 중에 `calt`, `locl` 두 개만 남아 있었습니다. `font-variant-numeric: tabular-nums`는 폰트에 `tnum`이 없으면 아무 일도 하지 않습니다. 오류도 경고도 없어서 앱 전체에서 조용히 효과가 없어졌습니다.

## 수정

목록에 `tnum`을 넣어 다시 만들었습니다.

```sh
--layout-features='kern,liga,calt,ccmp,locl,mark,mkmk,tnum'
```

숫자 10글자의 균일폭 글리프가 추가되는 것이라 파일은 438,888B에서 439,188B로 300B(0.07%) 늘었습니다. 글자 수, 굵기 축, 줄 높이 같은 메트릭은 그대로라 CLS도 0 그대로였습니다.

스크립트에는 왜 이 목록을 다 적어야 하는지 주석을 남겼습니다.

```sh
# --layout-features 는 기본 세트를 대체한다. 목록에 없는 feature 는 통째로 사라지므로
# 화면이 쓰는 것을 전부 적어야 한다.
#   kern — 빼면 자간이 달라진다.
#   tnum — 빼면 tabular-nums 가 no-op 이 된다.
```

기본 목록을 유지한 채 하나만 더하고 싶다면 `--layout-features+=tnum`처럼 `+=`로 쓰는 방법도 있습니다.

## 검증을 넓힌 이유

처음 검증은 글자 수(cmap 2,566자)와 굵기 축(45~930)만 확인하고 있었습니다. 글자는 다 있었으니 통과했지만, 글자를 어떻게 바꾸는지는 보지 않았습니다. 이번 문제는 그 사이로 빠져나갔습니다.

그래서 서브셋을 만든 뒤 두 가지를 더 확인하도록 했습니다.

```python
# 1. 필요한 기능이 파일에 남아 있는가
gsub = {r.FeatureTag for r in font['GSUB'].table.FeatureList.FeatureRecord}
gpos = {r.FeatureTag for r in font['GPOS'].table.FeatureList.FeatureRecord}
for tag, table in (('tnum', gsub), ('calt', gsub), ('locl', gsub), ('kern', gpos)):
    assert tag in table, f'{tag} feature 가 사라졌다'

# 2. tnum 을 적용하면 숫자 10개의 폭이 실제로 하나가 되는가
tnum_map = {}
for record in font['GSUB'].table.FeatureList.FeatureRecord:
    if record.FeatureTag != 'tnum':
        continue
    for i in record.Feature.LookupListIndex:
        for sub in font['GSUB'].table.LookupList.Lookup[i].SubTable:
            tnum_map.update(getattr(sub, 'mapping', {}))

digits = [cmap[ord(d)] for d in '0123456789']
widths = {font['hmtx'][tnum_map.get(g, g)][0] for g in digits}
assert len(widths) == 1, f'tnum 을 적용해도 숫자 폭이 제각각이다: {widths}'
```

두 번째 검사까지 둔 이유는, 기능 이름이 목록에 있어도 실제 치환 규칙이 비어 있으면 같은 문제가 생기기 때문입니다. 수정 후 이 검사에서 숫자 폭은 1258 하나로 나왔습니다.

## 이 블로그는 괜찮았나

이 블로그는 Pretendard가 배포하는 dynamic subset을 그대로 쓰고 있어서, 같은 방식으로 확인해 봤습니다. 영문·숫자가 들어 있는 91번 조각에는 `tnum`을 포함해 `pnum`, `frac`, `zero` 같은 숫자 관련 기능이 모두 남아 있었습니다. 배포본은 서브셋할 때 기능을 그대로 유지한 것으로 보입니다.

직접 서브셋을 만들 때는 글자 범위만큼이나 어떤 OpenType 기능을 남길지가 화면에 영향을 줍니다. `--layout-features`를 쓴다면 화면에서 쓰는 기능을 빠짐없이 적고, 만든 파일에 그 기능이 남아 있는지 확인하는 단계를 같이 두는 것이 좋습니다.
