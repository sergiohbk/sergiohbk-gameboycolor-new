import { cpu as CPU, memory as MEMORY } from '../GAMEBOYCOLOR/components';

test('instructions', () => {
  expect(CPU).toBeDefined();
  expect(MEMORY).toBeDefined();
});
