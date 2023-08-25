class DebugEngine {
  DEBUG: boolean = true;
  DEBUGSCREENS: boolean = false;
  DataInterpreter: DataInterpreter = new DataInterpreter();
}

class DataInterpreter {
  getPPUState(state: number): string {
    switch (state) {
      case 0:
        return 'HBLANK';
      case 1:
        return 'VBLANK';
      case 2:
        return 'OAM';
      case 3:
        return 'TRANSFER';
      default:
        return 'ERROR';
    }
  }

  getPPULCDC(tempLCDC: number, onlyData = false): (string | boolean)[] {
    if (onlyData) {
      return [
        tempLCDC & 0x1 ? true : false,
        tempLCDC & 0x2 ? true : false,
        `${tempLCDC & 0x4 ? '8x16' : '8x8'}`,
        `${tempLCDC & 0x8 ? '0x9C00-0x9FFF' : '0x9800-0x9BFF'}`,
        `${tempLCDC & 0x10 ? '0x8000-0x8FFF' : '0x8800-0x97FF'}`,
        tempLCDC & 0x20 ? true : false,
        `${tempLCDC & 0x40 ? '0x9C00-0x9FFF' : '0x9800-0x9BFF'}`,
        tempLCDC & 0x80 ? true : false,
      ];
    }

    return [
      `BG & WIN Display/priority: ${tempLCDC & 0x1 ? 'ON' : 'OFF'}`,
      `OBJ Display: ${tempLCDC & 0x2 ? 'ON' : 'OFF'}`,
      `OBJ Size: ${tempLCDC & 0x4 ? '8x16' : '8x8'}`,
      `BG Tile Map: ${tempLCDC & 0x8 ? '0x9C00-0x9FFF' : '0x9800-0x9BFF'}`,
      `BG & Window Tile Data: ${
        tempLCDC & 0x10 ? '0x8000-0x8FFF' : '0x8800-0x97FF'
      }`,
      `Window Display: ${tempLCDC & 0x20 ? 'ON' : 'OFF'}`,
      `Window Tile Map: ${tempLCDC & 0x40 ? '0x9C00-0x9FFF' : '0x9800-0x9BFF'}`,
      `LCD Display: ${tempLCDC & 0x80 ? 'ON' : 'OFF'}`,
    ];
  }

  getPPUSTAT(tempSTAT: number, onlyData = false): (string | boolean)[] {
    const ppustate = this.getPPUState(tempSTAT & 0x3);
    if (onlyData) {
      return [
        `${ppustate}`,
        tempSTAT & 0x8 ? true : false,
        tempSTAT & 0x10 ? true : false,
        tempSTAT & 0x20 ? true : false,
        tempSTAT & 0x40 ? true : false,
        tempSTAT & 0x80 ? true : false,
      ];
    }

    return [
      `PPU Mode: ${ppustate}`,
      `Coincidence Flag: ${tempSTAT & 0x4 ? 'ON' : 'OFF'}`,
      `Mode 0 HBLANK Interrupt: ${tempSTAT & 0x8 ? 'ON' : 'OFF'}`,
      `Mode 1 VBLANK Interrupt: ${tempSTAT & 0x10 ? 'ON' : 'OFF'}`,
      `Mode 2 OAM Interrupt: ${tempSTAT & 0x20 ? 'ON' : 'OFF'}`,
      `LYC=LY Interrupt: ${tempSTAT & 0x40 ? 'ON' : 'OFF'}`,
    ];
  }
}

export default DebugEngine;
