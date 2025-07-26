"use client";

interface StartMenuProps {
  onStart: () => void;
}

const StartMenu = ({ onStart }: StartMenuProps) => {
  return (
    <div className="font-press absolute top-0 left-0 w-full h-[400px] flex flex-col justify-center items-center bg-black/70 text-white z-[100]">
      <h1>Pixel Runner</h1>
      <button
        onClick={onStart}
        className="px-5 py-2 text-[1.2em] cursor-pointer"
      >
        Start Game
      </button>
    </div>
  );
};

export default StartMenu;
