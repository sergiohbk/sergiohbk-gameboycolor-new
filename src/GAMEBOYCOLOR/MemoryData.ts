import MBC1 from './MBCs/MBC1';
import MBC3 from './MBCs/MBC3';
import MBC30 from './MBCs/MBC30';
import MBC5 from './MBCs/MBC5';
import ROMonly from './MBCs/ROMonly';
import GAMEBOYCOLOR from './gbc';
import { bootrom as BOOTROM } from './components';

interface IOMap {
  [key: string]: number;
}

class MemoryData {
  //--------------ROM---------------
  MemoryMap: MBC1 | MBC3 | MBC5 | MBC30 | ROMonly =
    new ROMonly();
  //mapea desde 0x0000 - 0x7FFF, osea la rom0 y la rom1, tambien mapea la ram externa en caso de haber, 0xA000 - 0xBFFF
  BootromStat: number = 0x00;
  //0xFF50 bootrom status
  //-------------MEMORY----------------
  VRAM: Uint8ClampedArray[] = Array(2).fill(
    new Uint8ClampedArray(0x2000),
  );
  // 8000 - 9FFF
  WORKRAM: Uint8ClampedArray[] = Array(8).fill(
    new Uint8ClampedArray(0x1000),
  );
  // C000 - DFFF
  OAM: Uint8ClampedArray = new Uint8ClampedArray(0xa0);
  // FE00 - FE9F
  IOregisters: Uint8ClampedArray = new Uint8ClampedArray(0x7f);
  // FF00 - FF7F
  HIGHRAM: Uint8ClampedArray = new Uint8ClampedArray(0x7f);
  // FF80 - FFFE
  IE: number = 0x00;
  // FFFF

  //-------------IO MAP---------------
  ioNames: IOMap = {
    P1: 0x0,
    SB: 0x1,
    SC: 0x2,
    DIV: 0x4,
    TIMA: 0x5,
    TMA: 0x6,
    TAC: 0x7,
    IF: 0xf,
    NR10: 0x10,
    NR11: 0x11,
    NR12: 0x12,
    NR13: 0x13,
    NR14: 0x14,
    NR21: 0x16,
    NR22: 0x17,
    NR23: 0x18,
    NR24: 0x19,
    NR30: 0x1a,
    NR31: 0x1b,
    NR32: 0x1c,
    NR33: 0x1d,
    NR34: 0x1e,
    NR41: 0x20,
    NR42: 0x21,
    NR43: 0x22,
    NR44: 0x23,
    NR50: 0x24,
    NR51: 0x25,
    NR52: 0x26,
    LCDC: 0x40,
    STAT: 0x41,
    SCY: 0x42,
    SCX: 0x43,
    LY: 0x44,
    LYC: 0x45,
    DMA: 0x46,
    BGP: 0x47,
    OBP0: 0x48,
    OBP1: 0x49,
    WY: 0x4a,
    WX: 0x4b,
    VBK: 0x4f,
    BRD: 0x50,
    HDMA1: 0x51,
    HDMA2: 0x52,
    HDMA3: 0x53,
    HDMA4: 0x54,
    HDMA5: 0x55,
    RP: 0x56,
    BCPS: 0x68,
    BCPD: 0x69,
    OCPS: 0x6a,
    OCPD: 0x6b,
    SVBK: 0x70,
    IE: 0xff,
  };

  //-------------Interrupts----------------
  interruptNames: IOMap = {
    VBLANK: 0x1,
    LCDSTAT: 0x2,
    TIMER: 0x4,
    SERIAL: 0x8,
    JOYPAD: 0x10,
  };

  setDefault() {
    //datos de la ROM
    this.MemoryMap = new ROMonly();
    this.BootromStat = 0x00; //0xFF50
    //datos de memoria generales
    this.VRAM = Array(2).fill(new Uint8ClampedArray(0x2000));
    this.WORKRAM = Array(8).fill(new Uint8ClampedArray(0x1000));
    this.OAM = new Uint8ClampedArray(0xa0);
    this.HIGHRAM = new Uint8ClampedArray(0x7f);
    this.IOregisters = new Uint8ClampedArray(0x7f);
  }

  defaultValuesGB() {
    this.IOregisters[this.ioNames.LCDC] = 0x91;
    this.IOregisters[this.ioNames.LCDCSTAT] = 0x85;
    this.IOregisters[this.ioNames.P1] = 0xff;
    this.IOregisters[this.ioNames.IF] = 0xe1;
    this.IOregisters[this.ioNames.BGP] = 0xfc;
    this.IOregisters[this.ioNames.OBP0] = 0xff;
    this.IOregisters[this.ioNames.OBP1] = 0xff;
  }

  IOread(address: number): number {
    switch (address) {
      case this.ioNames.VBK:
        if (GAMEBOYCOLOR.GAMEBOYCOLORMODE)
          return this.IOregisters[address] & 0b1;
        else return 0;
      case this.ioNames.SVBK:
        if (GAMEBOYCOLOR.GAMEBOYCOLORMODE)
          return this.IOregisters[address];
        else return 0;
      case this.ioNames.IE:
        return this.IE;
      default:
        return this.IOregisters[address];
    }
  }

  IOwrite(address: number, value: number) {
    switch (address) {
      case this.ioNames.P1:
        this.IOregisters[address] =
          (this.IOregisters[address] & 0b1111) |
          (value & 0b11110000);
        break;
      case this.ioNames.DIV:
        this.IOregisters[address] = 0;
        break;
      case this.ioNames.TAC:
        this.IOregisters[address] = 0b11111000 | value;
        break;
      case this.ioNames.STAT:
        this.IOregisters[address] =
          (this.IOregisters[address] & 0b111) |
          (value & 0b11111000);
        break;
      case this.ioNames.IF:
        this.IOregisters[address] = value | 0b11100000;
        break;
      case this.ioNames.VBK:
        if (GAMEBOYCOLOR.GAMEBOYCOLORMODE)
          this.IOregisters[address] = value & 0b1;
        break;
      case this.ioNames.IE:
        this.IE = value | 0b11100000;
        break;
      case this.ioNames.BRD:
        if (value !== 0) BOOTROM.isActive = false;
        break;
      case this.ioNames.SVBK:
        if (GAMEBOYCOLOR.GAMEBOYCOLORMODE)
          this.IOregisters[address] = value | 0b11111000;
        break;
      default:
        this.IOregisters[address] = value;
    }
  }

  /* annotations */

  /*
  si TIMA se ha desbordado y se escribe en TIMA antes de que TMA
  sea igualado, la escritura se ignorara, no se hasta que punto pueda ocurrir esto
  en principio, no deberia ocurrir nunca.

  si se escribe en TMA justo en el mismo ciclo que TIMA se desborda, TMA igualara su anterior valor
  a TIMA y no el nuevo escrito
  */
}

export default MemoryData;
