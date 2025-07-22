import * as PIXI from "pixi.js";
import obstacles from "../config/obstacles.json";
import { Game } from "../game/Game";

interface SpawnData {
  time: number;
  type: string;
  y?: number;
}

export class Obstacle {
  public sprite: PIXI.AnimatedSprite;
  private passed = false;

  constructor(
    app: PIXI.Application,
    textures: PIXI.Texture[] | PIXI.Texture,
    y?: number,
    type?: string,
  ) {
    const texArray = Array.isArray(textures) ? textures : [textures];
    this.sprite = new PIXI.AnimatedSprite(texArray);
    this.sprite.anchor.set(0.5);
    this.sprite.animationSpeed = 0.1; // Adjust animation speed
    this.sprite.play();

    // Make it smaller
    this.sprite.scale.set(0.5);

    this.sprite.x = app.screen.width + this.sprite.width;

    if (typeof y === "number") {
      this.sprite.y = y;
    } else if (type === "bird") {
      this.sprite.y = 180; // 예시
    } else {
      this.sprite.y = app.screen.height - 100 - this.sprite.height / 2 + 50;
    }
  }

  public update(speed: number) {
    this.sprite.x -= speed;
  }

  public isOffScreen(): boolean {
    return this.sprite.x < -this.sprite.width;
  }

  public hasPassedPlayer(playerX: number): boolean {
    if (!this.passed && this.sprite.x < playerX) {
      this.passed = true;
      return true;
    }
    return false;
  }
}

export class ObstacleManager {
  private app: PIXI.Application;
  private game: Game;
  private obstacles: Obstacle[] = [];
  private spawnSequence: SpawnData[] = [];
  private nextSequenceIndex = 0;

  private obstacleTextureMap: Record<string, PIXI.Texture[] | PIXI.Texture> =
    {};

  constructor(app: PIXI.Application, game: Game) {
    this.app = app;
    this.game = game;
    this.loadObstacleAssets();
    this.loadSequence();
  }

  private loadSequence() {
    this.spawnSequence = obstacles;
    this.nextSequenceIndex = 0;
  }

  private async loadObstacleAssets() {
    // Rock
    const rockSheet = PIXI.Assets.get("/assets/pixel-runner/assets/png/Obstacle/Rock.png");
    if (!rockSheet || !rockSheet.baseTexture) {
      console.error("Obstacle.ts: rockSheet or baseTexture is null for Rock.png");
      return;
    }
    const rockFrames: PIXI.Texture[] = [];
    const rockFrameCount = Math.floor(rockSheet.width / 128);
    for (let i = 0; i < rockFrameCount; i++) {
      rockFrames.push(
        new PIXI.Texture({
          source: rockSheet.baseTexture,
          frame: new PIXI.Rectangle(i * 128, 0, 128, 128),
        }),
      );
    }
    this.obstacleTextureMap["rock"] = rockFrames;

    // Bird
    const birdSheet = PIXI.Assets.get("/assets/pixel-runner/assets/png/Obstacle/Bird.png");
    if (!birdSheet || !birdSheet.baseTexture) {
      console.error("Obstacle.ts: birdSheet or baseTexture is null for Bird.png");
      return;
    }
    const birdFrames: PIXI.Texture[] = [];
    const birdFrameCount = Math.floor(birdSheet.width / 128);
    for (let i = 0; i < birdFrameCount; i++) {
      birdFrames.push(
        new PIXI.Texture({
          source: birdSheet.baseTexture,
          frame: new PIXI.Rectangle(i * 128, 0, 128, 128),
        }),
      );
    }
    this.obstacleTextureMap["bird"] = birdFrames;
  }

  private spawnObstacle(type: string, y?: number) {
    const textures =
      this.obstacleTextureMap[type] || this.obstacleTextureMap["ground"];
    const newObstacle = new Obstacle(this.app, textures, y, type);
    this.obstacles.push(newObstacle);
    this.app.stage.addChild(newObstacle.sprite);
  }

  public update(speed: number, gameTime: number) {
    if (Object.keys(this.obstacleTextureMap).length === 0) return; // Wait for assets to load

    // JSON 시퀀스에 따라 스폰
    while (
      this.nextSequenceIndex < this.spawnSequence.length &&
      this.spawnSequence[this.nextSequenceIndex].time <= gameTime
    ) {
      const data = this.spawnSequence[this.nextSequenceIndex];
      this.spawnObstacle(data.type, data.y);
      this.nextSequenceIndex++;
    }

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      obstacle.update(speed);

      if (obstacle.hasPassedPlayer(this.app.screen.width / 2)) {
        this.game.increaseScore();
      }

      if (obstacle.isOffScreen()) {
        this.removeObstacle(obstacle);
      }
    }
  }

  public removeObstacle(obstacle: Obstacle) {
    this.app.stage.removeChild(obstacle.sprite);
    this.obstacles = this.obstacles.filter((o) => o !== obstacle);
    obstacle.sprite.destroy(); // Clean up sprite resources
  }

  public getObstacles(): Obstacle[] {
    return this.obstacles;
  }

  public reset() {
    this.obstacles.forEach((o) => {
      this.app.stage.removeChild(o.sprite);
      o.sprite.destroy();
    });
    this.obstacles = [];
    this.loadSequence();
  }
}
