import Bootrom from '../bootrom';
import CPU from '../cpu';
import CYCLES from '../cycles';
import FLAGS from '../generalFlags';
import Memory from '../memory';

describe('Cpu tests', () => {
  let cpu: CPU;
  let flags: FLAGS;
  beforeEach(() => {
    flags = new FLAGS();
    cpu = new CPU(
      new Memory(flags, new Bootrom()),
      new CYCLES(),
      flags,
      new Bootrom(),
    );
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
      expect(cpu.PC).toBe(0x2025);
      expect(cpu.cycles.cycles).toBe(12);
    });
    it('debe saltar al RST en todas las situaciones y retornar con RET', () => {
      cpu.PC = 0x2000;
      cpu.instructionSet(0xcf);
      expect(cpu.PC).toBe(0x08);
      expect(cpu.cycles.cycles).toBe(16);
      expect(cpu.memory.stackMem[0xfffe]).toBe(0x20);
      expect(cpu.memory.stackMem[0xfffd]).toBe(0x00);
      cpu.instructionSet(0xc9);
      expect(cpu.PC).toBe(0x2000);
      expect(cpu.cycles.cycles).toBe(32);
      cpu.PC = 0x2333;
      cpu.instructionSet(0xc7);
      expect(cpu.PC).toBe(0x00);
      expect(cpu.cycles.cycles).toBe(48);
      cpu.PC = 0x10;
      cpu.instructionSet(0xdf);
      expect(cpu.PC).toBe(0x18);
      expect(cpu.cycles.cycles).toBe(64);
      expect(cpu.memory.stackMem[0xfffc]).toBe(0x00);
      expect(cpu.memory.stackMem[0xfffb]).toBe(0x10);
      expect(cpu.memory.stackMem[0xfffe]).toBe(0x23);
      expect(cpu.memory.stackMem[0xfffd]).toBe(0x33);
    });
  });
  describe('IncDec', () => {
    it('incrementar de 0 a 1', () => {
      const result = cpu.IncDec('inc', 0, true);
      expect(result).toEqual(1);
      expect(cpu.zeroFlag).toBe(false);
      expect(cpu.halfCarryFlag).toBe(false);
      expect(cpu.subtractFlag).toBe(false);
    });

    it('incrementar de 15 a 16 para el half carry flag', () => {
      const result = cpu.IncDec('inc', 15, true);
      expect(result).toEqual(16);
      expect(cpu.zeroFlag).toBe(false);
      expect(cpu.halfCarryFlag).toBe(true);
      expect(cpu.subtractFlag).toBe(false);
    });

    it('decrementar de 1 a 0', () => {
      const result = cpu.IncDec('dec', 1, true);
      expect(result).toEqual(0);
      expect(cpu.zeroFlag).toBe(true);
      expect(cpu.halfCarryFlag).toBe(false);
      expect(cpu.subtractFlag).toBe(true);
    });

    it('decrementar de 16 a 15 para el half carry flag', () => {
      const result = cpu.IncDec('dec', 16, true);
      expect(result).toEqual(15);
      expect(cpu.zeroFlag).toBe(false);
      expect(cpu.halfCarryFlag).toBe(true); // 16 & 0xf - 1 es 0, que es menor que 0
      expect(cpu.subtractFlag).toBe(true);
    });

    it('incrementar de 255 a 0 (overflow)', () => {
      const result = cpu.IncDec('inc', 255, true);
      expect(result).toEqual(0);
      expect(cpu.zeroFlag).toBe(true);
      expect(cpu.halfCarryFlag).toBe(true);
      expect(cpu.subtractFlag).toBe(false);
    });

    it('decrementar de 0 a 255 (underflow)', () => {
      const result = cpu.IncDec('dec', 0, true);
      expect(result).toEqual(255);
      expect(cpu.zeroFlag).toBe(false);
      expect(cpu.halfCarryFlag).toBe(true); // 0 & 0xf - 1 es -1, que es menor que 0
      expect(cpu.subtractFlag).toBe(true);
    });

    it('incrementar sin actualizar flags', () => {
      const result = cpu.IncDec('inc', 0, false);
      expect(result).toEqual(1);
      expect(cpu.zeroFlag).toBe(false);
      expect(cpu.halfCarryFlag).toBe(false);
      expect(cpu.subtractFlag).toBe(false);
    });

    it('decrementar sin actualizar flags', () => {
      const result = cpu.IncDec('dec', 0xff34, false);
      expect(result).toEqual(0xff33);
      expect(cpu.zeroFlag).toBe(false);
      expect(cpu.halfCarryFlag).toBe(false);
      expect(cpu.subtractFlag).toBe(false);
    });
    describe('addsub', () => {
      it('debe sumar dos numeros de 8 bits', () => {
        cpu.addSub('add', 0x12, 0x34, 8);
        expect(cpu.zeroFlag).toBe(false);
        expect(cpu.halfCarryFlag).toBe(false);
        expect(cpu.carryFlag).toBe(false);
        expect(cpu.subtractFlag).toBe(false);
      });

      it('debe sumar dos numeros de 16 bits', () => {
        cpu.addSub('add', 0x1234, 0x4567, 16);
        expect(cpu.zeroFlag).toBe(false);
        expect(cpu.halfCarryFlag).toBe(false);
        expect(cpu.carryFlag).toBe(false);
        expect(cpu.subtractFlag).toBe(false);
      });

      it('sumar numeros con el carry activado y haciendo overflow', () => {
        cpu.carryFlag = true;
        let result = cpu.addSub('adc', 0xfd, 0x02, 8);
        expect(cpu.carryFlag).toBe(true);
        expect(cpu.halfCarryFlag).toBe(false);
        expect(cpu.subtractFlag).toBe(false);
        expect(cpu.zeroFlag).toBe(true);
        expect(result).toBe(0x00);
      });

      it('should correctly subtract two 8 bit numbers', () => {
        cpu.addSub('sub', 0x90, 0x11, 8);
        expect(cpu.carryFlag).toBe(false);
        expect(cpu.halfCarryFlag).toBe(true);
        expect(cpu.subtractFlag).toBe(true);
        expect(cpu.zeroFlag).toBe(false);
      });

      it('should correctly subtract two 8 bit numbers with carry', () => {
        cpu.addSub('sbc', 0x90, 0x11, 8);
        expect(cpu.carryFlag).toBe(false);
        expect(cpu.halfCarryFlag).toBe(true);
        expect(cpu.subtractFlag).toBe(true);
        expect(cpu.zeroFlag).toBe(false);
      });

      it('should correctly add two 16 bit numbers', () => {
        cpu.addSub('add', 0x1234, 0x5678, 16);
        expect(cpu.carryFlag).toBe(false);
        expect(cpu.halfCarryFlag).toBe(false);
        expect(cpu.subtractFlag).toBe(false);
        expect(cpu.zeroFlag).toBe(false);
      });

      it('should correctly subtract two 16 bit numbers', () => {
        cpu.addSub('sub', 0x8000, 0x2000, 16);
        expect(cpu.carryFlag).toBe(false);
        expect(cpu.halfCarryFlag).toBe(false);
        expect(cpu.subtractFlag).toBe(true);
        expect(cpu.zeroFlag).toBe(false);
      });

      it('should set the zero flag when result is zero', () => {
        cpu.addSub('sub', 0x12, 0x12, 8);
        expect(cpu.zeroFlag).toBe(true);
      });
    });
    describe('bootrom test work', () => {
      test('bootrom test instructions', () => {
        //LD SP 0xFFFE
        cpu.instructionSet(0x31);
        cpu.SP = 0xfffe;
        expect(cpu.PC).toBe(0x3);
        expect(cpu.cycles.cycles).toBe(12);
        cpu.instructionSet(0xaf);
        expect(cpu.A).toBe(0);
        expect(cpu.zeroFlag).toBe(true);
        expect(cpu.cycles.cycles).toBe(16);
        expect(cpu.PC).toBe(0x4);
        cpu.PC = 0x000a;
        cpu.PC += cpu.JR(0xfb);
        expect(cpu.PC).toBe(0x7);
      });
    });
  });
});
