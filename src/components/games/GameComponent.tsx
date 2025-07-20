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

      gameRef.current.innerHTML = "";

      const loadAndInitGame = async () => {
        try {
          const gameModule = await loadGameModule(gameSlug);
          if (gameRef.current) {
            destroyGameRef.current = await gameModule.init(gameRef.current);
          }
        } catch (error: unknown) {
          if (gameRef.current) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "An unknown error occurred";
            gameRef.current.innerHTML = `<p class="text-center text-red-500 dark:text-red-400">Error loading game: ${errorMessage}</p>`;
          }
        }
      };

      loadAndInitGame();
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
