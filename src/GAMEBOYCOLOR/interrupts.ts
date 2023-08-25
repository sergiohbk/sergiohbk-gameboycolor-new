import {
  memory as MEMORY,
  cpu as CPU,
  cycles as TIME,
} from './components';
class INTERRUPTS {
  tick() {
    const interrupt =
      MEMORY.IE & MEMORY.IOregisters[MEMORY.ioNames.IF] & 0x1f;

    if (interrupt === 0) return;

    CPU.haltExit();

    if (!CPU.IME) return;

    CPU.stackPush16bit(CPU.PC);
    CPU.IME = false;
    TIME.sumCycles(20);

    switch (interrupt) {
      case interrupt & 0b1:
        CPU.PC = 0x40;
        MEMORY.IOwrite(
          MEMORY.ioNames.IF,
          MEMORY.IOread(MEMORY.ioNames.IF) & 0xfe,
        );
        break;
      case interrupt & 0b10:
        CPU.PC = 0x48;
        MEMORY.IOwrite(
          MEMORY.ioNames.IF,
          MEMORY.IOread(MEMORY.ioNames.IF) & 0xfd,
        );
        break;
      case interrupt & 0b100:
        CPU.PC = 0x50;
        MEMORY.IOwrite(
          MEMORY.ioNames.IF,
          MEMORY.IOread(MEMORY.ioNames.IF) & 0xfb,
        );
        break;
      case interrupt & 0b1000:
        CPU.PC = 0x58;
        MEMORY.IOwrite(
          MEMORY.ioNames.IF,
          MEMORY.IOread(MEMORY.ioNames.IF) & 0xf7,
        );
        break;
      case interrupt & 0b10000:
        CPU.PC = 0x60;
        MEMORY.IOwrite(
          MEMORY.ioNames.IF,
          MEMORY.IOread(MEMORY.ioNames.IF) & 0xef,
        );
        break;
    }
  }
}

export default INTERRUPTS;
