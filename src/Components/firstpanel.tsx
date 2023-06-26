import * as PIXI from 'pixi.js';
import React, { useRef, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { gbc } from '../GAMEBOYCOLOR/gbc';
import {
  GameboyData,
  selectGameboyData,
  updateData,
} from '../store/features';
import {
  Paper,
  Table,
  TableHead,
  TableBody,
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  useTheme,
} from '@mui/material';
import {
  MyHeaderTableRow,
  MyTableRow,
  MyTableCell,
  MyHeaderTableCell,
  MyCard,
  MyCardContent,
  MyTableContainer,
  screenStyle,
} from '../styles';

export function GbcScreen() {
  const theme = useTheme();
  const PIXIref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const app = new PIXI.Application({
      width: 160,
      height: 144,
      backgroundColor: 0x1099bb,
    });

    if (PIXIref.current) {
      PIXIref.current.appendChild(app.view as HTMLCanvasElement);
    }

    gbc.assignPixi(app);

    return () => {
      app.destroy(true);
    };
  }, []);
  //carga de bootrom, DMG

  return (
    <MyCard
      square={true}
      style={{ backgroundColor: theme.palette.background.paper }}
    >
      <MyCardContent>
        <div
          ref={PIXIref}
          className='screen'
          id='PIXIscreen'
          style={screenStyle}
        />
      </MyCardContent>
    </MyCard>
  );
}

export function GbcPrincipalDataZone() {
  const theme = useTheme();
  const GbcData = useSelector(selectGameboyData);

  return (
    <MyCard
      style={{ backgroundColor: theme.palette.background.paper }}
    >
      <MyCardContent>
        <MyTableContainer>
          <Table size='small'>
            <TableHead>
              <MyHeaderTableRow>
                <MyHeaderTableCell>
                  Tipo de Dato
                </MyHeaderTableCell>
                <MyHeaderTableCell>Valor</MyHeaderTableCell>
              </MyHeaderTableRow>
            </TableHead>
            <TableBody>
              <MyTableRow>
                <MyTableCell>Estado de la consola</MyTableCell>
                <MyTableCell align='right'>
                  {GbcData.generalData.GBCSTATE.toUpperCase()}
                </MyTableCell>
              </MyTableRow>
              <MyTableRow>
                <MyTableCell>FPS</MyTableCell>
                <MyTableCell align='right'>
                  {GbcData.generalData.fps}
                </MyTableCell>
              </MyTableRow>
              <MyTableRow>
                <MyTableCell>Debug</MyTableCell>
                <MyTableCell align='right'>
                  {String(
                    GbcData.generalData.debugActive,
                  ).toUpperCase()}
                </MyTableCell>
              </MyTableRow>
              <MyTableRow>
                <MyTableCell>Iniciado</MyTableCell>
                <MyTableCell align='right'>
                  {String(
                    GbcData.generalData.isStarted,
                  ).toUpperCase()}
                </MyTableCell>
              </MyTableRow>
              <MyTableRow>
                <MyTableCell>Pausado</MyTableCell>
                <MyTableCell align='right'>
                  {String(
                    GbcData.generalData.paused,
                  ).toUpperCase()}
                </MyTableCell>
              </MyTableRow>
              <MyTableRow>
                <MyTableCell>Ciclos de reloj</MyTableCell>
                <MyTableCell align='right'>
                  {GbcData.cyclesData.cycles}
                </MyTableCell>
              </MyTableRow>
            </TableBody>
          </Table>
        </MyTableContainer>
      </MyCardContent>
    </MyCard>
  );
}

export function CPUdataZone() {
  const theme = useTheme();
  const GbcData = useSelector(selectGameboyData);

  return (
    <MyCard
      style={{ backgroundColor: theme.palette.background.paper }}
    >
      <MyCardContent>
        <MyTableContainer>
          <Table size='small'>
            <TableHead>
              <MyHeaderTableRow>
                <MyHeaderTableCell>Cpu dato</MyHeaderTableCell>
                <MyHeaderTableCell>Valor</MyHeaderTableCell>
              </MyHeaderTableRow>
            </TableHead>
            <TableBody>
              <MyTableRow>
                <MyTableCell>A register</MyTableCell>
                <MyTableCell align='right'>
                  {'0x' +
                    GbcData.cpuData.registers.A.toString(
                      16,
                    ).toUpperCase()}
                </MyTableCell>
              </MyTableRow>
              <MyTableRow>
                <MyTableCell>B register</MyTableCell>
                <MyTableCell align='right'>
                  {'0x' +
                    GbcData.cpuData.registers.B.toString(
                      16,
                    ).toUpperCase()}
                </MyTableCell>
              </MyTableRow>
              <MyTableRow>
                <MyTableCell>C register</MyTableCell>
                <MyTableCell align='right'>
                  {'0x' +
                    GbcData.cpuData.registers.C.toString(
                      16,
                    ).toUpperCase()}
                </MyTableCell>
              </MyTableRow>
              <MyTableRow>
                <MyTableCell>D register</MyTableCell>
                <MyTableCell align='right'>
                  {'0x' +
                    GbcData.cpuData.registers.D.toString(
                      16,
                    ).toUpperCase()}
                </MyTableCell>
              </MyTableRow>
              <MyTableRow>
                <MyTableCell>E register</MyTableCell>
                <MyTableCell align='right'>
                  {'0x' +
                    GbcData.cpuData.registers.E.toString(
                      16,
                    ).toUpperCase()}
                </MyTableCell>
              </MyTableRow>
              <MyTableRow>
                <MyTableCell>H register</MyTableCell>
                <MyTableCell align='right'>
                  {'0x' +
                    GbcData.cpuData.registers.H.toString(
                      16,
                    ).toUpperCase()}
                </MyTableCell>
              </MyTableRow>
              <MyTableRow>
                <MyTableCell>L register</MyTableCell>
                <MyTableCell align='right'>
                  {'0x' +
                    GbcData.cpuData.registers.L.toString(
                      16,
                    ).toUpperCase()}
                </MyTableCell>
              </MyTableRow>
              <MyTableRow>
                <MyTableCell>carry flag</MyTableCell>
                <MyTableCell align='right'>
                  {String(GbcData.cpuData.flags.C).toUpperCase()}
                </MyTableCell>
              </MyTableRow>
              <MyTableRow>
                <MyTableCell>half carry flag</MyTableCell>
                <MyTableCell align='right'>
                  {String(GbcData.cpuData.flags.H).toUpperCase()}
                </MyTableCell>
              </MyTableRow>
              <MyTableRow>
                <MyTableCell>subtract flag</MyTableCell>
                <MyTableCell align='right'>
                  {String(GbcData.cpuData.flags.S).toUpperCase()}
                </MyTableCell>
              </MyTableRow>
              <MyTableRow>
                <MyTableCell>zero flag</MyTableCell>
                <MyTableCell align='right'>
                  {String(GbcData.cpuData.flags.Z).toUpperCase()}
                </MyTableCell>
              </MyTableRow>
              <MyTableRow>
                <MyTableCell>Program counter</MyTableCell>
                <MyTableCell align='right'>
                  {'0x' +
                    GbcData.cpuData.PC.toString(
                      16,
                    ).toUpperCase()}
                </MyTableCell>
              </MyTableRow>
              <MyTableRow>
                <MyTableCell>Stack pointer</MyTableCell>
                <MyTableCell align='right'>
                  {'0x' +
                    GbcData.cpuData.SP.toString(
                      16,
                    ).toUpperCase()}
                </MyTableCell>
              </MyTableRow>
            </TableBody>
          </Table>
        </MyTableContainer>
      </MyCardContent>
    </MyCard>
  );
}

export function UploadBootromZone() {
  const theme = useTheme();
  const handlebootClick = () => {
    const element = document.getElementById('bootromload');
    if (element) element.click();
    else console.log('no element');
  };

  const handlebootChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const buffer = e.target?.result;
        if (buffer) {
          gbc.loadBootrom(buffer as ArrayBuffer);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const GbcData = useSelector(selectGameboyData);

  return (
    <MyCard
      style={{ backgroundColor: theme.palette.background.paper }}
    >
      <MyCardContent>
        {!GbcData.generalData.isBootRomLoaded ? (
          <div style={{ display: 'inline-block' }}>
            <input
              type='file'
              id='bootromload'
              title='upload bootrom'
              style={{ display: 'none' }}
              onChange={handlebootChange}
            />
            <Button
              onClick={handlebootClick}
              variant='contained'
            >
              Cargar Bootrom
            </Button>
          </div>
        ) : (
          <div>
            {GbcData.generalData.isGBCbootrom ? 'CGB ' : 'DMG '}
            bootrom cargada
            <Button
              variant='contained'
              onClick={() => {
                gbc.start();
              }}
            >
              Iniciar
            </Button>
          </div>
        )}
      </MyCardContent>
    </MyCard>
  );
}

export function GbcDebugConfig() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [intervalDebug, setIntervalDebug] =
    useState<number>(1000);

  useEffect(() => {
    const intervalData = setInterval(() => {
      const gameboyData = getUpdatedGBCData();
      dispatch(updateData(gameboyData));
    }, intervalDebug);

    return () => {
      clearInterval(intervalData);
    };
  }, [dispatch, intervalDebug]);

  return (
    <MyCard
      style={{ backgroundColor: theme.palette.background.paper }}
    >
      <MyCardContent>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <TextField
            id='outlined-basic'
            label='Intervalo de debug'
            variant='outlined'
            defaultValue={intervalDebug}
            onChange={(e) => {
              setIntervalDebug(Number(e.target.value));
            }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={gbc.debug}
                id='debug-checkbox'
                onChange={(e) => {
                  gbc.debug = e.target.checked;
                }}
              />
            }
            label='Debug Mode'
            htmlFor='debug-checkbox'
          />
        </div>
      </MyCardContent>
    </MyCard>
  );
}

function getUpdatedGBCData(): GameboyData {
  return {
    generalData: {
      debugActive: gbc.debug,
      fps: gbc.fps,
      isStarted: gbc.isStarted,
      paused: gbc.paused,
      GBCSTATE: gbc.GBCSTATE,
      isBootRomLoaded: gbc.bootrom.isBootromLoaded,
      isGBCbootrom: gbc.bootrom.isGBC,
    },
    cyclesData: {
      cycles: gbc.cycles.getCycles(),
    },
    cpuData: {
      registers: {
        A: gbc.cpu.A,
        B: gbc.cpu.B,
        C: gbc.cpu.C,
        D: gbc.cpu.D,
        E: gbc.cpu.E,
        H: gbc.cpu.H,
        L: gbc.cpu.L,
      },
      flags: {
        Z: gbc.cpu.zeroFlag,
        S: gbc.cpu.subtractFlag,
        H: gbc.cpu.halfCarryFlag,
        C: gbc.cpu.carryFlag,
      },
      PC: gbc.cpu.PC,
      SP: gbc.cpu.SP,
    },
  };
}
