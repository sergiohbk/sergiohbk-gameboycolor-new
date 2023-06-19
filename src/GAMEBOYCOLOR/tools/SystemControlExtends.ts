export class SysCtrlExtends {
  instructionsLog: any[];
  injectInstructions: number[];
  limitEntrys: number;
  cpuStack: number[];
  isDebug: boolean;

  constructor() {
    this.limitEntrys = 300;
    this.instructionsLog = [];
    this.injectInstructions = [];
    this.cpuStack = [];
    this.isDebug = true;
  }
}

export interface logInstruction {
  opcode: number;
  pc: number;
  cycles: number;
}
