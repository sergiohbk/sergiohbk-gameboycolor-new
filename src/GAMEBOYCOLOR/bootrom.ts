class Bootrom {
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

  setDefault() {
    this.rom = null;
    this.isActive = false;
    this.isBootromLoaded = false;
    this.isGBC = false;
  }

  setRom(rom: Uint8ClampedArray) {
    this.rom = rom;
    this.isBootromLoaded = true;
    this.isActive = true;
    this.isGBC = this.isGBCtype();
  }

  private isGBCtype() {
    if (!this.rom)
      throw new Error(
        'trying to get bootrom type but there is no rom',
      );

    if (this.rom.length <= 256) return false;
    else return true;
  }
}

export default Bootrom;
