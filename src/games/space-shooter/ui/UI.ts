import * as PIXI from "pixi.js";

export class UI {
  public scoreText: PIXI.Text;
  public timeText: PIXI.Text;
  public livesText: PIXI.Text;

  constructor(app: PIXI.Application) {
    // 점수
    this.scoreText = new PIXI.Text({
      text: "SCORE: 0",
      style: {
        fontFamily: "Arial",
        fontSize: 28,
        fill: 0xffff00,
        fontWeight: "bold",
        stroke: 0x000000,
        // strokeThickness: 4,
      },
    });
    this.scoreText.x = 30;
    this.scoreText.y = 20;

    // 목숨
    this.livesText = new PIXI.Text({
      text: "LIVES: 3",
      style: {
        fontFamily: "Arial",
        fontSize: 24,
        fill: 0xff5555,
        fontWeight: "bold",
        stroke: 0x000000,
        // strokeThickness: 3,
      },
    });
    this.livesText.x = 30;
    this.livesText.y = 60;

    // 남은 시간
    this.timeText = new PIXI.Text({
      text: "TIME: 30",
      style: {
        fontFamily: "Arial",
        fontSize: 24,
        fill: 0x00ffff,
        fontWeight: "bold",
        stroke: 0x000000,
        // strokeThickness: 3,
      },
    });
    this.timeText.x = app.screen.width - 150;
    this.timeText.y = 20;
  }

  updateScore(score: number) {
    this.scoreText.text = `SCORE: ${score}`;
  }

  updateLives(lives: number) {
    this.livesText.text = `LIVES: ${lives}`;
  }

  updateTime(remainingTime: number) {
    this.timeText.text = `TIME: ${Math.max(0, Math.ceil(remainingTime))}`;
  }
}
