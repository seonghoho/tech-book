type KeyHandler = (e: KeyboardEvent) => void;

export class KeyboardManager {
  private keyDownHandlers: KeyHandler[] = [];
  private keyUpHandlers: KeyHandler[] = [];
  private boundOnKeyDown: (e: KeyboardEvent) => void;
  private boundOnKeyUp: (e: KeyboardEvent) => void;

  constructor() {
    this.boundOnKeyDown = this.onKeyDown.bind(this);
    this.boundOnKeyUp = this.onKeyUp.bind(this);
  }

  public listen() {
    window.addEventListener("keydown", this.boundOnKeyDown);
    window.addEventListener("keyup", this.boundOnKeyUp);
  }

  public unlisten() {
    window.removeEventListener("keydown", this.boundOnKeyDown);
    window.removeEventListener("keyup", this.boundOnKeyUp);
  }

  public registerKeyDown(handler: KeyHandler) {
    this.keyDownHandlers.push(handler);
  }

  public unregisterKeyDown(handler: KeyHandler) {
    this.keyDownHandlers = this.keyDownHandlers.filter((h) => h !== handler);
  }

  public registerKeyUp(handler: KeyHandler) {
    this.keyUpHandlers.push(handler);
  }

  public unregisterKeyUp(handler: KeyHandler) {
    this.keyUpHandlers = this.keyUpHandlers.filter((h) => h !== handler);
  }

  private onKeyDown = (e: KeyboardEvent) => {
    const allowDefault =
      e.metaKey || // macOS Command
      (e.ctrlKey &&
        ["c", "v", "x", "a", "z", "y"].includes(e.key.toLowerCase()));

    if (!allowDefault) {
      e.preventDefault();
    }

    this.keyDownHandlers.forEach((handler) => handler(e));
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keyUpHandlers.forEach((handler) => handler(e));
  };

  public destroy() {
    this.unlisten();
    this.keyDownHandlers = [];
    this.keyUpHandlers = [];
  }
}
