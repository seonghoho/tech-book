"use client";

import React, { useEffect, useRef } from "react";
import { loadGameModule } from "@/lib/gameLoader";

export interface GameComponentProps {
  gameSlug: string;
}

const GameComponent: React.FC<GameComponentProps> = ({ gameSlug }) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const destroyGameRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (gameRef.current) {
      // Clean up previous game instance if any
      if (destroyGameRef.current) {
        destroyGameRef.current();
        destroyGameRef.current = null;
      }

      gameRef.current.innerHTML = ""; // Clear previous content

      loadGameModule(gameSlug)
        .then((module) => {
          if (gameRef.current) {
            destroyGameRef.current = module.init(gameRef.current);
          }
        })
        .catch((error) => {
          console.error(`Failed to load game ${gameSlug}:`, error);
          if (gameRef.current) {
            gameRef.current.innerHTML = `<p class="text-center text-red-500 dark:text-red-400">Error loading game: ${error.message}</p>`;
          }
        });
    }

    return () => {
      // Cleanup when component unmounts
      if (destroyGameRef.current) {
        destroyGameRef.current();
        destroyGameRef.current = null;
      }
    };
  }, [gameSlug]);

  return (
    <div
      ref={gameRef}
      className="w-full h-full flex items-center justify-center"
    ></div>
  );
};

export default GameComponent;
