import { cloneElement, isValidElement } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GameProvider, useGame } from '../contexts/GameContext';
import type { Difficulty } from '../types/game';
import './GameContainer.css';

interface GameContainerProps {
  children: ReactNode;
}

function GameContainerInner({ children }: GameContainerProps) {
  const { t } = useTranslation();
  const { gameState, setDifficulty } = useGame();

  const difficulties: Difficulty[] = [
    { level: 'easy', label: t('common.easy'), multiplier: 1 },
    { level: 'medium', label: t('common.medium'), multiplier: 1.5 },
    { level: 'hard', label: t('common.hard'), multiplier: 2 },
    { level: 'expert', label: t('common.expert', { defaultValue: 'Expert' }), multiplier: 3 },
  ];

  const handleDifficultyChange = (level: Difficulty['level']) => {
    setDifficulty(level);
  };

  const childrenWithProps = isValidElement(children)
    ? cloneElement(children as React.ReactElement<{ difficulty?: Difficulty['level'] }>, { difficulty: gameState.difficulty })
    : children;

  return (
    <div className="game-container">
      <header className="game-header">
        <Link to="/" className="back-button">
          ← {t('common.backToHome')}
        </Link>
        
        <div className="difficulty-selector">
          <span>{t('common.difficulty')}:</span>
          {difficulties.map((diff) => (
            <button
              key={diff.level}
              className={`difficulty-btn ${gameState.difficulty === diff.level ? 'active' : ''}`}
              onClick={() => handleDifficultyChange(diff.level)}
              disabled={gameState.isPlaying}
            >
              {diff.label}
            </button>
          ))}
        </div>
      </header>
      
      <main className="game-content">
        {childrenWithProps}
      </main>
    </div>
  );
}

function GameContainer({ children }: GameContainerProps) {
  return (
    <GameProvider>
      <GameContainerInner>{children}</GameContainerInner>
    </GameProvider>
  );
}

export default GameContainer;