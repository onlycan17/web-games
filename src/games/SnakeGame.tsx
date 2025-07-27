import { useState, useEffect, useRef } from 'react';
import { useGame } from '../contexts/GameContext';
import type { Difficulty } from '../types/game';
import './SnakeGame.css';

interface Position {
  x: number;
  y: number;
}

interface SnakeGameProps {
  difficulty?: Difficulty['level'];
}

function SnakeGame({ difficulty = 'easy' }: SnakeGameProps) {
  const { gameState, startGame, endGame, updateScore, updateLevel } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [foodEaten, setFoodEaten] = useState(0);

  const gridSize = 20;
  const cellSize = 20;

  const getGameSpeed = () => {
    switch (difficulty) {
      case 'easy': return 150;
      case 'medium': return 100;
      case 'hard': return 70;
      case 'expert': return 50;
      default: return 150;
    }
  };

  const generateFood = () => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize),
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  };

  const startNewGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood(generateFood());
    setDirection('RIGHT');
    setGameOver(false);
    setFoodEaten(0);
    startGame();
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameState.isPlaying || gameOver) return;

      switch (e.key) {
        case 'ArrowUp':
          if (direction !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown':
          if (direction !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft':
          if (direction !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowRight':
          if (direction !== 'LEFT') setDirection('RIGHT');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, gameState.isPlaying, gameOver]);

  useEffect(() => {
    if (!gameState.isPlaying || gameOver || gameState.isPaused) return;

    const gameInterval = setInterval(() => {
      setSnake(currentSnake => {
        const newSnake = [...currentSnake];
        const head = { ...newSnake[0] };

        switch (direction) {
          case 'UP': head.y -= 1; break;
          case 'DOWN': head.y += 1; break;
          case 'LEFT': head.x -= 1; break;
          case 'RIGHT': head.x += 1; break;
        }

        if (
          head.x < 0 || head.x >= gridSize ||
          head.y < 0 || head.y >= gridSize ||
          newSnake.some(segment => segment.x === head.x && segment.y === head.y)
        ) {
          setGameOver(true);
          endGame();
          return currentSnake;
        }

        newSnake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
          setFood(generateFood());
          setFoodEaten(prev => prev + 1);
          
          const baseScore = 10;
          const difficultyMultiplier = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 1.5 : difficulty === 'hard' ? 2 : 3;
          const score = Math.floor(baseScore * difficultyMultiplier);
          updateScore(gameState.currentScore + score);

          if (foodEaten > 0 && (foodEaten + 1) % 10 === 0) {
            if (gameState.currentLevel < 10) {
              updateLevel(gameState.currentLevel + 1);
            }
          }
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, getGameSpeed());

    return () => clearInterval(gameInterval);
  }, [direction, food, gameState.isPlaying, gameOver, gameState.isPaused, difficulty, foodEaten]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#e2e8f0';
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if ((i + j) % 2 === 0) {
          ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
        }
      }
    }

    ctx.fillStyle = '#48bb78';
    snake.forEach((segment, index) => {
      if (index === 0) {
        ctx.fillStyle = '#38a169';
      } else {
        ctx.fillStyle = '#48bb78';
      }
      ctx.fillRect(segment.x * cellSize, segment.y * cellSize, cellSize - 2, cellSize - 2);
    });

    ctx.fillStyle = '#e53e3e';
    ctx.fillRect(food.x * cellSize, food.y * cellSize, cellSize - 2, cellSize - 2);
  }, [snake, food]);

  return (
    <div className="snake-game">
      <div className="game-info">
        <h2>스네이크 게임</h2>
        <div className="stats">
          <span>레벨: {gameState.currentLevel}</span>
          <span>점수: {gameState.currentScore}</span>
          <span>먹은 음식: {foodEaten}</span>
        </div>
      </div>

      <div className="game-board">
        <canvas
          ref={canvasRef}
          width={gridSize * cellSize}
          height={gridSize * cellSize}
          className="snake-canvas"
        />
        
        {!gameState.isPlaying && (
          <div className="game-overlay">
            <button className="start-btn" onClick={startNewGame}>
              게임 시작
            </button>
            <p className="instructions">방향키로 뱀을 조종하세요!</p>
          </div>
        )}

        {gameOver && (
          <div className="game-overlay">
            <h3>게임 오버!</h3>
            <p>점수: {gameState.currentScore}</p>
            <button className="restart-btn" onClick={startNewGame}>
              다시 시작
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SnakeGame;