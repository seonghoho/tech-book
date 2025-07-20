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
    backgroundColor: 0x000000, // Black background for space
    resolution: window.devicePixelRatio || 1,
  });

  // Create a simple spaceship (triangle)
  const spaceship = new PIXI.Graphics();
  spaceship.beginFill(0x00ff00); // Green color
  spaceship.moveTo(0, -20);
  spaceship.lineTo(20, 20);
  spaceship.lineTo(-20, 20);
  spaceship.closePath();
  spaceship.endFill();

  // Center the spaceship
  spaceship.x = app.screen.width / 2;
  spaceship.y = app.screen.height - 50;

  app.stage.addChild(spaceship);

  // Simple movement (e.g., move left/right with keys)
  let speed = 0;
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      speed = -5;
    } else if (e.key === "ArrowRight") {
      speed = 5;
    }
  });

  window.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      speed = 0;
    }
  });

  app.ticker.add(() => {
    spaceship.x += speed;
    // Keep spaceship within bounds
    if (spaceship.x < 0) spaceship.x = 0;
    if (spaceship.x > app.screen.width) spaceship.x = app.screen.width;
  });

  // Handle resize
  const handleResize = () => {
    app.renderer.resize(container.clientWidth, container.clientHeight);
    spaceship.x = app.screen.width / 2;
    spaceship.y = app.screen.height - 50;
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
