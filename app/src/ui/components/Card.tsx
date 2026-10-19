import type { ReactNode } from 'react';
import { View, type GestureResponderEvent } from 'react-native';

import { useTheme } from '../theme';
import { PressableScale } from './PressableScale';

export type CardTone = 'default' | 'muted' | 'primary' | 'accent' | 'ochre' | 'info';

const toneClass: Record<CardTone, string> = {
  default: 'bg-surface border border-border',
  muted: 'bg-surface-muted',
  primary: 'bg-primary-soft',
  accent: 'bg-accent-soft',
  ochre: 'bg-ochre-soft',
  info: 'bg-info-soft',
};

const paddingClass = { none: '', compact: 'p-4', comfortable: 'p-5', spacious: 'p-6' } as const;

export type CardProps = {
  children: ReactNode;
  tone?: CardTone;
  padding?: keyof typeof paddingClass;
  onPress?: (e: GestureResponderEvent) => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  className?: string;
};

/** Calm content container. Pressable when `onPress` is given. */
export function Card({
  children,
  tone = 'default',
  padding = 'comfortable',
  onPress,
  accessibilityLabel,
  accessibilityHint,
  className = '',
}: CardProps) {
  const { shadows } = useTheme();
  const classes = `rounded-xl overflow-hidden ${toneClass[tone]} ${paddingClass[padding]}`;
  const shadow = tone === 'default' ? { boxShadow: shadows.card } : undefined;

  if (!onPress) {
    return (
      <View className={`${classes} ${className}`} style={shadow}>
        {children}
      </View>
    );
  }

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      pressedScale={0.98}
      className={className}
    >
      {({ pressed }) => (
        <View className={`${classes} ${pressed ? 'opacity-90' : ''}`} style={shadow}>
          {children}
        </View>
      )}
    </PressableScale>
  );
}
