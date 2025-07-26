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
      <div className="h-[400px]">
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
      <div className="flex flex-col gap-4">
        <div className="font-press flex flex-col sm:flex-row items-center justify-center font-semibold text-lg py-2">
          <span>캐릭터를 이동해 30초 동안 </span>
          <span>장애물을 피해보세요!</span>
        </div>
        <div className="font-press flex flex-col lg:flex-row gap-4 justify-center items-center text-sm">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center justify-center sm:justify-between w-full sm:w-auto">
            <div className="flex justify-between sm:gap-2 sm:w-auto w-48">
              <span>이동</span>
              <span>← →</span>
            </div>
            <div className="flex justify-between sm:gap-2 sm:w-auto w-48">
              <span>점프</span>
              <span>Space</span>
            </div>
            <div className="flex justify-between sm:gap-2 sm:w-auto w-48">
              <span>공격</span>
              <span>Z/X/C</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center justify-center sm:justify-between w-full sm:w-auto">
            <div className="flex justify-between sm:gap-2 sm:w-auto w-48">
              <span>쉴드</span>
              <span>Q</span>
            </div>
            <div className="flex justify-between sm:gap-2 sm:w-auto w-48">
              <span>캐릭터 선택</span>
              <span>1/2/3</span>
            </div>
            <div className="flex justify-between sm:gap-2 sm:w-auto w-48">
              <span>배경</span>
              <span>Tab+1/Tab+2</span>
            </div>
            <div className="flex justify-between sm:gap-2 sm:w-auto w-48">
              <span>재시작</span>
              <span>R</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameComponent;
