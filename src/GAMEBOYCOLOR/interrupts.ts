import { CPU } from "./cpu";
import { CYCLES } from "./cycles";
import { Memory } from "./memory";

export class INTERRUPTS{
    //----DEPENDENCIES----
    memory: Memory
    cpu: CPU
    cycles : CYCLES

    constructor(memory : Memory, cpu : CPU, cycles : CYCLES) {
        this.memory = memory;
        this.cpu = cpu;
        this.cycles = cycles
    }

    tick() {
        const interrupt = (this.memory.IF & this.memory.IE) & 0x1F;

        if (interrupt === 0)
            return;
        
        this.haltExit()
        
        if (!this.memory.flags.IME)
            return;
        
        this.cpu.stackPush16bit(this.cpu.PC);
        this.memory.flags.IME = false;
        this.cycles.sumCycles(20)
        
        switch (interrupt) {
            case (interrupt & 0b1):
                this.cpu.PC = 0x40;
                this.memory.IF = this.memory.IF & 0xFE
                break;
            case (interrupt & 0b10):
                this.cpu.PC = 0x48;
                this.memory.IF = this.memory.IF & 0xFD
                break;
            case (interrupt & 0b100):
                this.cpu.PC = 0x50;
                this.memory.IF = this.memory.IF & 0xFB
                break;
            case (interrupt & 0b1000):
                this.cpu.PC = 0x58;
                this.memory.IF = this.memory.IF & 0xF7
                break;
            case (interrupt & 0b10000):
                this.cpu.PC = 0x60;
                this.memory.IF = this.memory.IF & 0xEF
                break;
        }
    }

    haltExit() {
        if (this.memory.flags.CPUhalt) {
            this.memory.flags.CPUhalt = false;
            this.cycles.sumCycles(4)
        }
        //halt bug implement here
    }
}