import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useGame } from '../contexts/GameContext';
import type { Difficulty } from '../types/game';
import './ShellGame.css';

interface ShellGameProps {
  difficulty?: Difficulty['level'];
}

interface Cup {
  id: number;
  position: number;
  hasBall: boolean;
}

function ShellGame({ difficulty = 'easy' }: ShellGameProps) {
  const { t } = useTranslation();
  const { gameState, startGame, endGame, updateScore, updateLevel } = useGame();
  const [cups, setCups] = useState<Cup[]>([
    { id: 0, position: 0, hasBall: false },
    { id: 1, position: 1, hasBall: false },
    { id: 2, position: 2, hasBall: false },
  ]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [selectedCup, setSelectedCup] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [consecutiveWins, setConsecutiveWins] = useState(0);
  const [round, setRound] = useState(0);
  const [money, setMoney] = useState(30000); // 시작 금액 3만원
  const BET_AMOUNT = 5000; // 베팅 금액 5천원

  const getDifficultySettings = () => {
    switch (difficulty) {
      case 'easy':
        return { shuffleTime: 2000, shuffleSpeed: 300, moves: 5 };
      case 'medium':
        return { shuffleTime: 2500, shuffleSpeed: 200, moves: 8 };
      case 'hard':
        return { shuffleTime: 3000, shuffleSpeed: 150, moves: 12 };
      case 'expert':
        return { shuffleTime: 3500, shuffleSpeed: 100, moves: 15 };
      default:
        return { shuffleTime: 2000, shuffleSpeed: 300, moves: 5 };
    }
  };

  const startNewRound = () => {
    const ballPosition = Math.floor(Math.random() * 3);
    const newCups = cups.map((cup, index) => ({
      ...cup,
      position: index,
      hasBall: index === ballPosition,
    }));
    setCups(newCups);
    setIsRevealing(true);
    setSelectedCup(null);
    setMessage(t('games.shellGame.watchCarefully'));
    
    if (money < BET_AMOUNT) {
      setMessage(t('games.shellGame.gameOverNoMoney'));
      endGame();
      return;
    }
    
    // Show the ball briefly
    setTimeout(() => {
      setIsRevealing(false);
      setTimeout(() => {
        shuffleCups();
      }, 500);
    }, 1500);
  };

  const shuffleCups = () => {
    setIsShuffling(true);
    const settings = getDifficultySettings();
    let moveCount = 0;
    
    const shuffleInterval = setInterval(() => {
      setCups((prevCups) => {
        const newCups = [...prevCups];
        // Randomly swap two cups
        const cup1 = Math.floor(Math.random() * 3);
        let cup2 = Math.floor(Math.random() * 3);
        while (cup2 === cup1) {
          cup2 = Math.floor(Math.random() * 3);
        }
        
        // Swap positions
        const temp = newCups[cup1].position;
        newCups[cup1].position = newCups[cup2].position;
        newCups[cup2].position = temp;
        
        return newCups;
      });
      
      moveCount++;
      if (moveCount >= settings.moves) {
        clearInterval(shuffleInterval);
        setIsShuffling(false);
        setMessage(t('games.shellGame.pickCup'));
      }
    }, settings.shuffleSpeed);
  };

  const handleCupClick = (cupId: number) => {
    if (isShuffling || isRevealing || selectedCup !== null) return;
    if (money < BET_AMOUNT) return; // 베팅 금액이 부족하면 클릭 불가
    
    setSelectedCup(cupId);
    setIsRevealing(true);
    
    const clickedCup = cups.find(cup => cup.id === cupId);
    
    if (clickedCup?.hasBall) {
      const baseScore = 50;
      const difficultyMultiplier = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 1.5 : difficulty === 'hard' ? 2 : 3;
      const streakBonus = consecutiveWins * 10;
      const totalScore = Math.floor((baseScore + streakBonus) * difficultyMultiplier);
      const winAmount = BET_AMOUNT * 2; // 베팅 금액의 2배 획득
      
      setMoney(money + winAmount);
      updateScore(gameState.currentScore + totalScore);
      setConsecutiveWins(consecutiveWins + 1);
      setMessage(t('games.shellGame.correctWithMoney', { score: totalScore, amount: winAmount.toLocaleString() }));
      
      setTimeout(() => {
        setRound(round + 1);
        if (round === 4) {
          updateLevel(gameState.currentLevel + 1);
        }
        startNewRound();
      }, 2000);
    } else {
      const newMoney = money - BET_AMOUNT;
      setMoney(newMoney);
      setConsecutiveWins(0);
      setMessage(t('games.shellGame.wrongWithMoney', { amount: BET_AMOUNT.toLocaleString() }));
      
      if (newMoney <= 0) {
        setTimeout(() => {
          setMessage(t('games.shellGame.gameOverNoMoney'));
          endGame();
        }, 2000);
      } else {
        setTimeout(() => {
          startNewRound();
        }, 2000);
      }
    }
  };

  useEffect(() => {
    if (!gameState.isPlaying) {
      startGame();
      startNewRound();
    }
  }, []);

  const getCupStyle = (cup: Cup) => {
    const baseLeft = 33.33;
    return {
      left: `${baseLeft * cup.position}%`,
      transform: `translateX(-50%) ${isRevealing && cup.hasBall ? 'translateY(-30px) rotateZ(15deg)' : ''}`,
    };
  };

  return (
    <div className="shell-game">
      <div className="game-info">
        <h2>{t('games.shellGame.name')}</h2>
        <div className="stats">
          <span>{t('common.level')}: {gameState.currentLevel}</span>
          <span>{t('common.score')}: {gameState.currentScore}</span>
          <span>{t('games.shellGame.money')}: ₩{money.toLocaleString()}</span>
          <span>{t('games.shellGame.streak')}: {consecutiveWins}</span>
        </div>
      </div>

      <div className="game-area">
        <div className="message">{message}</div>
        
        <div className="cups-container">
          {cups.map((cup) => (
            <div
              key={cup.id}
              className={`cup ${isShuffling ? 'shuffling' : ''} ${selectedCup === cup.id ? 'selected' : ''}`}
              style={getCupStyle(cup)}
              onClick={() => handleCupClick(cup.id)}
            >
              <div className="cup-body"></div>
              {isRevealing && cup.hasBall && (
                <div className="ball">🟡</div>
              )}
            </div>
          ))}
        </div>

        {!gameState.isPlaying && (
          <button className="restart-btn" onClick={() => {
            setRound(0);
            setConsecutiveWins(0);
            setMoney(30000); // 금액 초기화
            startGame();
            startNewRound();
          }}>
            {t('common.playAgain')}
          </button>
        )}
      </div>
    </div>
  );
}

export default ShellGame;