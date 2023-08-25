import { memory as MEMORY } from '../GAMEBOYCOLOR/components';

test('memory', () => {
  expect(MEMORY).toBeDefined();
});

test('read from 0xFF00', () => {
  expect(MEMORY.read(0xff00)).toBe(0xff);
});

test('write to 0xFF00', () => {
  MEMORY.write(0xff02, 0x01);
  expect(MEMORY.read(0xff02)).toBe(0x01);
});

//IOregisters
test('IOregisters', () => {
  expect(MEMORY.IOregisters).toBeDefined();
});

test('IOread', () => {
  expect(MEMORY.IOread(0x1)).toBe(0xff);
});

test('IOwrite', () => {
  MEMORY.IOwrite(0x1, 0x01);
  expect(MEMORY.IOread(0x1)).toBe(0x01);
});
