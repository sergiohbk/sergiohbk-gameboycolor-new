class CYCLES {
  cycles: number;
  //----------------
  cyclesToOAM: number;
  cyclesToVBlank: number;
  cyclesToHblank: number;
  cyclesToTransfer: number;
  cyclesToFrame: number;
  cyclesToMode: number;
  cyclesPPUcounter: number;

  constructor() {
    this.cycles = 0;
    this.cyclesToHblank = 206;
    this.cyclesToVBlank = 456;
    this.cyclesToOAM = 80;
    this.cyclesToTransfer = 170;
    this.cyclesToFrame = 70224;
    this.cyclesToMode = 0;
    this.cyclesPPUcounter = 0;
  }

  setCycles(cycles: number) {
    this.cycles = cycles;
  }
  sumCycles(cycles: number) {
    this.cycles += cycles;
  }
  resCycles(cycles: number) {
    this.cycles -= cycles;
  }
  getCycles() {
    return this.cycles;
  }
  updateCyclesCounter() {
    this.cyclesPPUcounter += this.cycles - this.cyclesPPUcounter;
  }
  updateToNewFrame() {
    this.cyclesPPUcounter %= this.cyclesToFrame;
    this.cyclesToMode %= this.cyclesToFrame;
  }
  setOAMCycles() {
    this.cyclesToMode += this.cyclesToOAM;
  }
  setTransferCycles() {
    this.cyclesToMode += this.cyclesToTransfer;
  }
  setHblankCycles() {
    this.cyclesToMode += this.cyclesToHblank;
  }
  setVblankCycles() {
    this.cyclesToMode += this.cyclesToVBlank;
  }
}

export default CYCLES;
