import * as PIXI from "pixi.js";
import { Player } from "../entities/Player";
import { Enemy } from "../entities/Enemy";
import { Bullet } from "../entities/Bullet";
import { KeyboardManager } from "../../common/controls/KeyboardManager";
import gameConfig from "../config/game-config.json";
import { UI } from "@/games/space-shooter/ui/UI";

export class Game {
  private app: PIXI.Application;
  private player: Player;
  private enemies: Enemy[] = [];
  private bullets: Bullet[] = [];
  private keyboard: KeyboardManager;
  private lastEnemySpawnTime: number = 0;

  public gameState: "ready" | "playing" | "gameOver" = "ready";
  private score: number = 0;
  private ui: UI; // 추가
  private lives: number = 3; // 목숨(필요하다면)

  private gameDuration = 30; // 게임 총 시간 (초)
  private gameTime = 0; // 경과 시간

  private isShooting: boolean = false;
  private lastBulletTime: number = 0;
  private bulletInterval: number = 180;

  private onGameOverCallback: ((score: number | string) => void) | undefined;
  private onScoreUpdateCallback: ((score: number) => void) | undefined;

  private restartKeyHandler: ((e: KeyboardEvent) => void) | null = null;

  constructor(
    app: PIXI.Application,
    onGameOver?: (score: number | string) => void,
    onScoreUpdate?: (score: number) => void
  ) {
    this.app = app;
    this.onGameOverCallback = onGameOver;
    this.onScoreUpdateCallback = onScoreUpdate;

    this.ui = new UI(this.app);
    this.app.stage.addChild(this.ui.scoreText);
    this.app.stage.addChild(this.ui.livesText);
    this.app.stage.addChild(this.ui.timeText);

    this.keyboard = new KeyboardManager();
    this.keyboard.listen();
    this.keyboard.registerKeyDown(this.handleGlobalKeyDown.bind(this));
    this.keyboard.registerKeyUp(this.handleGlobalKeyUp.bind(this));

    // 플레이어 인스턴스 (PIXI 기반)
    this.player = new Player(
      this.app,
      this,
      this.app.screen.width / 2,
      this.app.screen.height - 50
    );
    if (this.player.display) {
      this.app.stage.addChild(this.player.display); // display는 Player가 갖는 PIXI.Sprite 인스턴스
    }
  }

  public init() {
    // UI 초기화/등록 등 필요시 여기에 추가

    this.keyboard.registerKeyDown((e: KeyboardEvent) => {
      if (e.code === "Space") {
        this.isShooting = true;
      }
    });
    this.keyboard.registerKeyUp((e: KeyboardEvent) => {
      if (e.code === "Space") {
        this.isShooting = false;
      }
    });
    // this.start();
  }

  public start() {
    this.gameState = "playing";
    this.resetGame();

    this.lives = 3;
    this.gameTime = 0;
    this.ui.updateScore(this.score);
    this.ui.updateLives(this.lives);
    this.ui.updateTime(this.gameDuration);

    this.app.ticker.add(this.gameLoop);

    // R키 핸들러 등록
    this.restartKeyHandler = (e: KeyboardEvent) => {
      if ((e.code === "KeyR" || e.key === "r" || e.key === "R") && !e.repeat) {
        this.start();
      }
    };
    this.keyboard.registerKeyDown(this.restartKeyHandler);
  }

  private handleGlobalKeyDown(e: KeyboardEvent) {
    if (this.gameState === "playing") {
      this.player.handleKeyDown?.(e.code);
    }
  }

  private handleGlobalKeyUp(e: KeyboardEvent) {
    if (this.gameState === "playing") {
      this.player.handleKeyUp?.(e.code);
    }
  }

  private resetGame() {
    // Stage에서 모든 enemy, bullet 제거
    for (const enemy of this.enemies) this.app.stage.removeChild(enemy.display);
    for (const bullet of this.bullets)
      this.app.stage.removeChild(bullet.display);
    this.enemies = [];
    this.bullets = [];

    // 플레이어 위치 초기화
    this.player.x = this.app.screen.width / 2;
    this.player.y = this.app.screen.height - 50;
    this.player.updateDisplay();
    this.score = 0;
    this.lives = 3;
    this.gameTime = 0;
    if (this.onScoreUpdateCallback) this.onScoreUpdateCallback(this.score);

    this.ui.updateScore(this.score);
    this.ui.updateLives(this.lives);
    this.ui.updateTime(this.gameDuration);
    this.lastEnemySpawnTime = 0;
    this.gameState = "playing";
  }

  private gameLoop = () => {
    if (this.gameState !== "playing") return;

    // 1. 시간 갱신
    this.gameTime += this.app.ticker.deltaMS / 1000; // ms → s 변환
    const remainingTime = this.gameDuration - this.gameTime;
    this.ui.updateTime(remainingTime);

    // 2. 남은 시간이 0 이하일 때 게임 오버
    if (remainingTime <= 0) {
      this.gameOver("Time's up!");
      return;
    }

    this.player.update(this.app.screen.width);

    // Enemy spawn
    const currentTime = Date.now();
    if (currentTime - this.lastEnemySpawnTime > gameConfig.enemySpawnInterval) {
      this.spawnEnemy();
      this.lastEnemySpawnTime = currentTime;
    }

    const now = Date.now();
    if (this.isShooting && now - this.lastBulletTime > this.bulletInterval) {
      this.shootBullet();
      this.lastBulletTime = now;
    }
    // Bullets update
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      this.bullets[i].update();
      if (this.bullets[i].y < 0) {
        this.app.stage.removeChild(this.bullets[i].display);
        this.bullets.splice(i, 1);
      }
    }

    // Enemies update
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      this.enemies[i].update();
      if (this.enemies[i].y > this.app.screen.height) {
        this.app.stage.removeChild(this.enemies[i].display);
        this.enemies.splice(i, 1);

        // 목숨 차감!
        this.lives--;
        this.ui.updateLives(this.lives);

        if (this.lives <= 0) {
          this.gameOver("You lost all your lives.");
          return;
        }
      }
    }

    // Collision: bullet-enemy
    outer: for (let b = 0; b < this.bullets.length; b++) {
      for (let e = 0; e < this.enemies.length; e++) {
        if (this.checkCollision(this.bullets[b], this.enemies[e])) {
          this.app.stage.removeChild(this.bullets[b].display);
          this.app.stage.removeChild(this.enemies[e].display);
          this.bullets.splice(b, 1);
          this.enemies.splice(e, 1);

          this.increaseScore(10);
          this.ui.updateScore(this.score); // 점수 UI도 실시간 갱신

          break outer;
        }
      }
    }

    // Collision: player-enemy
    for (const enemy of this.enemies) {
      if (this.checkCollision(this.player, enemy)) {
        this.lives = 0;
        this.ui.updateLives(this.lives);
        this.gameOver("Player hit by enemy.");
        return;
      }
    }
  };

  private shootBullet() {
    if (this.gameState !== "playing") return;
    const bullet = new Bullet(
      this.app,
      this.player.x + this.player.width / 2 - gameConfig.bulletWidth / 2 - 25,
      this.player.y
    );
    this.bullets.push(bullet);
    this.app.stage.addChild(bullet.display); // display는 Bullet이 갖는 PIXI.Graphics 인스턴스
  }

  private spawnEnemy() {
    const x = Math.random() * (this.app.screen.width - gameConfig.enemyWidth);
    const enemy = new Enemy(this.app, x, -gameConfig.enemyHeight);
    this.enemies.push(enemy);
    this.app.stage.addChild(enemy.display); // display는 Enemy가 갖는 PIXI.Graphics 인스턴스
  }

  private checkCollision(
    a: { x: number; y: number; width: number; height: number },
    b: { x: number; y: number; width: number; height: number }
  ): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }
  private increaseScore(amount = 1) {
    this.score += amount;
    if (this.onScoreUpdateCallback) {
      this.onScoreUpdateCallback(this.score);
    }
    this.ui.updateScore(this.score); // 항상 UI 동기화
  }

  public gameOver(message?: string) {
    this.gameState = "gameOver";
    if (this.onGameOverCallback) {
      this.onGameOverCallback(this.score);
    }
    if (this.restartKeyHandler) {
      this.keyboard.unregisterKeyDown(this.restartKeyHandler);
      this.restartKeyHandler = null;
    }
    this.app.ticker.remove(this.gameLoop);

    // 메시지는 PIXI.Text 등으로 화면에 띄우는 게 더 적절!
    if (message) {
      console.log("Game Over!", message);
    }
  }

  public destroy() {
    this.app.ticker.remove(this.gameLoop);
    if (this.restartKeyHandler) {
      this.keyboard.unregisterKeyDown(this.restartKeyHandler);
      this.restartKeyHandler = null;
    }
    this.keyboard.destroy();
    // 기타 리소스 해제 시 추가
  }
}
