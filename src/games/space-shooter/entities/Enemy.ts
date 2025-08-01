import * as PIXI from "pixi.js";
import gameConfig from "../config/game-config.json";

export class Enemy {
  public display: PIXI.Graphics;
  x: number;
  y: number;
  width: number = gameConfig.enemyWidth;
  height: number = gameConfig.enemyHeight;
  color: number = 0xff3333; // 빨간색, 16진수
  speed: number = gameConfig.enemySpeed;

  constructor(app: PIXI.Application, x: number, y: number) {
    this.x = x;
    this.y = y;

    // PIXI.Graphics로 사각형 도형 생성
    this.display = new PIXI.Graphics();
    this.display.beginFill(this.color);
    this.display.drawRect(0, 0, this.width, this.height);
    this.display.endFill();

    // 위치 지정
    this.display.x = this.x;
    this.display.y = this.y;

    // 필요에 따라 생성시 stage에 추가 (보통 Game 클래스에서 addChild)
    // app.stage.addChild(this.display);
  }

  update() {
    this.y += this.speed;
    this.display.y = this.y; // 위치 동기화
  }
}
