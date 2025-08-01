import { Application, Graphics } from "pixi.js";

interface StarGraphic extends Graphics {
  isStar: boolean;
}

import { Game } from "./game/Game";

/**
 * PIXI 게임 초기화
 * @param container - PIXI 캔버스를 붙일 div DOM
 * @param onGameOver - 게임 오버 콜백
 * @param onScoreUpdate - 점수 변경 콜백
 */
export async function init(
  container: HTMLDivElement,
  onGameOver: (score: number | string) => void,
  onScoreUpdate: (score: number) => void
) {
  // 1. 기존 자식 노드 모두 제거 (중복 렌더 방지)
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  // 2. PIXI 앱 생성 및 초기화 (비동기)
  const app = new Application();
  await app.init({
    background: "#000000",
    width: container.clientWidth,
    height: 400,
  });
  // 3. PIXI 캔버스 DOM에 추가
  container.appendChild(app.canvas);

  // 별 생성
  const starCount = 60; // 별 개수
  for (let i = 0; i < starCount; i++) {
    const star = new Graphics() as StarGraphic;
    // 무작위 색상 선택
    const colors = [0xffffff, 0xffd700, 0x87ceeb, 0xff69b4, 0x00ff00];
    const color = colors[Math.floor(Math.random() * colors.length)];
    star.beginFill(color);
    star.drawRect(0, 0, 2, 2); // 작은 사각형 (도트 느낌)
    star.endFill();
    star.x = Math.random() * app.screen.width;
    star.y = Math.random() * app.screen.height;

    app.stage.addChild(star);
    star.isStar = true;
  }

  // 배경 별 점멸 효과 (옵션)
  app.ticker.add(() => {
    app.stage.children.forEach((child) => {
      if ((child as StarGraphic).isStar) {
        child.alpha = 0.5 + Math.random() * 0.5; // 반짝임 효과
      }
    });
  });

  // 4. Game 인스턴스 생성 및 초기화 (비동기)
  const game = new Game(app, onGameOver, onScoreUpdate);
  await game.init();

  // 5. destroy 시 canvas를 container에서 안전하게 제거
  return {
    gameInstance: game,
    destroy: () => {
      game.destroy();
      if (app.canvas.parentNode === container) {
        container.removeChild(app.canvas);
      }
    },
  };
}
