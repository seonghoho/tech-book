import * as PIXI from "pixi.js";
import gameConfig from "../config/game-config.json";

export class Enemy {
  public display: PIXI.Graphics;
  x: number;
  y: number;
  width: number;
  height: number;
  color: number = 0x888888; // 회색 계열 (운석 느낌)
  speed: number = gameConfig.enemySpeed;

  constructor(app: PIXI.Application, x: number, y: number) {
    this.x = x;
    this.y = y;

    // 랜덤 크기 조절 (기본값 +- 30%)
    const sizeMultiplier = 0.7 + Math.random() * 0.6;
    this.width = gameConfig.enemyWidth * sizeMultiplier;
    this.height = gameConfig.enemyHeight * sizeMultiplier;

    // PIXI.Graphics로 운석 모양 생성
    this.display = new PIXI.Graphics();
    this.drawAsteroidShape(this.display, this.width, this.height);

    // 위치 지정
    this.display.x = this.x;
    this.display.y = this.y;

    // 필요에 따라 생성시 stage에 추가 (보통 Game 클래스에서 addChild)
    // app.stage.addChild(this.display);
  }

  drawAsteroidShape(graphics: PIXI.Graphics, width: number, height: number) {
    graphics.clear();
    graphics.beginFill(this.color);

    // 운석 모양 다각형, 다소 불규칙한 꼭짓점들
    const points = [];

    const basePoints = 8; // 꼭짓점 갯수
    const angleStep = (Math.PI * 2) / basePoints;

    for (let i = 0; i < basePoints; i++) {
      // 기본 반경에 랜덤 추가
      const radius =
        (Math.min(width, height) / 2) * (0.7 + Math.random() * 0.6);

      const angle = i * angleStep;
      const px = width / 2 + radius * Math.cos(angle);
      const py = height / 2 + radius * Math.sin(angle);
      points.push(new PIXI.Point(px, py));
    }

    graphics.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      graphics.lineTo(points[i].x, points[i].y);
    }
    graphics.closePath();
    graphics.endFill();

    // 경계선 그리기 (조금 더 어두운 회색)
    graphics.lineStyle(2, 0x555555, 1);
    graphics.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      graphics.lineTo(points[i].x, points[i].y);
    }
    graphics.closePath();
  }

  update() {
    this.y += this.speed;
    this.display.y = this.y; // 위치 동기화
  }
}
