import * as PIXI from "pixi.js";
import gameConfig from "../config/game-config.json";

export class Bullet {
  public display: PIXI.Container; // Container to hold sprite
  x: number;
  y: number;
  width: number = gameConfig.bulletWidth;
  height: number = gameConfig.bulletHeight;
  speed: number = gameConfig.bulletSpeed;

  private sprite: PIXI.Sprite;

  constructor(app: PIXI.Application, x: number, y: number) {
    this.x = x;
    this.y = y;

    // Create canvas texture with gradient and highlight
    const canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = this.height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, this.width, 0);
      gradient.addColorStop(0, "#fff5a1");
      gradient.addColorStop(0.5, "#ffd600");
      gradient.addColorStop(1, "#b38f00");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, this.width, this.height);

      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.beginPath();
      ctx.ellipse(
        this.width * 0.25,
        this.height * 0.5,
        this.width * 0.15,
        this.height * 0.4,
        0,
        0,
        2 * Math.PI
      );
      ctx.fill();

      const trailGradient = ctx.createLinearGradient(
        this.width,
        0,
        this.width * 1.5,
        0
      );
      trailGradient.addColorStop(0, "rgba(255, 214, 0, 0.8)");
      trailGradient.addColorStop(1, "rgba(255, 214, 0, 0)");
      ctx.fillStyle = trailGradient;
      ctx.fillRect(this.width, 0, this.width / 2, this.height);
    }

    const texture = PIXI.Texture.from(canvas);
    this.sprite = new PIXI.Sprite(texture);
    this.sprite.anchor.set(0.5);

    // Blur filter
    const blurFilter = new PIXI.BlurFilter();
    blurFilter.blur = 2;
    this.sprite.filters = [blurFilter];

    this.display = new PIXI.Container();
    this.display.addChild(this.sprite);
    this.display.x = this.x;
    this.display.y = this.y;
  }

  update() {
    this.y -= this.speed;
    this.display.y = this.y;
  }
}
