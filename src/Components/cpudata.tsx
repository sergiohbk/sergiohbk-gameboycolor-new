import { useEffect, useState } from 'react';
import { cpu as CPU } from '../GAMEBOYCOLOR/components';
import { menuStyle, spanStyle, smallSpanStyle } from '../styles';

function CpuData() {
  const [registerA, setRegisterA] = useState(0);
  const [registerB, setRegisterB] = useState(0);
  const [registerC, setRegisterC] = useState(0);
  const [registerD, setRegisterD] = useState(0);
  const [registerE, setRegisterE] = useState(0);
  const [registerH, setRegisterH] = useState(0);
  const [registerL, setRegisterL] = useState(0);
  const [registerSP, setRegisterSP] = useState(0);
  const [registerPC, setRegisterPC] = useState(0);
  const [zeroFlag, setZeroFlag] = useState(false);
  const [substractFlag, setSubstractFlag] = useState(false);
  const [halfCarryFlag, setHalfCarryFlag] = useState(false);
  const [carryFlag, setCarryFlag] = useState(false);
  const [halt, setHalt] = useState(false);
  const [stop, setStop] = useState(false);
  const [ime, setIme] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setRegisterA(CPU.A);
      setRegisterB(CPU.B);
      setRegisterC(CPU.C);
      setRegisterD(CPU.D);
      setRegisterE(CPU.E);
      setRegisterH(CPU.H);
      setRegisterL(CPU.L);
      setRegisterSP(CPU.SP);
      setRegisterPC(CPU.PC);
      setZeroFlag(CPU.zeroFlag);
      setSubstractFlag(CPU.subtractFlag);
      setHalfCarryFlag(CPU.halfCarryFlag);
      setCarryFlag(CPU.carryFlag);
      setHalt(CPU.HALT);
      setStop(CPU.STOP);
      setIme(CPU.IME);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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
        <h1 style={{ margin: 0 }}> CPU REGISTERS</h1>
        <h2 style={{ margin: 0 }}>
          {' '}
          A: <span style={spanStyle}>{registerA.toString(16)}</span>
        </h2>
        <h2 style={{ margin: 0 }}>
          {' '}
          B: <span style={spanStyle}>{registerB.toString(16)}</span>
        </h2>
        <h2 style={{ margin: 0 }}>
          {' '}
          C: <span style={spanStyle}>{registerC.toString(16)}</span>
        </h2>
        <h2 style={{ margin: 0 }}>
          {' '}
          D: <span style={spanStyle}>{registerD.toString(16)}</span>
        </h2>
        <h2 style={{ margin: 0 }}>
          {' '}
          E: <span style={spanStyle}>{registerE.toString(16)}</span>
        </h2>
        <h2 style={{ margin: 0 }}>
          {' '}
          H: <span style={spanStyle}>{registerH.toString(16)}</span>
        </h2>
        <h2 style={{ margin: 0 }}>
          {' '}
          L: <span style={spanStyle}>{registerL.toString(16)}</span>
        </h2>
        <h2 style={{ margin: 0 }}>
          {' '}
          SP: <span style={spanStyle}>{registerSP.toString(16)} </span>
        </h2>
        <h2 style={{ margin: 0 }}>
          {' '}
          PC: <span style={spanStyle}>{registerPC.toString(16)}</span>{' '}
        </h2>
      </div>
      <div style={menuStyle}>
        <h1 style={{ margin: 0 }}>FLAGS</h1>
        {zeroFlag && (
          <h3 style={{ ...smallSpanStyle, margin: 0 }}>Zero Flag</h3>
        )}
        {substractFlag && (
          <h3 style={{ ...smallSpanStyle, margin: 0 }}>Negative Flag</h3>
        )}
        {halfCarryFlag && (
          <h3 style={{ ...smallSpanStyle, margin: 0 }}>Half Carry Flag</h3>
        )}
        {carryFlag && (
          <h3 style={{ ...smallSpanStyle, margin: 0 }}>Carry Flag</h3>
        )}
        {halt && <h3 style={{ ...smallSpanStyle, margin: 0 }}>HALT</h3>}
        {stop && <h3 style={{ ...smallSpanStyle, margin: 0 }}>STOP</h3>}
        {ime && <h3 style={{ ...smallSpanStyle, margin: 0 }}>IME</h3>}
      </div>
    </div>
  );
}

export default CpuData;
