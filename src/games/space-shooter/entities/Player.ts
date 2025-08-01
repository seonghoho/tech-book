import { Game } from "@/games/space-shooter/game/Game";
import * as PIXI from "pixi.js";

export class Player {
  private app: PIXI.Application;
  private game: Game;
  public display: PIXI.Graphics; // PIXI로 그릴 실제 도형

  x: number;
  y: number;
  width: number = 50;
  height: number = 50;
  color: number = 0x3366ff; // hex 숫자 (파랑)
  speed: number = 10;

  keys: Record<string, boolean> = {};

  constructor(app: PIXI.Application, game: Game, x: number, y: number) {
    this.app = app;
    this.game = game;
    this.x = x;
    this.y = y;

    // PIXI.Graphics 인스턴스 생성
    this.display = new PIXI.Graphics();
    this.drawGraphics();
    this.display.x = this.x;
    this.display.y = this.y;
  }

  // 위치 및 크기 바뀔 때마다 PIXI 도형 다시 그림
  public updateDisplay() {
    this.drawGraphics();
    this.display.x = this.x;
    this.display.y = this.y;
  }

  private drawGraphics() {
    this.display.clear();
    this.display.beginFill(this.color);
    this.display.drawRect(0, 0, this.width, this.height);
    this.display.endFill();
  }

  public update(canvasWidth: number) {
    // 좌우 이동
    if (this.keys["ArrowLeft"]) {
      this.x -= this.speed;
    }
    if (this.keys["ArrowRight"]) {
      this.x += this.speed;
    }
    // 화면 밖으로 못나가게
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > canvasWidth) this.x = canvasWidth - this.width;

    // 위치를 display 객체에 반영
    this.updateDisplay();
  }

  // Canvas 버전 draw는 불필요. (PIXI가 알아서 그림)
  // draw(ctx: CanvasRenderingContext2D) { ... } <-- 삭제

  public handleKeyDown(key: string) {
    this.keys[key] = true;
  }

  public handleKeyUp(key: string) {
    this.keys[key] = false;
  }
}
