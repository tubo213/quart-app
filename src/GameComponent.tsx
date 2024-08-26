import React, { useEffect, useState } from 'react';
import './App.css';
import init, { WebRunner } from '../wasm/pkg/wasm.js';

interface PieceProps {
  color: number;
  shape: number;
  height: number;
  surface: number;
  isSelected: boolean;
}

const Piece: React.FC<PieceProps> = ({ color, shape, height, surface, isSelected }) => {
  const colors = ['blue', 'brown'];
  const shapes = ['rectangular', 'cylinder'];
  const adjustedHeight = height === 1 ? '60px' : '35px';
  const styles: React.CSSProperties = {
    backgroundColor: colors[color],
    width: '40px',
    height: adjustedHeight,
    borderRadius: shapes[shape] === 'cylinder' ? '50%' : '0%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
    position: 'relative',
    border: isSelected ? '3px solid blue' : 'none',
  };

  return (
    <div style={styles}>
      {surface === 1 && (
        <div
          style={{
            width: '15px',
            height: '15px',
            backgroundColor: 'white',
            borderRadius: '50%',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        ></div>
      )}
    </div>
  );
};

const GameComponent: React.FC = () => {
  const [gameState, setGameState] = useState<any>(null);
  const [runner, setRunner] = useState<any>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [selectedRowCol, setSelectedRowCol] = useState<{ row: number, col: number } | null>(null);
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
      runner.play_turn(action.row, action.col, action.piece_index);
      const newStateJson = runner.fetch_game_state();
      const newState = JSON.parse(newStateJson);
      setGameState(newState);
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
      // available_pieces が 0 のときは、selectedRowCol のみで判定
      return selectedRowCol === null || !isPlayerTurn;
    } else {
      // 通常時は selectedRowCol と selectedPieceIndex の両方で判定
      return selectedRowCol === null || selectedPieceIndex === null || !isPlayerTurn;
    }
  };

  const handlePlayTurn = () => {
    if (selectedRowCol && (selectedPieceIndex !== null || gameState?.available_pieces.length === 0) && runner) {
      const { row, col } = selectedRowCol;

      try {
        runner.play_turn(row, col, selectedPieceIndex);
      } catch (error) {
        console.error("Error during play_turn:", error);
        return;
      }

      let newState;
      try {
        const gameStateJson = runner.fetch_game_state();
        newState = JSON.parse(gameStateJson);
      } catch (error) {
        console.error("Error fetching game state:", error);
        return;
      }

      setGameState(newState);
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
      runner.reset();
      const newState = JSON.parse(runner.fetch_game_state());
      setGameState(newState);
      setIsGameOver(false);
      setWinner(null);
      setSelectedRowCol(null);
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 80px)', gap: '10px', justifyContent: 'center' }}>
                {gameState && gameState.board && (
                  gameState.board.grid.map((row: any[], rowIndex: number) => (
                    row.map((cell: any, colIndex: number) => (
                      <button
                        key={`${rowIndex}-${colIndex}`}
                        onClick={() => handleGridClick(rowIndex, colIndex)}
                        disabled={isGameOver || cell !== null || !isPlayerTurn}
                        style={{
                          width: '80px',
                          height: '100px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: selectedRowCol && selectedRowCol.row === rowIndex && selectedRowCol.col === colIndex ? '3px solid blue' : '1px solid #ccc',
                          backgroundColor: '#f9f9f9',
                        }}
                      >
                        {cell !== null ? (
                          <Piece {...cell} isSelected={false} />
                        ) : (
                          'Empty'
                        )}
                      </button>
                    ))
                  ))
                )}
              </div>
              <div style={{ marginTop: '20px' }}>
                <button onClick={handlePlayTurn} disabled={handlePlayTurnDisabled()}>
                  Play Turn
                </button>
                <button onClick={handleReset} style={{ marginLeft: '10px' }}>Reset Game</button>
              </div>
            </>
          )}
        </div>
        <div>
          {isPlayerTurn !== null && gameState?.available_pieces.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h3>相手に渡す駒を選んでください</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 60px)', gap: '10px', marginBottom: '20px' }}>
                {gameState.available_pieces.map((piece: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => handlePieceSelection(index)}
                    disabled={selectedPieceIndex === index || !isPlayerTurn}
                    style={{
                      width: '60px',
                      height: '80px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: selectedPieceIndex === index ? '3px solid blue' : '1px solid #ccc',
                      backgroundColor: '#f9f9f9',
                    }}
                  >
                    <Piece {...piece} isSelected={selectedPieceIndex === index} />
                  </button>
                ))}
              </div>
            </div>
          )}
          <h3>置く駒</h3>
          {gameState?.selected_piece && (
            <Piece {...gameState.selected_piece} isSelected={false} />
          )}
        </div>
      </div>
    </div>
  );
};

export default GameComponent;
