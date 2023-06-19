import { CPU } from '../cpu';
import { CYCLES } from '../cycles';
import { FLAGS } from '../generalFlags';
import { Memory } from '../memory';

describe('Cpu tests', () => {
  let cpu: CPU;
  let flags: FLAGS;
  beforeEach(() => {
    flags = new FLAGS();
    cpu = new CPU(new Memory(flags), new CYCLES(), flags);
    cpu.SP = 0xfffe;
    cpu.testMode = true;
  });
  describe('stack pointer tests', () => {
    it('should increment stack pointer', () => {
      expect(cpu.SP).toBe(0xfffe);
      cpu.stackPush8bit(0x01);
      expect(cpu.SP).toBe(0xfffd);
    });
    it('should decrement stack pointer', () => {
      expect(cpu.SP).toBe(0xfffe);
      cpu.stackPush8bit(0x01);
      expect(cpu.SP).toBe(0xfffd);
      const stack = cpu.stackPop8bit();
      expect(cpu.SP).toBe(0xfffe);
      expect(stack).toBe(0x01);
    });

    it('should increment stack pointer 16bit', () => {
      expect(cpu.SP).toBe(0xfffe);
      cpu.stackPush16bit(0x0101);
      expect(cpu.SP).toBe(0xfffc);
    });
    it('should decrement stack pointer 16bit', () => {
      expect(cpu.SP).toBe(0xfffe);
      cpu.stackPush16bit(0x0101);
      expect(cpu.SP).toBe(0xfffc);
      const stack = cpu.stackPop16bit();
      expect(cpu.SP).toBe(0xfffe);
      expect(stack).toBe(0x0101);
    });
  });
  describe('16 bits register set and get', () => {
    it('should set and get BC', () => {
      cpu.setBC(0x0101);
      expect(cpu.getBC()).toBe(0x0101);
    });
    it('should set and get DE', () => {
      cpu.setDE(0x0101);
      expect(cpu.getDE()).toBe(0x0101);
    });
    it('should set and get HL', () => {
      cpu.setHL(0x0101);
      expect(cpu.getHL()).toBe(0x0101);
    });
    it('should set and get A and flags', () => {
      cpu.setAF(0x01f0);
      expect(cpu.zeroFlag).toBe(true);
      expect(cpu.subtractFlag).toBe(true);
      expect(cpu.halfCarryFlag).toBe(true);
      expect(cpu.carryFlag).toBe(true);
      expect(cpu.getAF()).toBe(0x01f0);
    });
  });
  describe('cycles gestion', () => {
    it('should add cycles', () => {
      cpu.cycles.sumCycles(4);
      expect(cpu.cycles.cycles).toBe(4);
    });
    it('should reset cycles', () => {
      cpu.cycles.sumCycles(4);
      expect(cpu.cycles.cycles).toBe(4);
      cpu.cycles.setCycles(0);
      expect(cpu.cycles.cycles).toBe(0);
    });
    it('should rest cycles', () => {
      cpu.cycles.sumCycles(4);
      expect(cpu.cycles.cycles).toBe(4);
      cpu.cycles.resCycles(2);
      expect(cpu.cycles.cycles).toBe(2);
    });
  });
  describe('instruction loads test', () => {
    it('0x21 should load 16bit value to HL', () => {
      cpu.instructionSet(0x21);
      expect(cpu.getHL()).toBe(0x2323);
      expect(cpu.cycles.cycles).toBe(12);
      expect(cpu.PC).toBe(0x0003);
    });
    it('0x31 should load 16bit value to SP', () => {
      cpu.instructionSet(0x31);
      expect(cpu.SP).toBe(0x2323);
      expect(cpu.cycles.cycles).toBe(12);
      expect(cpu.PC).toBe(0x0003);
    });
    it('0x32 should load A value in HL minus 1 to memory', () => {
      cpu.setHL(0x9fff);
      cpu.A = 0x23;
      cpu.instructionSet(0x32);
      expect(cpu.memory.read(0x9fff)).toBe(0x23);
      expect(cpu.cycles.cycles).toBe(8);
      expect(cpu.PC).toBe(0x0001);
    });
  });
  describe('operations test', () => {
    it('logical operations', () => {
      cpu.A = 0x0;
      cpu.B = 0x0;
      cpu.logicalOps('xor', cpu.A, cpu.A);
      expect(cpu.zeroFlag).toBe(true);
      expect(cpu.A).toBe(0x0);
    });
    it('bit operations test', () => {
      cpu.bitOps('bit', 7, cpu.A);
      expect(cpu.zeroFlag).toBe(true);
      expect(cpu.halfCarryFlag).toBe(true);
      expect(cpu.subtractFlag).toBe(false);
    });
  });
  describe('jump tests', () => {
    it('0x20 should jump relative getting 8 bits (0x23)', () => {
      cpu.PC = 0x2000;
      cpu.instructionSet(0x20);
      expect(cpu.PC).toBe(0x2023);
      expect(cpu.cycles.cycles).toBe(12);
    });
  });
});
