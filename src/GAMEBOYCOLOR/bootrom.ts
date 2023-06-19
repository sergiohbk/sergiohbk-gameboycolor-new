export class Bootrom {
  rom: Uint8ClampedArray | null;
  isActive: boolean;
  isBootromLoaded: boolean;
  isGBC: boolean;

  constructor() {
    this.rom = null;
    this.isActive = false;
    this.isBootromLoaded = false;
    this.isGBC = false;
  }

  setRom(rom: Uint8ClampedArray) {
    this.rom = rom;
    this.isBootromLoaded = true;
    this.isActive = true;
    this.isGBC = this.getBootRomSize(rom);

    console.log(this.rom);
  }

  getBootRomSize(rom: Uint8ClampedArray) {
    if (rom.length <= 256) return false;
    else return true;
  }
}
