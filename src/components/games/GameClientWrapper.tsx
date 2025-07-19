"use client";

import dynamic from "next/dynamic";
import { type GameComponentProps } from "./GameComponent";

interface GameClientWrapperProps {
  gameSlug: string;
}

const GameComponent = dynamic<GameComponentProps>(
  () => import("./GameComponent"),
  {
    ssr: false,
    loading: () => <p>Loading game...</p>,
  }
);

export default function GameClientWrapper({
  gameSlug,
}: GameClientWrapperProps) {
  return (
    <div className="w-full h-[600px] bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
      <GameComponent gameSlug={gameSlug} />
    </div>
  );
}
