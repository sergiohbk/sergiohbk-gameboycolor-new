import { useState, useEffect } from 'react';
import { memory as MEMORY } from '../GAMEBOYCOLOR/components';
import { debugengine as DEBUGENGINE } from '../GAMEBOYCOLOR/components';
import { menuStyle, smallSpanStyle } from '../styles';

function PpuData() {
  const [lcdc, setLCDC] = useState<(string | boolean)[]>([]);
  const [stat, setStat] = useState<(string | boolean)[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLCDC(
        DEBUGENGINE.DataInterpreter.getPPULCDC(MEMORY.IOregisters[0x40], true),
      );
      setStat(
        DEBUGENGINE.DataInterpreter.getPPUSTAT(MEMORY.IOregisters[0x41], true),
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [lcdc]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '2rem',
        flexWrap: 'wrap',
      }}
    >
      <div style={menuStyle}>
        <h1 style={{ margin: 0 }}>STATUS</h1>
        <h4 style={{ margin: 0 }}>
          {' '}
          <span style={smallSpanStyle}>{stat[0]}</span>{' '}
        </h4>
        {stat[1] && (
          <h4 style={{ margin: 0 }}>
            <span style={smallSpanStyle}>LYC=LY FLAG</span>
          </h4>
        )}
        {stat[2] && (
          <h4 style={{ margin: 0 }}>
            <span style={smallSpanStyle}>Mode 0 H-Blank Interrupt</span>
          </h4>
        )}
        {stat[3] && (
          <h4 style={{ margin: 0 }}>
            <span style={smallSpanStyle}>Mode 1 V-Blank Interrupt</span>
          </h4>
        )}
        {stat[4] && (
          <h4 style={{ margin: 0 }}>
            <span style={smallSpanStyle}>Mode 2 OAM Interrupt</span>{' '}
          </h4>
        )}
        {stat[5] && (
          <h4 style={{ margin: 0 }}>
            <span style={smallSpanStyle}>LYC=LY interrupt</span>
          </h4>
        )}
      </div>
      <div style={menuStyle}>
        <h1 style={{ margin: 0 }}> LCDC INFO</h1>
        {lcdc[0] && (
          <h4 style={{ margin: 0 }}>
            <span style={smallSpanStyle}>BG Display/priority</span>
          </h4>
        )}
        {lcdc[1] && (
          <h4 style={{ margin: 0 }}>
            <span style={smallSpanStyle}>OBJ Display</span>
          </h4>
        )}
        <h4 style={{ margin: 0 }}>
          {' '}
          OBJ Size: <span style={smallSpanStyle}>{lcdc[2]}</span>{' '}
        </h4>
        <h4 style={{ margin: 0 }}>
          {' '}
          BG Tile Map area: <span style={smallSpanStyle}> {lcdc[3]} </span>{' '}
        </h4>
        <h4 style={{ margin: 0 }}>
          {' '}
          BG & Window Tile Data area:{' '}
          <span style={smallSpanStyle}> {lcdc[4]} </span>{' '}
        </h4>
        {lcdc[5] && (
          <h4 style={{ margin: 0 }}>
            <span style={smallSpanStyle}> Window Display </span>
          </h4>
        )}
        <h4 style={{ margin: 0 }}>
          {' '}
          Window Tile Map area: <span style={smallSpanStyle}>
            {' '}
            {lcdc[6]}{' '}
          </span>{' '}
        </h4>
        {lcdc[7] && (
          <h4 style={{ margin: 0 }}>
            <span style={smallSpanStyle}>LCD Display Enable</span>
          </h4>
        )}
      </div>
    </div>
  );
}

export default PpuData;
