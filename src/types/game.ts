export interface IGame {
  start: () => void;
  destroy: () => void;
  onGameOverCallback?: (score: number | string) => void;
  onScoreUpdateCallback?: (score: number) => void;
}
