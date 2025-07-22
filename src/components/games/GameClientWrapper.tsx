"use client";

import { useEffect, useRef } from "react";
import { IGame } from "@/types/game";

interface GameClientWrapperProps {
  gameName: string;
  onGameInstanceReady?: (game: IGame) => void;
  onGameOver?: (score: number | string) => void;
  onScoreUpdate?: (score: number) => void;
}

const GameClientWrapper = ({
  gameName,
  onGameInstanceReady,
  onGameOver,
  onScoreUpdate,
}: GameClientWrapperProps) => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const initializedRef = useRef<boolean>(false); // New ref to track initialization

  useEffect(() => {
    const loadGame = async () => {
      if (!gameName) {
        console.warn("gameName is empty or undefined, skipping game load.");
        return;
      }

      // Prevent re-initialization if already initialized
      if (initializedRef.current) {
        return;
      }

      if (gameContainerRef.current) {
        gameContainerRef.current.innerHTML = "";
        try {
          const gameModule = await import(`@/games/${gameName}`);
          if (gameModule && typeof gameModule.init === "function") {
            const { gameInstance, destroy } = await gameModule.init(
              gameContainerRef.current,
              onGameOver,
              onScoreUpdate
            );
            cleanupRef.current = () => {
              if (destroy) destroy();
              if (gameContainerRef.current) {
                gameContainerRef.current.innerHTML = "";
              }
            };
            if (onGameInstanceReady) {
              onGameInstanceReady(gameInstance);
            }
            initializedRef.current = true; // Mark as initialized
          } else {
            console.error("Loaded game module does not have an init function.");
          }
        } catch (error) {
          console.error("Failed to load or initialize the game:", error);
        }
      }
    };
    loadGame();

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      initializedRef.current = false; // Reset on cleanup/unmount
    };
  }, [gameName, onGameInstanceReady, onGameOver, onScoreUpdate]);

  return (
    <div ref={gameContainerRef} style={{ width: "100%", height: "100%" }} />
  );
};

export default GameClientWrapper;
