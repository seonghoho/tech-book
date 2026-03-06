# Site UI Refactor Notes

## Overview

이번 리팩터링은 기존 블로그/포트폴리오 구조를 유지하면서, 전반적인 UI를 더 차분하고 읽기 쉬운 방향으로 정리하는 데 초점을 두었다. 특정 레퍼런스 사이트를 복제하지 않고, 정보 위계, 여백, 타이포그래피 대비, 절제된 포인트 컬러 사용이라는 방향만 참고했다.

핵심 목표는 다음 네 가지였다.

- 전체 사이트에 일관된 시각 규칙을 부여한다.
- 다크 테마와 라이트 테마를 모두 안정적으로 지원한다.
- `/about` 및 프로젝트 상세 경험을 실제 포트폴리오 페이지 수준으로 끌어올린다.
- 블로그 읽기 경험과 목록 탐색 경험을 더 명확하게 만든다.

## What Changed

### 1. Theme Foundation

전역 색상과 표면 스타일을 CSS 변수 기반 토큰으로 재정리했다.

- 배경 계층: `--color-bg`, `--color-bg-muted`
- 표면 계층: `--color-surface`, `--color-surface-elevated`, `--color-surface-muted`
- 텍스트 계층: `--color-text-primary`, `--color-text-secondary`, `--color-text-muted`
- 경계선: `--color-border`, `--color-border-strong`
- 포인트 컬러: `--color-accent`, `--color-accent-hover`, `--color-accent-soft`
- 링크/코드: `--color-link`, `--color-code`

이 토큰은 `src/styles/globals.css`에 정의되어 있고, `:root`와 `html.dark`에 각각 라이트/다크 값이 들어 있다.

### 2. Shared UI Primitives

공통 레이아웃과 카드 스타일을 반복 클래스 대신 재사용 가능한 컴포넌트 클래스 형태로 정리했다.

- `page-shell`
- `page-stack`
- `surface-panel`
- `surface-panel-strong`
- `surface-subtle`
- `eyebrow-label`
- `section-title`
- `body-copy`
- `muted-copy`
- `button-primary`
- `button-secondary`
- `tag-chip`
- `input-shell`
- `nav-link`

이 클래스들은 섹션 간 간격, 카드 밀도, 버튼 톤, 입력창 포커스 상태를 일관되게 맞추는 기준 역할을 한다.

### 3. Light / Dark Theme

기존 다크 모드 중심 구조를 유지하되, 라이트 모드를 별도 스킨이 아니라 같은 디자인 언어의 반전 버전으로 구성했다.

- 다크 모드: 깊지만 완전히 검지 않은 배경, 낮은 채도의 표면 대비
- 라이트 모드: 차가운 흰색 대신 약간의 중성 톤을 섞은 밝은 배경
- `ThemeInitializer`에서 저장된 테마와 OS 선호 테마를 함께 처리
- `color-scheme`을 함께 설정해 브라우저 기본 UI와도 톤을 맞춤

## Refactored Areas

### Global Layout

- 헤더를 더 단정한 정보 구조로 정리
- 푸터를 단순 저작권 줄이 아니라 연락/탐색 영역으로 개선
- 메인 레이아웃과 사이드바 폭, 경계선, 배경 톤 정리
- 모바일 사이드바와 상단 네비게이션의 토큰 적용

### Home

홈을 단순 진입점이 아니라 포트폴리오와 글을 함께 소개하는 허브 페이지로 재구성했다.

- 소개 히어로
- 대표 프로젝트 하이라이트
- 최근 글 요약
- 카테고리/태그 탐색
- 연락 유도 섹션

### About

`/about`는 긴 자기소개 문단 대신 빠르게 스캔 가능한 프로필 페이지로 재구성했다.

- 인트로 / 프로필
- 핵심 강점
- 기술 스택
- 경험 타임라인
- 프로젝트 목록
- 성장 관점 / 협업 방식

콘텐츠는 `src/lib/aboutData.ts`에 중앙화되어 있어, UI 수정 없이도 데이터 확장이 가능하다.

### Project Details

프로젝트 상세는 확장성을 고려해 라우트 기반으로 구현했다.

- 목록: `/about`
- 상세: `/about/projects/[slug]`

현재 구조에서 라우트 방식은 다음 이유로 적합하다.

- 직접 URL 공유 가능
- 브라우저 뒤로가기 흐름이 자연스러움
- SEO 메타데이터를 프로젝트별로 분리 가능

또한 데이터 구조가 분리되어 있어서, 이후 필요하면 같은 데이터를 기반으로 모달 상세 뷰도 추가할 수 있다.

### Blog / Writing

글 목록과 글 상세 화면을 읽기 경험 중심으로 정리했다.

- 포스트 카드 간격과 메타데이터 정리
- 검색/필터 UI의 일관성 정리
- 본문 헤더와 이전/다음 글 내비게이션 개선
- `formatDate` 유틸로 날짜 포맷 일관화

## Files to Know

주요 변경 지점은 아래 파일들이다.

- `src/styles/globals.css`
- `tailwind.config.mjs`
- `src/components/common/Header.tsx`
- `src/components/common/Footer.tsx`
- `src/components/common/ThemeInitializer.tsx`
- `src/components/landing/LandingPage.tsx`
- `src/components/about/AboutPage.tsx`
- `src/components/about/ProjectCard.tsx`
- `src/components/about/ProjectDetailView.tsx`
- `src/lib/aboutData.ts`
- `src/components/posts/PostContent.tsx`
- `src/components/posts/PostListItem.tsx`
- `src/lib/formatDate.ts`

## Extension Points

이후 확장하기 좋은 지점은 아래와 같다.

- `/projects` 전용 라우트 추가
- 프로젝트 상세의 모달 버전 추가
- 홈에서 featured project 선택 로직 고도화
- theme token을 Tailwind plugin 또는 semantic utility로 추가 정리
- 프로젝트별 이미지/스크린샷 자산 연동
- contact 섹션에 폼 또는 외부 링크 확장

## Verification

기본 검증은 아래 기준으로 진행했다.

- `next build --webpack` 빌드 통과
- 로컬 개발 서버에서 `/`, `/about`, `/posts` 응답 확인
- `/about/projects/[slug]` 프로젝트 상세 라우트 정적 생성 확인

브라우저 단의 세밀한 시각 QA는 이후 실제 화면 확인을 거치며 추가 조정할 수 있다.
