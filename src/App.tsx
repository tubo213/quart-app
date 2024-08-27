import React, { useEffect, useState } from 'react';
import init, { WebRunner } from '../wasm/pkg/wasm.js';
import GameBoard from './components/GameBoard';
import PieceSelection from './components/PieceSelection';
import PlayControl from './components/PlayControl';
import Piece from './components/Piece';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<any>(null);
  const [runner, setRunner] = useState<any>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [selectedRowCol, setSelectedRowCol] = useState<{ row: number, col: number } | null>(null);
  const [lastPlacedRowCol, setLastPlacedRowCol] = useState<{ row: number, col: number } | null>(null);
  const [selectedPieceIndex, setSelectedPieceIndex] = useState<number | null>(null);
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean | null>(null);
  const [isPlayerFirst, setIsPlayerFirst] = useState<boolean>(false);
  const [cpuHasPlayed, setCpuHasPlayed] = useState<boolean>(false);

  useEffect(() => {
    const initializeGame = async () => {
      try {
        await init();
        const runnerInstance = new WebRunner();
        setRunner(runnerInstance);
        const gameJson = runnerInstance.fetch_game_state();
        const gameData = JSON.parse(gameJson);
        setGameState(gameData);
      } catch (error) {
        console.error("Error initializing WebRunner:", error);
      }
    };

    initializeGame();
  }, []);

  const handlePlayerFirst = () => {
    setIsPlayerTurn(true);
    setIsPlayerFirst(true);
  };

  const handleCpuFirst = () => {
    setIsPlayerTurn(false);
    setIsPlayerFirst(false);
    executeCpuTurn();
  };

  const handleGridClick = (row: number, col: number) => {
    if (gameState.board.grid[row][col] !== null) {
      alert("The cell is already occupied. Please choose another cell.");
      return;
    }
    setSelectedRowCol({ row, col });
  };

  const handlePieceSelection = (pieceIndex: number) => {
    setSelectedPieceIndex(pieceIndex);
  };

  const executeCpuTurn = () => {
    if (runner && !cpuHasPlayed) {
      const actionJson = runner.fetch_policy_action();
      const action = JSON.parse(actionJson);
      console.log(`Player placed piece at (${action.row}, ${action.col}), piece index: ${action.piece_index}`);
      console.log('Available pieces:', gameState.available_pieces.length);
      runner.play_turn(action.row, action.col, action.piece_index);
      const newStateJson = runner.fetch_game_state();
      const newState = JSON.parse(newStateJson);
      setGameState(newState);
      setLastPlacedRowCol({ row: action.row, col: action.col });
      setCpuHasPlayed(true);

      if (runner.is_game_over()) {
        setIsGameOver(true);
        setWinner(runner.judge_winner(isPlayerFirst));
      } else {
        setIsPlayerTurn(true);
        setCpuHasPlayed(false);
      }
    }
  };

  const handlePlayTurnDisabled = () => {
    if (gameState?.available_pieces.length === 0) {
      return selectedRowCol === null || !isPlayerTurn;
    } else {
      return selectedRowCol === null || selectedPieceIndex === null || !isPlayerTurn;
    }
  };

  const handlePlayTurn = () => {
    if (selectedRowCol && (selectedPieceIndex !== null || gameState?.available_pieces.length === 0) && runner) {
      const { row, col } = selectedRowCol;
      runner.play_turn(row, col, selectedPieceIndex);

      let newState;
      const gameStateJson = runner.fetch_game_state();
      newState = JSON.parse(gameStateJson);

      setGameState(newState);
      setLastPlacedRowCol({ row, col }); // 最後に置かれた位置を保存
      setSelectedRowCol(null);
      setSelectedPieceIndex(null);

      if (runner.is_game_over()) {
        setIsGameOver(true);
        setWinner(runner.judge_winner(isPlayerFirst));
      } else {
        setIsPlayerTurn(false);
        executeCpuTurn();
      }
    } else {
      alert("Please select a cell to place the piece.");
    }
  };

  const handleReset = () => {
    if (runner) {
      runner.reset()
      const newState = JSON.parse(runner.fetch_game_state());
      setGameState(newState);
      setIsGameOver(false);
      setWinner(null);
      setSelectedRowCol(null);
      setLastPlacedRowCol(null);
      setSelectedPieceIndex(null);
      setIsPlayerTurn(null);
      setCpuHasPlayed(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ marginRight: '40px' }}>
          <h1>Quarto Game</h1>
          {isGameOver && <h2>{winner}の勝ち！</h2>}
          {isPlayerTurn === null && (
            <div style={{ marginBottom: '20px' }}>
              <h2>先攻/後攻を選択してください</h2>
              <button onClick={handlePlayerFirst} style={{ marginRight: '10px' }}>先攻</button>
              <button onClick={handleCpuFirst}>後攻</button>
            </div>
          )}
          {isPlayerTurn !== null && (
            <>
              <GameBoard
                gameState={gameState}
                selectedRowCol={selectedRowCol}
                lastPlacedRowCol={lastPlacedRowCol}
                onGridClick={handleGridClick}
                isPlayerTurn={isPlayerTurn}
                isGameOver={isGameOver}
              />
              <PlayControl
                handlePlayTurn={handlePlayTurn}
                handleReset={handleReset}
                isPlayTurnDisabled={handlePlayTurnDisabled()}
              />
            </>
          )}
        </div>
        <div>
          {isPlayerTurn !== null && (
            <>
              <PieceSelection
                gameState={gameState}
                selectedPieceIndex={selectedPieceIndex}
                onPieceSelect={handlePieceSelection}
                isPlayerTurn={isPlayerTurn}
              />
              <h3>置く駒</h3>
              {gameState?.selected_piece && (
                <Piece {...gameState.selected_piece} isSelected={false} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
