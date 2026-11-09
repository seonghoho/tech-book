export type AppLink = {
  label: string;
  href: string;
  kind: "store" | "web";
};

export type AppDetailSection = {
  heading: string;
  paragraphs: string[];
  points?: string[];
};

export type AppScreenshot = {
  src: string;
  alt: string;
  orientation: "portrait" | "landscape";
};

export type PersonalApp = {
  slug: string;
  title: string;
  summary: string;
  statusLabel: string;
  inProgress?: boolean;
  thumbnail: {
    src: string;
    alt: string;
    fit?: "cover" | "contain";
  };
  links: AppLink[];
  detail: {
    intro: string;
    sections: AppDetailSection[];
    gallery: AppScreenshot[];
  };
};

function screenshots(
  slug: string,
  title: string,
  orientation: AppScreenshot["orientation"],
  files: string[],
): AppScreenshot[] {
  return files.map((file, index) => ({
    src: `/images/apps/${slug}/${file}`,
    alt: `${title} 화면 ${index + 1}`,
    orientation,
  }));
}

export const personalApps: PersonalApp[] = [
  {
    slug: "hankan",
    title: "한칸",
    summary:
      "하루에 한 칸씩, 손으로 그린 동그라미를 칠해 나가는 습관 체크입니다. 웹에서 쓰던 기록이 Android 앱과 그대로 이어지도록 동기화를 붙였습니다.",
    statusLabel: "Google Play 출시",
    thumbnail: { src: "/images/apps/hankan.png", alt: "한칸 대표 이미지" },
    links: [
      {
        label: "Google Play",
        href: "https://play.google.com/store/apps/details?id=com.seonghoho.hankan",
        kind: "store",
      },
      { label: "웹에서 보기", href: "https://hankan.seonghoho.com", kind: "web" },
    ],
    detail: {
      intro:
        "습관을 체크하는 앱은 많지만, 종이에 동그라미를 하나씩 칠하던 손맛을 화면에서 살리고 싶어 만들었습니다. 로그인 없이 기기 안에서 먼저 동작하고, 서버는 백업과 동기화에만 씁니다.",
      sections: [
        {
          heading: "만든 것",
          paragraphs: ["웹과 Android 앱을 한 저장소에서 함께 만들었습니다."],
          points: [
            "pnpm 모노레포: Next.js 정적 웹, Capacitor Android 앱, 순수 TypeScript 도메인 패키지",
            "Cloudflare Worker 하나가 정적 자산과 API를 함께 맡고, 데이터는 D1에 저장",
            "카카오·Google 로그인, 기기 간 동기화, 계정 삭제",
            "라이브러리 없이 직접 작성한 서비스 워커로 오프라인 지원",
            "Android 위젯, 매일 알림, 카카오톡 공유, 추천 판 20개",
          ],
        },
        {
          heading: "어려웠던 점",
          paragraphs: [
            "손그림 동그라미가 그릴 때마다 모양이 달라지는 문제가 있었습니다. Math.random을 쓰지 않고 판 ID와 칸 번호로 시드를 만들어, 같은 칸은 언제나 같은 모양으로 그려지게 했습니다.",
            "여러 기기를 동기화할 때는 지운 기록이 다른 기기에서 되살아나는 일이 생겼습니다. 삭제를 표시로 남기고, 기기 시계 대신 서버가 매기는 순번으로 동기화 위치를 잡아 해결했습니다.",
            "손글씨 한글 글꼴은 조각만 1.1MB가 넘어서 미리 담지 않고, 처음 쓰는 글자만 받아 캐시하도록 했습니다.",
          ],
        },
        {
          heading: "지금 상태",
          paragraphs: [
            "웹을 운영하고 있고, Android 1.0.3을 Google Play에 출시했습니다. 다음으로는 함께 칠하는 판을 준비하고 있습니다.",
          ],
        },
      ],
      gallery: screenshots("hankan", "한칸", "portrait", [
        "1-board.png",
        "2-paint.png",
        "3-calendar.png",
        "4-result.png",
        "5-widget.png",
        "6-list.png",
        "7-start.png",
      ]),
    },
  },
  {
    slug: "dotori",
    title: "다람쥐 퍼즐",
    summary:
      "다람쥐가 숲 곳곳에 도토리를 숨기는 손그림 논리 퍼즐입니다. 스타 배틀 규칙을 따르고, 답이 하나뿐인 판을 만드는 생성기와 풀이기를 직접 만들었습니다.",
    statusLabel: "Google Play 출시",
    thumbnail: { src: "/images/apps/dotori.png", alt: "다람쥐 퍼즐 대표 이미지" },
    links: [
      {
        label: "Google Play",
        href: "https://play.google.com/store/apps/details?id=com.seonghoho.dotori",
        kind: "store",
      },
      { label: "웹에서 플레이", href: "https://dotori.seonghoho.com", kind: "web" },
    ],
    detail: {
      intro:
        "가로줄, 세로줄, 색 구역마다 도토리를 하나씩 놓되 도토리끼리는 대각선으로도 닿으면 안 되는 퍼즐입니다. 레벨이 끝없이 이어지고, 목숨과 아이템, 주간 창고가 있습니다.",
      sections: [
        {
          heading: "만든 것",
          paragraphs: ["퍼즐을 손으로 만들지 않고, 코드로 계속 만들어 내는 구조를 짰습니다."],
          points: [
            "퍼즐 생성기와 사람이 쓰는 풀이 기법을 쉬운 순서로 적용하는 논리 풀이기. 같은 풀이기를 생성, 힌트, 안내에 함께 씁니다",
            "Web Worker에서 다음 두 판을 미리 만들어 대기 시간 없이 이어지게 했습니다",
            "Next.js 정적 웹과 Capacitor Android 앱, Cloudflare Worker 기반 계정 동기화",
            "AdMob 광고와 광고 제거 인앱결제",
            "Remotion으로 30초 미리보기와 매일 바뀌는 퀴즈 영상을 만드는 도구",
          ],
        },
        {
          heading: "어려웠던 점",
          paragraphs: [
            "무작위로 구역을 넓히면 답이 여러 개인 판이 나옵니다. 다른 답을 찾으면 그 답에 쓰인 칸을 이웃 구역으로 옮겨 깨뜨리고, 찍지 않고 논리만으로 끝까지 풀리지 않는 판은 버렸습니다. 풀 때 쓰인 가장 어려운 기법으로 난이도를 정합니다.",
            "아이폰 크롬에서 튜토리얼 뒤에 화면이 멈추는 문제가 있었습니다. 원격 디버깅으로 보니 http 접속이라 crypto.randomUUID가 없었습니다. 대체 생성 함수를 넣고, https로 옮기도록 설정을 바꿨습니다.",
            "느린 망에서는 로딩 화면에 갇히는 일이 있어, 저장에 시간 제한을 두고 첫 그림과 효과음을 받는 동안 진행률을 보여 주도록 바꿨습니다.",
          ],
        },
        {
          heading: "지금 상태",
          paragraphs: [
            "웹을 운영하고 있고, Android 1.0.4가 2026년 11월 Google Play 승인을 받아 공개됐습니다.",
          ],
        },
      ],
      gallery: screenshots("dotori", "다람쥐 퍼즐", "portrait", [
        "01.png",
        "02.png",
        "03.png",
        "04.png",
        "05.png",
        "06.png",
      ]),
    },
  },
  {
    slug: "space-cleanup",
    title: "궤도 청소대",
    summary:
      "정거장으로 날아오는 우주 쓰레기를 청소 위성으로 쪼개고 붙잡아 치우는 경로형 타워 디펜스입니다. 화면 없이 수십 판을 돌리는 시뮬레이터를 만들어 밸런스를 맞췄습니다.",
    statusLabel: "웹 운영 중 · Android 준비 중",
    thumbnail: { src: "/images/apps/space-cleanup.png", alt: "궤도 청소대 대표 이미지" },
    links: [{ label: "플레이하기", href: "https://space-defence.seonghoho.com", kind: "web" }],
    detail: {
      intro:
        "적을 쏘아 없애는 대신, 우주 잔해를 쪼개고 붙잡고 끌어당겨 치우는 타워 디펜스입니다. 쪼개진 조각이 다른 잔해와 부딪히면 연쇄 피해가 나서, 위성을 어디에 두느냐가 중요합니다.",
      sections: [
        {
          heading: "만든 것",
          paragraphs: ["TypeScript와 PixiJS로 게임을 만들고, 규칙 코드는 화면과 분리했습니다."],
          points: [
            "위성 8종, 잔해 14종, 보스 6종, 섹터 5개 × 맵 6개, 난이도 3단계",
            "캠페인, 격납고, 연구, 도감",
            "Node에서 화면 없이 판을 돌리는 시뮬레이터와 자동 플레이 봇, 리플레이 회귀 테스트",
            "Cloudflare Worker와 D1로 판 기록, 관리자 대시보드, 구글·카카오 로그인, 클라우드 저장",
            "보상형 광고(배너 없음)와 스토어 스크린샷 자동 생성 스크립트",
          ],
        },
        {
          heading: "어려웠던 점",
          paragraphs: [
            "규칙 코드는 1/30초 고정 간격으로 진행해서, 화면 프레임과 상관없이 같은 입력이면 같은 결과가 나오게 했습니다. 규칙이 바뀌면 리플레이 결과가 달라져 바로 알 수 있습니다.",
            "잔해가 많아지면 충돌 검사가 느려졌습니다. 공간을 격자로 나눠 가까운 잔해끼리만 검사하게 해서, 한 번 진행하는 시간을 0.86ms에서 0.4~0.6ms로 줄였습니다. 잔해 300개, 위성 30개에서도 60fps를 유지합니다.",
            "밸런스는 사람이 하기 전에 봇으로 먼저 맞췄습니다. 클리어율과 위성 기여도를 보며 조정했고, 작살이 움직이는 대상을 앞질러 겨누게 해 빗나감을 47%에서 17%로 줄였습니다.",
          ],
        },
        {
          heading: "지금 상태",
          paragraphs: [
            "웹을 운영하고 있습니다. Android 빌드를 마쳤고, Google Play 등록과 비공개 테스트를 앞두고 있습니다.",
          ],
        },
      ],
      gallery: screenshots("space-cleanup", "궤도 청소대", "landscape", [
        "1-title.png",
        "2-sectors.png",
        "3-battle.png",
        "4-boss.png",
        "5-hangar.png",
        "6-codex.png",
      ]),
    },
  },
  {
    slug: "view-racer",
    title: "View Racer",
    summary:
      "Three.js로 만든 타임어택 레이싱입니다. 하나의 3D 월드를 체이스·시네마틱·탑다운·1인칭 네 시점으로 바꿔 가며 달리고, 고스트와 순위, 챌린지 공유까지 붙였습니다.",
    statusLabel: "웹 운영 중",
    thumbnail: { src: "/images/apps/view-racer.png", alt: "View Racer 대표 이미지" },
    links: [{ label: "플레이하기", href: "https://view-racer.seonghoho.com", kind: "web" }],
    detail: {
      intro:
        "같은 트랙도 보는 시점이 바뀌면 전혀 다른 게임처럼 느껴진다는 데서 출발했습니다. 시점을 바꿔 가며 기록을 줄이는 타임어택과, 목표 없이 끝없이 달리는 힐링 드라이브 모드가 있습니다. 모바일 터치 조작도 지원합니다.",
      sections: [
        {
          heading: "만든 것",
          paragraphs: [
            "React Three Fiber를 쓰지 않고 TypeScript로 엔진을 직접 짰습니다. React는 화면에 붙이고 정리하는 역할만 맡습니다.",
          ],
          points: [
            "코드로 만든 로우폴리 차량 10종, 트랙 6종, 에셋 없이 합성한 엔진음",
            "Supabase 익명 인증으로 기간별 순위, 온라인 고스트, 구간별 격차 분석",
            "날짜로 정해지는 데일리 챌린지, 도전장 링크와 카카오 공유",
            "Playwright로 모바일 성능을 재는 도구와 기기 성능에 맞춰 품질을 낮추는 장치",
          ],
        },
        {
          heading: "어려웠던 점",
          paragraphs: [
            "급한 코너에서 벽이 접혀 차가 벽을 통과하는 문제가 있었습니다. 화면과 충돌 판정이 같은 계산을 쓰도록 벽 폭 계산을 하나로 모으고, 가장 가까운 지점을 트랙 전체가 아니라 진행 위치 주변에서만 찾게 바꿨습니다.",
            "끝없이 이어지는 도로에서는 메모리와 좌표 정밀도가 문제였습니다. 도로를 조각 단위로 재사용하고, 차가 멀리 가면 세계 원점을 옮기는 방식으로 해결했습니다.",
            "저가 휴대폰에서는 품질 단계마다 프레임 시간 목표를 정해 두고 측정했습니다. 빛 번짐 효과를 끄는 것만으로 GPU 시간이 46% 줄었습니다.",
          ],
        },
        {
          heading: "지금 상태",
          paragraphs: [
            "웹으로 운영하고 있습니다. 지금은 힐링 드라이브에 산길 지형을 더하는 작업을 하고 있습니다.",
          ],
        },
      ],
      gallery: [],
    },
  },
  {
    slug: "green-putt",
    title: "그린 퍼팅",
    summary:
      "새총처럼 당겨서 치는 2.5D 퍼팅 게임입니다. 전속 캐디와 함께 단계를 하나씩 넘어가며, '한 판 더'를 누르게 되는지 확인하려고 만들고 있습니다.",
    statusLabel: "웹 체험 가능",
    thumbnail: { src: "/images/apps/green-putt.jpg", alt: "그린 퍼팅 대표 이미지" },
    links: [{ label: "플레이하기", href: "https://putt.seonghoho.com", kind: "web" }],
    detail: {
      intro:
        "골프 그린에서 경사를 읽고 거리를 맞추는 재미만 떼어 낸 프로토타입입니다. 드래그로 당긴 거리가 세기, 반대 방향이 공이 나가는 방향입니다. 검증하려는 질문은 하나, 플레이어가 '한 판 더'를 누르는가입니다.",
      sections: [
        {
          heading: "만든 것",
          paragraphs: ["Canvas 2D로 그리고, 물리는 직접 만들었습니다."],
          points: [
            "1/240초 고정 간격의 물리: 둔덕 지형, 굴러가는 공, 잔디 빠르기에 따른 마찰, 홀인과 립아웃 판정",
            "시드로 단계를 만들고 난이도 곡선에 맞는 판을 고르는 단계 생성기와 해답 탐색기",
            "코인과 다이아, 상점과 옷장, 출석 보상, 말투와 표정이 다른 캐디 4명",
            "Web Audio로 합성한 효과음과 첫 실행 튜토리얼",
          ],
        },
        {
          heading: "어려웠던 점",
          paragraphs: [
            "조준할 때 보이는 예상선과 실제로 공이 구르는 길이 어긋나는 문제가 있었습니다. 예상선을 실제 물리 코드로 미리 굴려 그려서 둘이 반드시 같게 했습니다.",
            "단계마다 난이도가 들쭉날쭉하지 않도록, 한 번에 넣을 확률을 재서 목표 곡선에 맞는 후보만 골랐습니다. 목표 확률은 1%에서 시작해 1000단계에서 0.2%까지 천천히 내려갑니다.",
          ],
        },
        {
          heading: "지금 상태",
          paragraphs: [
            "웹에서 체험할 수 있는 프로토타입입니다. 지금 200단계가 있고, 1000단계까지 늘려 갈 계획입니다.",
          ],
        },
      ],
      gallery: [],
    },
  },
  {
    slug: "receipt-photobooth",
    title: "영수증 포토부스",
    summary:
      "10인치 태블릿에서 사진을 찍어 영수증 프린터로 뽑는 렌탈형 키오스크입니다. 앱과 운영자 화면, 사진 QR 내려받기까지 만들었고 실기기 검증을 앞두고 있습니다.",
    statusLabel: "개발 중 · 실기기 검증 단계",
    inProgress: true,
    thumbnail: {
      src: "/images/apps/receipt-photobooth.png",
      alt: "영수증 포토부스 앱 시작 화면",
      fit: "contain",
    },
    links: [],
    detail: {
      intro:
        "행사장에 세워 두는 포토부스를 영수증 프린터로 바꿔 보고 싶었습니다. 태블릿으로 사진을 찍으면 영수증처럼 출력되는 키오스크를, 기기를 파는 대신 행사 단위로 빌려 주는 렌탈 서비스로 설계했습니다.",
      sections: [
        {
          heading: "어떤 서비스인가",
          paragraphs: [
            "10인치 태블릿을 세로로 고정해 두고, 손님이 사진을 찍으면 USB OTG로 연결한 ESC/POS 프린터(58mm·80mm)가 영수증처럼 사진을 뽑아 줍니다.",
          ],
        },
        {
          heading: "만든 것",
          paragraphs: ["혼자서 키오스크 앱부터 운영 도구까지 한 벌을 다 만들었습니다."],
          points: [
            "Android 키오스크 앱: 촬영, 꾸미기, 영수증 프린터 출력",
            "서버: Cloudflare Worker 하나로 사진 보관과 기기 연결을 처리",
            "운영자 화면: 기기 등록과 연결 상태, 기간·기기별 통계와 CSV 내보내기, 용지 부족 알림, 사진 삭제",
            "사진 내려받기: 동의한 손님은 영수증의 QR로 원본을 받고, 보관 기간이 지나면 만료되며 직접 지울 수도 있습니다",
          ],
        },
        {
          heading: "지금 상태",
          paragraphs: [
            "기능 구현은 마쳤고, 실제 태블릿과 프린터를 연결해 오래 돌려 보는 검증이 남았습니다. 스토어에 올리지 않고 운영자 화면에서 APK를 직접 배포하는 구조로 준비하고 있습니다.",
          ],
        },
      ],
      gallery: [],
    },
  },
];

export function getPersonalAppBySlug(slug: string) {
  return personalApps.find((app) => app.slug === slug);
}
