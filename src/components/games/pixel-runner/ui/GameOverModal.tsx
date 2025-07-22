"use client";

interface GameOverModalProps {
  score: number | string;
  onRestart: () => void;
}

const GameOverModal = ({ score, onRestart }: GameOverModalProps) => {
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
      <h2>Game Over</h2>
      <h4>Your Score: {score}</h4>
      <button
        onClick={onRestart}
        style={{
          padding: "10px 20px",
          fontSize: "1.2em",
          cursor: "pointer",
        }}
      >
        Restart
      </button>
    </div>
  );
};

export default GameOverModal;
