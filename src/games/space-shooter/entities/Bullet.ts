import * as PIXI from "pixi.js";
import gameConfig from "../config/game-config.json";

export class Bullet {
  public display: PIXI.Graphics;
  x: number;
  y: number;
  width: number = gameConfig.bulletWidth;
  height: number = gameConfig.bulletHeight;
  color: number = 0xffd600; // 노란색
  speed: number = gameConfig.bulletSpeed;

  constructor(app: PIXI.Application, x: number, y: number) {
    this.x = x;
    this.y = y;

    // PIXI.Graphics 인스턴스 생성
    this.display = new PIXI.Graphics();
    this.display.beginFill(this.color);
    this.display.drawRect(0, 0, this.width, this.height);
    this.display.endFill();

    // 초기 위치 설정
    this.display.x = this.x;
    this.display.y = this.y;

    // 만약 생성 즉시 stage에 추가하려면 (아니면 game에서 관리)
    // app.stage.addChild(this.display);
  }

  update() {
    this.y -= this.speed;
    this.display.y = this.y; // 그래픽 위치 반영
  }
}
