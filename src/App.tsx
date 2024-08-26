import { useState } from 'react';
import './App.css';
import init, { initialize_game } from '../wasm/pkg/wasm.js';

function App() {
  const [gameState, setGameState] = useState<any>(null);

  const handleClick = async () => {
    try {
      await init(); // Wasm モジュールを初期化
      const gameJson = initialize_game(); // Wasm モジュールが初期化された後で `initialize_game` を呼び出す
      const gameData = JSON.parse(gameJson); // JSON をオブジェクトに変換
      console.log("Game state data:", gameData);

      setGameState(gameData); // JSON データを状態に保存
    } catch (error) {
      console.error("Error initializing game:", error);
    }
  };

  return (
    <>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={handleClick}>
          Initialize Game
        </button>
        {gameState && (
          <div>
            <p>Current Player: {gameState.current_player}</p>
            <p>Selected Piece: {JSON.stringify(gameState.selected_piece)}</p>
            <p>Available Pieces: {JSON.stringify(gameState.available_pieces)}</p>
            <p>Board: {JSON.stringify(gameState.board)}</p>
          </div>
        )}
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
