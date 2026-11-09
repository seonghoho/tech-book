export type AppLink = {
  label: string;
  href: string;
  kind: "store" | "web";
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
  detailHref?: string;
};

export const personalApps: PersonalApp[] = [
  {
    slug: "hankan",
    title: "한칸",
    summary:
      "하루에 한 칸씩, 손으로 그린 동그라미를 칠해 나가는 습관 체크예요. 웹에서 쓰던 기록이 Android 앱과 그대로 이어지도록 동기화를 붙였어요.",
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
  },
  {
    slug: "dotori",
    title: "다람쥐 퍼즐",
    summary:
      "다람쥐가 숲 곳곳에 도토리를 숨기는 손그림 논리 퍼즐이에요. 스타 배틀 규칙을 따르고, 답이 하나뿐인 판을 만드는 생성기와 풀이기를 직접 짰어요.",
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
  },
  {
    slug: "space-cleanup",
    title: "궤도 청소대",
    summary:
      "정거장으로 날아오는 우주 쓰레기를 청소 위성으로 쪼개고 붙잡아 치우는 경로형 타워 디펜스예요. 화면 없이 수십 판을 돌리는 시뮬레이터를 만들어 밸런스를 맞췄어요.",
    statusLabel: "웹 운영 중 · Android 준비 중",
    thumbnail: { src: "/images/apps/space-cleanup.png", alt: "궤도 청소대 대표 이미지" },
    links: [{ label: "플레이하기", href: "https://space-defence.seonghoho.com", kind: "web" }],
  },
  {
    slug: "view-racer",
    title: "View Racer",
    summary:
      "Three.js로 만든 타임어택 레이싱이에요. 하나의 3D 월드를 체이스·시네마틱·탑다운·1인칭 네 시점으로 바꿔 가며 달리고, 고스트와 순위, 챌린지 공유까지 붙였어요.",
    statusLabel: "웹 운영 중",
    thumbnail: { src: "/images/apps/view-racer.png", alt: "View Racer 대표 이미지" },
    links: [{ label: "플레이하기", href: "https://view-racer.seonghoho.com", kind: "web" }],
  },
  {
    slug: "green-putt",
    title: "그린 퍼팅",
    summary:
      "새총처럼 당겨서 치는 2.5D 퍼팅 게임이에요. 전속 캐디와 함께 단계를 하나씩 넘어가며, '한 판 더'를 누르게 되는지 확인하려고 만들고 있어요.",
    statusLabel: "웹 체험 가능",
    thumbnail: { src: "/images/apps/green-putt.jpg", alt: "그린 퍼팅 대표 이미지" },
    links: [{ label: "플레이하기", href: "https://putt.seonghoho.com", kind: "web" }],
  },
  {
    slug: "receipt-photobooth",
    title: "영수증 포토부스",
    summary:
      "10인치 태블릿에서 사진을 찍어 영수증 프린터로 뽑는 렌탈형 키오스크예요. 앱과 운영자 화면, 사진 QR 내려받기까지 만들었고 실기기 검증을 앞두고 있어요.",
    statusLabel: "개발 중 · 실기기 검증 단계",
    inProgress: true,
    thumbnail: {
      src: "/images/apps/receipt-photobooth.png",
      alt: "영수증 포토부스 앱 시작 화면",
      fit: "contain",
    },
    links: [],
    detailHref: "/projects/receipt-photobooth",
  },
];

export const receiptPhotoboothDetail = {
  title: "영수증 포토부스",
  summary:
    "태블릿으로 사진을 찍어 영수증처럼 출력하는 렌탈형 키오스크를 만들고 있어요. 앱, 서버, 운영자 화면까지 구현했고 실기기 검증이 남았어요.",
  sections: [
    {
      heading: "어떤 서비스인가",
      paragraphs: [
        "행사장에 세워 두는 포토부스를 영수증 프린터로 바꿔 보고 싶었어요. 10인치 태블릿을 세로로 고정해 두고, 손님이 사진을 찍으면 USB OTG로 연결한 ESC/POS 프린터(58mm·80mm)가 영수증처럼 사진을 뽑아 줘요.",
        "기기를 직접 파는 대신 행사 단위로 빌려 주는 렌탈 서비스로 설계했어요.",
      ],
    },
    {
      heading: "만든 것",
      paragraphs: [
        "혼자서 키오스크 앱부터 운영 도구까지 한 벌을 다 만들어야 했어요.",
      ],
      points: [
        "Android 키오스크 앱: 촬영, 꾸미기, 영수증 프린터 출력",
        "서버: Cloudflare Worker 하나로 사진 보관과 기기 연결을 처리",
        "운영자 화면: 기기 등록과 연결 상태, 기간·기기별 통계와 CSV 내보내기, 용지 부족 알림, 사진 삭제",
        "사진 내려받기: 동의한 손님은 영수증의 QR로 원본을 받고, 보관 기간이 지나면 만료되며 직접 지울 수도 있어요",
      ],
    },
    {
      heading: "지금 어디까지 왔나",
      paragraphs: [
        "기능 구현은 마쳤고, 실제 태블릿과 프린터를 연결해 오래 돌려 보는 검증이 남았어요. 스토어에 올리지 않고 운영자 화면에서 APK를 직접 배포하는 구조로 준비하고 있어요.",
      ],
    },
  ],
};
