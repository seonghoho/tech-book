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

  useEffect(() => {
    const container = gameContainerRef.current;
    let isActive = true;

    // 🚩 이미 canvas가 있으면 아무것도 하지 않음
    if (!gameName || !container) return;
    if (container.querySelector("canvas")) return;

    let destroy: (() => void) | null = null;

    const loadGame = async () => {
      try {
        console.log("=== 게임 모듈 import 시도 ===");
        const gameModule = await import(`@/games/${gameName}`);
        console.log("=== 게임 모듈 import 완료 ===", gameModule);

        if (gameModule && typeof gameModule.init === "function") {
          const result = await gameModule.init(
            container,
            onGameOver,
            onScoreUpdate
          );
          destroy = result.destroy;
          if (!isActive) {
            if (destroy) destroy();
            return;
          }
          if (onGameInstanceReady) onGameInstanceReady(result.gameInstance);
        } else {
          console.error("Loaded game module does not have an init function.");
        }
      } catch (error) {
        console.error("Failed to load or initialize the game:", error);
      }
    };

    loadGame();

    return () => {
      isActive = false;
      // 정리: destroy 실행 + 남아있는 canvas 모두 제거
      if (destroy) destroy();
      if (container) {
        container.querySelectorAll("canvas").forEach((c) => c.remove());
        container.innerHTML = "";
      }
    };
  }, []);

  return (
    <div ref={gameContainerRef} style={{ width: "100%", height: "100%" }} />
  );
};

export default GameClientWrapper;
