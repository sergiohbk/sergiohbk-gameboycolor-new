import { MBC1 } from './MBCs/MBC1';
import { MBC3 } from './MBCs/MBC3';
import { MBC30 } from './MBCs/MBC30';
import { MBC5 } from './MBCs/MBC5';
import { ROMonly } from './MBCs/ROMonly';
import { FLAGS } from './generalFlags';

export class MemoryData {
  //----DEPENDENCIES----
  flags: FLAGS;
  //--------------ROM---------------
  MemoryMap: MBC1 | MBC3 | MBC5 | MBC30 | ROMonly | null; //mapea desde 0x0000 - 0x7FFF, osea la rom0 y la rom1, tambien mapea la ram externa en caso de haber, 0xA000 - 0xBFFF
  BootromStat: number; //0xFF50 bootrom status
  //-------------MEMORY----------------
  VRAM: Uint8ClampedArray[]; // 8000 - 9FFF
  WORKRAM: Uint8ClampedArray[]; // C000 - DFFF
  OAM: Uint8ClampedArray; // FE00 - FE9F
  HIGHRAM: Uint8ClampedArray; // FF80 - FFFE
  //---------------CPU----------------
  stackMem: Uint8ClampedArray; //memory only for stack
  //---------------GPU----------------
  LCDC: number; //0xFF40 LCD control
  LCDCSTAT: number; //0xFF41 LCD status
  SCY: number; //0xFF42 scroll Y
  SCX: number; //0xFF43 scroll X
  LY: number; //0xFF44 LCD Y coordinate
  LYC: number; //0xFF45 LY compare
  DMA: number; //0xFF46 DMA transfer and start address
  WY: number; //0xFF4A window Y
  WX: number; //0xFF4B window X
  VBK: number; //0xFF4F VRAM bank
  //------------PALETTES-----------
  BGP: number; //0xFF47 background palette
  OBP0: number; //0xFF48 object palette 0
  OBP1: number; //0xFF49 object palette 1
  BCPS: number; //0xFF68 background palette specification
  BCPD: number; //0xFF69 background palette data
  OCPS: number; //0xFF6A object palette specification
  OCPD: number; //0xFF6B object palette data
  //------------INTERRUPTS------------
  IF: number; // 0xFF0F interrupt flags
  IE: number; // 0xFFFF interrupt enable
  //------------CONTROLLER-----------
  P1: number; //0xFF00 player one
  //------------CABLE LINK-----------
  SB: number; //0xFF01 serial data
  SC: number; //0xFF02 serial control
  //------------TIMER----------
  DIV: number; //0xFF04 divider register
  TAC: number; //0xFF07 timer control
  TIMA: number; //0xFF05 timer counter
  TMA: number; //0xFF06 timer modulo
  //------------GBC ONLY-------------
  WRAMBank: number; //0xFF70 work ram bank
  //-------------SOUND----------------
  NR10: number; //0xFF10 channel 1 sweep register
  NR11: number; //0xFF11 channel 1 sound length/duty pattern duty
  NR12: number; //0xFF12 channel 1 volume envelope
  NR13: number; //0xFF13 channel 1 frequency lo
  NR14: number; //0xFF14 channel 1 frequency hi & channel control
  NR21: number; //0xFF16 channel 2 sound length/wave pattern duty
  NR22: number; //0xFF17 channel 2 volume envelope
  NR23: number; //0xFF18 channel 2 frequency lo
  NR24: number; //0xFF19 channel 2 frequency hi
  NR30: number; //0xFF1A channel 3 DAC on/off
  NR31: number; //0xFF1B channel 3 sound length
  NR32: number; //0xFF1C channel 3 select output level
  NR33: number; //0xFF1D channel 3 frequency lo
  NR34: number; //0xFF1E channel 3 frequency hi & channel control
  NR41: number; //0xFF20 channel 4 sound length
  NR42: number; //0xFF21 channel 4 volume envelope
  NR43: number; //0xFF22 channel 4 polynomial counter
  NR44: number; //0xFF23 channel 4 counter/consecutive; initial
  NR50: number; //0xFF24 channel control / on-off / volume
  NR51: number; //0xFF25 sound panning
  NR52: number; //0xFF26 sound on/off
  wavePatternRAM: Uint8ClampedArray; //0xFF30 - 0xFF3F
  //------------UNUSED---------------
  unused_1: number; //0xFF03 unused

  constructor(flags: FLAGS) {
    //dependencias
    this.flags = flags;
    //datos de la ROM
    this.MemoryMap = null;
    this.BootromStat = 0x00; //0xFF50
    //datos de memoria generales
    this.VRAM = new Array(2);
    this.VRAM[0] = new Uint8ClampedArray(0x2000);
    this.VRAM[1] = new Uint8ClampedArray(0x2000);
    this.WORKRAM = new Array(8);
    this.WORKRAM[0] = new Uint8ClampedArray(0x1000);
    this.WORKRAM[1] = new Uint8ClampedArray(0x1000);
    this.WORKRAM[2] = new Uint8ClampedArray(0x1000);
    this.WORKRAM[3] = new Uint8ClampedArray(0x1000);
    this.WORKRAM[4] = new Uint8ClampedArray(0x1000);
    this.WORKRAM[5] = new Uint8ClampedArray(0x1000);
    this.WORKRAM[6] = new Uint8ClampedArray(0x1000);
    this.WORKRAM[7] = new Uint8ClampedArray(0x1000);
    this.OAM = new Uint8ClampedArray(0xa0);
    this.HIGHRAM = new Uint8ClampedArray(0x7f);
    //datos para CPU
    this.stackMem = new Uint8ClampedArray(0x10000); //memory only for stack
    //datos para GPU
    this.LCDC = 0x00;
    this.LCDCSTAT = 0x00;
    this.SCY = 0x00;
    this.SCX = 0x00;
    this.LY = 0x00;
    this.LYC = 0x00;
    this.WY = 0x00;
    this.WX = 0x00;
    this.VBK = 0x00;
    this.DMA = 0x00;
    //paletas de color
    this.BGP = 0x00;
    this.OBP0 = 0x00;
    this.OBP1 = 0x00;
    this.BCPS = 0x00;
    this.BCPD = 0x00;
    this.OCPS = 0x00;
    this.OCPD = 0x00;
    //datos para interruptores
    this.IF = 0x00;
    this.IE = 0x00;
    //datos de controles
    this.P1 = 0x00;
    //datos de serial
    this.SB = 0x00;
    this.SC = 0x00;
    //datos de timer
    this.DIV = 0x00;
    this.TIMA = 0x00;
    this.TMA = 0x00;
    this.TAC = 0x00;
    //datos exclusivos de GBC
    this.WRAMBank = 1;
    //datos de sonido
    this.NR10 = 0x00;
    this.NR11 = 0x00;
    this.NR12 = 0x00;
    this.NR13 = 0x00;
    this.NR14 = 0x00;
    this.NR21 = 0x00;
    this.NR22 = 0x00;
    this.NR23 = 0x00;
    this.NR24 = 0x00;
    this.NR30 = 0x00;
    this.NR31 = 0x00;
    this.NR32 = 0x00;
    this.NR33 = 0x00;
    this.NR34 = 0x00;
    this.NR41 = 0x00;
    this.NR42 = 0x00;
    this.NR43 = 0x00;
    this.NR44 = 0x00;
    this.NR50 = 0x00;
    this.NR51 = 0x00;
    this.NR52 = 0x00;
    this.wavePatternRAM = new Uint8ClampedArray(0x10).fill(0x00);
    //datos no usados
    this.unused_1 = 0x00;

    this.defaultValuesGB();
    this.setIOhandlerLogic();
  }

  defaultValuesGB() {
    this.LCDC = 0x91;
    this.LCDCSTAT = 0x85;
    this.P1 = 0xff;
    this.IF = 0xe1;
    this.BGP = 0xfc;
    this.OBP0 = 0xff;
    this.OBP1 = 0xff;
  }

  protected ioHandlers: { [address: number]: IOHandler } = {};
  protected unmappedIOHandler: Uint8ClampedArray =
    new Uint8ClampedArray(0x100);

  setIOhandlerLogic() {
    this.ioHandlers[0xff00] = {
      read: () => {
        console.log('read P1');
        return this.P1;
      },
      write: (_, value: number) => {
        this.P1 = value;
      },
    };
    this.ioHandlers[0xff01] = {
      read: () => {
        return this.SB;
      },
      write: (_, value: number) => {
        this.SB = value;
      },
    };
    this.ioHandlers[0xff02] = {
      read: () => {
        return this.SC;
      },
      write: (_, value: number) => {
        this.SC = value;
      },
    };
    this.ioHandlers[0xff04] = {
      read: () => {
        return this.DIV;
      },
      write: (_, value: number) => {
        this.DIV = value;
      },
    };
    this.ioHandlers[0xff05] = {
      read: () => {
        return this.TIMA;
      },
      write: (_, value: number) => {
        this.TIMA = value;
      },
    };
    this.ioHandlers[0xff06] = {
      read: () => {
        return this.TMA;
      },
      write: (_, value: number) => {
        this.TMA = value;
      },
    };
    this.ioHandlers[0xff07] = {
      read: () => {
        return this.TAC;
      },
      write: (_, value: number) => {
        this.TAC = value;
      },
    };
    this.ioHandlers[0xff0f] = {
      read: () => {
        return this.IF | 0xe0;
      },
      write: (_, value: number) => {
        this.IF = value;
      },
    };
    this.ioHandlers[0xff10] = {
      read: () => {
        return this.NR10;
      },
      write: (_, value: number) => {
        this.NR10 = value;
      },
    };
    this.ioHandlers[0xff11] = {
      read: () => {
        return this.NR11;
      },
      write: (_, value: number) => {
        this.NR11 = value;
      },
    };
    this.ioHandlers[0xff12] = {
      read: () => {
        return this.NR12;
      },
      write: (_, value: number) => {
        this.NR12 = value;
      },
    };
    this.ioHandlers[0xff13] = {
      read: () => {
        return this.NR13;
      },
      write: (_, value: number) => {
        this.NR13 = value;
      },
    };
    this.ioHandlers[0xff14] = {
      read: () => {
        return this.NR14;
      },
      write: (_, value: number) => {
        this.NR14 = value;
      },
    };
    this.ioHandlers[0xff16] = {
      read: () => {
        return this.NR21;
      },
      write: (_, value: number) => {
        this.NR21 = value;
      },
    };
    this.ioHandlers[0xff17] = {
      read: () => {
        return this.NR22;
      },
      write: (_, value: number) => {
        this.NR22 = value;
      },
    };
    this.ioHandlers[0xff18] = {
      read: () => {
        return this.NR23;
      },
      write: (_, value: number) => {
        this.NR23 = value;
      },
    };
    this.ioHandlers[0xff19] = {
      read: () => {
        return this.NR24;
      },
      write: (_, value: number) => {
        this.NR24 = value;
      },
    };
    this.ioHandlers[0xff1a] = {
      read: () => {
        return this.NR30;
      },
      write: (_, value: number) => {
        this.NR30 = value;
      },
    };
    this.ioHandlers[0xff1b] = {
      read: () => {
        return this.NR31;
      },
      write: (_, value: number) => {
        this.NR31 = value;
      },
    };
    this.ioHandlers[0xff1c] = {
      read: () => {
        return this.NR32;
      },
      write: (_, value: number) => {
        this.NR32 = value;
      },
    };
    this.ioHandlers[0xff1d] = {
      read: () => {
        return this.NR33;
      },
      write: (_, value: number) => {
        this.NR33 = value;
      },
    };
    this.ioHandlers[0xff1e] = {
      read: () => {
        return this.NR34;
      },
      write: (_, value: number) => {
        this.NR34 = value;
      },
    };
    this.ioHandlers[0xff20] = {
      read: () => {
        return this.NR41;
      },
      write: (_, value: number) => {
        this.NR41 = value;
      },
    };
    this.ioHandlers[0xff21] = {
      read: () => {
        return this.NR42;
      },
      write: (_, value: number) => {
        this.NR42 = value;
      },
    };
    this.ioHandlers[0xff22] = {
      read: () => {
        return this.NR43;
      },
      write: (_, value: number) => {
        this.NR43 = value;
      },
    };
    this.ioHandlers[0xff23] = {
      read: () => {
        return this.NR44;
      },
      write: (_, value: number) => {
        this.NR44 = value;
      },
    };
    this.ioHandlers[0xff24] = {
      read: () => {
        return this.NR50;
      },
      write: (_, value: number) => {
        this.NR50 = value;
      },
    };
    this.ioHandlers[0xff25] = {
      read: () => {
        return this.NR51;
      },
      write: (_, value: number) => {
        this.NR51 = value;
      },
    };
    this.ioHandlers[0xff26] = {
      read: () => {
        return this.NR52;
      },
      write: (_, value: number) => {
        this.NR52 = value;
      },
    };
    this.ioHandlers[0xff40] = {
      read: () => {
        return this.LCDC;
      },
      write: (_, value: number) => {
        this.LCDC = value;
      },
    };
    this.ioHandlers[0xff41] = {
      read: () => {
        return this.LCDCSTAT;
      },
      write: (_, value: number) => {
        this.LCDCSTAT = value;
      },
    };
    this.ioHandlers[0xff42] = {
      read: () => {
        return this.SCY;
      },
      write: (_, value: number) => {
        this.SCY = value;
      },
    };
    this.ioHandlers[0xff43] = {
      read: () => {
        return this.SCX;
      },
      write: (_, value: number) => {
        this.SCX = value;
      },
    };
    this.ioHandlers[0xff44] = {
      read: () => {
        return this.LY;
      },
      write: (_, value: number) => {
        this.LY = value;
      },
    };
    this.ioHandlers[0xff45] = {
      read: () => {
        return this.LYC;
      },
      write: (_, value: number) => {
        this.LYC = value;
      },
    };
    this.ioHandlers[0xff46] = {
      read: () => {
        return this.DMA;
      },
      write: (_, value: number) => {
        this.DMA = value;
      },
    };
    this.ioHandlers[0xff47] = {
      read: () => {
        return this.BGP;
      },
      write: (_, value: number) => {
        this.BGP = value;
      },
    };
    this.ioHandlers[0xff48] = {
      read: () => {
        return this.OBP0;
      },
      write: (_, value: number) => {
        this.OBP0 = value;
      },
    };
    this.ioHandlers[0xff49] = {
      read: () => {
        return this.OBP1;
      },
      write: (_, value: number) => {
        this.OBP1 = value;
      },
    };
    this.ioHandlers[0xff4a] = {
      read: () => {
        return this.WY;
      },
      write: (_, value: number) => {
        this.WY = value;
      },
    };
    this.ioHandlers[0xff4b] = {
      read: () => {
        return this.WX;
      },
      write: (_, value: number) => {
        this.WX = value;
      },
    };
    this.ioHandlers[0xff4f] = {
      read: () => {
        if (this.flags.GBCmode) return this.VBK | 0b11111110;
        else return 0xff;
      },
      write: (_, value: number) => {
        this.VBK = value;
      },
    };
    this.ioHandlers[0xff50] = {
      read: () => {
        return this.BootromStat;
      },
      write: (_, value: number) => {
        this.BootromStat = value;
      },
    };
    this.ioHandlers[0xff70] = {
      read: () => {
        if (this.flags.GBCmode)
          return this.WRAMBank | 0b11111000;
        else return 0xff;
      },
      write: (_, value: number) => {
        this.WRAMBank = value;
      },
    };
  }
}

interface IOHandler {
  read: (address: number) => number;
  write: (address: number, value: number) => void;
}
