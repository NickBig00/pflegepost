/**
 * Design tokens – the single source of truth for colors, type, spacing,
 * radii, shadows and motion. Tailwind classes resolve colors through CSS
 * variables that ThemeProvider fills from these values (see theme.tsx).
 */

export type ColorScheme = 'light' | 'dark';

const light = {
  // Surfaces: warm paper tones
  canvas: '#F6F3ED',
  surface: '#FFFFFF',
  surfaceMuted: '#EFEAE1',
  surfaceRaised: '#FFFFFF',
  border: '#E5DFD4',
  borderStrong: '#CFC7B9',

  // Text
  fg: '#1E2320',
  fgMuted: '#575F59',
  fgSubtle: '#646B66',

  // Primary: sage green
  primary: '#3A6650',
  primaryPressed: '#2F5543',
  onPrimary: '#FFFFFF',
  primarySoft: '#E2ECE5',
  onPrimarySoft: '#2A4C3B',

  // Deadlines: terracotta, never alarm red
  accent: '#9E4A2A',
  accentSoft: '#F7E5DB',
  onAccentSoft: '#843D21',

  // Gentle hints: ochre
  ochre: '#835E0F',
  ochreSoft: '#F5EBD3',
  onOchreSoft: '#6C4C0C',

  // AI notices and information: dusty blue
  info: '#3D6683',
  infoSoft: '#E3EBF1',
  onInfoSoft: '#2D4F67',

  success: '#2F7350',
  successSoft: '#DFEEE4',
  onSuccessSoft: '#235A3E',

  // Only for destructive actions
  danger: '#A23A30',
  dangerSoft: '#F6E1DE',
  onDangerSoft: '#7F2B23',

  overlay: '#1E2320',
  focus: '#3D6683',
} as const;

export type ColorToken = keyof typeof light;

const dark: Record<ColorToken, string> = {
  canvas: '#141715',
  surface: '#1D211F',
  surfaceMuted: '#262B28',
  surfaceRaised: '#232825',
  border: '#313733',
  borderStrong: '#454C47',

  fg: '#EEEAE3',
  fgMuted: '#B0B5AF',
  fgSubtle: '#8D938E',

  primary: '#94C4A9',
  primaryPressed: '#7FB396',
  onPrimary: '#10231A',
  primarySoft: '#223429',
  onPrimarySoft: '#B5DAC4',

  accent: '#E89F81',
  accentSoft: '#3B2820',
  onAccentSoft: '#F2C2AE',

  ochre: '#DDB463',
  ochreSoft: '#362D1A',
  onOchreSoft: '#EBCF94',

  info: '#9DBEDA',
  infoSoft: '#1F2B35',
  onInfoSoft: '#BFD5E7',

  success: '#8FCBA5',
  successSoft: '#1E3327',
  onSuccessSoft: '#B3DEC2',

  danger: '#EE9A90',
  dangerSoft: '#3A2220',
  onDangerSoft: '#F5BEB7',

  overlay: '#000000',
  focus: '#9DBEDA',
};

export const colors: Record<ColorScheme, Record<ColorToken, string>> = { light, dark };

/** Inter, loaded via @expo-google-fonts/inter. One family per weight (Android ignores fontWeight). */
export const fontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export type FontWeightToken = keyof typeof fontFamily;

type TypeStyle = {
  size: number;
  lineHeight: number;
  weight: FontWeightToken;
  letterSpacing: number;
  /** Upper bound for system font scaling so huge sizes stay usable. */
  maxScale: number;
};

/** Type scale based on iOS text styles, body at 17 pt for easy reading. */
export const typography = {
  display: { size: 32, lineHeight: 38, weight: 'bold', letterSpacing: -0.6, maxScale: 1.4 },
  title1: { size: 26, lineHeight: 32, weight: 'semibold', letterSpacing: -0.4, maxScale: 1.5 },
  title2: { size: 21, lineHeight: 27, weight: 'semibold', letterSpacing: -0.25, maxScale: 1.6 },
  title3: { size: 18, lineHeight: 24, weight: 'semibold', letterSpacing: -0.1, maxScale: 1.8 },
  body: { size: 17, lineHeight: 25, weight: 'regular', letterSpacing: -0.1, maxScale: 2.2 },
  bodyStrong: { size: 17, lineHeight: 25, weight: 'semibold', letterSpacing: -0.1, maxScale: 2.2 },
  callout: { size: 15, lineHeight: 21, weight: 'regular', letterSpacing: 0, maxScale: 2.2 },
  calloutStrong: { size: 15, lineHeight: 21, weight: 'medium', letterSpacing: 0, maxScale: 2.2 },
  caption: { size: 13, lineHeight: 18, weight: 'medium', letterSpacing: 0.1, maxScale: 2 },
  eyebrow: { size: 13, lineHeight: 16, weight: 'semibold', letterSpacing: 0.6, maxScale: 1.8 },
} as const satisfies Record<string, TypeStyle>;

export type TypographyToken = keyof typeof typography;

/** 8-pt grid with 4-pt half steps for optical fine-tuning. */
export const space = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  ml: 20,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

/** Soft, warm shadows; in dark mode surfaces are separated by tone and border instead. */
export const shadows: Record<ColorScheme, { card: string; raised: string; floating: string }> = {
  light: {
    card: '0px 1px 2px rgba(54, 44, 28, 0.05), 0px 2px 8px rgba(54, 44, 28, 0.04)',
    raised: '0px 2px 4px rgba(54, 44, 28, 0.06), 0px 8px 24px rgba(54, 44, 28, 0.08)',
    floating: '0px 8px 16px rgba(54, 44, 28, 0.08), 0px 20px 48px rgba(54, 44, 28, 0.14)',
  },
  dark: {
    card: '0px 0px 0px rgba(0, 0, 0, 0)',
    raised: '0px 4px 16px rgba(0, 0, 0, 0.35)',
    floating: '0px 12px 40px rgba(0, 0, 0, 0.5)',
  },
};

/** Durations in ms; all animations stay inside 200–300 ms as per DESIGN.md. */
export const motion = {
  fast: 200,
  base: 250,
  slow: 300,
  spring: { damping: 22, stiffness: 260, mass: 0.9 },
} as const;

/** Tab bar height above the bottom safe area (pt). */
export const tabBarHeight = 68;

/** Minimum touch target (pt), WCAG 2.2 / HIG. */
export const minTouch = 44;
