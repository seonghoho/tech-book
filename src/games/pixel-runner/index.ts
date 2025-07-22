import { Application, Assets } from "pixi.js";
import { Game } from "./game/Game";
import characterConfig from "./config/character-config.json";

export async function init(container: HTMLDivElement, onGameOver?: (score: number | string) => void, onScoreUpdate?: (score: number) => void) {
  console.log("index.ts: init function started");
  // Preload all assets
  const assetsToLoad: string[] = [];

  // Backgrounds
  assetsToLoad.push("/assets/pixel-runner/assets/png/Background/day.png");
  assetsToLoad.push("/assets/pixel-runner/assets/png/Background/dawn.png");

  // Characters
  for (const characterName in characterConfig) {
    for (const animName in characterConfig[characterName]) {
      assetsToLoad.push(
        `/assets/pixel-runner/assets/png/${characterName}/${animName}.png`,
      );
    }
  }

  // Obstacles
  assetsToLoad.push("/assets/pixel-runner/assets/png/Obstacle/Rock.png");
  assetsToLoad.push("/assets/pixel-runner/assets/png/Obstacle/Bird.png");

  console.log("index.ts: Loading assets...", assetsToLoad);
  await Assets.load(assetsToLoad);
  console.log("index.ts: Assets loaded.");
  console.log("index.ts: PixiJS Assets Cache:", Assets.cache);

  const app = new Application();

  console.log("index.ts: Initializing PixiJS application...");
  await app.init({
    background: "#021f4b",
    width: container.clientWidth,
    height: 400,
  });
  console.log("index.ts: PixiJS application initialized.");

  container.appendChild(app.canvas);
  console.log("index.ts: Canvas appended to container.");

  const game = new Game(app, onGameOver, onScoreUpdate);
  console.log("index.ts: Game instance created.");
  await game.init();
  console.log("index.ts: Game initialized.");

  const handleResize = () => {
    app.renderer.resize(container.clientWidth, container.clientHeight);
  };

  window.addEventListener("resize", handleResize);
  console.log("index.ts: Resize listener added.");

  // Return the game instance and a combined destroy function
  return {
    gameInstance: game,
    destroy: () => {
      console.log("index.ts: Destroy function called.");
      window.removeEventListener("resize", handleResize);
      game.destroy();
      app.destroy(true, true);
    },
  };
}
