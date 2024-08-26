import React from 'react';
import Piece from './Piece';

interface GameBoardProps {
  gameState: any;
  selectedRowCol: { row: number, col: number } | null;
  lastPlacedRowCol: { row: number, col: number } | null;
  onGridClick: (row: number, col: number) => void;
  isPlayerTurn: boolean;
  isGameOver: boolean;
}

const GameBoard: React.FC<GameBoardProps> = ({ gameState, selectedRowCol, lastPlacedRowCol, onGridClick, isPlayerTurn, isGameOver }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 80px)', gap: '10px', justifyContent: 'center' }}>
      {gameState && gameState.board && (
        gameState.board.grid.map((row: any[], rowIndex: number) => (
          row.map((cell: any, colIndex: number) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              onClick={() => onGridClick(rowIndex, colIndex)}
              disabled={isGameOver || cell !== null || !isPlayerTurn}
              style={{
                width: '80px',
                height: '100px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: selectedRowCol && selectedRowCol.row === rowIndex && selectedRowCol.col === colIndex 
                          ? '3px solid blue' 
                          : lastPlacedRowCol && lastPlacedRowCol.row === rowIndex && lastPlacedRowCol.col === colIndex
                          ? '3px solid green'
                          : '1px solid #ccc',
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
  );
};

export default GameBoard;
