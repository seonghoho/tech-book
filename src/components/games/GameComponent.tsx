"use client";

import dynamic from "next/dynamic";
import { useState, useRef } from "react";
import StartMenu from "./ui/StartMenu";
import GameOverModal from "./ui/GameOverModal";
import { IGame } from "@/types/game";
import { GuideComponents } from "@/components/games/guide";

// Dynamically import GameClientWrapper to ensure it's client-side rendered
const GameClientWrapper = dynamic(() => import("./GameClientWrapper"), {
  ssr: false,
});

interface GameComponentProps {
  gameName: string;
}

const GameComponent = ({ gameName }: GameComponentProps) => {
  const [gameState, setGameState] = useState<"ready" | "playing" | "gameOver">(
    "ready"
  );
  const [score, setScore] = useState<number>(0);
  const gameInstanceRef = useRef<IGame | null>(null); // Ref to hold the Game class instance

  const Guide =
    GuideComponents[gameName as keyof typeof GuideComponents] || null;

  const handleStartGame = () => {
    setGameState("playing");
    if (gameInstanceRef.current) {
      // console.log(gameInstanceRef.current);
      gameInstanceRef.current.start();
    }
  };

  const handleRestartGame = () => {
    setScore(0);
    setGameState("playing");
    if (gameInstanceRef.current) {
      gameInstanceRef.current.start();
    }
  };

  const handleGameOver = (finalScore: number | string) => {
    setScore(typeof finalScore === "number" ? finalScore : 0); // Assuming score is number for display
    setGameState("gameOver");
  };

  const handleScoreUpdate = (newScore: number) => {
    setScore(newScore);
  };

  // Callback to receive the game instance from GameClientWrapper
  const onGameInstanceReady = (game: IGame) => {
    gameInstanceRef.current = game;
    // Set up listeners for game events
    game.onGameOverCallback = handleGameOver;
    game.onScoreUpdateCallback = handleScoreUpdate;
  };

  return (
    <div className="relative w-full h-full">
      <div className="min-h-[500px] h-[50vh]">
        {gameState === "ready" && <StartMenu onStart={handleStartGame} />}
        {gameState === "gameOver" && (
          <GameOverModal score={score} onRestart={handleRestartGame} />
        )}
        <GameClientWrapper
          gameName={gameName}
          onGameInstanceReady={onGameInstanceReady}
          onGameOver={handleGameOver}
          onScoreUpdate={handleScoreUpdate}
        />
      </div>
      {Guide && <Guide />}
    </div>
  );
};

export default GameComponent;
