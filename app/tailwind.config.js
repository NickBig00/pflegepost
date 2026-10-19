// Colors resolve to CSS variables set by ThemeProvider from src/ui/tokens.ts,
// so every class works in light and dark mode without `dark:` variants.
const colorTokens = [
  'canvas',
  'surface',
  'surface-muted',
  'surface-raised',
  'border',
  'border-strong',
  'fg',
  'fg-muted',
  'fg-subtle',
  'primary',
  'primary-pressed',
  'on-primary',
  'primary-soft',
  'on-primary-soft',
  'accent',
  'accent-soft',
  'on-accent-soft',
  'ochre',
  'ochre-soft',
  'on-ochre-soft',
  'info',
  'info-soft',
  'on-info-soft',
  'success',
  'success-soft',
  'on-success-soft',
  'danger',
  'danger-soft',
  'on-danger-soft',
  'overlay',
  'focus',
];

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  // Theming runs through CSS variables (ThemeProvider), not dark: variants.
  darkMode: 'class',
  theme: {
    colors: {
      transparent: 'transparent',
      ...Object.fromEntries(colorTokens.map((name) => [name, `rgb(var(--color-${name}) / <alpha-value>)`])),
    },
    fontFamily: {
      regular: ['Inter_400Regular'],
      medium: ['Inter_500Medium'],
      semibold: ['Inter_600SemiBold'],
      bold: ['Inter_700Bold'],
    },
    extend: {
      borderRadius: { sm: '8px', md: '12px', lg: '16px', xl: '24px' },
    },
  },
  plugins: [],
};
