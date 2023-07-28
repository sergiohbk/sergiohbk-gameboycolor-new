import Memory from './memory';
import CYCLES from './cycles';
import FLAGS from './generalFlags';
import INTERRUPTS from './interrupts';
import Bootrom from './bootrom';

enum CPUstate {
  INSTRUCTION = 'INSTRUCTION',
  HALT = 'HALT',
  STOP = 'STOP',
  INTERRUPT = 'INTERRUPT',
  INTERRUPT_WAIT = 'INTERRUPT_WAIT',
  TIMER = 'TIMER',
  WAIT = 'WAIT',
  COLLAPSED = 'COLLAPSED',
}

class CPU {
  //----DEPENDENCIES----
  memory: Memory;
  cycles: CYCLES;
  flags: FLAGS;
  bootrom: Bootrom;
  //----REGISTERS----
  A: number; // Accumulator
  B: number; // B
  C: number; // C
  D: number; // D
  E: number; // E
  H: number; // H
  L: number; // L
  //----FLAGS----
  zeroFlag: boolean; // Zero Flag
  subtractFlag: boolean; // Subtract Flag
  halfCarryFlag: boolean; // Half Carry Flag
  carryFlag: boolean; // Carry Flag
  //----FLOW CONTROL----
  SP: number; // Stack Pointer
  PC: number; // Program Counter
  requestIE: boolean; //requiere activar el IME, pero se delayea 1 instruccion
  testMode: boolean;
  //----COMPONENTS----
  interrupts: INTERRUPTS;

  CPUSTATE: CPUstate;

  constructor(
    memory: Memory,
    cycles: CYCLES,
    flags: FLAGS,
    bootrom: Bootrom,
  ) {
    //----DEPENDENCIES----
    this.memory = memory;
    this.cycles = cycles;
    this.flags = flags;
    this.bootrom = bootrom;
    // REGISTERS
    this.A = 0;
    this.B = 0;
    this.C = 0;
    this.D = 0;
    this.E = 0;
    this.H = 0;
    this.L = 0;
    //----FLAGS----
    this.zeroFlag = false;
    this.subtractFlag = false;
    this.halfCarryFlag = false;
    this.carryFlag = false;
    //----FLOW CONTROL----
    this.SP = 0;
    this.PC = 0;
    this.requestIE = false;
    this.testMode = false;
    //----COMPONENTS----
    this.interrupts = new INTERRUPTS(
      this.memory,
      this,
      this.cycles,
    );

    this.CPUSTATE = CPUstate.WAIT;
  }

  tick() {
    if (this.stopTick()) return;
    this.interrupts.tick();
    if (this.flags.CPUhalt) return;
    this.execute();
  }

  fetch(): number {
    if (this.PC < 0x8000) {
      return this.memory.read(this.PC);
    } else
      throw new Error(`the program counter try to fetch from ${this.PC} but 
      the address is more than 0x7FFF`);
  }

  decode(opcode: number) {
    if (opcode !== undefined) this.instructionSet(opcode);
    else
      throw new Error(
        `the opcode given is undefined, there are maybe a error in fetch`,
      );
    if (this.requestIE) {
      //la instruccion EI delayea la activacion en 1 instruccion
      this.flags.IME = true;
      this.requestIE = false;
    }
  }

  execute() {
    const opcode = this.fetch();
    this.decode(opcode);
  }

  //----GET16BITREGISTER----
  getAF() {
    let value: number = 0;
    value = this.A << 8;
    value |= (this.carryFlag ? 1 : 0) << 4;
    value |= (this.halfCarryFlag ? 1 : 0) << 5;
    value |= (this.subtractFlag ? 1 : 0) << 6;
    value |= (this.zeroFlag ? 1 : 0) << 7;
    return value;
  }

  getBC() {
    return (this.B << 8) | this.C;
  }

  getDE() {
    return (this.D << 8) | this.E;
  }

  getHL() {
    return (this.H << 8) | this.L;
  }

  //----SET16BITREGISTER----
  setAF(value: number) {
    value &= 0xffff;
    this.A = value >> 8;
    this.carryFlag = (value & 0x10) === 0x10;
    this.halfCarryFlag = (value & 0x20) === 0x20;
    this.subtractFlag = (value & 0x40) === 0x40;
    this.zeroFlag = (value & 0x80) === 0x80;
  }

  setBC(value: number) {
    value &= 0xffff;
    this.B = value >> 8;
    this.C = value & 0xff;
  }

  setDE(value: number) {
    value &= 0xffff;
    this.D = value >> 8;
    this.E = value & 0xff;
  }

  setHL(value: number) {
    value &= 0xffff;
    this.H = value >> 8;
    this.L = value & 0xff;
  }
  //----STACKPUSH8BIT----
  stackPush8bit(value: number) {
    this.memory.stackMem[this.SP] = value;
    this.SP--;
    //a revisar si se resta antes o despues
  }
  //----STACKPUSH16BIT----
  stackPush16bit(value: number) {
    value &= 0xffff;
    this.memory.stackMem[this.SP] = value >> 8;
    this.memory.stackMem[this.SP - 1] = value & 0xff;
    this.SP -= 2;
  }
  //----STACKPOP8BIT----
  stackPop8bit() {
    if (this.SP > 0xfffe) {
      throw new Error('Stack overflow');
    }

    this.SP++;
    return this.memory.stackMem[this.SP];
  }
  //----STACKPOP16BIT----
  stackPop16bit() {
    if (this.SP > 0xfffe) {
      throw new Error('Stack overflow');
    }

    this.SP += 2;
    return (
      (this.memory.stackMem[this.SP] << 8) |
      this.memory.stackMem[this.SP - 1]
    );
  }
  //----8NEXTBITSDATA----
  get8nextBits() {
    if (this.testMode) return 0x23;
    return this.memory.read(this.PC + 1);
  }
  //----16NEXTBITSDATA----
  get16nextBits() {
    if (this.testMode) return 0x2323;
    return (
      (this.memory.read(this.PC + 2) << 8) |
      this.memory.read(this.PC + 1)
    );
  }
  //----PROGRAM COUNTER INCREMENT----
  pcIncrement(increment: number) {
    this.PC += increment;
    this.PC &= 0xffff;
  }
  //----INSTRUCTIONS----
  instructionSet(opcode: number) {
    this.CPUSTATE = CPUstate.INSTRUCTION;

    switch (opcode) {
      case 0x00:
        //NOP
        this.cycles.sumCycles(4);
        break;
      case 0x01:
        //LD BC, d16
        this.setBC(this.get16nextBits());
        this.pcIncrement(2);
        this.cycles.sumCycles(12);
        break;
      case 0x02:
        //LD (BC), A
        this.memory.write(this.getBC(), this.A);
        this.cycles.sumCycles(8);
        break;
      case 0x03:
        //INC BC
        this.setBC(this.IncDec('inc', this.getBC()));
        this.cycles.sumCycles(8);
        break;
      case 0x04:
        //INC B
        this.B = this.IncDec('inc', this.B);
        this.cycles.sumCycles(4);
        break;
      case 0x05:
        //DEC B
        this.B = this.IncDec('dec', this.B);
        this.cycles.sumCycles(4);
        break;
      case 0x06:
        //LD B, d8
        this.B = this.get8nextBits();
        this.pcIncrement(1);
        this.cycles.sumCycles(8);
        break;
      case 0x07:
        //RLCA
        this.A = this.rotShift('RLCA', this.A);
        this.cycles.sumCycles(4);
        break;
      case 0x08:
        //LD (a16), SP
        this.memory.write(this.get16nextBits(), this.SP);
        this.pcIncrement(2);
        this.cycles.sumCycles(20);
        break;
      case 0x09:
        //ADD HL, BC
        this.setHL(
          this.addSub('add', this.getHL(), this.getBC(), 16),
        );
        this.cycles.sumCycles(8);
        break;
      case 0x0a:
        //LD A, (BC)
        this.A = this.memory.read(this.getBC());
        this.cycles.sumCycles(8);
        break;
      case 0x0b:
        //DEC BC
        this.setBC(this.IncDec('dec', this.getBC()));
        this.cycles.sumCycles(8);
        break;
      case 0x0c:
        //INC C
        this.C = this.IncDec('inc', this.C);
        this.cycles.sumCycles(4);
        break;
      case 0x0d:
        //DEC C
        this.C = this.IncDec('dec', this.C);
        this.cycles.sumCycles(4);
        break;
      case 0x0e:
        //LD C, d8
        this.C = this.get8nextBits();
        this.pcIncrement(1);
        this.cycles.sumCycles(8);
        break;
      case 0x0f:
        //RRCA
        this.A = this.rotShift('RRCA', this.A);
        this.cycles.sumCycles(4);
        break;
      case 0x10:
        //STOP
        this.STOPinstruction(this.get8nextBits());
        this.pcIncrement(1);
        this.cycles.sumCycles(4);
        break;
      case 0x11:
        //LD DE, d16
        this.setDE(this.get16nextBits());
        this.pcIncrement(2);
        this.cycles.sumCycles(12);
        break;
      case 0x12:
        //LD (DE), A
        this.memory.write(this.getDE(), this.A);
        this.cycles.sumCycles(8);
        break;
      case 0x13:
        //INC DE
        this.setDE(this.IncDec('inc', this.getDE()));
        this.cycles.sumCycles(8);
        break;
      case 0x14:
        //INC D
        this.D = this.IncDec('inc', this.D);
        this.cycles.sumCycles(4);
        break;
      case 0x15:
        //DEC D
        this.D = this.IncDec('dec', this.D);
        this.cycles.sumCycles(4);
        break;
      case 0x16:
        //LD D, d8
        this.D = this.get8nextBits();
        this.pcIncrement(1);
        this.cycles.sumCycles(8);
        break;
      case 0x17:
        //RLA
        this.A = this.rotShift('RLA', this.A);
        this.cycles.sumCycles(4);
        break;
      case 0x18:
        //JR r8
        this.PC += this.JR(this.get8nextBits());
        this.PC &= 0xffff;
        this.pcIncrement(-1);
        this.cycles.sumCycles(12);
        break;
      case 0x19:
        //ADD HL, DE
        this.setHL(
          this.addSub('add', this.getHL(), this.getDE(), 16),
        );
        this.cycles.sumCycles(8);
        break;
      case 0x1a:
        //LD A, (DE)
        this.A = this.memory.read(this.getDE());
        this.cycles.sumCycles(8);
        break;
      case 0x1b:
        //DEC DE
        this.setDE(this.IncDec('dec', this.getDE()));
        this.cycles.sumCycles(8);
        break;
      case 0x1c:
        //INC E
        this.E = this.IncDec('inc', this.E);
        this.cycles.sumCycles(4);
        break;
      case 0x1d:
        //DEC E
        this.E = this.IncDec('dec', this.E);
        this.cycles.sumCycles(4);
        break;
      case 0x1e:
        //LD E, d8
        this.E = this.get8nextBits();
        this.pcIncrement(1);
        this.cycles.sumCycles(8);
        break;
      case 0x1f:
        //RRA
        this.A = this.rotShift('RRA', this.A);
        this.cycles.sumCycles(4);
        break;
      case 0x20:
        //JR NZ, r8
        if (!this.zeroFlag) {
          this.PC += this.JR(this.get8nextBits());
          this.PC &= 0xffff;
          this.pcIncrement(-1);
          this.cycles.sumCycles(12);
        } else {
          this.pcIncrement(1);
          this.cycles.sumCycles(8);
        }
        break;
      case 0x21:
        //LD HL, d16
        this.setHL(this.get16nextBits());
        this.pcIncrement(2);
        this.cycles.sumCycles(12);
        break;
      case 0x22:
        //LD (HL+), A
        this.memory.write(this.getHL(), this.A);
        this.setHL(this.IncDec('inc', this.getHL()));
        this.cycles.sumCycles(8);
        break;
      case 0x23:
        //INC HL
        this.setHL(this.IncDec('inc', this.getHL()));
        this.cycles.sumCycles(8);
        break;
      case 0x24:
        //INC H
        this.H = this.IncDec('inc', this.H);
        this.cycles.sumCycles(4);
        break;
      case 0x25:
        //DEC H
        this.H = this.IncDec('dec', this.H);
        this.cycles.sumCycles(4);
        break;
      case 0x26:
        //LD H, d8
        this.H = this.get8nextBits();
        this.pcIncrement(1);
        this.cycles.sumCycles(8);
        break;
      case 0x27:
        //DAA
        this.A = this.DAA(this.A);
        this.cycles.sumCycles(4);
        break;
      case 0x28:
        //JR Z, r8
        if (this.zeroFlag) {
          this.PC += this.JR(this.get8nextBits());
          this.PC &= 0xffff;
          this.pcIncrement(-1);
          this.cycles.sumCycles(12);
        } else {
          this.pcIncrement(1);
          this.cycles.sumCycles(8);
        }
        break;
      case 0x29:
        //ADD HL, HL
        this.setHL(
          this.addSub('add', this.getHL(), this.getHL(), 16),
        );
        this.cycles.sumCycles(8);
        break;
      case 0x2a:
        //LD A, (HL+)
        this.A = this.memory.read(this.getHL());
        this.setHL(this.IncDec('inc', this.getHL()));
        this.cycles.sumCycles(8);
        break;
      case 0x2b:
        //DEC HL
        this.setHL(this.IncDec('dec', this.getHL()));
        this.cycles.sumCycles(8);
        break;
      case 0x2c:
        //INC L
        this.L = this.IncDec('inc', this.L);
        this.cycles.sumCycles(4);
        break;
      case 0x2d:
        //DEC L
        this.L = this.IncDec('dec', this.L);
        this.cycles.sumCycles(4);
        break;
      case 0x2e:
        //LD L, d8
        this.L = this.get8nextBits();
        this.pcIncrement(1);
        this.cycles.sumCycles(8);
        break;
      case 0x2f:
        //CPL
        this.A = this.miscelaneous('cpl', this.A) as number;
        this.cycles.sumCycles(4);
        break;
      case 0x30:
        //JR NC, r8
        if (!this.carryFlag) {
          this.PC += this.JR(this.get8nextBits());
          this.PC &= 0xffff;
          this.pcIncrement(-1);
          this.cycles.sumCycles(12);
        } else {
          this.pcIncrement(1);
          this.cycles.sumCycles(8);
        }
        break;
      case 0x31:
        //LD SP, d16
        this.SP = this.get16nextBits();
        this.pcIncrement(2);
        this.cycles.sumCycles(12);
        break;
      case 0x32:
        //LD (HL-), A
        this.memory.write(this.getHL(), this.A);
        this.setHL(this.IncDec('dec', this.getHL()));
        this.cycles.sumCycles(8);
        break;
      case 0x33:
        //INC SP
        this.SP = this.IncDec('inc', this.SP);
        this.cycles.sumCycles(8);
        break;
      case 0x34:
        //INC (HL)
        this.memory.write(
          this.getHL(),
          this.IncDec('inc', this.memory.read(this.getHL())),
        );
        this.cycles.sumCycles(12);
        break;
      case 0x35:
        //DEC (HL)
        this.memory.write(
          this.getHL(),
          this.IncDec('dec', this.memory.read(this.getHL())),
        );
        this.cycles.sumCycles(12);
        break;
      case 0x36:
        //LD (HL), d8
        this.memory.write(this.getHL(), this.get8nextBits());
        this.pcIncrement(1);
        this.cycles.sumCycles(12);
        break;
      case 0x37:
        //SCF
        this.miscelaneous('scf');
        this.cycles.sumCycles(4);
        break;
      case 0x38:
        //JR C, r8
        if (this.carryFlag) {
          this.PC += this.JR(this.get8nextBits());
          this.PC &= 0xffff;
          this.pcIncrement(-1);
          this.cycles.sumCycles(12);
        } else {
          this.pcIncrement(1);
          this.cycles.sumCycles(8);
        }
        break;
      case 0x39:
        //ADD HL, SP
        this.setHL(
          this.addSub('add', this.getHL(), this.SP, 16),
        );
        this.cycles.sumCycles(8);
        break;
      case 0x3a:
        //LD A, (HL-)
        this.A = this.memory.read(this.getHL());
        this.setHL(this.IncDec('dec', this.getHL()));
        this.cycles.sumCycles(8);
        break;
      case 0x3b:
        //DEC SP
        this.SP = this.IncDec('dec', this.SP);
        this.cycles.sumCycles(8);
        break;
      case 0x3c:
        //INC A
        this.A = this.IncDec('inc', this.A);
        this.cycles.sumCycles(4);
        break;
      case 0x3d:
        //DEC A
        this.A = this.IncDec('dec', this.A);
        this.cycles.sumCycles(4);
        break;
      case 0x3e:
        //LD A, d8
        this.A = this.get8nextBits();
        this.pcIncrement(1);
        this.cycles.sumCycles(8);
        break;
      case 0x3f:
        //CCF
        this.miscelaneous('ccf');
        this.cycles.sumCycles(4);
        break;
      case 0x40:
        //LD B, B
        this.cycles.sumCycles(4);
        break;
      case 0x41:
        //LD B, C
        this.B = this.C;
        this.cycles.sumCycles(4);
        break;
      case 0x42:
        //LD B, D
        this.B = this.D;
        this.cycles.sumCycles(4);
        break;
      case 0x43:
        //LD B, E
        this.B = this.E;
        this.cycles.sumCycles(4);
        break;
      case 0x44:
        //LD B, H
        this.B = this.H;
        this.cycles.sumCycles(4);
        break;
      case 0x45:
        //LD B, L
        this.B = this.L;
        this.cycles.sumCycles(4);
        break;
      case 0x46:
        //LD B, (HL)
        this.B = this.memory.read(this.getHL());
        this.cycles.sumCycles(8);
        break;
      case 0x47:
        //LD B, A
        this.B = this.A;
        this.cycles.sumCycles(4);
        break;
      case 0x48:
        //LD C, B
        this.C = this.B;
        this.cycles.sumCycles(4);
        break;
      case 0x49:
        //LD C, C
        this.cycles.sumCycles(4);
        break;
      case 0x4a:
        //LD C, D
        this.C = this.D;
        this.cycles.sumCycles(4);
        break;
      case 0x4b:
        //LD C, E
        this.C = this.E;
        this.cycles.sumCycles(4);
        break;
      case 0x4c:
        //LD C, H
        this.C = this.H;
        this.cycles.sumCycles(4);
        break;
      case 0x4d:
        //LD C, L
        this.C = this.L;
        this.cycles.sumCycles(4);
        break;
      case 0x4e:
        //LD C, (HL)
        this.C = this.memory.read(this.getHL());
        this.cycles.sumCycles(8);
        break;
      case 0x4f:
        //LD C, A
        this.C = this.A;
        this.cycles.sumCycles(4);
        break;
      case 0x50:
        //LD D, B
        this.D = this.B;
        this.cycles.sumCycles(4);
        break;
      case 0x51:
        //LD D, C
        this.D = this.C;
        this.cycles.sumCycles(4);
        break;
      case 0x52:
        //LD D, D
        this.cycles.sumCycles(4);
        break;
      case 0x53:
        //LD D, E
        this.D = this.E;
        this.cycles.sumCycles(4);
        break;
      case 0x54:
        //LD D, H
        this.D = this.H;
        this.cycles.sumCycles(4);
        break;
      case 0x55:
        //LD D, L
        this.D = this.L;
        this.cycles.sumCycles(4);
        break;
      case 0x56:
        //LD D, (HL)
        this.D = this.memory.read(this.getHL());
        this.cycles.sumCycles(8);
        break;
      case 0x57:
        //LD D, A
        this.D = this.A;
        this.cycles.sumCycles(4);
        break;
      case 0x58:
        //LD E, B
        this.E = this.B;
        this.cycles.sumCycles(4);
        break;
      case 0x59:
        //LD E, C
        this.E = this.C;
        this.cycles.sumCycles(4);
        break;
      case 0x5a:
        //LD E, D
        this.E = this.D;
        this.cycles.sumCycles(4);
        break;
      case 0x5b:
        //LD E, E
        this.cycles.sumCycles(4);
        break;
      case 0x5c:
        //LD E, H
        this.E = this.H;
        this.cycles.sumCycles(4);
        break;
      case 0x5d:
        //LD E, L
        this.E = this.L;
        this.cycles.sumCycles(4);
        break;
      case 0x5e:
        //LD E, (HL)
        this.E = this.memory.read(this.getHL());
        this.cycles.sumCycles(8);
        break;
      case 0x5f:
        //LD E, A
        this.E = this.A;
        this.cycles.sumCycles(4);
        break;
      case 0x60:
        //LD H, B
        this.H = this.B;
        this.cycles.sumCycles(4);
        break;
      case 0x61:
        //LD H, C
        this.H = this.C;
        this.cycles.sumCycles(4);
        break;
      case 0x62:
        //LD H, D
        this.H = this.D;
        this.cycles.sumCycles(4);
        break;
      case 0x63:
        //LD H, E
        this.H = this.E;
        this.cycles.sumCycles(4);
        break;
      case 0x64:
        //LD H, H
        this.cycles.sumCycles(4);
        break;
      case 0x65:
        //LD H, L
        this.H = this.L;
        this.cycles.sumCycles(4);
        break;
      case 0x66:
        //LD H, (HL)
        this.H = this.memory.read(this.getHL());
        this.cycles.sumCycles(8);
        break;
      case 0x67:
        //LD H, A
        this.H = this.A;
        this.cycles.sumCycles(4);
        break;
      case 0x68:
        //LD L, B
        this.L = this.B;
        this.cycles.sumCycles(4);
        break;
      case 0x69:
        //LD L, C
        this.L = this.C;
        this.cycles.sumCycles(4);
        break;
      case 0x6a:
        //LD L, D
        this.L = this.D;
        this.cycles.sumCycles(4);
        break;
      case 0x6b:
        //LD L, E
        this.L = this.E;
        this.cycles.sumCycles(4);
        break;
      case 0x6c:
        //LD L, H
        this.L = this.H;
        this.cycles.sumCycles(4);
        break;
      case 0x6d:
        //LD L, L
        this.cycles.sumCycles(4);
        break;
      case 0x6e:
        //LD L, (HL)
        this.L = this.memory.read(this.getHL());
        this.cycles.sumCycles(8);
        break;
      case 0x6f:
        //LD L, A
        this.L = this.A;
        this.cycles.sumCycles(4);
        break;
      case 0x70:
        //LD (HL), B
        this.memory.write(this.getHL(), this.B);
        this.cycles.sumCycles(8);
        break;
      case 0x71:
        //LD (HL), C
        this.memory.write(this.getHL(), this.C);
        this.cycles.sumCycles(8);
        break;
      case 0x72:
        //LD (HL), D
        this.memory.write(this.getHL(), this.D);
        this.cycles.sumCycles(8);
        break;
      case 0x73:
        //LD (HL), E
        this.memory.write(this.getHL(), this.E);
        this.cycles.sumCycles(8);
        break;
      case 0x74:
        //LD (HL), H
        this.memory.write(this.getHL(), this.H);
        this.cycles.sumCycles(8);
        break;
      case 0x75:
        //LD (HL), L
        this.memory.write(this.getHL(), this.L);
        this.cycles.sumCycles(8);
        break;
      case 0x76:
        //HALT
        this.halt();
        this.cycles.sumCycles(4);
        break;
      case 0x77:
        //LD (HL), A
        this.memory.write(this.getHL(), this.A);
        this.cycles.sumCycles(8);
        break;
      case 0x78:
        //LD A, B
        this.A = this.B;
        this.cycles.sumCycles(4);
        break;
      case 0x79:
        //LD A, C
        this.A = this.C;
        this.cycles.sumCycles(4);
        break;
      case 0x7a:
        //LD A, D
        this.A = this.D;
        this.cycles.sumCycles(4);
        break;
      case 0x7b:
        //LD A, E
        this.A = this.E;
        this.cycles.sumCycles(4);
        break;
      case 0x7c:
        //LD A, H
        this.A = this.H;
        this.cycles.sumCycles(4);
        break;
      case 0x7d:
        //LD A, L
        this.A = this.L;
        this.cycles.sumCycles(4);
        break;
      case 0x7e:
        //LD A, (HL)
        this.A = this.memory.read(this.getHL());
        this.cycles.sumCycles(8);
        break;
      case 0x7f:
        //LD A, A
        this.cycles.sumCycles(4);
        break;
      case 0x80:
        //ADD A, B
        this.A = this.addSub('add', this.A, this.B, 8);
        this.cycles.sumCycles(4);
        break;
      case 0x81:
        //ADD A, C
        this.A = this.addSub('add', this.A, this.C, 8);
        this.cycles.sumCycles(4);
        break;
      case 0x82:
        //ADD A, D
        this.A = this.addSub('add', this.A, this.D, 8);
        this.cycles.sumCycles(4);
        break;
      case 0x83:
        //ADD A, E
        this.A = this.addSub('add', this.A, this.E, 8);
        this.cycles.sumCycles(4);
        break;
      case 0x84:
        //ADD A, H
        this.A = this.addSub('add', this.A, this.H, 8);
        this.cycles.sumCycles(4);
        break;
      case 0x85:
        //ADD A, L
        this.A = this.addSub('add', this.A, this.L, 8);
        this.cycles.sumCycles(4);
        break;
      case 0x86:
        //ADD A, (HL)
        this.A = this.addSub(
          'add',
          this.A,
          this.memory.read(this.getHL()),
          8,
        );
        this.cycles.sumCycles(8);
        break;
      case 0x87:
        //ADD A, A
        this.A = this.addSub('add', this.A, this.A, 8);
        this.cycles.sumCycles(4);
        break;
      case 0x88:
        //ADC A, B
        this.A = this.addSub('adc', this.A, this.B, 8);
        this.cycles.sumCycles(4);
        break;
      case 0x89:
        //ADC A, C
        this.A = this.addSub('adc', this.A, this.C, 8);
        this.cycles.sumCycles(4);
        break;
      case 0x8a:
        //ADC A, D
        this.A = this.addSub('adc', this.A, this.D, 8);
        this.cycles.sumCycles(4);
        break;
      case 0x8b:
        //ADC A, E
        this.A = this.addSub('adc', this.A, this.E, 8);
        this.cycles.sumCycles(4);
        break;
      case 0x8c:
        //ADC A, H
        this.A = this.addSub('adc', this.A, this.H, 8);
        this.cycles.sumCycles(4);
        break;
      case 0x8d:
        //ADC A, L
        this.A = this.addSub('adc', this.A, this.L, 8);
        this.cycles.sumCycles(4);
        break;
      case 0x8e:
        //ADC A, (HL)
        this.A = this.addSub(
          'adc',
          this.A,
          this.memory.read(this.getHL()),
          8,
        );
        this.cycles.sumCycles(8);
        break;
      case 0x8f:
        //ADC A, A
        this.A = this.addSub('adc', this.A, this.A, 8);
        this.cycles.sumCycles(4);
        break;
      case 0x90:
        //SUB A, B
        this.A = this.addSub('sub', this.A, this.B, 8);
        this.cycles.sumCycles(4);
        break;
      case 0x91:
        //SUB A, C
        this.A = this.addSub('sub', this.A, this.C, 8);
        this.cycles.sumCycles(4);
        break;
      case 0x92:
        //SUB A, D
        this.A = this.addSub('sub', this.A, this.D, 8);
        this.cycles.sumCycles(4);
        break;
      case 0x93:
        //SUB A, E
        this.A = this.addSub('sub', this.A, this.E, 8);
        this.cycles.sumCycles(4);
        break;
      case 0x94:
        //SUB A, H
        this.A = this.addSub('sub', this.A, this.H, 8);
        this.cycles.sumCycles(4);
        break;
      case 0x95:
        //SUB A, L
        this.A = this.addSub('sub', this.A, this.L, 8);
        this.cycles.sumCycles(4);
        break;
      case 0x96:
        //SUB A, (HL)
        this.A = this.addSub(
          'sub',
          this.A,
          this.memory.read(this.getHL()),
          8,
        );
        this.cycles.sumCycles(8);
        break;
      case 0x97:
        //SUB A, A
        this.A = this.addSub('sub', this.A, this.A, 8);
        this.cycles.sumCycles(4);
        break;
      case 0x98:
        //SBC A, B
        this.A = this.addSub('sbc', this.A, this.B, 8);
        this.cycles.sumCycles(4);
        break;
      case 0x99:
        //SBC A, C
        this.A = this.addSub('sbc', this.A, this.C, 8);
        this.cycles.sumCycles(4);
        break;
      case 0x9a:
        //SBC A, D
        this.A = this.addSub('sbc', this.A, this.D, 8);
        this.cycles.sumCycles(4);
        break;
      case 0x9b:
        //SBC A, E
        this.A = this.addSub('sbc', this.A, this.E, 8);
        this.cycles.sumCycles(4);
        break;
      case 0x9c:
        //SBC A, H
        this.A = this.addSub('sbc', this.A, this.H, 8);
        this.cycles.sumCycles(4);
        break;
      case 0x9d:
        //SBC A, L
        this.A = this.addSub('sbc', this.A, this.L, 8);
        this.cycles.sumCycles(4);
        break;
      case 0x9e:
        //SBC A, (HL)
        this.A = this.addSub(
          'sbc',
          this.A,
          this.memory.read(this.getHL()),
          8,
        );
        this.cycles.sumCycles(8);
        break;
      case 0x9f:
        //SBC A, A
        this.A = this.addSub('sbc', this.A, this.A, 8);
        this.cycles.sumCycles(4);
        break;
      case 0xa0:
        //AND A, B
        this.A = this.logicalOps('and', this.A, this.B);
        this.cycles.sumCycles(4);
        break;
      case 0xa1:
        //AND A, C
        this.A = this.logicalOps('and', this.A, this.C);
        this.cycles.sumCycles(4);
        break;
      case 0xa2:
        //AND A, D
        this.A = this.logicalOps('and', this.A, this.D);
        this.cycles.sumCycles(4);
        break;
      case 0xa3:
        //AND A, E
        this.A = this.logicalOps('and', this.A, this.E);
        this.cycles.sumCycles(4);
        break;
      case 0xa4:
        //AND A, H
        this.A = this.logicalOps('and', this.A, this.H);
        this.cycles.sumCycles(4);
        break;
      case 0xa5:
        //AND A, L
        this.A = this.logicalOps('and', this.A, this.L);
        this.cycles.sumCycles(4);
        break;
      case 0xa6:
        //AND A, (HL)
        this.A = this.logicalOps(
          'and',
          this.A,
          this.memory.read(this.getHL()),
        );
        this.cycles.sumCycles(8);
        break;
      case 0xa7:
        //AND A, A
        this.A = this.logicalOps('and', this.A, this.A);
        this.cycles.sumCycles(4);
        break;
      case 0xa8:
        //XOR A, B
        this.A = this.logicalOps('xor', this.A, this.B);
        this.cycles.sumCycles(4);
        break;
      case 0xa9:
        //XOR A, C
        this.A = this.logicalOps('xor', this.A, this.C);
        this.cycles.sumCycles(4);
        break;
      case 0xaa:
        //XOR A, D
        this.A = this.logicalOps('xor', this.A, this.D);
        this.cycles.sumCycles(4);
        break;
      case 0xab:
        //XOR A, E
        this.A = this.logicalOps('xor', this.A, this.E);
        this.cycles.sumCycles(4);
        break;
      case 0xac:
        //XOR A, H
        this.A = this.logicalOps('xor', this.A, this.H);
        this.cycles.sumCycles(4);
        break;
      case 0xad:
        //XOR A, L
        this.A = this.logicalOps('xor', this.A, this.L);
        this.cycles.sumCycles(4);
        break;
      case 0xae:
        //XOR A, (HL)
        this.A = this.logicalOps(
          'xor',
          this.A,
          this.memory.read(this.getHL()),
        );
        this.cycles.sumCycles(8);
        break;
      case 0xaf:
        //XOR A, A
        this.A = this.logicalOps('xor', this.A, this.A);
        this.cycles.sumCycles(4);
        break;
      case 0xb0:
        //OR A, B
        this.A = this.logicalOps('or', this.A, this.B);
        this.cycles.sumCycles(4);
        break;
      case 0xb1:
        //OR A, C
        this.A = this.logicalOps('or', this.A, this.C);
        this.cycles.sumCycles(4);
        break;
      case 0xb2:
        //OR A, D
        this.A = this.logicalOps('or', this.A, this.D);
        this.cycles.sumCycles(4);
        break;
      case 0xb3:
        //OR A, E
        this.A = this.logicalOps('or', this.A, this.E);
        this.cycles.sumCycles(4);
        break;
      case 0xb4:
        //OR A, H
        this.A = this.logicalOps('or', this.A, this.H);
        this.cycles.sumCycles(4);
        break;
      case 0xb5:
        //OR A, L
        this.A = this.logicalOps('or', this.A, this.L);
        this.cycles.sumCycles(4);
        break;
      case 0xb6:
        //OR A, (HL)
        this.A = this.logicalOps(
          'or',
          this.A,
          this.memory.read(this.getHL()),
        );
        this.cycles.sumCycles(8);
        break;
      case 0xb7:
        //OR A, A
        this.A = this.logicalOps('or', this.A, this.A);
        this.cycles.sumCycles(4);
        break;
      case 0xb8:
        //CP A, B
        this.logicalOps('cp', this.A, this.B);
        this.cycles.sumCycles(4);
        break;
      case 0xb9:
        //CP A, C
        this.logicalOps('cp', this.A, this.C);
        this.cycles.sumCycles(4);
        break;
      case 0xba:
        //CP A, D
        this.logicalOps('cp', this.A, this.D);
        this.cycles.sumCycles(4);
        break;
      case 0xbb:
        //CP A, E
        this.logicalOps('cp', this.A, this.E);
        this.cycles.sumCycles(4);
        break;
      case 0xbc:
        //CP A, H
        this.logicalOps('cp', this.A, this.H);
        this.cycles.sumCycles(4);
        break;
      case 0xbd:
        //CP A, L
        this.logicalOps('cp', this.A, this.L);
        this.cycles.sumCycles(4);
        break;
      case 0xbe:
        //CP A, (HL)
        this.logicalOps(
          'cp',
          this.A,
          this.memory.read(this.getHL()),
        );
        this.cycles.sumCycles(8);
        break;
      case 0xbf:
        //CP A, A
        this.logicalOps('cp', this.A, this.A);
        this.cycles.sumCycles(4);
        break;
      case 0xc0:
        //RET NZ
        if (!this.zeroFlag) {
          this.PC = this.stackPop16bit();
          this.pcIncrement(-1);
          this.cycles.sumCycles(20);
        } else {
          this.cycles.sumCycles(8);
        }
        break;
      case 0xc1:
        //POP BC
        this.setBC(this.stackPop16bit());
        this.cycles.sumCycles(12);
        break;
      case 0xc2:
        //JP NZ, nn
        if (!this.zeroFlag) {
          this.PC =
            this.memory.read(this.PC) |
            (this.memory.read(this.PC + 1) << 8);
          this.pcIncrement(-1);
          this.cycles.sumCycles(16);
        } else {
          this.pcIncrement(2);
          this.cycles.sumCycles(12);
        }
        break;
      case 0xc3:
        //JP nn
        this.PC =
          this.memory.read(this.PC) |
          (this.memory.read(this.PC + 1) << 8);
        this.pcIncrement(-1);
        this.cycles.sumCycles(16);
        break;
      case 0xc4:
        //CALL NZ, nn
        if (!this.zeroFlag) {
          this.stackPush16bit(this.PC + 3);
          this.PC =
            this.memory.read(this.PC + 1) |
            (this.memory.read(this.PC + 2) << 8);
          this.pcIncrement(-1);
          this.cycles.sumCycles(24);
        } else {
          this.pcIncrement(2);
          this.cycles.sumCycles(12);
        }
        break;
      case 0xc5:
        //PUSH BC
        this.stackPush16bit(this.getBC());
        this.cycles.sumCycles(16);
        break;
      case 0xc6:
        //ADD A, n
        this.A = this.addSub(
          'add',
          this.A,
          this.memory.read(this.PC),
          8,
        );
        this.pcIncrement(1);
        this.cycles.sumCycles(8);
        break;
      case 0xc7:
        //RST 00H
        this.stackPush16bit(this.PC);
        this.PC = 0x00;
        this.pcIncrement(-1);
        this.cycles.sumCycles(16);
        break;
      case 0xc8:
        //RET Z
        if (this.zeroFlag) {
          this.PC = this.stackPop16bit();
          this.pcIncrement(-1);
          this.cycles.sumCycles(20);
        } else {
          this.cycles.sumCycles(8);
        }
        break;
      case 0xc9:
        //RET
        this.PC = this.stackPop16bit();
        this.pcIncrement(-1);
        this.cycles.sumCycles(16);
        break;
      case 0xca:
        //JP Z, nn
        if (this.zeroFlag) {
          this.PC =
            this.memory.read(this.PC) |
            (this.memory.read(this.PC + 1) << 8);
          this.pcIncrement(-1);
          this.cycles.sumCycles(16);
        } else {
          this.pcIncrement(2);
          this.cycles.sumCycles(12);
        }
        break;
      case 0xcb:
        //CB prefix
        //switch on next byte
        switch (this.memory.read(this.PC + 1)) {
          case 0x00:
            //RLC B
            this.B = this.rotShift('RLC', this.B);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x01:
            //RLC C
            this.C = this.rotShift('RLC', this.C);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x02:
            //RLC D
            this.D = this.rotShift('RLC', this.D);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x03:
            //RLC E
            this.E = this.rotShift('RLC', this.E);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x04:
            //RLC H
            this.H = this.rotShift('RLC', this.H);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x05:
            //RLC L
            this.L = this.rotShift('RLC', this.L);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x06:
            //RLC (HL)
            this.memory.write(
              this.getHL(),
              this.rotShift(
                'RLC',
                this.memory.read(this.getHL()),
              ),
            );
            this.pcIncrement(1);
            this.cycles.sumCycles(16);
            break;
          case 0x07:
            //RLC A
            this.A = this.rotShift('RLC', this.A);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x08:
            //RRC B
            this.B = this.rotShift('RRC', this.B);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x09:
            //RRC C
            this.C = this.rotShift('RRC', this.C);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x0a:
            //RRC D
            this.D = this.rotShift('RRC', this.D);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x0b:
            //RRC E
            this.E = this.rotShift('RRC', this.E);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x0c:
            //RRC H
            this.H = this.rotShift('RRC', this.H);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x0d:
            //RRC L
            this.L = this.rotShift('RRC', this.L);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x0e:
            //RRC (HL)
            this.memory.write(
              this.getHL(),
              this.rotShift(
                'RRC',
                this.memory.read(this.getHL()),
              ),
            );
            this.pcIncrement(1);
            this.cycles.sumCycles(16);
            break;
          case 0x0f:
            //RRC A
            this.A = this.rotShift('RRC', this.A);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x10:
            //RL B
            this.B = this.rotShift('RL', this.B);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x11:
            //RL C
            this.C = this.rotShift('RL', this.C);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x12:
            //RL D
            this.D = this.rotShift('RL', this.D);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x13:
            //RL E
            this.E = this.rotShift('RL', this.E);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x14:
            //RL H
            this.H = this.rotShift('RL', this.H);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x15:
            //RL L
            this.L = this.rotShift('RL', this.L);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x16:
            //RL (HL)
            this.memory.write(
              this.getHL(),
              this.rotShift(
                'RL',
                this.memory.read(this.getHL()),
              ),
            );
            this.pcIncrement(1);
            this.cycles.sumCycles(16);
            break;
          case 0x17:
            //RL A
            this.A = this.rotShift('RL', this.A);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x18:
            //RR B
            this.B = this.rotShift('RR', this.B);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x19:
            //RR C
            this.C = this.rotShift('RR', this.C);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x1a:
            //RR D
            this.D = this.rotShift('RR', this.D);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x1b:
            //RR E
            this.E = this.rotShift('RR', this.E);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x1c:
            //RR H
            this.H = this.rotShift('RR', this.H);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x1d:
            //RR L
            this.L = this.rotShift('RR', this.L);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x1e:
            //RR (HL)
            this.memory.write(
              this.getHL(),
              this.rotShift(
                'RR',
                this.memory.read(this.getHL()),
              ),
            );
            this.pcIncrement(1);
            this.cycles.sumCycles(16);
            break;
          case 0x1f:
            //RR A
            this.A = this.rotShift('RR', this.A);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x20:
            //SLA B
            this.B = this.rotShift('SLA', this.B);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x21:
            //SLA C
            this.C = this.rotShift('SLA', this.C);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x22:
            //SLA D
            this.D = this.rotShift('SLA', this.D);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x23:
            //SLA E
            this.E = this.rotShift('SLA', this.E);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x24:
            //SLA H
            this.H = this.rotShift('SLA', this.H);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x25:
            //SLA L
            this.L = this.rotShift('SLA', this.L);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x26:
            //SLA (HL)
            this.memory.write(
              this.getHL(),
              this.rotShift(
                'SLA',
                this.memory.read(this.getHL()),
              ),
            );
            this.pcIncrement(1);
            this.cycles.sumCycles(16);
            break;
          case 0x27:
            //SLA A
            this.A = this.rotShift('SLA', this.A);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x28:
            //SRA B
            this.B = this.rotShift('SRA', this.B);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x29:
            //SRA C
            this.C = this.rotShift('SRA', this.C);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x2a:
            //SRA D
            this.D = this.rotShift('SRA', this.D);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x2b:
            //SRA E
            this.E = this.rotShift('SRA', this.E);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x2c:
            //SRA H
            this.H = this.rotShift('SRA', this.H);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x2d:
            //SRA L
            this.L = this.rotShift('SRA', this.L);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x2e:
            //SRA (HL)
            this.memory.write(
              this.getHL(),
              this.rotShift(
                'SRA',
                this.memory.read(this.getHL()),
              ),
            );
            this.pcIncrement(1);
            this.cycles.sumCycles(16);
            break;
          case 0x2f:
            //SRA A
            this.A = this.rotShift('SRA', this.A);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x30:
            //SWAP B
            this.B = this.rotShift('SWAP', this.B);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x31:
            //SWAP C
            this.C = this.rotShift('SWAP', this.C);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x32:
            //SWAP D
            this.D = this.rotShift('SWAP', this.D);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x33:
            //SWAP E
            this.E = this.rotShift('SWAP', this.E);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x34:
            //SWAP H
            this.H = this.rotShift('SWAP', this.H);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x35:
            //SWAP L
            this.L = this.rotShift('SWAP', this.L);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x36:
            //SWAP (HL)
            this.memory.write(
              this.getHL(),
              this.rotShift(
                'SWAP',
                this.memory.read(this.getHL()),
              ),
            );
            this.pcIncrement(1);
            this.cycles.sumCycles(16);
            break;
          case 0x37:
            //SWAP A
            this.A = this.rotShift('SWAP', this.A);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x38:
            //SRL B
            this.B = this.rotShift('SRL', this.B);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x39:
            //SRL C
            this.C = this.rotShift('SRL', this.C);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x3a:
            //SRL D
            this.D = this.rotShift('SRL', this.D);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x3b:
            //SRL E
            this.E = this.rotShift('SRL', this.E);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x3c:
            //SRL H
            this.H = this.rotShift('SRL', this.H);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x3d:
            //SRL L
            this.L = this.rotShift('SRL', this.L);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x3e:
            //SRL (HL)
            this.memory.write(
              this.getHL(),
              this.rotShift(
                'SRL',
                this.memory.read(this.getHL()),
              ),
            );
            this.pcIncrement(1);
            this.cycles.sumCycles(16);
            break;
          case 0x3f:
            //SRL A
            this.A = this.rotShift('SRL', this.A);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x40:
            //BIT 0, B
            this.bitOps('bit', 0, this.B);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x41:
            //BIT 0, C
            this.bitOps('bit', 0, this.C);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x42:
            //BIT 0, D
            this.bitOps('bit', 0, this.D);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x43:
            //BIT 0, E
            this.bitOps('bit', 0, this.E);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x44:
            //BIT 0, H
            this.bitOps('bit', 0, this.H);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x45:
            //BIT 0, L
            this.bitOps('bit', 0, this.L);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x46:
            //BIT 0, (HL)
            this.bitOps(
              'bit',
              0,
              this.memory.read(this.getHL()),
            );
            this.pcIncrement(1);
            this.cycles.sumCycles(12);
            break;
          case 0x47:
            //BIT 0, A
            this.bitOps('bit', 0, this.A);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x48:
            //BIT 1, B
            this.bitOps('bit', 1, this.B);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x49:
            //BIT 1, C
            this.bitOps('bit', 1, this.C);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x4a:
            //BIT 1, D
            this.bitOps('bit', 1, this.D);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x4b:
            //BIT 1, E
            this.bitOps('bit', 1, this.E);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x4c:
            //BIT 1, H
            this.bitOps('bit', 1, this.H);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x4d:
            //BIT 1, L
            this.bitOps('bit', 1, this.L);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x4e:
            //BIT 1, (HL)
            this.bitOps(
              'bit',
              1,
              this.memory.read(this.getHL()),
            );
            this.pcIncrement(1);
            this.cycles.sumCycles(12);
            break;
          case 0x4f:
            //BIT 1, A
            this.bitOps('bit', 1, this.A);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x50:
            //BIT 2, B
            this.bitOps('bit', 2, this.B);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x51:
            //BIT 2, C
            this.bitOps('bit', 2, this.C);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x52:
            //BIT 2, D
            this.bitOps('bit', 2, this.D);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x53:
            //BIT 2, E
            this.bitOps('bit', 2, this.E);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x54:
            //BIT 2, H
            this.bitOps('bit', 2, this.H);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x55:
            //BIT 2, L
            this.bitOps('bit', 2, this.L);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x56:
            //BIT 2, (HL)
            this.bitOps(
              'bit',
              2,
              this.memory.read(this.getHL()),
            );
            this.pcIncrement(1);
            this.cycles.sumCycles(12);
            break;
          case 0x57:
            //BIT 2, A
            this.bitOps('bit', 2, this.A);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x58:
            //BIT 3, B
            this.bitOps('bit', 3, this.B);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x59:
            //BIT 3, C
            this.bitOps('bit', 3, this.C);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x5a:
            //BIT 3, D
            this.bitOps('bit', 3, this.D);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x5b:
            //BIT 3, E
            this.bitOps('bit', 3, this.E);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x5c:
            //BIT 3, H
            this.bitOps('bit', 3, this.H);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x5d:
            //BIT 3, L
            this.bitOps('bit', 3, this.L);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x5e:
            //BIT 3, (HL)
            this.bitOps(
              'bit',
              3,
              this.memory.read(this.getHL()),
            );
            this.pcIncrement(1);
            this.cycles.sumCycles(12);
            break;
          case 0x5f:
            //BIT 3, A
            this.bitOps('bit', 3, this.A);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x60:
            //BIT 4, B
            this.bitOps('bit', 4, this.B);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x61:
            //BIT 4, C
            this.bitOps('bit', 4, this.C);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x62:
            //BIT 4, D
            this.bitOps('bit', 4, this.D);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x63:
            //BIT 4, E
            this.bitOps('bit', 4, this.E);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x64:
            //BIT 4, H
            this.bitOps('bit', 4, this.H);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x65:
            //BIT 4, L
            this.bitOps('bit', 4, this.L);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x66:
            //BIT 4, (HL)
            this.bitOps(
              'bit',
              4,
              this.memory.read(this.getHL()),
            );
            this.pcIncrement(1);
            this.cycles.sumCycles(12);
            break;
          case 0x67:
            //BIT 4, A
            this.bitOps('bit', 4, this.A);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x68:
            //BIT 5, B
            this.bitOps('bit', 5, this.B);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x69:
            //BIT 5, C
            this.bitOps('bit', 5, this.C);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x6a:
            //BIT 5, D
            this.bitOps('bit', 5, this.D);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x6b:
            //BIT 5, E
            this.bitOps('bit', 5, this.E);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x6c:
            //BIT 5, H
            this.bitOps('bit', 5, this.H);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x6d:
            //BIT 5, L
            this.bitOps('bit', 5, this.L);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x6e:
            //BIT 5, (HL)
            this.bitOps(
              'bit',
              5,
              this.memory.read(this.getHL()),
            );
            this.pcIncrement(1);
            this.cycles.sumCycles(12);
            break;
          case 0x6f:
            //BIT 5, A
            this.bitOps('bit', 5, this.A);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x70:
            //BIT 6, B
            this.bitOps('bit', 6, this.B);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x71:
            //BIT 6, C
            this.bitOps('bit', 6, this.C);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x72:
            //BIT 6, D
            this.bitOps('bit', 6, this.D);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x73:
            //BIT 6, E
            this.bitOps('bit', 6, this.E);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x74:
            //BIT 6, H
            this.bitOps('bit', 6, this.H);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x75:
            //BIT 6, L
            this.bitOps('bit', 6, this.L);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x76:
            //BIT 6, (HL)
            this.bitOps(
              'bit',
              6,
              this.memory.read(this.getHL()),
            );
            this.pcIncrement(1);
            this.cycles.sumCycles(12);
            break;
          case 0x77:
            //BIT 6, A
            this.bitOps('bit', 6, this.A);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x78:
            //BIT 7, B
            this.bitOps('bit', 7, this.B);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x79:
            //BIT 7, C
            this.bitOps('bit', 7, this.C);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x7a:
            //BIT 7, D
            this.bitOps('bit', 7, this.D);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x7b:
            //BIT 7, E
            this.bitOps('bit', 7, this.E);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x7c:
            //BIT 7, H
            this.bitOps('bit', 7, this.H);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x7d:
            //BIT 7, L
            this.bitOps('bit', 7, this.L);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x7e:
            //BIT 7, (HL)
            this.bitOps(
              'bit',
              7,
              this.memory.read(this.getHL()),
            );
            this.pcIncrement(1);
            this.cycles.sumCycles(12);
            break;
          case 0x7f:
            //BIT 7, A
            this.bitOps('bit', 7, this.A);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x80:
            //RES 0, B
            this.B = this.bitOps('res', 0, this.B);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x81:
            //RES 0, C
            this.C = this.bitOps('res', 0, this.C);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x82:
            //RES 0, D
            this.D = this.bitOps('res', 0, this.D);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x83:
            //RES 0, E
            this.E = this.bitOps('res', 0, this.E);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x84:
            //RES 0, H
            this.H = this.bitOps('res', 0, this.H);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x85:
            //RES 0, L
            this.L = this.bitOps('res', 0, this.L);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x86:
            //RES 0, (HL)
            this.memory.write(
              this.getHL(),
              this.bitOps(
                'res',
                0,
                this.memory.read(this.getHL()),
              ),
            );
            this.pcIncrement(1);
            this.cycles.sumCycles(16);
            break;
          case 0x87:
            //RES 0, A
            this.A = this.bitOps('res', 0, this.A);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x88:
            //RES 1, B
            this.B = this.bitOps('res', 1, this.B);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x89:
            //RES 1, C
            this.C = this.bitOps('res', 1, this.C);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x8a:
            //RES 1, D
            this.D = this.bitOps('res', 1, this.D);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x8b:
            //RES 1, E
            this.E = this.bitOps('res', 1, this.E);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x8c:
            //RES 1, H
            this.H = this.bitOps('res', 1, this.H);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x8d:
            //RES 1, L
            this.L = this.bitOps('res', 1, this.L);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x8e:
            //RES 1, (HL)
            this.memory.write(
              this.getHL(),
              this.bitOps(
                'res',
                1,
                this.memory.read(this.getHL()),
              ),
            );
            this.pcIncrement(1);
            this.cycles.sumCycles(16);
            break;
          case 0x8f:
            //RES 1, A
            this.A = this.bitOps('res', 1, this.A);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x90:
            //RES 2, B
            this.B = this.bitOps('res', 2, this.B);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x91:
            //RES 2, C
            this.C = this.bitOps('res', 2, this.C);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x92:
            //RES 2, D
            this.D = this.bitOps('res', 2, this.D);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x93:
            //RES 2, E
            this.E = this.bitOps('res', 2, this.E);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x94:
            //RES 2, H
            this.H = this.bitOps('res', 2, this.H);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x95:
            //RES 2, L
            this.L = this.bitOps('res', 2, this.L);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x96:
            //RES 2, (HL)
            this.memory.write(
              this.getHL(),
              this.bitOps(
                'res',
                2,
                this.memory.read(this.getHL()),
              ),
            );
            this.pcIncrement(1);
            this.cycles.sumCycles(16);
            break;
          case 0x97:
            //RES 2, A
            this.A = this.bitOps('res', 2, this.A);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x98:
            //RES 3, B
            this.B = this.bitOps('res', 3, this.B);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x99:
            //RES 3, C
            this.C = this.bitOps('res', 3, this.C);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x9a:
            //RES 3, D
            this.D = this.bitOps('res', 3, this.D);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x9b:
            //RES 3, E
            this.E = this.bitOps('res', 3, this.E);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x9c:
            //RES 3, H
            this.H = this.bitOps('res', 3, this.H);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x9d:
            //RES 3, L
            this.L = this.bitOps('res', 3, this.L);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0x9e:
            //RES 3, (HL)
            this.memory.write(
              this.getHL(),
              this.bitOps(
                'res',
                3,
                this.memory.read(this.getHL()),
              ),
            );
            this.pcIncrement(1);
            this.cycles.sumCycles(16);
            break;
          case 0x9f:
            //RES 3, A
            this.A = this.bitOps('res', 3, this.A);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xa0:
            //RES 4, B
            this.B = this.bitOps('res', 4, this.B);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xa1:
            //RES 4, C
            this.C = this.bitOps('res', 4, this.C);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xa2:
            //RES 4, D
            this.D = this.bitOps('res', 4, this.D);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xa3:
            //RES 4, E
            this.E = this.bitOps('res', 4, this.E);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xa4:
            //RES 4, H
            this.H = this.bitOps('res', 4, this.H);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xa5:
            //RES 4, L
            this.L = this.bitOps('res', 4, this.L);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xa6:
            //RES 4, (HL)
            this.memory.write(
              this.getHL(),
              this.bitOps(
                'res',
                4,
                this.memory.read(this.getHL()),
              ),
            );
            this.pcIncrement(1);
            this.cycles.sumCycles(16);
            break;
          case 0xa7:
            //RES 4, A
            this.A = this.bitOps('res', 4, this.A);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xa8:
            //RES 5, B
            this.B = this.bitOps('res', 5, this.B);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xa9:
            //RES 5, C
            this.C = this.bitOps('res', 5, this.C);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xaa:
            //RES 5, D
            this.D = this.bitOps('res', 5, this.D);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xab:
            //RES 5, E
            this.E = this.bitOps('res', 5, this.E);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xac:
            //RES 5, H
            this.H = this.bitOps('res', 5, this.H);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xad:
            //RES 5, L
            this.L = this.bitOps('res', 5, this.L);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xae:
            //RES 5, (HL)
            this.memory.write(
              this.getHL(),
              this.bitOps(
                'res',
                5,
                this.memory.read(this.getHL()),
              ),
            );
            this.pcIncrement(1);
            this.cycles.sumCycles(16);
            break;
          case 0xaf:
            //RES 5, A
            this.A = this.bitOps('res', 5, this.A);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xb0:
            //RES 6, B
            this.B = this.bitOps('res', 6, this.B);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xb1:
            //RES 6, C
            this.C = this.bitOps('res', 6, this.C);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xb2:
            //RES 6, D
            this.D = this.bitOps('res', 6, this.D);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xb3:
            //RES 6, E
            this.E = this.bitOps('res', 6, this.E);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xb4:
            //RES 6, H
            this.H = this.bitOps('res', 6, this.H);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xb5:
            //RES 6, L
            this.L = this.bitOps('res', 6, this.L);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xb6:
            //RES 6, (HL)
            this.memory.write(
              this.getHL(),
              this.bitOps(
                'res',
                6,
                this.memory.read(this.getHL()),
              ),
            );
            this.pcIncrement(1);
            this.cycles.sumCycles(16);
            break;
          case 0xb7:
            //RES 6, A
            this.A = this.bitOps('res', 6, this.A);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xb8:
            //RES 7, B
            this.B = this.bitOps('res', 7, this.B);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xb9:
            //RES 7, C
            this.C = this.bitOps('res', 7, this.C);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xba:
            //RES 7, D
            this.D = this.bitOps('res', 7, this.D);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xbb:
            //RES 7, E
            this.E = this.bitOps('res', 7, this.E);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xbc:
            //RES 7, H
            this.H = this.bitOps('res', 7, this.H);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xbd:
            //RES 7, L
            this.L = this.bitOps('res', 7, this.L);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xbe:
            //RES 7, (HL)
            this.memory.write(
              this.getHL(),
              this.bitOps(
                'res',
                7,
                this.memory.read(this.getHL()),
              ),
            );
            this.pcIncrement(1);
            this.cycles.sumCycles(16);
            break;
          case 0xbf:
            //RES 7, A
            this.A = this.bitOps('res', 7, this.A);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xc0:
            //SET 0, B
            this.B = this.bitOps('set', 0, this.B);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xc1:
            //SET 0, C
            this.C = this.bitOps('set', 0, this.C);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xc2:
            //SET 0, D
            this.D = this.bitOps('set', 0, this.D);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xc3:
            //SET 0, E
            this.E = this.bitOps('set', 0, this.E);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xc4:
            //SET 0, H
            this.H = this.bitOps('set', 0, this.H);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xc5:
            //SET 0, L
            this.L = this.bitOps('set', 0, this.L);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xc6:
            //SET 0, (HL)
            this.memory.write(
              this.getHL(),
              this.bitOps(
                'set',
                0,
                this.memory.read(this.getHL()),
              ),
            );
            this.pcIncrement(1);
            this.cycles.sumCycles(16);
            break;
          case 0xc7:
            //SET 0, A
            this.A = this.bitOps('set', 0, this.A);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xc8:
            //SET 1, B
            this.B = this.bitOps('set', 1, this.B);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xc9:
            //SET 1, C
            this.C = this.bitOps('set', 1, this.C);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xca:
            //SET 1, D
            this.D = this.bitOps('set', 1, this.D);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xcb:
            //SET 1, E
            this.E = this.bitOps('set', 1, this.E);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xcc:
            //SET 1, H
            this.H = this.bitOps('set', 1, this.H);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xcd:
            //SET 1, L
            this.L = this.bitOps('set', 1, this.L);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xce:
            //SET 1, (HL)
            this.memory.write(
              this.getHL(),
              this.bitOps(
                'set',
                1,
                this.memory.read(this.getHL()),
              ),
            );
            this.pcIncrement(1);
            this.cycles.sumCycles(16);
            break;
          case 0xcf:
            //SET 1, A
            this.A = this.bitOps('set', 1, this.A);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xd0:
            //SET 2, B
            this.B = this.bitOps('set', 2, this.B);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xd1:
            //SET 2, C
            this.C = this.bitOps('set', 2, this.C);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xd2:
            //SET 2, D
            this.D = this.bitOps('set', 2, this.D);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xd3:
            //SET 2, E
            this.E = this.bitOps('set', 2, this.E);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xd4:
            //SET 2, H
            this.H = this.bitOps('set', 2, this.H);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xd5:
            //SET 2, L
            this.L = this.bitOps('set', 2, this.L);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xd6:
            //SET 2, (HL)
            this.memory.write(
              this.getHL(),
              this.bitOps(
                'set',
                2,
                this.memory.read(this.getHL()),
              ),
            );
            this.pcIncrement(1);
            this.cycles.sumCycles(16);
            break;
          case 0xd7:
            //SET 2, A
            this.A = this.bitOps('set', 2, this.A);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xd8:
            //SET 3, B
            this.B = this.bitOps('set', 3, this.B);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xd9:
            //SET 3, C
            this.C = this.bitOps('set', 3, this.C);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xda:
            //SET 3, D
            this.D = this.bitOps('set', 3, this.D);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xdb:
            //SET 3, E
            this.E = this.bitOps('set', 3, this.E);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xdc:
            //SET 3, H
            this.H = this.bitOps('set', 3, this.H);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xdd:
            //SET 3, L
            this.L = this.bitOps('set', 3, this.L);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xde:
            //SET 3, (HL)
            this.memory.write(
              this.getHL(),
              this.bitOps(
                'set',
                3,
                this.memory.read(this.getHL()),
              ),
            );
            this.pcIncrement(1);
            this.cycles.sumCycles(16);
            break;
          case 0xdf:
            //SET 3, A
            this.A = this.bitOps('set', 3, this.A);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xe0:
            //SET 4, B
            this.B = this.bitOps('set', 4, this.B);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xe1:
            //SET 4, C
            this.C = this.bitOps('set', 4, this.C);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xe2:
            //SET 4, D
            this.D = this.bitOps('set', 4, this.D);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xe3:
            //SET 4, E
            this.E = this.bitOps('set', 4, this.E);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xe4:
            //SET 4, H
            this.H = this.bitOps('set', 4, this.H);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xe5:
            //SET 4, L
            this.L = this.bitOps('set', 4, this.L);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xe6:
            //SET 4, (HL)
            this.memory.write(
              this.getHL(),
              this.bitOps(
                'set',
                4,
                this.memory.read(this.getHL()),
              ),
            );
            this.pcIncrement(1);
            this.cycles.sumCycles(16);
            break;
          case 0xe7:
            //SET 4, A
            this.A = this.bitOps('set', 4, this.A);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xe8:
            //SET 5, B
            this.B = this.bitOps('set', 5, this.B);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xe9:
            //SET 5, C
            this.C = this.bitOps('set', 5, this.C);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xea:
            //SET 5, D
            this.D = this.bitOps('set', 5, this.D);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xeb:
            //SET 5, E
            this.E = this.bitOps('set', 5, this.E);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xec:
            //SET 5, H
            this.H = this.bitOps('set', 5, this.H);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xed:
            //SET 5, L
            this.L = this.bitOps('set', 5, this.L);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xee:
            //SET 5, (HL)
            this.memory.write(
              this.getHL(),
              this.bitOps(
                'set',
                5,
                this.memory.read(this.getHL()),
              ),
            );
            this.pcIncrement(1);
            this.cycles.sumCycles(16);
            break;
          case 0xef:
            //SET 5, A
            this.A = this.bitOps('set', 5, this.A);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xf0:
            //SET 6, B
            this.B = this.bitOps('set', 6, this.B);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xf1:
            //SET 6, C
            this.C = this.bitOps('set', 6, this.C);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xf2:
            //SET 6, D
            this.D = this.bitOps('set', 6, this.D);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xf3:
            //SET 6, E
            this.E = this.bitOps('set', 6, this.E);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xf4:
            //SET 6, H
            this.H = this.bitOps('set', 6, this.H);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xf5:
            //SET 6, L
            this.L = this.bitOps('set', 6, this.L);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xf6:
            //SET 6, (HL)
            this.memory.write(
              this.getHL(),
              this.bitOps(
                'set',
                6,
                this.memory.read(this.getHL()),
              ),
            );
            this.pcIncrement(1);
            this.cycles.sumCycles(16);
            break;
          case 0xf7:
            //SET 6, A
            this.A = this.bitOps('set', 6, this.A);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xf8:
            //SET 7, B
            this.B = this.bitOps('set', 7, this.B);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xf9:
            //SET 7, C
            this.C = this.bitOps('set', 7, this.C);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xfa:
            //SET 7, D
            this.D = this.bitOps('set', 7, this.D);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xfb:
            //SET 7, E
            this.E = this.bitOps('set', 7, this.E);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xfc:
            //SET 7, H
            this.H = this.bitOps('set', 7, this.H);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xfd:
            //SET 7, L
            this.L = this.bitOps('set', 7, this.L);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          case 0xfe:
            //SET 7, (HL)
            this.memory.write(
              this.getHL(),
              this.bitOps(
                'set',
                7,
                this.memory.read(this.getHL()),
              ),
            );
            this.pcIncrement(1);
            this.cycles.sumCycles(16);
            break;
          case 0xff:
            //SET 7, A
            this.A = this.bitOps('set', 7, this.A);
            this.pcIncrement(1);
            this.cycles.sumCycles(8);
            break;
          default:
            console.error('Unimplemented CB prefix instruction');
        }
        break;
      case 0xcc:
        //CALL Z, nn
        if (this.zeroFlag) {
          this.stackPush16bit(this.PC + 3);
          this.PC =
            this.memory.read(this.PC + 1) |
            (this.memory.read(this.PC + 2) << 8);
          this.pcIncrement(-1);
          this.cycles.sumCycles(24);
        } else {
          this.pcIncrement(2);
          this.cycles.sumCycles(12);
        }
        break;
      case 0xcd:
        //CALL nn
        this.stackPush16bit(this.PC + 3);
        this.PC =
          this.memory.read(this.PC + 1) |
          (this.memory.read(this.PC + 2) << 8);
        this.pcIncrement(-1);
        this.cycles.sumCycles(24);
        break;
      case 0xce:
        //ADC A, n
        this.A = this.addSub(
          'adc',
          this.A,
          this.memory.read(this.PC),
          8,
        );
        this.pcIncrement(1);
        this.cycles.sumCycles(8);
        break;
      case 0xcf:
        //RST 08H
        this.stackPush16bit(this.PC);
        this.PC = 0x08;
        this.pcIncrement(-1);
        this.cycles.sumCycles(16);
        break;
      case 0xd0:
        //RET NC
        if (!this.carryFlag) {
          this.PC = this.stackPop16bit();
          this.pcIncrement(-1);
          this.cycles.sumCycles(20);
        } else {
          this.cycles.sumCycles(8);
        }
        break;
      case 0xd1:
        //POP DE
        this.setDE(this.stackPop16bit());
        this.cycles.sumCycles(12);
        break;
      case 0xd2:
        //JP NC, nn
        if (!this.carryFlag) {
          this.PC =
            this.memory.read(this.PC) |
            (this.memory.read(this.PC + 1) << 8);
          this.pcIncrement(-1);
          this.cycles.sumCycles(16);
        } else {
          this.pcIncrement(2);
          this.cycles.sumCycles(12);
        }
        break;
      case 0xd4:
        //CALL NC, nn
        if (!this.carryFlag) {
          this.stackPush16bit(this.PC + 3);
          this.PC =
            this.memory.read(this.PC + 1) |
            (this.memory.read(this.PC + 2) << 8);
          this.pcIncrement(-1);
          this.cycles.sumCycles(24);
        } else {
          this.pcIncrement(2);
          this.cycles.sumCycles(12);
        }
        break;
      case 0xd5:
        //PUSH DE
        this.stackPush16bit(this.getDE());
        this.cycles.sumCycles(16);
        break;
      case 0xd6:
        //SUB A, n
        this.A = this.addSub(
          'sub',
          this.A,
          this.memory.read(this.PC),
          8,
        );
        this.pcIncrement(1);
        this.cycles.sumCycles(8);
        break;
      case 0xd7:
        //RST 10H
        this.stackPush16bit(this.PC);
        this.PC = 0x10;
        this.pcIncrement(-1);
        this.cycles.sumCycles(16);
        break;
      case 0xd8:
        //RET C
        if (this.carryFlag) {
          this.PC = this.stackPop16bit();
          this.pcIncrement(-1);
          this.cycles.sumCycles(20);
        } else {
          this.cycles.sumCycles(8);
        }
        break;
      case 0xd9:
        //RETI
        this.PC = this.stackPop16bit();
        this.pcIncrement(-1);
        this.flags.IME = true;
        this.cycles.sumCycles(16);
        break;
      case 0xda:
        //JP C, nn
        if (this.carryFlag) {
          this.PC =
            this.memory.read(this.PC) |
            (this.memory.read(this.PC + 1) << 8);
          this.pcIncrement(-1);
          this.cycles.sumCycles(16);
        } else {
          this.pcIncrement(2);
          this.cycles.sumCycles(12);
        }
        break;
      case 0xdc:
        //CALL C, nn
        if (this.carryFlag) {
          this.stackPush16bit(this.PC + 3);
          this.PC =
            this.memory.read(this.PC + 1) |
            (this.memory.read(this.PC + 2) << 8);
          this.pcIncrement(-1);
          this.cycles.sumCycles(24);
        }
        break;
      case 0xde:
        //SBC A, n
        this.A = this.addSub(
          'sbc',
          this.A,
          this.memory.read(this.PC),
          8,
        );
        this.pcIncrement(1);
        this.cycles.sumCycles(8);
        break;
      case 0xdf:
        //RST 18H
        this.stackPush16bit(this.PC);
        this.PC = 0x18;
        this.pcIncrement(-1);
        this.cycles.sumCycles(16);
        break;
      case 0xe0:
        //LDH (n), A
        this.memory.write(
          0xff00 | this.memory.read(this.PC),
          this.A,
        );
        this.pcIncrement(1);
        this.cycles.sumCycles(12);
        break;
      case 0xe1:
        //POP HL
        this.setHL(this.stackPop16bit());
        this.cycles.sumCycles(12);
        break;
      case 0xe2:
        //LD (C), A
        this.memory.write(0xff00 | this.C, this.A);
        this.cycles.sumCycles(8);
        break;
      case 0xe5:
        //PUSH HL
        this.stackPush16bit(this.getHL());
        this.cycles.sumCycles(16);
        break;
      case 0xe6:
        //AND A, n
        this.A = this.logicalOps(
          'and',
          this.A,
          this.memory.read(this.PC),
        );
        this.pcIncrement(1);
        this.cycles.sumCycles(8);
        break;
      case 0xe7:
        //RST 20H
        this.stackPush16bit(this.PC);
        this.PC = 0x20;
        this.pcIncrement(-1);
        this.cycles.sumCycles(16);
        break;
      case 0xe8:
        //ADD SP, n
        this.SP = this.addSub(
          'add',
          this.SP,
          this.memory.read(this.PC),
          16,
        );
        this.pcIncrement(1);
        this.cycles.sumCycles(16);
        break;
      case 0xe9:
        //JP (HL)
        this.PC = this.getHL();
        this.pcIncrement(-1);
        this.cycles.sumCycles(4);
        break;
      case 0xea:
        //LD (nn), A
        this.memory.write(
          this.memory.read(this.PC) |
            (this.memory.read(this.PC + 1) << 8),
          this.A,
        );
        this.pcIncrement(2);
        this.cycles.sumCycles(16);
        break;
      case 0xee:
        //XOR A, n
        this.A = this.logicalOps(
          'xor',
          this.A,
          this.memory.read(this.PC),
        );
        this.pcIncrement(1);
        this.cycles.sumCycles(8);
        break;
      case 0xef:
        //RST 28H
        this.stackPush16bit(this.PC);
        this.PC = 0x28;
        this.pcIncrement(-1);
        this.cycles.sumCycles(16);
        break;
      case 0xf0:
        //LDH A, (n)
        this.A = this.memory.read(
          0xff00 | this.memory.read(this.PC),
        );
        this.pcIncrement(1);
        this.cycles.sumCycles(12);
        break;
      case 0xf1:
        //POP AF
        this.setAF(this.stackPop16bit());
        this.cycles.sumCycles(12);
        break;
      case 0xf2:
        //LD A, (C)
        this.A = this.memory.read(0xff00 | this.C);
        this.cycles.sumCycles(8);
        break;
      case 0xf3:
        //DI
        this.flags.IME = false;
        this.cycles.sumCycles(4);
        break;
      case 0xf5:
        //PUSH AF
        this.stackPush16bit(this.getAF());
        this.cycles.sumCycles(16);
        break;
      case 0xf6:
        //OR A, n
        this.A = this.logicalOps(
          'or',
          this.A,
          this.memory.read(this.PC),
        );
        this.pcIncrement(1);
        this.cycles.sumCycles(8);
        break;
      case 0xf7:
        //RST 30H
        this.stackPush16bit(this.PC);
        this.PC = 0x30;
        this.pcIncrement(-1);
        this.cycles.sumCycles(16);
        break;
      case 0xf8:
        //LD HL, SP+n
        this.setHL(this.SP + this.memory.read(this.PC));
        this.pcIncrement(1);
        this.cycles.sumCycles(12);
        break;
      case 0xf9:
        //LD SP, HL
        this.SP = this.getHL();
        this.cycles.sumCycles(8);
        break;
      case 0xfa:
        //LD A, (nn)
        this.A = this.memory.read(
          this.memory.read(this.PC) |
            (this.memory.read(this.PC + 1) << 8),
        );
        this.pcIncrement(2);
        this.cycles.sumCycles(16);
        break;
      case 0xfb:
        //EI
        this.requestIE = true;
        this.cycles.sumCycles(4);
        break;
      case 0xfe:
        //CP A, n
        this.logicalOps('cp', this.A, this.memory.read(this.PC));
        this.pcIncrement(1);
        this.cycles.sumCycles(8);
        break;
      case 0xff:
        //RST 38H
        this.stackPush16bit(this.PC);
        this.PC = 0x38;
        this.pcIncrement(-1);
        this.cycles.sumCycles(16);
        break;
      default:
        throw new Error(
          'Unknown opcode: ' + opcode.toString(16),
        );
    }
    this.pcIncrement(1);
  }

  IncDec(op: 'inc' | 'dec', register: number, flags?: boolean) {
    let result = op === 'inc' ? register + 1 : register - 1;
    if (!flags) return result & 0xffff;
    result = result & 0xff;
    //flags
    this.zeroFlag = result === 0;
    if (op === 'inc')
      this.halfCarryFlag = (register & 0xf) + 1 > 0xf;
    if (op === 'dec')
      this.halfCarryFlag = (register & 0xf) - 1 < 0;
    this.subtractFlag = op === 'dec';

    return result;
  }

  rotShift(
    op:
      | 'RLCA'
      | 'RLA'
      | 'RRCA'
      | 'RRA'
      | 'RLC'
      | 'RL'
      | 'RRC'
      | 'RR'
      | 'SLA'
      | 'SRA'
      | 'SWAP'
      | 'SRL',
    register: number,
  ): number {
    let result = 0;
    if (op === 'RLCA' || op === 'RLC')
      result = (register << 1) | (register >> 7);
    if (op === 'RRCA' || op === 'RRC')
      result = (register >> 1) | (register << 7);
    if (op === 'RLA' || op === 'RL')
      result = (register << 1) | (this.carryFlag ? 1 : 0);
    if (op === 'RRA' || op === 'RR')
      result = (register >> 1) | (this.carryFlag ? 0x80 : 0);
    if (op === 'SLA') result = register << 1;
    if (op === 'SRA')
      result = (register >> 1) | (register & 0x80);
    if (op === 'SWAP')
      result = ((register & 0xf) << 4) | (register >> 4);
    if (op === 'SRL') result = register >> 1;
    //pyboy tiene otra implementacion de RRCA
    //flags
    this.zeroFlag = false;
    this.halfCarryFlag = false;
    this.subtractFlag = false;
    if (
      op === 'RLCA' ||
      op === 'RLA' ||
      op === 'RLC' ||
      op === 'RL' ||
      op === 'SLA'
    )
      this.carryFlag = register > 0x7f;
    if (
      op === 'RRCA' ||
      op === 'RRA' ||
      op === 'RRC' ||
      op === 'RR' ||
      op === 'SRA' ||
      op === 'SRL'
    )
      this.carryFlag = (register & 0b1) === 1;
    if (
      op === 'RLC' ||
      op === 'RRC' ||
      op === 'RL' ||
      op === 'RR' ||
      op === 'SLA' ||
      op === 'SRA' ||
      op === 'SWAP' ||
      op === 'SRL'
    )
      this.zeroFlag = (result & 0xff) === 0;

    if (op === 'SWAP') this.carryFlag = false;

    return result & 0xff;
    //no se si las flags en instrucciones CB estaran bien puestas
  }

  addSub(
    op: 'add' | 'adc' | 'sub' | 'sbc',
    register: number,
    value: number,
    bits: 8 | 16,
  ): number {
    let result = 0;
    if (op === 'add') result = register + value;
    if (op === 'adc')
      result = register + value + (this.carryFlag ? 1 : 0);
    if (op === 'sub') result = register - value;
    if (op === 'sbc')
      result = register - value - (this.carryFlag ? 1 : 0);

    //flags
    //implementacion erronea de las flags en mi anterior emulador
    if (op === 'add' || op === 'adc') {
      if (bits === 8)
        this.halfCarryFlag =
          (register & 0xf) + (value & 0xf) > 0xf;
      else
        this.halfCarryFlag =
          (register & 0xfff) + (value & 0xfff) > 0xfff;

      this.carryFlag = result > (bits === 8 ? 0xff : 0xffff);
    } else {
      if (bits === 8)
        this.halfCarryFlag =
          (register & 0xf) - (value & 0xf) < 0;

      this.carryFlag = result < 0;
    }

    if (bits === 8) this.zeroFlag = (result & 0xff) === 0;
    this.subtractFlag = op === 'sub' || op === 'sbc';

    return result & (bits === 8 ? 0xff : 0xffff);
  }

  STOPinstruction(nextbyte: number) {
    //TODO: implementar
    return;
  }

  JR(byte: number): number {
    //byte > 0x7f ? byte - 0x100 : byte o (byte ^ 0x80) - 0x80 otras formas de hacerlo signed
    const signed = (byte << 24) >> 24;
    return signed + 2;
  }

  DAA(register: number): number {
    let adjust = 0;
    if (!this.subtractFlag) {
      if (this.carryFlag || register > 0x99) {
        adjust |= 0x60;
        this.carryFlag = true;
      }
      if (this.halfCarryFlag || (register & 0xf) > 0x9) {
        adjust |= 0x6;
      }

      register += adjust;
    } else {
      if (this.carryFlag) {
        adjust |= 0x9a;
      }
      if (this.halfCarryFlag) {
        adjust |= 0xa;
      }
      register -= adjust;
      //a revisar
    }
    this.halfCarryFlag = false;
    this.zeroFlag = (register & 0xff) === 0;
    this.carryFlag = adjust >= 0x100;
    return (register &= 0xff);
  }

  logicalOps(
    op: 'and' | 'or' | 'xor' | 'cp',
    register: number,
    value: number,
  ): number {
    let result = 0;
    if (op === 'and') result = register & value;
    if (op === 'or') result = register | value;
    if (op === 'xor') result = register ^ value;
    if (op === 'cp') result = register - value;

    if (op === 'and') this.halfCarryFlag = true;
    else this.halfCarryFlag = false;
    this.zeroFlag = result === 0;
    this.carryFlag = false;

    this.subtractFlag = op === 'cp';
    if (op === 'cp') {
      this.halfCarryFlag = (register & 0xf) - (value & 0xf) < 0;
      this.carryFlag = result < 0;

      return register;
    }

    return result & 0xff;
  }

  bitOps(op: 'bit' | 'res' | 'set', bit: number, value: number) {
    if (op === 'bit') this.zeroFlag = (value & (1 << bit)) === 0;
    if (op === 'res') value &= ~(1 << bit);
    if (op === 'set') value |= 1 << bit;

    if (op === 'bit') {
      this.halfCarryFlag = true;
      this.subtractFlag = false;
    }

    return value;
  }

  miscelaneous(
    op: 'cpl' | 'ccf' | 'scf',
    register?: number,
  ): number | undefined {
    if (op === 'cpl') {
      register = ~register!;
      this.halfCarryFlag = true;
      this.subtractFlag = true;
      return register;
    }
    if (op === 'ccf') {
      this.carryFlag = !this.carryFlag;
      this.halfCarryFlag = false;
      this.subtractFlag = false;
    }
    if (op === 'scf') {
      this.carryFlag = true;
      this.halfCarryFlag = false;
      this.subtractFlag = false;
    }
  }

  halt() {
    this.flags.CPUhalt = true;
    return;
  }

  haltTick(): boolean {
    return false;
    //a revisar
  }

  stopTick(): boolean {
    return false;
  }

  inicializeDefaultValuesGB() {
    this.A = 0x01;
    this.B = 0x00;
    this.C = 0x13;
    this.D = 0x00;
    this.E = 0xd8;
    this.H = 0x01;
    this.L = 0x4d;
    this.SP = 0xfffe;
    this.PC = 0x0100;

    this.carryFlag = true;
    this.halfCarryFlag = true;
    this.zeroFlag = true;
    this.subtractFlag = false;
  }
}

export default CPU;
