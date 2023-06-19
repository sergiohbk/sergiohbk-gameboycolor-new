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
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import './firstpanel.css';

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
    <Card
      square={true}
      style={{ backgroundColor: theme.palette.background.paper }}
    >
      <CardContent>
        <div
          ref={PIXIref}
          className='screen'
          id='PIXIscreen'
          style={{ display: 'flex' }}
        />
      </CardContent>
    </Card>
  );
}

export function GbcPrincipalDataZone() {
  const theme = useTheme();
  const GbcData = useSelector(selectGameboyData);

  return (
    <Card
      style={{ backgroundColor: theme.palette.background.paper }}
    >
      <CardContent>
        <TableContainer component={Paper}>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell>Tipo de Dato</TableCell>
                <TableCell>Valor</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Estado de la consola</TableCell>
                <TableCell align='right'>
                  {GbcData.generalData.GBCSTATE.toUpperCase()}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>FPS</TableCell>
                <TableCell align='right'>
                  {GbcData.generalData.fps}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Debug</TableCell>
                <TableCell align='right'>
                  {String(
                    GbcData.generalData.debugActive,
                  ).toUpperCase()}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Iniciado</TableCell>
                <TableCell align='right'>
                  {String(
                    GbcData.generalData.isStarted,
                  ).toUpperCase()}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Pausado</TableCell>
                <TableCell align='right'>
                  {String(
                    GbcData.generalData.paused,
                  ).toUpperCase()}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Ciclos de reloj</TableCell>
                <TableCell align='right'>
                  {GbcData.cyclesData.cycles}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}

export function CPUdataZone() {
  const theme = useTheme();
  const GbcData = useSelector(selectGameboyData);

  return (
    <Card
      style={{ backgroundColor: theme.palette.background.paper }}
    >
      <CardContent>
        <TableContainer component={Paper}>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell>Cpu dato</TableCell>
                <TableCell>Valor</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>A register</TableCell>
                <TableCell align='right'>
                  {'0x' +
                    GbcData.cpuData.registers.A.toString(
                      16,
                    ).toUpperCase()}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>B register</TableCell>
                <TableCell align='right'>
                  {'0x' +
                    GbcData.cpuData.registers.B.toString(
                      16,
                    ).toUpperCase()}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>C register</TableCell>
                <TableCell align='right'>
                  {'0x' +
                    GbcData.cpuData.registers.C.toString(
                      16,
                    ).toUpperCase()}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>D register</TableCell>
                <TableCell align='right'>
                  {'0x' +
                    GbcData.cpuData.registers.D.toString(
                      16,
                    ).toUpperCase()}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>E register</TableCell>
                <TableCell align='right'>
                  {'0x' +
                    GbcData.cpuData.registers.E.toString(
                      16,
                    ).toUpperCase()}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>H register</TableCell>
                <TableCell align='right'>
                  {'0x' +
                    GbcData.cpuData.registers.H.toString(
                      16,
                    ).toUpperCase()}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>L register</TableCell>
                <TableCell align='right'>
                  {'0x' +
                    GbcData.cpuData.registers.L.toString(
                      16,
                    ).toUpperCase()}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>carry flag</TableCell>
                <TableCell align='right'>
                  {String(GbcData.cpuData.flags.C).toUpperCase()}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>half carry flag</TableCell>
                <TableCell align='right'>
                  {String(GbcData.cpuData.flags.H).toUpperCase()}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>subtract flag</TableCell>
                <TableCell align='right'>
                  {String(GbcData.cpuData.flags.S).toUpperCase()}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>zero flag</TableCell>
                <TableCell align='right'>
                  {String(GbcData.cpuData.flags.Z).toUpperCase()}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Program counter</TableCell>
                <TableCell align='right'>
                  {'0x' +
                    GbcData.cpuData.PC.toString(
                      16,
                    ).toUpperCase()}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Stack pointer</TableCell>
                <TableCell align='right'>
                  {'0x' +
                    GbcData.cpuData.SP.toString(
                      16,
                    ).toUpperCase()}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
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
    <Card
      style={{ backgroundColor: theme.palette.background.paper }}
    >
      <CardContent>
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
      </CardContent>
    </Card>
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
    <Card
      style={{ backgroundColor: theme.palette.background.paper }}
    >
      <CardContent>
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
      </CardContent>
    </Card>
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
