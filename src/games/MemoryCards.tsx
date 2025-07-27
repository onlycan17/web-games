import { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import type { Difficulty } from '../types/game';
import './MemoryCards.css';

interface Card {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryCardsProps {
  difficulty?: Difficulty['level'];
}

function MemoryCards({ difficulty = 'easy' }: MemoryCardsProps) {
  const { gameState, startGame, endGame, updateScore, updateLevel } = useGame();
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isChecking, setIsChecking] = useState(false);

  const getCardEmojis = () => {
    const allEmojis = ['🎈', '🎨', '🎭', '🎪', '🎯', '🎲', '🎳', '🎵', '🎸', '🎺', '🎻', '🎮', '🎰', '🎱', '🏀', '🏈'];
    switch (difficulty) {
      case 'easy': return allEmojis.slice(0, 6);
      case 'medium': return allEmojis.slice(0, 8);
      case 'hard': return allEmojis.slice(0, 10);
      case 'expert': return allEmojis.slice(0, 12);
      default: return allEmojis.slice(0, 6);
    }
  };

  const initializeCards = () => {
    const emojis = getCardEmojis();
    const cardPairs = [...emojis, ...emojis];
    const shuffled = cardPairs.sort(() => Math.random() - 0.5);
    
    const newCards = shuffled.map((value, index) => ({
      id: index,
      value,
      isFlipped: false,
      isMatched: false,
    }));
    
    setCards(newCards);
    setSelectedCards([]);
    setMoves(0);
    setMatches(0);
    setIsChecking(false);
  };

  const startNewGame = () => {
    initializeCards();
    startGame();
  };

  useEffect(() => {
    if (!gameState.isPlaying) {
      startNewGame();
    }
  }, []);

  const handleCardClick = (id: number) => {
    if (isChecking || gameState.isPaused || !gameState.isPlaying) return;
    
    const card = cards.find(c => c.id === id);
    if (!card || card.isFlipped || card.isMatched) return;

    const newCards = cards.map(c => 
      c.id === id ? { ...c, isFlipped: true } : c
    );
    setCards(newCards);

    const newSelected = [...selectedCards, id];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setIsChecking(true);
      setMoves(moves + 1);
      
      const [first, second] = newSelected;
      const firstCard = newCards.find(c => c.id === first);
      const secondCard = newCards.find(c => c.id === second);

      if (firstCard && secondCard && firstCard.value === secondCard.value) {
        setTimeout(() => {
          const matchedCards = newCards.map(c => 
            c.id === first || c.id === second ? { ...c, isMatched: true } : c
          );
          setCards(matchedCards);
          setMatches(matches + 1);
          setSelectedCards([]);
          setIsChecking(false);

          const baseScore = 100;
          const movesPenalty = Math.max(0, 50 - moves) * 2;
          const difficultyMultiplier = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 1.5 : difficulty === 'hard' ? 2 : 3;
          const score = Math.floor((baseScore + movesPenalty) * difficultyMultiplier);
          updateScore(gameState.currentScore + score);

          const totalPairs = getCardEmojis().length;
          if (matches + 1 === totalPairs) {
            if (gameState.currentLevel < 10) {
              setTimeout(() => {
                updateLevel(gameState.currentLevel + 1);
                startNewGame();
              }, 1500);
            } else {
              endGame();
            }
          }
        }, 500);
      } else {
        setTimeout(() => {
          const flippedCards = newCards.map(c => 
            c.id === first || c.id === second ? { ...c, isFlipped: false } : c
          );
          setCards(flippedCards);
          setSelectedCards([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  };

  return (
    <div className="memory-cards">
      <div className="game-info">
        <h2>메모리 카드 게임</h2>
        <div className="stats">
          <span>레벨: {gameState.currentLevel}</span>
          <span>점수: {gameState.currentScore}</span>
          <span>이동: {moves}</span>
          <span>매치: {matches}/{getCardEmojis().length}</span>
        </div>
      </div>

      <div className={`cards-grid cards-${difficulty}`}>
        {cards.map((card) => (
          <div
            key={card.id}
            className={`card ${card.isFlipped ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}`}
            onClick={() => handleCardClick(card.id)}
          >
            <div className="card-inner">
              <div className="card-front">?</div>
              <div className="card-back">{card.value}</div>
            </div>
          </div>
        ))}
      </div>

      {!gameState.isPlaying && (
        <button className="restart-btn" onClick={startNewGame}>
          게임 시작
        </button>
      )}
    </div>
  );
}

export default MemoryCards;