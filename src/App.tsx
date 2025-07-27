import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import GameContainer from './components/GameContainer';
import NumberGuessing from './games/NumberGuessing';
import MemoryCards from './games/MemoryCards';
import SnakeGame from './games/SnakeGame';
import LanguageSelector from './components/LanguageSelector';

function App() {
  return (
    <Router>
      <div className="app">
        <LanguageSelector />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game/number-guessing" element={<GameContainer><NumberGuessing /></GameContainer>} />
          <Route path="/game/memory-cards" element={<GameContainer><MemoryCards /></GameContainer>} />
          <Route path="/game/snake" element={<GameContainer><SnakeGame /></GameContainer>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App
