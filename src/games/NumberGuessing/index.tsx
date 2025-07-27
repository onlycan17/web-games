import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useGame } from '../../contexts/GameContext';
import type { Difficulty } from '../../types/game';
import './NumberGuessing.css';

interface NumberGuessingProps {
  difficulty?: Difficulty['level'];
}

function NumberGuessing({ difficulty = 'easy' }: NumberGuessingProps) {
  const { t } = useTranslation();
  const { gameState, startGame, endGame, updateScore, updateLevel } = useGame();
  const [targetNumber, setTargetNumber] = useState<number>(0);
  const [guess, setGuess] = useState<string>('');
  const [attempts, setAttempts] = useState<number>(0);
  const [message, setMessage] = useState<string>('');
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [history, setHistory] = useState<number[]>([]);

  const getDifficultyRange = () => {
    switch (difficulty) {
      case 'easy': return { min: 1, max: 50, maxAttempts: 10 };
      case 'medium': return { min: 1, max: 100, maxAttempts: 7 };
      case 'hard': return { min: 1, max: 200, maxAttempts: 8 };
      case 'expert': return { min: 1, max: 500, maxAttempts: 10 };
      default: return { min: 1, max: 50, maxAttempts: 10 };
    }
  };

  const startNewGame = () => {
    const range = getDifficultyRange();
    const newTarget = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    setTargetNumber(newTarget);
    setGuess('');
    setAttempts(0);
    setMessage(t('games.numberGuessing.hint', { min: range.min, max: range.max }));
    setGameOver(false);
    setHistory([]);
    startGame();
  };

  useEffect(() => {
    if (!gameState.isPlaying) {
      startNewGame();
    }
  }, []);

  const handleGuess = () => {
    const guessNum = parseInt(guess);
    const range = getDifficultyRange();

    if (isNaN(guessNum)) {
      setMessage(t('games.numberGuessing.invalidInput', { defaultValue: 'Please enter a valid number!' }));
      return;
    }

    if (guessNum < range.min || guessNum > range.max) {
      setMessage(t('games.numberGuessing.outOfRange', { min: range.min, max: range.max, defaultValue: `Please enter a number between ${range.min} and ${range.max}!` }));
      return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    setHistory([...history, guessNum]);

    if (guessNum === targetNumber) {
      const baseScore = 100;
      const attemptsBonus = Math.max(0, (range.maxAttempts - newAttempts) * 10);
      const difficultyMultiplier = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 1.5 : difficulty === 'hard' ? 2 : 3;
      const totalScore = Math.floor((baseScore + attemptsBonus) * difficultyMultiplier);
      
      updateScore(gameState.currentScore + totalScore);
      setMessage(`🎉 ${t('games.numberGuessing.correct', { attempts: newAttempts })} +${totalScore}${t('common.score', { defaultValue: 'points' })}`);
      setGameOver(true);
      
      if (gameState.currentLevel < 10) {
        setTimeout(() => {
          updateLevel(gameState.currentLevel + 1);
          startNewGame();
        }, 2000);
      }
    } else if (newAttempts >= range.maxAttempts) {
      setMessage(`😢 ${t('common.gameOver')}! ${t('games.numberGuessing.answer', { number: targetNumber, defaultValue: `The answer was ${targetNumber}` })}`);
      setGameOver(true);
      endGame();
    } else {
      if (guessNum < targetNumber) {
        setMessage(`📈 ${t('games.numberGuessing.tooLow')} (${t('games.numberGuessing.remainingAttempts', { count: range.maxAttempts - newAttempts, defaultValue: `${range.maxAttempts - newAttempts} attempts left` })})`);
      } else {
        setMessage(`📉 ${t('games.numberGuessing.tooHigh')} (${t('games.numberGuessing.remainingAttempts', { count: range.maxAttempts - newAttempts, defaultValue: `${range.maxAttempts - newAttempts} attempts left` })})`);
      }
    }
    
    setGuess('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !gameOver) {
      handleGuess();
    }
  };

  return (
    <div className="number-guessing">
      <div className="game-info">
        <h2>{t('games.numberGuessing.name')}</h2>
        <div className="stats">
          <span>{t('common.level')}: {gameState.currentLevel}</span>
          <span>{t('common.score')}: {gameState.currentScore}</span>
          <span>{t('games.numberGuessing.attempts')}: {attempts}/{getDifficultyRange().maxAttempts}</span>
        </div>
      </div>

      <div className="game-area">
        <div className="message">{message}</div>
        
        {!gameOver && gameState.isPlaying && (
          <div className="input-area">
            <input
              type="number"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('games.numberGuessing.yourGuess')}
              min={getDifficultyRange().min}
              max={getDifficultyRange().max}
            />
            <button onClick={handleGuess}>{t('games.numberGuessing.guess')}</button>
          </div>
        )}

        {history.length > 0 && (
          <div className="history">
            <h3>{t('games.numberGuessing.history', { defaultValue: 'Guess History' })}</h3>
            <div className="history-list">
              {history.map((num, index) => (
                <span key={index} className="history-item">
                  {num} {num < targetNumber ? '↑' : num > targetNumber ? '↓' : '✓'}
                </span>
              ))}
            </div>
          </div>
        )}

        {gameOver && (
          <button className="restart-btn" onClick={startNewGame}>
            {t('common.playAgain')}
          </button>
        )}
      </div>
    </div>
  );
}

export default NumberGuessing;