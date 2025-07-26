"use client";

import dynamic from "next/dynamic";
import { useState, useRef } from "react";
import StartMenu from "./pixel-runner/ui/StartMenu";
import GameOverModal from "./pixel-runner/ui/GameOverModal";
import { IGame } from "@/types/game";

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

  const handleStartGame = () => {
    setGameState("playing");
    if (gameInstanceRef.current) {
      console.log(gameInstanceRef.current);
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
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        border: "1px solid #ccc",
      }}
    >
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
  );
};

export default GameComponent;
