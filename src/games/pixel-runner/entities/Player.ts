import * as PIXI from "pixi.js";
import characterConfig from "../config/character-config.json";
import { Game } from "../game/Game";

type Character = "Fighter" | "Samurai" | "Shinobi";
type AnimationName =
  | "Idle"
  | "Run"
  | "Walk"
  | "Jump"
  | "Attack_1"
  | "Attack_2"
  | "Attack_3"
  | "Shield"
  | "Hurt"
  | "Dead";

interface AnimationData {
  frames: number;
  frameWidth: number;
  frameHeight: number;
  isSpriteSheet: boolean;
}

interface CharacterConfig {
  [key: string]: {
    [key: string]: AnimationData;
  };
}

export class Player {
  private app: PIXI.Application;
  private game: Game;
  public sprite: PIXI.AnimatedSprite;
  private animations: Record<string, PIXI.Texture[]> = {};
  private character: Character = "Fighter";
  private config!: CharacterConfig;

  // State
  private lives = 3;
  private speed = 3;
  private runSpeed = 5;
  private jumpPower = 18;
  private gravity = 0.8;
  private velocityY = 0;

  private isJumping = false;
  private isAttacking = false;
  private isShielding = false;
  private isRunning = false;
  private isHurt = false;
  private hurtTimer = 0;
  private isInvincible = false;
  private invincibleTimer = 0;
  private isDead = false;
  private isWin = false;
  private groundYOffset = -30;

  // Input state
  private keys: Record<string, boolean> = {};
  private lastDirPressTime = 0;
  private lastDirection: "left" | "right" | null = null;
  private doubleTapThreshold = 250; // ms

  constructor(app: PIXI.Application, game: Game) {
    this.app = app;
    this.game = game;
    this.sprite = new PIXI.AnimatedSprite([PIXI.Texture.EMPTY]);
    this.sprite.anchor.set(0.5);
  }

  public async init() {
    this.config = characterConfig;
    await this.switchCharacter("Fighter");
    this.app.stage.addChild(this.sprite); // Add sprite to stage
    this.sprite.visible = false; // Hide initially
  }

  public reset() {
    this.lives = 3;
    this.isHurt = false;
    this.isInvincible = false;
    this.isDead = false;
    this.isWin = false;
    this.isJumping = false;
    this.isAttacking = false;
    this.isShielding = false;
    this.isRunning = false;

    this.velocityY = 0;
    this.hurtTimer = 0;
    this.invincibleTimer = 0;

    this.keys = {};
    this.lastDirPressTime = 0;
    this.lastDirection = null;

    this.sprite.onComplete = undefined; // Clear any pending animation callbacks
    this.sprite.visible = true;
    this.sprite.x = 150;
    this.sprite.scale.x = 1; // Reset direction

    const groundY = this.app.screen.height - 100 + this.groundYOffset;
    this.sprite.y = groundY - this.sprite.height / 2; // align bottom of sprite to ground

    this.setAnimation("Walk", true);
  }

  public async switchCharacter(character: Character) {
    this.character = character;
    const assetMap = this.config[this.character];

    for (const animName of Object.keys(assetMap)) {
      const animData = assetMap[animName];
      const textures: PIXI.Texture[] = [];

      if (animData.isSpriteSheet) {
        const sheetTexture = await PIXI.Assets.load(
          `/assets/pixel-runner/assets/png/${this.character}/${animName}.png`
        );

        for (let i = 0; i < animData.frames; i++) {
          const frame = new PIXI.Rectangle(
            i * animData.frameWidth,
            0,
            animData.frameWidth,
            animData.frameHeight
          );
          textures.push(
            new PIXI.Texture({ source: sheetTexture.source, frame })
          );
        }
      } else {
        // For single image animations like Hurt, Dead
        const texture = await PIXI.Assets.load(
          `/assets/pixel-runner/assets/png/${this.character}/${animName}.png`
        );
        textures.push(texture);
      }
      this.animations[animName] = textures;
    }
    this.setAnimation("Walk", true);
  }

  public update() {
    console.log(`Player.ts: update - Full keys object:`, { ...this.keys });
    // --- Invincibility Timer ---
    if (this.isInvincible) {
      this.invincibleTimer -= this.app.ticker.deltaMS;
      this.sprite.visible = Math.floor(this.invincibleTimer / 100) % 2 === 0; // Blink effect
      if (this.invincibleTimer <= 0) {
        this.isInvincible = false;
        this.sprite.visible = true;
      }
    }

    // --- Hurt Timer ---
    if (this.isHurt) {
      this.hurtTimer -= this.app.ticker.deltaMS;
      if (this.hurtTimer <= 0) {
        this.isHurt = false;
      }
    }

    // --- Gravity and Ground Check ---
    this.velocityY += this.gravity;
    this.sprite.y += this.velocityY;
    const groundY = this.app.screen.height - 100 + this.groundYOffset;

    if (this.sprite.y >= groundY) {
      this.sprite.y = groundY;
      this.velocityY = 0;
      if (this.isJumping) {
        this.isJumping = false;
      }
    }

    // --- Handle Actions based on key state ---
    // Actions are only allowed if not currently hurt, dead, or destroyed
    if (!this.isHurt && !this.sprite.destroyed && !this.isDead && !this.isWin) {
      if (this.keys["Space"]) this.jump();
      if (this.keys["KeyZ"]) this.attack(1);
      if (this.keys["KeyX"]) this.attack(2);
      if (this.keys["KeyC"]) this.attack(3);
      this.shield(this.keys["KeyQ"]);
    }

    // --- Horizontal Movement ---
    const isMoving = this.keys["ArrowLeft"] || this.keys["ArrowRight"];
    if (
      !this.isAttacking &&
      !this.isShielding &&
      !this.isHurt &&
      !this.isDead
    ) {
      // Allow movement even if hurt animation is playing
      const speed = this.isRunning ? this.runSpeed : this.speed;
      if (this.keys["ArrowLeft"]) {
        this.sprite.x -= speed;
        if (this.sprite.scale.x !== -1) this.sprite.scale.x = -1;
      } else if (this.keys["ArrowRight"]) {
        this.sprite.x += speed;
        if (this.sprite.scale.x !== 1) this.sprite.scale.x = 1;
      }
    }

    // --- Animation Logic ---
    // Prioritize Dead, Hurt, Attack, Jump, Shield animations
    if (
      this.isDead ||
      this.lives <= 0 ||
      this.sprite.destroyed ||
      this.sprite.textures === this.animations["Dead"]
    ) {
      this.setAnimation("Dead", false);
    } else if (this.isHurt) {
      this.setAnimation("Hurt", false); // Hurt animation should play once
    } else if (this.isAttacking) {
      // Attack animation is set in attack() method, no change here
    } else if (this.isJumping) {
      this.setAnimation("Jump", true); // Jump animation loops while in air
    } else if (this.isShielding) {
      this.setAnimation("Shield", true); // Shield animation loops while active
    } else if (isMoving) {
      this.setAnimation(this.isRunning ? "Run" : "Walk", true);
    } else if (
      !this.isDead &&
      !this.isWin &&
      !this.isHurt &&
      !this.isAttacking &&
      !this.isShielding &&
      !this.isJumping
    ) {
      this.setAnimation("Walk", true);
    }
    // --- Clamp Player's X Position ---
    const halfWidth = this.sprite.width / 2;
    const minX = halfWidth;
    const maxX = this.app.screen.width - halfWidth;

    if (this.sprite.x < minX) {
      this.sprite.x = minX;
    }
    if (this.sprite.x > maxX) {
      this.sprite.x = maxX;
    }
  }

  private setAnimation(name: AnimationName, loop: boolean) {
    if (!this.animations[name]) {
      console.warn(
        `Animation "${name}" not found for character "${this.character}"`
      );
      return;
    }
    // Only change animation if it's different or loop state changes
    if (
      this.sprite.textures === this.animations[name] &&
      this.sprite.loop === loop
    )
      return;

    this.sprite.textures = this.animations[name];
    this.sprite.loop = loop;
    this.sprite.animationSpeed = 0.2;
    this.sprite.gotoAndPlay(0);
  }

  public handleKeyDown(key: string, isRepeat: boolean) {
    console.log(`Player.ts: handleKeyDown - Key: ${key}, isRepeat: ${isRepeat}`);
    this.keys[key] = true;
    console.log(`Player.ts: handleKeyDown - After setting ${key}:`, this.keys[key], "Full keys object:", { ...this.keys });
    if (key === "ArrowLeft" || key === "ArrowRight") {
      const direction = key === "ArrowLeft" ? "left" : "right";
      const now = Date.now();
      if (
        this.lastDirection === direction &&
        now - this.lastDirPressTime < this.doubleTapThreshold
      ) {
        this.isRunning = true;
      } else {
        this.isRunning = false;
      }
      this.lastDirPressTime = now;
      this.lastDirection = direction;
    }

    // Only process character switch on initial key press
    if (isRepeat) return;

    switch (key) {
      case "Digit1":
        this.switchCharacter("Fighter");
        break;
      case "Digit2":
        this.switchCharacter("Samurai");
        break;
      case "Digit3":
        this.switchCharacter("Shinobi");
        break;
    }
  }

  public handleKeyUp(key: string) {
    console.log(`Player.ts: handleKeyUp - Key: ${key}`);
    this.keys[key] = false;
    console.log(`Player.ts: handleKeyUp - After setting ${key}:`, this.keys[key], "Full keys object:", { ...this.keys });
    if (key === "ArrowLeft" || key === "ArrowRight") {
      this.isRunning = false;
      this.lastDirection = this.keys["ArrowLeft"]
        ? "left"
        : this.keys["ArrowRight"]
        ? "right"
        : null;
    }
  }

  private jump() {
    if (
      this.isJumping ||
      this.isAttacking ||
      this.isShielding ||
      this.isHurt ||
      this.isWin
    )
      return;
    this.isJumping = true;
    this.velocityY = -this.jumpPower;
    this.setAnimation("Jump", true);
  }

  private attack(attackType: 1 | 2 | 3) {
    if (
      this.isJumping ||
      this.isAttacking ||
      this.isShielding ||
      this.isHurt ||
      this.isWin
    )
      return;
    this.isAttacking = true;
    this.setAnimation(`Attack_${attackType}` as AnimationName, false);
    this.sprite.onComplete = () => {
      this.isAttacking = false;
      // After attack, return to appropriate animation (walk/run/idle)
      if (
        (!this.isJumping && !this.isShielding && !this.isHurt) ||
        this.isWin
      ) {
        // Check isHurt here too
        const isMoving = this.keys["ArrowLeft"] || this.keys["ArrowRight"];
        this.setAnimation(
          isMoving ? (this.isRunning ? "Run" : "Walk") : "Walk",
          true
        );
      }
      this.sprite.onComplete = undefined;
    };
  }

  private shield(active: boolean) {
    if (this.isJumping || this.isAttacking || this.isHurt || this.isWin) return;
    if (active && !this.isShielding) {
      this.isShielding = true;
      this.setAnimation("Shield", true);
    } else if (!active && this.isShielding) {
      this.isShielding = false;
      // After shield, return to appropriate animation (walk/run/idle)
      if (!this.isJumping && !this.isAttacking && !this.isHurt) {
        // Check isHurt here too
        const isMoving = this.keys["ArrowLeft"] || this.keys["ArrowRight"];
        this.setAnimation(
          isMoving ? (this.isRunning ? "Run" : "Walk") : "Walk",
          true
        );
      }
    }
  }

  public hurt() {
    if (this.isInvincible || this.isAttacking || this.isShielding || this.isWin)
      return;
    this.lives--;
    if (this.lives <= 0) {
      this.die();
    } else {
      this.isHurt = true;
      this.hurtTimer = 500; // Stay in hurt state for 500ms
      this.isInvincible = true;
      this.invincibleTimer = 1500; // 1.5 seconds of invincibility
      this.setAnimation("Hurt", false);
    }
  }

  private die() {
    this.isDead = true;
    this.setAnimation("Dead", false);
    this.sprite.onComplete = () => {
      this.sprite.gotoAndStop(this.sprite.totalFrames - 1); // Show last dead frame
      this.game.gameOver();
      this.sprite.onComplete = undefined;
    };
  }

  public timeUp() {
    this.isWin = true;
    this.setAnimation("Dead", false);
    this.sprite.onComplete = () => {
      this.sprite.gotoAndStop(this.sprite.totalFrames - 1);
      this.game.winGame();
      this.sprite.onComplete = undefined;
    };
  }

  public getLives(): number {
    return this.lives;
  }
}
