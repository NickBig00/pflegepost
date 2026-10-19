import { contrastRatio } from '../contrast';
import { colors, type ColorScheme, type ColorToken } from '../tokens';

const schemes: ColorScheme[] = ['light', 'dark'];
const backgrounds: ColorToken[] = ['canvas', 'surface', 'surfaceMuted'];
const textTokens: ColorToken[] = [
  'fg',
  'fgMuted',
  'fgSubtle',
  'primary',
  'accent',
  'ochre',
  'info',
  'success',
  'danger',
];
const softPairs = ['primary', 'accent', 'ochre', 'info', 'success', 'danger'] as const;

const AA = 4.5;

describe.each(schemes)('color tokens (%s)', (scheme) => {
  const c = colors[scheme];

  test.each(textTokens.flatMap((t) => backgrounds.map((b) => [t, b] as const)))(
    '%s on %s meets WCAG AA',
    (text, bg) => {
      expect(contrastRatio(c[text], c[bg])).toBeGreaterThanOrEqual(AA);
    },
  );

  test.each(softPairs)('text on %s-soft surfaces meets WCAG AA', (name) => {
    const cap = (name[0]!.toUpperCase() + name.slice(1)) as Capitalize<typeof name>;
    const soft = c[`${name}Soft`];
    expect(contrastRatio(c[`on${cap}Soft`], soft)).toBeGreaterThanOrEqual(AA);
    expect(contrastRatio(c[name], soft)).toBeGreaterThanOrEqual(AA);
  });

  test('text on primary buttons meets WCAG AA', () => {
    expect(contrastRatio(c.onPrimary, c.primary)).toBeGreaterThanOrEqual(AA);
    expect(contrastRatio(c.onPrimary, c.primaryPressed)).toBeGreaterThanOrEqual(AA);
  });

  test('inverted toast text meets WCAG AA', () => {
    expect(contrastRatio(c.canvas, c.fg)).toBeGreaterThanOrEqual(AA);
    expect(contrastRatio(c.primarySoft, c.fg)).toBeGreaterThanOrEqual(AA);
  });
});

test('tailwind config exposes exactly the color tokens', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const config = require('../../../tailwind.config.js') as { theme: { colors: Record<string, string> } };
  const kebab = (s: string) => s.replace(/[A-Z]/g, (ch) => `-${ch.toLowerCase()}`);
  const expected = Object.keys(colors.light).map(kebab).sort();
  const actual = Object.keys(config.theme.colors)
    .filter((k) => k !== 'transparent')
    .sort();
  expect(actual).toEqual(expected);
  expect(Object.keys(colors.dark).sort()).toEqual(Object.keys(colors.light).sort());
});
