import { Application, Assets } from "pixi.js";
import { Game } from "./game/Game";
import characterConfig from "./config/character-config.json";

export async function init(
  container: HTMLDivElement,
  onGameOver?: (score: number | string) => void,
  onScoreUpdate?: (score: number) => void
) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  console.log("index.ts: init function started");
  // Preload all assets
  const assetsToLoad: string[] = [];

  // Backgrounds
  assetsToLoad.push("/assets/pixel-runner/assets/png/Background/day.png");
  assetsToLoad.push("/assets/pixel-runner/assets/png/Background/dawn.png");

  // Characters
  for (const characterName of Object.keys(characterConfig) as Array<
    keyof typeof characterConfig
  >) {
    const charConfig = characterConfig[characterName];
    for (const animName of Object.keys(charConfig) as Array<
      keyof typeof charConfig
    >) {
      assetsToLoad.push(
        `/assets/pixel-runner/assets/png/${characterName}/${animName}.png`
      );
    }
  }

  // Obstacles
  assetsToLoad.push("/assets/pixel-runner/assets/png/Obstacle/Rock.png");
  assetsToLoad.push("/assets/pixel-runner/assets/png/Obstacle/Bird.png");

  await Assets.load(assetsToLoad);

  const app = new Application();

  await app.init({
    background: "#021f4b",
    width: container.clientWidth,
    height: 400,
  });

  container.appendChild(app.canvas);

  const game = new Game(app, onGameOver, onScoreUpdate);
  await game.init();
  const handleResize = () => {
    app.renderer.resize(container.clientWidth, container.clientHeight);
  };

  window.addEventListener("resize", handleResize);
  // Return the game instance and a combined destroy function
  return {
    gameInstance: game,
    destroy: () => {
      window.removeEventListener("resize", handleResize);
      game.destroy();
      app.destroy(true, true);
    },
  };
}
