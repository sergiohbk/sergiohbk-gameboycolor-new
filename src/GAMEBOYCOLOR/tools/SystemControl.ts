import {
    SysCtrlExtends,
    logInstruction,
} from './SystemControlExtends';

class SysCtrl extends SysCtrlExtends {
    // Add a new instruction to the log
    addInstruction(instruction: logInstruction) {
        if (this.isDebug) {
            if (
                this.instructionsLog.length >=
                this.limitEntrys
            ) {
                this.instructionsLog.shift();
            }
            this.instructionsLog.push(instruction);
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
}

const sysctrl = new SysCtrl();

export { sysctrl };
