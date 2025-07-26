"use client";

interface GameOverModalProps {
  score: number | string;
  onRestart: () => void;
}

const GameOverModal = ({ score, onRestart }: GameOverModalProps) => {
  return (
    <div className="absolute top-0 left-0 w-full h-[400px] flex flex-col justify-center items-center bg-black/70 text-white z-[100] font-press">
      <h2 className="text-3xl mb-2">Game Over</h2>
      <h4 className="text-xl mb-4">Your Score: {score}</h4>
      <button
        onClick={onRestart}
        className="px-5 py-2 text-lg cursor-pointer bg-white text-black rounded hover:bg-gray-200"
      >
        Restart
      </button>
    </div>
  );
};

export default GameOverModal;
