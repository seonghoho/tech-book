type KeyHandler = (e: KeyboardEvent) => void;

export class KeyboardManager {
  private handlers: KeyHandler[] = [];
  private boundOnKeyDown: (e: KeyboardEvent) => void;

  constructor() {
    this.boundOnKeyDown = this.onKeyDown.bind(this);
  }

  public listen() {
    window.addEventListener("keydown", this.boundOnKeyDown);
  }

  public unlisten() {
    window.removeEventListener("keydown", this.boundOnKeyDown);
  }

  public register(handler: KeyHandler) {
    this.handlers.push(handler);
  }

  public unregister(handler: KeyHandler) {
    this.handlers = this.handlers.filter((h) => h !== handler);
  }

  private onKeyDown = (e: KeyboardEvent) => {
    this.handlers.forEach((handler) => handler(e));
  };

  public destroy() {
    this.unlisten();
    this.handlers = [];
  }
}
