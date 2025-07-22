"use client";

interface StartMenuProps {
  onStart: () => void;
}

const StartMenu = ({ onStart }: StartMenuProps) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        color: "white",
        zIndex: 100,
      }}
    >
      <h1>Pixel Runner</h1>
      <button
        onClick={onStart}
        style={{
          padding: "10px 20px",
          fontSize: "1.2em",
          cursor: "pointer",
        }}
      >
        Start Game
      </button>
    </div>
  );
};

export default StartMenu;
