import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { GameState, Difficulty } from '../types/game';

interface GameContextType {
  gameState: GameState;
  updateScore: (score: number) => void;
  updateLevel: (level: number) => void;
  setDifficulty: (difficulty: Difficulty['level']) => void;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [gameState, setGameState] = useState<GameState>({
    currentScore: 0,
    currentLevel: 1,
    isPlaying: false,
    isPaused: false,
    difficulty: 'easy',
  });

  const updateScore = (score: number) => {
    setGameState(prev => ({ ...prev, currentScore: score }));
  };

  const updateLevel = (level: number) => {
    setGameState(prev => ({ ...prev, currentLevel: level }));
  };

  const setDifficulty = (difficulty: Difficulty['level']) => {
    setGameState(prev => ({ ...prev, difficulty }));
  };

  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      isPaused: false,
      currentScore: 0,
      currentLevel: 1,
    }));
  };

  const pauseGame = () => {
    setGameState(prev => ({ ...prev, isPaused: true }));
  };

  const resumeGame = () => {
    setGameState(prev => ({ ...prev, isPaused: false }));
  };

  const endGame = () => {
    setGameState(prev => ({
      ...prev,
      isPlaying: false,
      isPaused: false,
    }));
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        updateScore,
        updateLevel,
        setDifficulty,
        startGame,
        pauseGame,
        resumeGame,
        endGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}