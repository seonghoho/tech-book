import { Application } from "pixi.js";
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
    background: "#333333",
    width: container.clientWidth,
    height: 400,
  });

  // 3. PIXI 캔버스 DOM에 추가
  container.appendChild(app.canvas);

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
