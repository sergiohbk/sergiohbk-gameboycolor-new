import Memory from '../memory';
import FLAGS from '../generalFlags';
import MBC1 from '../MBCs/MBC1';
import ROMonly from '../MBCs/ROMonly';
import Cartridge from '../cartridge';
import Bootrom from '../bootrom';

describe('RomOnly memory test', () => {
  let memory: Memory;

  beforeEach(() => {
    memory = new Memory(new FLAGS(), new Bootrom());
    memory.setMBC(new ROMonly(new Cartridge()));
  });

  it('should write and read from memory from VRAM', () => {
    memory.write(0x9000, 0x56);
    expect(memory.read(0x9000)).toBe(0x56);
  });

  it('should write and read from memory from WRAM', () => {
    memory.write(0xc000, 0x56);
    expect(memory.read(0xc000)).toBe(0x56);
  });

  it('should write and read from memory from WRAM echo', () => {
    memory.write(0xe000, 0x56);
    expect(memory.read(0xe000)).toBe(0x56);
  });

  it('should write and read from memory from OAM', () => {
    memory.write(0xfe00, 0x56);
    expect(memory.read(0xfe00)).toBe(0x56);
  });

  it('should write and read from memory from IO', () => {
    memory.write(0xff00, 0x56);
    expect(memory.P1).toBe(0x56);
    expect(memory.read(0xff00)).toBe(0x56);
  });

  it('should write and read from memory from IO wave pattern', () => {
    memory.write(0xff30, 0x56);
    expect(memory.read(0xff30)).toBe(0x56);
  });

  it('should write and read from memory from IO unmapped data', () => {
    memory.write(0xff03, 0x56);
    expect(memory.read(0xff03)).toBe(0x56);
  });

  it('should write and read from memory from HRAM', () => {
    memory.write(0xff80, 0x56);
    expect(memory.read(0xff80)).toBe(0x56);
  });

  it('should write and read from memory from IE', () => {
    memory.write(0xffff, 0x56);
    expect(memory.read(0xffff)).toBe(0xf6);
  });

  it('should throw an error when writing to an invalid address', () => {
    expect(() => memory.write(0x10000, 0x00)).toThrow();
  });

  it('should select the correct wrambank 0, reads get rambank 0 but is 1', () => {
    memory.write(0xff70, 0x00);
    expect(memory.WRAMBank).toBe(0);
  });

  it('should select the correct wrambank', () => {
    memory.write(0xff70, 0x03);
    expect(memory.WRAMBank).toBe(3);
  });

  it('should set the MBC', () => {
    const mbc = new MBC1(new Cartridge());
    memory.setMBC(mbc);
    expect(memory.MemoryMap).toBe(mbc);
  });
});
