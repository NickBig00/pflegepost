import type { LucideIcon } from 'lucide-react-native';
import { ActivityIndicator, View, type GestureResponderEvent } from 'react-native';

import { haptics } from '../haptics';
import { useTheme } from '../theme';
import type { ColorToken } from '../tokens';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { Text, type TextTone } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'lg' | 'md' | 'sm';

type VariantStyle = { container: string; text: TextTone; icon: ColorToken };

const variants: Record<ButtonVariant, VariantStyle> = {
  primary: { container: 'bg-primary', text: 'onPrimary', icon: 'onPrimary' },
  secondary: { container: 'bg-primary-soft', text: 'onPrimarySoft', icon: 'onPrimarySoft' },
  outline: { container: 'bg-surface border border-border-strong', text: 'default', icon: 'fg' },
  ghost: { container: 'bg-transparent', text: 'primary', icon: 'primary' },
  danger: { container: 'bg-danger-soft', text: 'onDangerSoft', icon: 'onDangerSoft' },
};

const sizes: Record<ButtonSize, { container: string; icon: number }> = {
  lg: { container: 'min-h-[56px] px-6 rounded-lg gap-2.5', icon: 22 },
  md: { container: 'min-h-[48px] px-5 rounded-md gap-2', icon: 20 },
  sm: { container: 'min-h-[36px] px-3.5 rounded-full gap-1.5', icon: 17 },
};

const alignClass = { start: 'self-start', center: 'self-center', stretch: 'self-stretch' } as const;

export type ButtonProps = {
  label: string;
  onPress?: (e: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  iconPosition?: 'leading' | 'trailing';
  loading?: boolean;
  disabled?: boolean;
  /** Horizontal placement inside its parent; "stretch" makes it full width. */
  align?: 'start' | 'center' | 'stretch';
  /** Screen-reader hint describing the result, e.g. "Öffnet die Kamera". */
  accessibilityHint?: string;
  className?: string;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'leading',
  loading = false,
  disabled = false,
  align = 'start',
  accessibilityHint,
  className = '',
}: ButtonProps) {
  const { colors } = useTheme();
  const v = variants[variant];
  const s = sizes[size];
  const inactive = disabled || loading;

  const iconEl = icon ? <Icon icon={icon} size={s.icon} color={v.icon} strokeWidth={2} /> : null;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      hitSlop={size === 'sm' ? 4 : 0}
      onPress={(e) => {
        if (variant === 'primary') haptics.tap();
        onPress?.(e);
      }}
      className={`${alignClass[align]} ${className}`}
    >
      {({ pressed }) => (
        <View
          className={`flex-row items-center justify-center ${v.container} ${s.container} ${
            disabled ? 'opacity-50' : pressed && !loading ? 'opacity-90' : ''
          }`}
        >
          {loading ? (
            <ActivityIndicator color={colors[v.icon]} />
          ) : (
            <>
              {iconPosition === 'leading' && iconEl}
              <Text
                variant={size === 'sm' ? 'calloutStrong' : 'bodyStrong'}
                tone={v.text}
                numberOfLines={2}
                className="text-center"
              >
                {label}
              </Text>
              {iconPosition === 'trailing' && iconEl}
            </>
          )}
        </View>
      )}
    </PressableScale>
  );
}
