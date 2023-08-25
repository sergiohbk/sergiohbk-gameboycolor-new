import MemoryData from './MemoryData';
import { cartridge as CARTRIDGE } from './components';
import MBC from './MBCs/MBC';
import GAMEBOYCOLOR from './gbc';
import { bootrom as BOOTROM } from './components';

class Memory extends MemoryData {
  constructor() {
    super();
    this.resetAllMemory();
  }

  createMBC() {
    if (CARTRIDGE.cardType[0] === null) {
      console.error('MBC not supported');
      return;
    }

    this.setMBC(new CARTRIDGE.cardType[0]());
  }

  private setMBC(mbc: MBC) {
    this.MemoryMap = mbc;
  }

  resetAllMemory() {
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
    this.IOregisters.fill(0xff);
  }

  write(address: number, value: number) {
    if (address > 0xffff) throw new Error('Address is greater than 0xffff');
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
      if (GAMEBOYCOLOR.GAMEBOYCOLORMODE)
        this.VRAM[this.IOregisters[this.ioNames.VBK] & 0x1][address - 0x8000] =
          value;
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
      if (GAMEBOYCOLOR.GAMEBOYCOLORMODE) {
        if ((this.IOregisters[this.ioNames.SVBK] & 0b111) === 0)
          this.WORKRAM[1][address - 0xd000] = value;
        else
          this.WORKRAM[this.IOregisters[this.ioNames.SVBK] & 0b111][
            address - 0xd000
          ] = value;
      } else this.WORKRAM[1][address - 0xd000] = value;
      return;
    }
    //----ECHO RAM----
    if (address >= 0xe000 && address <= 0xfdff) {
      if (address >= 0xe000 && address <= 0xedff)
        this.WORKRAM[0][address - 0xe000] = value;
      else if (address >= 0xee00 && address <= 0xfdff)
        if (GAMEBOYCOLOR.GAMEBOYCOLORMODE) {
          if ((this.IOregisters[this.ioNames.SVBK] & 0b111) === 0)
            this.WORKRAM[1][address - 0xd000] = value;
          else
            this.WORKRAM[this.IOregisters[this.ioNames.SVBK] & 0b111][
              address - 0xd000
            ] = value;
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
      this.IOwrite(address - 0xff00, value);
    }
    //----HIGH RAM----
    if (address >= 0xff80 && address <= 0xfffe) {
      this.HIGHRAM[address - 0xff80] = value;
      return;
    }
    //----INTERRUPT ENABLE REGISTER----
    if (address === 0xffff) {
      this.IOwrite(0xff, value);
    }
  }

  read(address: number): number {
    //----BOOT ROM----
    if (
      BOOTROM.isActive &&
      ((address >= 0x0 && address <= 0xff) ||
        (address >= 0x200 && address <= 0x8ff))
    ) {
      return BOOTROM.rom![address];
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
      if (GAMEBOYCOLOR.GAMEBOYCOLORMODE)
        return this.VRAM[this.IOregisters[this.ioNames.VBK] & 0b1][
          address - 0x8000
        ];
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
      if (GAMEBOYCOLOR.GAMEBOYCOLORMODE) {
        if ((this.IOregisters[this.ioNames.SVBK] & 0b111) !== 0)
          return this.WORKRAM[this.IOregisters[this.ioNames.SVBK] & 0b111][
            address - 0xd000
          ];
      }
      return this.WORKRAM[1][address - 0xd000];
    }
    //----ECHO RAM----
    if (address >= 0xe000 && address <= 0xfdff) {
      if (address >= 0xe000 && address <= 0xedff)
        return this.WORKRAM[0][address - 0xe000];
      else if (address >= 0xee00 && address <= 0xfdff)
        if (GAMEBOYCOLOR.GAMEBOYCOLORMODE) {
          if ((this.IOregisters[this.ioNames.SVBK] & 0b111) !== 0)
            return this.WORKRAM[this.IOregisters[this.ioNames.SVBK] & 0b111][
              address - 0xd000
            ];
        }
      return this.WORKRAM[1][address - 0xee00];
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
      return this.IOread(address - 0xff00);
    }
    //----HIGH RAM----
    if (address >= 0xff80 && address <= 0xfffe) {
      return this.HIGHRAM[address - 0xff80];
    }
    //----INTERRUPT ENABLE REGISTER----
    if (address === 0xffff) return this.IOread(0xff);

    return 0xff;
  }
}

export default Memory;
