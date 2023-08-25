class CYCLES {
  cycles: number = 0;
  //----------------
  ToOAM: number = 80;
  ToVBlank: number = 456;
  ToHblank: number = 206;
  ToTransfer: number = 170;
  ToFrame: number = 70224;
  ToMode: number = 0;
  PPUcounter: number = 0;

  setCycles(cycles: number) {
    this.cycles = cycles;
  }
  sumCycles(cycles: number) {
    this.cycles += cycles;
  }
  resCycles(cycles: number) {
    this.cycles -= cycles;
  }
  updateCyclesCounter() {
    this.PPUcounter += this.cycles - this.PPUcounter;
  }
  updateToNewFrame() {
    this.PPUcounter %= this.ToFrame;
    this.ToMode %= this.ToFrame;
  }
  setPPUmode(mode: number) {
    if (mode === 0) this.setHblankCycles();
    else if (mode === 1) this.setVblankCycles();
    else if (mode === 2) this.setOAMCycles();
    else if (mode === 3) this.setTransferCycles();
  }
  private setOAMCycles() {
    this.ToMode += this.ToOAM;
  }
  private setTransferCycles() {
    this.ToMode += this.ToTransfer;
  }
  private setHblankCycles() {
    this.ToMode += this.ToHblank;
  }
  private setVblankCycles() {
    this.ToMode += this.ToVBlank;
  }
}

export default CYCLES;
