import { MemoryData } from './MemoryData';
import { MBC1 } from './MBCs/MBC1';
import { MBC3 } from './MBCs/MBC3';
import { MBC30 } from './MBCs/MBC30';
import { MBC5 } from './MBCs/MBC5';
import { ROMonly } from './MBCs/ROMonly';
import { Bootrom } from './bootrom';
import { FLAGS } from './generalFlags';

enum MemState {
  WRITE = 'WRITE',
  READ = 'READ',
  WAIT = 'WAIT',
  RESET = 'RESET',
}

export class Memory extends MemoryData {
  //----DEPENDENCIES----
  bootrom?: Bootrom;
  //----STATE----
  MEMSTATE: MemState;

  constructor(flags: FLAGS, bootrom?: Bootrom) {
    super(flags);
    this.bootrom = bootrom;

    //this.resetAllMemory();
    this.MEMSTATE = MemState.WAIT;
  }

  setMBC(mbc: MBC1 | MBC3 | MBC5 | MBC30 | ROMonly) {
    this.MemoryMap = mbc;
  }

  resetAllMemory() {
    this.MEMSTATE = MemState.RESET;
    this.stackMem.fill(0xff);
    this.VRAM[0].fill(0xff);
    this.VRAM[1].fill(0xff);
    this.WORKRAM[0].fill(0xff);
    this.WORKRAM[1].fill(0xff);
    this.WORKRAM[2].fill(0xff);
    this.WORKRAM[3].fill(0xff);
    this.WORKRAM[4].fill(0xff);
    this.WORKRAM[5].fill(0xff);
    this.WORKRAM[6].fill(0xff);
    this.WORKRAM[7].fill(0xff);
    this.OAM.fill(0xff);
    this.HIGHRAM.fill(0xff);
    this.IE = 0;
  }

  write(address: number, value: number) {
    this.MEMSTATE = MemState.WRITE;
    if (address > 0xffff)
      throw new Error('Address is greater than 0xffff');
    //----ROM BANK 00----
    if (address <= 0x3fff) {
      this.MemoryMap!.writeRomBank00(address, value);
      return;
    }
    //----ROM BANK NN----
    if (address >= 0x4000 && address <= 0x7fff) {
      this.MemoryMap!.writeRomBankNN(address, value);
      return;
    }
    //----VIDEO RAM----
    if (address >= 0x8000 && address <= 0x9fff) {
      if (this.flags.GBCmode)
        this.VRAM[this.VBK & 0x1][address - 0x8000] = value;
      else this.VRAM[0][address - 0x8000] = value;
      return;
    }
    //----EXTERNAL RAM----
    if (address >= 0xa000 && address <= 0xbfff) {
      this.MemoryMap!.externalRamWrite(address, value);
      return;
    }
    //----FIRST WORK RAM----
    if (address >= 0xc000 && address <= 0xcfff) {
      this.WORKRAM[0][address - 0xc000] = value;
      return;
    }
    //----SWITCHABLE WORK RAM----
    if (address >= 0xd000 && address <= 0xdfff) {
      if (this.flags.GBCmode) {
        if ((this.WRAMBank & 0b111) === 0)
          this.WORKRAM[1][address - 0xd000] = value;
        else
          this.WORKRAM[this.WRAMBank][address - 0xd000] = value;
      } else this.WORKRAM[1][address - 0xd000] = value;
      return;
    }
    //----ECHO RAM----
    if (address >= 0xe000 && address <= 0xfdff) {
      if (address >= 0xe000 && address <= 0xedff)
        this.WORKRAM[0][address - 0xe000] = value;
      else if (address >= 0xee00 && address <= 0xfdff)
        if (this.flags.GBCmode) {
          if ((this.WRAMBank & 0b111) === 0)
            this.WORKRAM[1][address - 0xd000] = value;
          else
            this.WORKRAM[this.WRAMBank][address - 0xd000] =
              value;
        } else this.WORKRAM[1][address - 0xee00] = value;
      return;
    }
    //----SPRITE ATTRIBUTE TABLE---
    if (address >= 0xfe00 && address <= 0xfe9f) {
      this.OAM[address - 0xfe00] = value;
      return;
    }
    //----UNUSABLE----
    if (address >= 0xfea0 && address <= 0xfeff) {
      return;
    }
    //----IO REGISTERS----
    if (address >= 0xff00 && address <= 0xff7f) {
      if (address >= 0xff30 && address <= 0xff3f)
        this.wavePatternRAM[address - 0xff30] = value;
      if (this.ioHandlers[address])
        this.ioHandlers[address].write(address, value);
      else this.unmappedIOHandler[address - 0xff00] = value;
    }
    //----HIGH RAM----
    if (address >= 0xff80 && address <= 0xfffe) {
      this.HIGHRAM[address - 0xff80] = value;
      return;
    }
    //----INTERRUPT ENABLE REGISTER----
    if (address === 0xffff) {
      this.IE = value & 0x1f;
      return;
    }
  }

  read(address: number): number {
    this.MEMSTATE = MemState.READ;
    //----BOOT ROM----
    if (
      this.bootrom?.isActive &&
      ((address >= 0x0000 && address <= 0x00ff) ||
        (address >= 0x0200 && address <= 0x08ff))
    ) {
      if (address === 0x100) this.bootrom.isActive = false;
      return this.bootrom.rom![address];
    }

    //----ROM BANK 00----
    if (address <= 0x3fff) {
      return this.MemoryMap!.readRomBank00(address);
    }
    //----ROM BANK NN----
    if (address >= 0x4000 && address <= 0x7fff) {
      return this.MemoryMap!.readRomBankNN(address);
    }
    //----VIDEO RAM----
    if (address >= 0x8000 && address <= 0x9fff) {
      if (this.flags.GBCmode)
        return this.VRAM[this.VBK & 0x1][address - 0x8000];
      else return this.VRAM[0][address - 0x8000];
    }
    //----EXTERNAL RAM----
    if (address >= 0xa000 && address <= 0xbfff) {
      return this.MemoryMap!.externalRamRead(address);
    }
    //----FIRST WORK RAM----
    if (address >= 0xc000 && address <= 0xcfff) {
      return this.WORKRAM[0][address - 0xc000];
    }
    //----SWITCHABLE WORK RAM----
    if (address >= 0xd000 && address <= 0xdfff) {
      if (this.flags.GBCmode) {
        if (this.WRAMBank === 0)
          return this.WORKRAM[1][address - 0xd000];
        else
          return this.WORKRAM[this.WRAMBank][address - 0xd000];
      } else return this.WORKRAM[1][address - 0xd000];
    }
    //----ECHO RAM----
    if (address >= 0xe000 && address <= 0xfdff) {
      if (address >= 0xe000 && address <= 0xedff)
        return this.WORKRAM[0][address - 0xe000];
      else if (address >= 0xee00 && address <= 0xfdff)
        if (this.flags.GBCmode) {
          if (this.WRAMBank === 0)
            return this.WORKRAM[1][address - 0xd000];
          else
            return this.WORKRAM[this.WRAMBank][address - 0xd000];
        } else return this.WORKRAM[1][address - 0xee00];
    }
    //----SPRITE ATTRIBUTE TABLE-----
    if (address >= 0xfe00 && address <= 0xfe9f) {
      return this.OAM[address - 0xfe00];
    }
    //----UNUSABLE----
    if (address >= 0xfea0 && address <= 0xfeff) {
      //CGB revision E behavior
      address = (address & 0xff) >> 4;
      return address | (address << 4);
    }
    //----IO REGISTERS----
    if (address >= 0xff00 && address <= 0xff7f) {
      if (address >= 0xff30 && address <= 0xff3f)
        return this.wavePatternRAM[address - 0xff30];
      if (this.ioHandlers[address])
        return this.ioHandlers[address].read(address);
      else return this.unmappedIOHandler[address - 0xff00];
    }
    //----HIGH RAM----
    if (address >= 0xff80 && address <= 0xfffe) {
      return this.HIGHRAM[address - 0xff80];
    }
    //----INTERRUPT ENABLE REGISTER----
    if (address === 0xffff) return this.IE | 0xe0;

    return 0xff;
  }
}
