import React from 'react';
import Piece from './Piece';

interface PieceSelectionProps {
  gameState: any;
  selectedPieceIndex: number | null;
  onPieceSelect: (index: number) => void;
  isPlayerTurn: boolean;
}

const PieceSelection: React.FC<PieceSelectionProps> = ({ gameState, selectedPieceIndex, onPieceSelect, isPlayerTurn }) => {
  if (!gameState?.available_pieces.length) return null;

  return (
    <div>
      <h3>相手に渡す駒を選んでください</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 60px)', gap: '10px', marginBottom: '20px' }}>
        {gameState.available_pieces.map((piece: any, index: number) => (
          <button
            key={index}
            onClick={() => onPieceSelect(index)}
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
  );
};

export default PieceSelection;
