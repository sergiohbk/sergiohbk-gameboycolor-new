export class SysCtrlExtends {
  instructionsLog: any[];
  injectInstructions: number[];
  limitEntrys: number;
  cpuStack: number[];
  isDebug: boolean;
  pcLog: number[];
  logFlag: boolean;
  verbose: boolean;

  constructor() {
    this.limitEntrys = 300;
    this.instructionsLog = [];
    this.injectInstructions = [];
    this.cpuStack = [];
    this.isDebug = true;
    this.pcLog = [];
    this.logFlag = true;
    this.verbose = true;
  }
}

export interface logInstruction {
  opcode: number;
  pc: number;
  cycles: number;
}
