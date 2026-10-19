import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { useTheme } from '../theme';
import { fontFamily, typography, type ColorToken, type TypographyToken } from '../tokens';

export type TextTone =
  | 'default'
  | 'muted'
  | 'subtle'
  | 'primary'
  | 'onPrimary'
  | 'accent'
  | 'ochre'
  | 'info'
  | 'success'
  | 'danger'
  | 'onPrimarySoft'
  | 'onAccentSoft'
  | 'onOchreSoft'
  | 'onInfoSoft'
  | 'onSuccessSoft'
  | 'onDangerSoft'
  /** On inverted surfaces (bg-fg), e.g. toasts. */
  | 'inverse'
  | 'inverseAction'
  | 'onCamera'
  | 'paperInk'
  | 'paperInkMuted';

// Colors come from the theme via style, not classes: class-based colors did not
// update reliably when a tone changes at runtime (e.g. toggled chips).
const toneColor: Record<TextTone, ColorToken> = {
  default: 'fg',
  muted: 'fgMuted',
  subtle: 'fgSubtle',
  primary: 'primary',
  onPrimary: 'onPrimary',
  accent: 'accent',
  ochre: 'ochre',
  info: 'info',
  success: 'success',
  danger: 'danger',
  onPrimarySoft: 'onPrimarySoft',
  onAccentSoft: 'onAccentSoft',
  onOchreSoft: 'onOchreSoft',
  onInfoSoft: 'onInfoSoft',
  onSuccessSoft: 'onSuccessSoft',
  onDangerSoft: 'onDangerSoft',
  inverse: 'canvas',
  inverseAction: 'primarySoft',
  onCamera: 'onCamera',
  paperInk: 'paperInk',
  paperInkMuted: 'paperInkMuted',
};

export type TextProps = RNTextProps & {
  variant?: TypographyToken;
  tone?: TextTone;
  className?: string;
};

const headingVariants: TypographyToken[] = ['display', 'title1', 'title2', 'title3'];

export function Text({ variant = 'body', tone = 'default', className = '', style, ...rest }: TextProps) {
  const t = typography[variant];
  const { colors } = useTheme();
  return (
    <RNText
      accessibilityRole={headingVariants.includes(variant) ? 'header' : undefined}
      maxFontSizeMultiplier={t.maxScale}
      className={className}
      style={[
        {
          fontFamily: fontFamily[t.weight],
          fontSize: t.size,
          lineHeight: t.lineHeight,
          letterSpacing: t.letterSpacing,
          color: colors[toneColor[tone]],
        },
        variant === 'eyebrow' && { textTransform: 'uppercase' },
        style,
      ]}
      {...rest}
    />
  );
}
