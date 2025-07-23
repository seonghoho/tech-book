import * as PIXI from "pixi.js";
import { Player } from "../entities/Player";
import { UI } from "../ui/UI";
import { ObstacleManager } from "../entities/Obstacle";
import { KeyboardManager } from "@/games/common/controls/KeyboardManager";

export class Game {
  private app: PIXI.Application;
  private player: Player;
  private ui: UI;
  private obstacleManager: ObstacleManager;
  private background: PIXI.TilingSprite | null;
  private restartKeyHandler: ((e: KeyboardEvent) => void) | null = null;
  private isTabDown = false;

  public gameState: "ready" | "playing" | "gameOver" = "ready";
  private scrollSpeed = 3;
  private score = 0;
  private gameTime = 0;
  private gameDuration = 30; // Game duration in seconds
  private keyboard: KeyboardManager;

  private onGameOverCallback: ((score: number | string) => void) | undefined;
  private onScoreUpdateCallback: ((score: number) => void) | undefined;

  constructor(
    app: PIXI.Application,
    onGameOver?: (score: number | string) => void,
    onScoreUpdate?: (score: number) => void
  ) {
    this.app = app;
    this.onGameOverCallback = onGameOver;
    this.onScoreUpdateCallback = onScoreUpdate;

    // this.background = new PIXI.TilingSprite();
    this.background = null;
    this.player = new Player(this.app, this);

    this.keyboard = new KeyboardManager();
    this.keyboard.listen();
    this.ui = new UI(this.app);
    this.obstacleManager = new ObstacleManager(this.app, this);

    this.app.ticker.add(() => this.update());

    // Register global keyboard event handlers with KeyboardManager
    this.keyboard.register(this.handleGlobalKeyDown.bind(this));
    this.keyboard.register(this.handleGlobalKeyUp.bind(this));
  }

  private handleGlobalKeyDown(e: KeyboardEvent) {
    if (e.code === "Tab") {
      this.isTabDown = true;
      e.preventDefault();
    }

    if (this.isTabDown && (e.code === "Digit1" || e.code === "Digit2")) {
      e.preventDefault();
      if (e.code === "Digit1") {
        this.setBackground("dawn.png");
      } else if (e.code === "Digit2") {
        this.setBackground("day.png");
      }
      return;
    }

    if (this.gameState === "playing") {
      this.player.handleKeyDown(e.code, e.repeat);
    }
  }

  private handleGlobalKeyUp(e: KeyboardEvent) {
    console.log("Game.ts: handleGlobalKeyUp called.", e.code);
    if (e.code === "Tab") {
      this.isTabDown = false;
    }
    if (this.gameState === "playing") {
      this.player.handleKeyUp(e.code);
    }
  }

  public async init() {
    await PIXI.Assets.load(
      "/assets/pixel-runner/assets/png/Background/day.png"
    );
    const bgTexture = PIXI.Assets.get(
      "/assets/pixel-runner/assets/png/Background/day.png"
    );
    // bgTexture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
    this.background = new PIXI.TilingSprite({
      texture: bgTexture,
      width: this.app.screen.width,
      height: 400,
    });
    this.app.stage.addChild(this.background);

    await this.player.init();
    // 항상 UI가 맨 위에 보이도록, background 추가 후 UI 컨테이너를 한 번 더 올림
    this.app.stage.addChild(this.ui.scoreText);
    this.app.stage.addChild(this.ui.livesContainer);
    this.app.stage.addChild(this.ui.timeText);
  }

  public start() {
    this.gameState = "playing";
    this.player.reset();
    this.obstacleManager.reset();
    this.score = 0;
    this.gameTime = 0;
    this.ui.updateLives(this.player.getLives());
    this.ui.updateScore(this.score);
    this.ui.updateTime(this.gameDuration);

    // R키 핸들러 등록
    this.restartKeyHandler = (e: KeyboardEvent) => {
      if ((e.code === "KeyR" || e.key === "r" || e.key === "R") && !e.repeat) {
        this.start(); // 재시작(=초기화)
      }
    };
    this.keyboard.register(this.restartKeyHandler);
  }

  private async setBackground(textureName: string) {
    try {
      const texturePath = `/assets/pixel-runner/assets/png/Background/${textureName}`;
      const texture = await PIXI.Assets.get(texturePath);
      if (this.background) this.background.texture = texture;
    } catch (error) {
      console.error(
        `Game.ts: Failed to load background texture: ${textureName}`,
        error
      );
    }
  }

  private update() {
    if (this.gameState !== "playing") return;
    this.gameTime += this.app.ticker.deltaMS / 1000;
    const remainingTime = this.gameDuration - this.gameTime;
    this.ui.updateTime(remainingTime);
    // Scroll background and ground
    if (this.background) this.background.tilePosition.x -= this.scrollSpeed;
    // this.ground.tilePosition.x -= this.scrollSpeed;
    console.log(this.player);
    this.player.update();
    this.obstacleManager.update(this.scrollSpeed, this.gameTime);

    // Collision Check
    this.obstacleManager.getObstacles().forEach((obstacle) => {
      if (this.checkCollision(this.player.sprite, obstacle.sprite)) {
        this.obstacleManager.removeObstacle(obstacle);
        this.player.hurt();
        this.ui.updateLives(this.player.getLives());
      }
    });

    if (remainingTime <= 0) {
      this.player.timeUp();
      return;
    }
  }

  public gameOver() {
    console.log("Game.ts: gameOver function called.");
    this.gameState = "gameOver";
    if (this.onGameOverCallback) {
      this.onGameOverCallback(this.score);
    }

    if (this.restartKeyHandler) {
      this.keyboard.unregister(this.restartKeyHandler);
      this.restartKeyHandler = null;
    }
  }

  public winGame() {
    console.log("Game.ts: winGame function called.");
    this.gameState = "gameOver";
    if (this.onGameOverCallback) {
      this.onGameOverCallback("WIN! 🎉");
    }

    if (this.restartKeyHandler) {
      this.keyboard.unregister(this.restartKeyHandler);
      this.restartKeyHandler = null;
    }
  }

  public increaseScore() {
    this.score++;
    this.ui.updateScore(this.score);
    if (this.onScoreUpdateCallback) {
      this.onScoreUpdateCallback(this.score);
    }
  }

  public destroy() {
    if (this.background && this.app.stage.children.includes(this.background)) {
      this.app.stage.removeChild(this.background);
      this.background.destroy({
        children: true,
        texture: true,
      });
      this.background = null;
    }
    if (this.app && this.app.ticker) {
      this.app.ticker.remove(this.update, this);
    }
    this.keyboard.destroy();
  }

  private checkCollision(spriteA: PIXI.Sprite, spriteB: PIXI.Sprite): boolean {
    const a = spriteA.getBounds();
    const b = spriteB.getBounds();

    // 실제 히트박스 축소 비율
    const shrink = 0.6; // 60%로 줄임

    const shrinkA = {
      x: a.x + (a.width * (1 - shrink)) / 2,
      y: a.y + (a.height * (1 - shrink)) / 2,
      width: a.width * shrink,
      height: a.height * shrink,
    };

    const shrinkB = {
      x: b.x + (b.width * (1 - shrink)) / 2,
      y: b.y + (b.height * (1 - shrink)) / 2,
      width: b.width * shrink,
      height: b.height * shrink,
    };

    return (
      shrinkA.x + shrinkA.width > shrinkB.x &&
      shrinkA.x < shrinkB.x + shrinkB.width &&
      shrinkA.y + shrinkA.height > shrinkB.y &&
      shrinkA.y < shrinkB.y + shrinkB.height
    );
  }
}
