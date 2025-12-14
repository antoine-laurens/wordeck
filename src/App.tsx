
import { GameBoard } from './components/GameBoard';
import { StartScreen } from './components/StartScreen'; // Assuming StartScreen is in this path
import { useGameStore } from './store/gameStore';
import './App.css';

function App() {
  const status = useGameStore(state => state.status);

  if (status === 'menu') {
    return <StartScreen />;
  }

  // Assuming the original content is rendered when status is not 'menu'
  // or specifically for a 'won' status as implied by the example snippet.
  // For simplicity, we'll keep the original return as the default if not 'menu'.
  return (
    <div className="app-container">
      <GameBoard />
    </div>
  );
}

export default App;
