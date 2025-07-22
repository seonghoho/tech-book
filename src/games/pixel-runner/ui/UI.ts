import * as PIXI from "pixi.js";

export class UI {
  private app: PIXI.Application;
  public scoreText: PIXI.Text;
  public timeText: PIXI.Text;
  public livesContainer: PIXI.Container;
  private heartTexture: PIXI.Texture;

  constructor(app: PIXI.Application) {
    this.app = app;

    // Create a placeholder heart texture
    this.heartTexture = this.createHeartTexture();

    // Score Text
    this.scoreText = new PIXI.Text({
      text: "Score: 0",
      style: { fontFamily: "Arial", fontSize: 24, fill: 0xffffff },
    });
    this.scoreText.x = this.app.screen.width - 140;
    this.scoreText.y = 20;
    this.app.stage.addChild(this.scoreText);

    // Time Text
    this.timeText = new PIXI.Text({
      text: "Time: 30",
      style: { fontFamily: "Arial", fontSize: 24, fill: 0xffffff },
    });
    this.timeText.x = this.app.screen.width - 280;
    this.timeText.y = 20;
    this.app.stage.addChild(this.timeText);

    // Lives
    this.livesContainer = new PIXI.Container();
    this.livesContainer.x = 20;
    this.livesContainer.y = 20;
    this.app.stage.addChild(this.livesContainer);
  }

  public updateScore(score: number) {
    this.scoreText.text = `Score: ${score}`;
  }

  public updateTime(remainingTime: number) {
    this.timeText.text = `Time: ${Math.ceil(remainingTime)}`;
  }

  public updateLives(lives: number) {
    this.livesContainer.removeChildren();
    for (let i = 0; i < lives; i++) {
      const heart = new PIXI.Sprite(this.heartTexture);
      heart.x = i * (this.heartTexture.width + 5);
      this.livesContainer.addChild(heart);
    }
  }

  private createHeartTexture(): PIXI.Texture {
    const gfx = new PIXI.Graphics();
    gfx.beginFill(0xff0000);

    gfx.moveTo(12, 20);
    gfx.bezierCurveTo(12, 12, 0, 12, 0, 6);
    gfx.bezierCurveTo(0, 0, 6, 0, 12, 6);
    gfx.bezierCurveTo(18, 0, 24, 0, 24, 6);
    gfx.bezierCurveTo(24, 12, 12, 12, 12, 20);

    gfx.endFill();

    return this.app.renderer.generateTexture(gfx);
  }
}