import { Game } from "@/games/space-shooter/game/Game";
import * as PIXI from "pixi.js";

export class Player {
  private app: PIXI.Application;
  private game: Game;
  public display: PIXI.Sprite | undefined;

  x: number;
  y: number;
  width: number = 50;
  height: number = 50;
  speed: number = 10;

  keys: Record<string, boolean> = {};

  constructor(app: PIXI.Application, game: Game, x: number, y: number) {
    this.app = app;
    this.game = game;
    this.x = x;
    this.y = y;

    PIXI.Assets.load("/assets/space-shooter/assets/png/SpaceShip.png").then(
      (texture) => {
        this.display = new PIXI.Sprite(texture);
        this.display.width = this.width;
        this.display.height = this.height;
        this.display.anchor.set(0.5);
        this.display.x = this.x;
        this.display.y = this.y;
        this.app.stage.addChild(this.display);
      }
    );
  }

  public updateDisplay() {
    if (!this.display) return;
    this.display.x = this.x;
    this.display.y = this.y;
  }

  public update(canvasWidth: number) {
    if (this.keys["ArrowLeft"]) {
      this.x -= this.speed;
    }
    if (this.keys["ArrowRight"]) {
      this.x += this.speed;
    }
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > canvasWidth) this.x = canvasWidth - this.width;

    this.updateDisplay();
  }

  public handleKeyDown(key: string) {
    this.keys[key] = true;
  }

  public handleKeyUp(key: string) {
    this.keys[key] = false;
  }
}
