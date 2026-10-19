import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { fontFamily, typography, type TypographyToken } from '../tokens';

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
  | 'inverseAction';

const toneClass: Record<TextTone, string> = {
  default: 'text-fg',
  muted: 'text-fg-muted',
  subtle: 'text-fg-subtle',
  primary: 'text-primary',
  onPrimary: 'text-on-primary',
  accent: 'text-accent',
  ochre: 'text-ochre',
  info: 'text-info',
  success: 'text-success',
  danger: 'text-danger',
  onPrimarySoft: 'text-on-primary-soft',
  onAccentSoft: 'text-on-accent-soft',
  onOchreSoft: 'text-on-ochre-soft',
  onInfoSoft: 'text-on-info-soft',
  onSuccessSoft: 'text-on-success-soft',
  onDangerSoft: 'text-on-danger-soft',
  inverse: 'text-canvas',
  inverseAction: 'text-primary-soft',
};

export type TextProps = RNTextProps & {
  variant?: TypographyToken;
  tone?: TextTone;
  className?: string;
};

const headingVariants: TypographyToken[] = ['display', 'title1', 'title2', 'title3'];

export function Text({ variant = 'body', tone = 'default', className = '', style, ...rest }: TextProps) {
  const t = typography[variant];
  return (
    <RNText
      accessibilityRole={headingVariants.includes(variant) ? 'header' : undefined}
      maxFontSizeMultiplier={t.maxScale}
      className={`${toneClass[tone]} ${className}`}
      style={[
        {
          fontFamily: fontFamily[t.weight],
          fontSize: t.size,
          lineHeight: t.lineHeight,
          letterSpacing: t.letterSpacing,
        },
        variant === 'eyebrow' && { textTransform: 'uppercase' },
        style,
      ]}
      {...rest}
    />
  );
}
