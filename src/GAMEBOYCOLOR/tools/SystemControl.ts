import {
  SysCtrlExtends,
  logInstruction,
} from './SystemControlExtends';

class SysCtrl extends SysCtrlExtends {
  // Add a new instruction to the log
  addInstruction(instruction: logInstruction, limit?: number) {
    if (!this.isDebug || !this.logFlag) return;
    if (this.instructionsLog.length >= this.limitEntrys)
      this.instructionsLog.shift();
    this.instructionsLog.push(instruction);

    if (limit && instruction.pc === limit) {
      this.logFlag = false;
      if (this.verbose) console.log(this.instructionsLog);
    }
  }

  // Add to the stack
  pushStack(value: number) {
    if (this.isDebug) this.cpuStack.push(value);
  }
  // Remove from the stack
  popStack() {
    if (this.isDebug) this.cpuStack.pop();
  }

  programCounterControl(pc: number, limit?: number) {
    if (!this.isDebug || !this.logFlag) return;
    if (this.pcLog.length >= this.limitEntrys)
      this.pcLog.shift();
    this.pcLog.push(pc);

    if (limit && pc === limit) {
      this.logFlag = false;
      if (this.verbose)
        console.log(this.pcLog.map((x) => x.toString(16)));
    }
  }
}

const sysctrl = new SysCtrl();

export { sysctrl };
