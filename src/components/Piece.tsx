import React from 'react';

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

export default Piece;
