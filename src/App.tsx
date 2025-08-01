import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import GameContainer from './components/GameContainer';
import NumberGuessing from './games/NumberGuessing';
import MemoryCards from './games/MemoryCards';
import SnakeGame from './games/SnakeGame';
import ShellGame from './games/ShellGame';
import YutNori from './games/YutNori';
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
          <Route path="/game/shell-game" element={<GameContainer><ShellGame /></GameContainer>} />
          <Route path="/game/yut-nori" element={<GameContainer><YutNori /></GameContainer>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App
