import React from 'react';

interface PlayControlProps {
  handlePlayTurn: () => void;
  handleReset: () => void;
  isPlayTurnDisabled: boolean;
}

const PlayControl: React.FC<PlayControlProps> = ({ handlePlayTurn, handleReset, isPlayTurnDisabled }) => {
  return (
    <div style={{ marginTop: '20px' }}>
      <button onClick={handlePlayTurn} disabled={isPlayTurnDisabled}>
        Play Turn
      </button>
      <button onClick={handleReset} style={{ marginLeft: '10px' }}>Reset Game</button>
    </div>
  );
};

export default PlayControl;
