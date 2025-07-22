export interface IGame {
  start: () => void;
  destroy: () => void;
  onGameOverCallback?: (score: number | string) => void;
  onScoreUpdateCallback?: (score: number) => void;
  // Add other public methods/properties of Game class if needed by React components
}
