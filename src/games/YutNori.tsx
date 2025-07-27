import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useGame } from '../contexts/GameContext';
import type { Difficulty } from '../types/game';
import './YutNori.css';

interface YutNoriProps {
  difficulty?: Difficulty['level'];
}

type YutResult = 'do' | 'gae' | 'geol' | 'yut' | 'mo' | 'back-do';
type PlayerType = 'human' | 'ai';
type GameMode = 'single' | 'multi';

interface Position {
  index: number;
  isShortcut?: boolean;
}

interface Piece {
  id: string;
  playerId: number;
  position: Position;
  isFinished: boolean;
}

interface Player {
  id: number;
  name: string;
  type: PlayerType;
  pieces: Piece[];
  color: string;
}

// 윷판 위치 정의 (총 29개 위치)
const BOARD_POSITIONS = 29;
const FINISH_POSITION = { index: BOARD_POSITIONS, isShortcut: false };

function YutNori({ difficulty = 'easy' }: YutNoriProps) {
  const { t } = useTranslation();
  const { gameState, startGame, endGame, updateScore } = useGame();
  
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [yutSticks, setYutSticks] = useState<boolean[]>([false, false, false, false]);
  const [isRolling, setIsRolling] = useState(false);
  const [lastResult, setLastResult] = useState<YutResult | null>(null);
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
  const [canRollAgain, setCanRollAgain] = useState(true);
  const [message, setMessage] = useState('');

  // 윷 결과 계산
  const calculateYutResult = (sticks: boolean[]): YutResult => {
    const upCount = sticks.filter(s => s).length;
    
    switch (upCount) {
      case 0: return 'mo';    // 모: 5칸
      case 1: return 'do';    // 도: 1칸
      case 2: return 'gae';   // 개: 2칸
      case 3: return 'geol';  // 걸: 3칸
      case 4: return 'yut';   // 윷: 4칸
      default: return 'do';
    }
  };

  // 결과에 따른 이동 칸 수
  const getMoveCount = (result: YutResult): number => {
    switch (result) {
      case 'do': return 1;
      case 'gae': return 2;
      case 'geol': return 3;
      case 'yut': return 4;
      case 'mo': return 5;
      case 'back-do': return -1;
      default: return 0;
    }
  };

  // 게임 초기화
  const initializeGame = (mode: GameMode) => {
    setGameMode(mode);
    startGame();
    
    const newPlayers: Player[] = [
      {
        id: 1,
        name: t('games.yutNori.player1'),
        type: 'human',
        pieces: Array.from({ length: 4 }, (_, i) => ({
          id: `p1-${i}`,
          playerId: 1,
          position: { index: 0, isShortcut: false },
          isFinished: false,
        })),
        color: '#3b82f6',
      },
    ];

    if (mode === 'single') {
      newPlayers.push({
        id: 2,
        name: t('games.yutNori.computer'),
        type: 'ai',
        pieces: Array.from({ length: 4 }, (_, i) => ({
          id: `p2-${i}`,
          playerId: 2,
          position: { index: 0, isShortcut: false },
          isFinished: false,
        })),
        color: '#ef4444',
      });
    } else {
      newPlayers.push({
        id: 2,
        name: t('games.yutNori.player2'),
        type: 'human',
        pieces: Array.from({ length: 4 }, (_, i) => ({
          id: `p2-${i}`,
          playerId: 2,
          position: { index: 0, isShortcut: false },
          isFinished: false,
        })),
        color: '#ef4444',
      });
    }

    setPlayers(newPlayers);
    setCurrentPlayerIndex(0);
    setMessage(t('games.yutNori.gameStart', { player: newPlayers[0].name }));
  };

  // 윷 던지기
  const rollYut = () => {
    if (isRolling || !canRollAgain) return;
    
    setIsRolling(true);
    setSelectedPiece(null);
    
    // 애니메이션 효과
    const animationDuration = 1000;
    const animationInterval = 50;
    let elapsed = 0;
    
    const interval = setInterval(() => {
      setYutSticks([
        Math.random() > 0.5,
        Math.random() > 0.5,
        Math.random() > 0.5,
        Math.random() > 0.5,
      ]);
      
      elapsed += animationInterval;
      if (elapsed >= animationDuration) {
        clearInterval(interval);
        
        // 최종 결과 결정
        const finalSticks = [
          Math.random() > 0.5,
          Math.random() > 0.5,
          Math.random() > 0.5,
          Math.random() > 0.5,
        ];
        
        setYutSticks(finalSticks);
        const result = calculateYutResult(finalSticks);
        setLastResult(result);
        setIsRolling(false);
        setCanRollAgain(false);
        
        // 윷이나 모가 나오면 한 번 더
        if (result === 'yut' || result === 'mo') {
          setCanRollAgain(true);
          setMessage(t('games.yutNori.rollAgain', { result: t(`games.yutNori.results.${result}`) }));
        } else {
          setMessage(t('games.yutNori.selectPiece', { result: t(`games.yutNori.results.${result}`) }));
        }
      }
    }, animationInterval);
  };

  // 말 이동
  const movePiece = (piece: Piece) => {
    if (!lastResult || isRolling) return;
    
    const moveCount = getMoveCount(lastResult);
    const newPosition = piece.position.index + moveCount;
    
    // 도착 확인
    if (newPosition >= BOARD_POSITIONS) {
      piece.isFinished = true;
      piece.position = FINISH_POSITION;
      setMessage(t('games.yutNori.pieceFinished'));
      
      // 모든 말이 도착했는지 확인
      const currentPlayer = players[currentPlayerIndex];
      const allFinished = currentPlayer.pieces.every(p => p.isFinished);
      
      if (allFinished) {
        setMessage(t('games.yutNori.playerWon', { player: currentPlayer.name }));
        updateScore(gameState.currentScore + 1000);
        endGame();
        return;
      }
    } else {
      piece.position = { index: newPosition, isShortcut: false };
    }
    
    // 상대 말 잡기 확인
    const opponentPieces = players[1 - currentPlayerIndex].pieces;
    const capturedPiece = opponentPieces.find(
      p => p.position.index === piece.position.index && !p.isFinished
    );
    
    if (capturedPiece) {
      capturedPiece.position = { index: 0, isShortcut: false };
      setCanRollAgain(true);
      setMessage(t('games.yutNori.pieceCaptured'));
    } else if (!canRollAgain) {
      // 다음 플레이어로
      setCurrentPlayerIndex((currentPlayerIndex + 1) % 2);
      setCanRollAgain(true);
    }
    
    setLastResult(null);
    setSelectedPiece(null);
  };

  // AI 턴 처리
  useEffect(() => {
    const currentPlayer = players[currentPlayerIndex];
    if (!currentPlayer || currentPlayer.type !== 'ai' || !gameState.isPlaying) return;
    
    // AI 자동 플레이
    const aiPlay = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (canRollAgain && !lastResult) {
        rollYut();
      } else if (lastResult && !isRolling) {
        // 이동 가능한 말 중 랜덤 선택
        const movablePieces = currentPlayer.pieces.filter(p => !p.isFinished);
        if (movablePieces.length > 0) {
          const randomPiece = movablePieces[Math.floor(Math.random() * movablePieces.length)];
          await new Promise(resolve => setTimeout(resolve, 500));
          movePiece(randomPiece);
        }
      }
    };
    
    aiPlay();
  }, [currentPlayerIndex, players, canRollAgain, lastResult, isRolling]);

  // 게임 보드 렌더링
  const renderBoard = () => {
    return (
      <div className="yut-board">
        <svg viewBox="0 0 400 400" className="board-svg">
          {/* 윷판 그리기 */}
          <rect x="50" y="50" width="300" height="300" fill="none" stroke="#333" strokeWidth="2" />
          
          {/* 대각선 */}
          <line x1="50" y1="50" x2="350" y2="350" stroke="#333" strokeWidth="2" />
          <line x1="350" y1="50" x2="50" y2="350" stroke="#333" strokeWidth="2" />
          
          {/* 중앙점 */}
          <circle cx="200" cy="200" r="5" fill="#333" />
          
          {/* 말 표시 */}
          {players.map(player => 
            player.pieces.map(piece => {
              if (piece.isFinished) return null;
              
              // 위치에 따른 좌표 계산 (간단한 예시)
              const x = 50 + (piece.position.index % 5) * 75;
              const y = 50 + Math.floor(piece.position.index / 5) * 75;
              
              return (
                <circle
                  key={piece.id}
                  cx={x}
                  cy={y}
                  r="15"
                  fill={player.color}
                  stroke="#fff"
                  strokeWidth="2"
                  className={selectedPiece?.id === piece.id ? 'selected' : ''}
                  onClick={() => player.id === players[currentPlayerIndex].id && setSelectedPiece(piece)}
                  style={{ cursor: player.id === players[currentPlayerIndex].id ? 'pointer' : 'default' }}
                />
              );
            })
          )}
        </svg>
      </div>
    );
  };

  return (
    <div className="yut-nori">
      {!gameMode ? (
        <div className="mode-selection">
          <h2>{t('games.yutNori.name')}</h2>
          <p>{t('games.yutNori.selectMode')}</p>
          <div className="mode-buttons">
            <button onClick={() => initializeGame('single')} className="mode-btn">
              {t('games.yutNori.singlePlayer')}
            </button>
            <button onClick={() => initializeGame('multi')} className="mode-btn">
              {t('games.yutNori.multiPlayer')}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="game-info">
            <h2>{t('games.yutNori.name')}</h2>
            <div className="players-info">
              {players.map((player, index) => (
                <div
                  key={player.id}
                  className={`player-info ${index === currentPlayerIndex ? 'active' : ''}`}
                  style={{ borderColor: player.color }}
                >
                  <span>{player.name}</span>
                  <div className="pieces-status">
                    {player.pieces.map(piece => (
                      <div
                        key={piece.id}
                        className={`piece-indicator ${piece.isFinished ? 'finished' : ''}`}
                        style={{ backgroundColor: player.color }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="game-area">
            <div className="message">{message}</div>
            
            <div className="game-content">
              {renderBoard()}
              
              <div className="yut-controls">
                <div className="yut-display">
                  {yutSticks.map((stick, index) => (
                    <div
                      key={index}
                      className={`yut-stick ${stick ? 'up' : 'down'} ${isRolling ? 'rolling' : ''}`}
                    />
                  ))}
                </div>
                
                {lastResult && (
                  <div className="result-display">
                    {t(`games.yutNori.results.${lastResult}`)} ({getMoveCount(lastResult)})
                  </div>
                )}
                
                <button
                  className="roll-btn"
                  onClick={rollYut}
                  disabled={!canRollAgain || isRolling || players[currentPlayerIndex]?.type === 'ai'}
                >
                  {t('games.yutNori.rollYut')}
                </button>
                
                {selectedPiece && lastResult && (
                  <button
                    className="move-btn"
                    onClick={() => movePiece(selectedPiece)}
                  >
                    {t('games.yutNori.movePiece')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default YutNori;