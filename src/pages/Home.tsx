import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Game } from '../types/game';
import './Home.css';

function Home() {
  const { t } = useTranslation();

  const games: Game[] = [
    {
      id: 'number-guessing',
      name: t('games.numberGuessing.name'),
      description: t('games.numberGuessing.description'),
      thumbnail: '🔢',
      category: 'logic',
      minPlayers: 1,
      maxPlayers: 1,
    },
    {
      id: 'memory-cards',
      name: t('games.memoryCards.name'),
      description: t('games.memoryCards.description'),
      thumbnail: '🎴',
      category: 'memory',
      minPlayers: 1,
      maxPlayers: 1,
    },
    {
      id: 'snake',
      name: t('games.snake.name'),
      description: t('games.snake.description'),
      thumbnail: '🐍',
      category: 'action',
      minPlayers: 1,
      maxPlayers: 1,
    },
    {
      id: 'shell-game',
      name: t('games.shellGame.name'),
      description: t('games.shellGame.description'),
      thumbnail: '🥤',
      category: 'logic',
      minPlayers: 1,
      maxPlayers: 1,
    },
  ];

  return (
    <div className="home">
      <header className="home-header">
        <h1>🎮 {t('home.title')}</h1>
        <p>{t('home.subtitle')}</p>
      </header>
      
      <main className="games-grid">
        {games.map((game) => (
          <Link
            key={game.id}
            to={`/game/${game.id}`}
            className="game-card"
          >
            <div className="game-thumbnail">{game.thumbnail}</div>
            <h3>{game.name}</h3>
            <p>{game.description}</p>
            <span className="game-category">{t(`home.categories.${game.category}`)}</span>
          </Link>
        ))}
      </main>
    </div>
  );
}

export default Home;