export const games = [
  {
    slug: "pixel-runner",
    title: "Pixel Runner",
    description: "A retro-style endless runner game.",
    image: "/images/games-thumbnail/pixel-runner-thumbnail.png",
    markdownPath: "game/pixel-runner/01-pixel-runner",
    playSlug: "pixel-runner",
    devlogSlug: "pixel-runner/02",
    summary:
      "Pixi.js로 만든 픽셀 감성 러너. 장애물을 피하며 달리는 러너 루프와 충돌 처리, 간단한 파티클 효과를 담았습니다.",
    techStack: ["Pixi.js", "TypeScript", "Canvas", "Vite"],
    highlights: [
      "러너 루프와 배경 패럴럭스 처리",
      "AABB 충돌 감지와 난이도 곡선 설계",
      "UI/사운드 자산을 포함한 전체 빌드 파이프라인",
    ],
  },
  {
    slug: "space-shooter",
    title: "Space Shooter",
    description: "A classic arcade space shooter.",
    image: "/images/games-thumbnail/space-shooter-thumbnail.png",
    markdownPath: "game/space-shooter/01-space-shooter",
    playSlug: "space-shooter",
    devlogSlug: "space-shooter/01-space-shooter",
    summary:
      "간단한 레트로 슈팅 게임. 탄막 패턴과 적 스폰 로직, 아이템 드랍을 통해 작은 아케이드 경험을 제공합니다.",
    techStack: ["Pixi.js", "TypeScript", "Canvas", "Vite"],
    highlights: [
      "탄막 패턴과 난이도 스케일링",
      "스코어링 및 체력/아이템 관리",
      "모바일 조작 대응을 위한 입력 레이어",
    ],
  },
];
