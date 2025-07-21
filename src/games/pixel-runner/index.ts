import * as PIXI from "pixi.js";

export async function init(container: HTMLDivElement) {
  container.innerHTML = ""; // Ensure the container is empty before appending a new canvas

  const canvas = document.createElement("canvas");
  container.appendChild(canvas);

  const app = new PIXI.Application();
  await app.init({
    view: canvas, // Explicitly provide the canvas
    width: container.clientWidth,
    height: container.clientHeight,
    backgroundColor: 0x1099bb,
    resolution: window.devicePixelRatio || 1,
  });
  // Create a red rectangle
  const rectangle = new PIXI.Graphics();
  rectangle.beginFill(0xff0000); // Red color
  rectangle.drawRect(0, 0, 100, 100); // x, y, width, height
  rectangle.endFill();

  // Center the rectangle
  rectangle.x = app.screen.width / 2 - rectangle.width / 2;
  rectangle.y = app.screen.height / 2 - rectangle.height / 2;

  app.stage.addChild(rectangle);

  // Simple animation
  app.ticker.add(() => {
    rectangle.rotation += 0.01;
  });

  // Handle resize
  const handleResize = () => {
    app.renderer.resize(container.clientWidth, container.clientHeight);
    rectangle.x = app.screen.width / 2 - rectangle.width / 2;
    rectangle.y = app.screen.height / 2 - rectangle.height / 2;
  };

  window.addEventListener("resize", handleResize);

  return () => {
    window.removeEventListener("resize", handleResize);
    app.destroy(true);
    // Remove the canvas element from the container when destroying
    if (container.contains(canvas)) {
      container.removeChild(canvas);
    }
  };
}
