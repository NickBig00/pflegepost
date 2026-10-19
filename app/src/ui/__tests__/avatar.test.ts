import { initials, paletteIndex } from '../components/Avatar';

test('initials use first and last name', () => {
  expect(initials('Anna Weber')).toBe('AW');
  expect(initials('  Thomas  ')).toBe('T');
  expect(initials('Anna Maria Weber')).toBe('AW');
});

test('palette is stable and spreads one family across colors', () => {
  expect(paletteIndex('Anna Weber')).toBe(paletteIndex('Anna Weber'));
  const family = ['Anna Weber', 'Thomas Weber', 'Ingrid Weber'].map(paletteIndex);
  expect(new Set(family).size).toBe(3);
});
