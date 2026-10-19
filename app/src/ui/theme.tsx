import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme, View } from 'react-native';
import { vars } from 'nativewind';

import { hexToRgb } from './contrast';
import { colors, shadows, type ColorScheme, type ColorToken } from './tokens';

type Theme = {
  scheme: ColorScheme;
  colors: Record<ColorToken, string>;
  shadows: (typeof shadows)[ColorScheme];
  /** null follows the system setting. */
  setSchemeOverride: (scheme: ColorScheme | null) => void;
};

const ThemeContext = createContext<Theme | null>(null);

function toKebab(token: string): string {
  return token.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
}

function cssVariables(scheme: ColorScheme) {
  return vars(
    Object.fromEntries(
      Object.entries(colors[scheme]).map(([token, hex]) => [
        `--color-${toKebab(token)}`,
        hexToRgb(hex).join(' '),
      ]),
    ),
  );
}

const variables = { light: cssVariables('light'), dark: cssVariables('dark') };

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [override, setSchemeOverride] = useState<ColorScheme | null>(null);
  const scheme: ColorScheme = override ?? (system === 'dark' ? 'dark' : 'light');

  const theme = useMemo<Theme>(
    () => ({ scheme, colors: colors[scheme], shadows: shadows[scheme], setSchemeOverride }),
    [scheme],
  );

  return (
    <ThemeContext.Provider value={theme}>
      <View style={[{ flex: 1 }, variables[scheme]]}>{children}</View>
    </ThemeContext.Provider>
  );
}

export function useTheme(): Theme {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error('useTheme must be used inside ThemeProvider');
  return theme;
}

/**
 * Re-applies the color variables. Needed inside native Modals, which render
 * outside the provider's view tree.
 */
export function ThemeScope({ children }: { children: ReactNode }) {
  const { scheme } = useTheme();
  return <View style={[{ flex: 1 }, variables[scheme]]}>{children}</View>;
}
