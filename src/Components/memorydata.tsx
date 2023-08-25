import { useEffect, useState } from 'react';
import { memory as MEMORY } from '../GAMEBOYCOLOR/components';
import { menuStyle, smallSpanStyle } from '../styles';

function MemoryData() {
  const [serialData, setSerialData] = useState(0);
  const [serialControl, setSerialControl] = useState(0);
  const [player1, setPlayer1] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSerialData(MEMORY.IOregisters[1]);
      setSerialControl(MEMORY.IOregisters[2]);
      setPlayer1(MEMORY.IOregisters[0]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={menuStyle}>
      <h1 style={{ margin: 0 }}>MEMORY IO DATA</h1>
      {serialData !== 0xff && (
        <div>
          <h3>Serial Data: </h3>
          <span style={smallSpanStyle}>{String.fromCharCode(serialData)}</span>
        </div>
      )}

      {serialControl !== 0xff && (
        <div>
          <h3>Serial Control: </h3>{' '}
          <span style={smallSpanStyle}>
            {String.fromCharCode(serialControl)}
          </span>
        </div>
      )}

      {player1 !== 0xff && (
        <div>
          <h3>Player 1: </h3>
          <span style={smallSpanStyle}>{player1}</span>
        </div>
      )}

      <button onClick={() => console.log(MEMORY.IOregisters)}>
        IOregisters
      </button>
    </div>
  );
}

export default MemoryData;
