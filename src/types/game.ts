export interface Game {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: 'puzzle' | 'action' | 'memory' | 'logic';
  minPlayers: number;
  maxPlayers: number;
}

export interface GameResult {
  id: string;
  gameId: string;
  playerId: string;
  score: number;
  level: number;
  completedAt: Date;
}

export interface Difficulty {
  level: 'easy' | 'medium' | 'hard' | 'expert';
  label: string;
  multiplier: number;
}

export interface GameState {
  currentScore: number;
  currentLevel: number;
  isPlaying: boolean;
  isPaused: boolean;
  difficulty: Difficulty['level'];
}