import { ChevronRight } from 'lucide-react-native';
import { Children, Fragment, isValidElement, type ReactNode } from 'react';
import { Pressable, View, type GestureResponderEvent } from 'react-native';

import { useTheme } from '../theme';
import { Icon } from './Icon';
import { Text } from './Text';

export type ListItemProps = {
  title: string;
  subtitle?: string;
  /** Icon tile, avatar or any small element. */
  leading?: ReactNode;
  /** Custom trailing element; defaults to a chevron when pressable. */
  trailing?: ReactNode;
  onPress?: (e: GestureResponderEvent) => void;
  accessibilityHint?: string;
};

export function ListItem({ title, subtitle, leading, trailing, onPress, accessibilityHint }: ListItemProps) {
  const content = (pressed: boolean) => (
    <View
      className={`min-h-[60px] flex-row items-center gap-3.5 px-4 py-3 ${pressed ? 'bg-surface-muted' : ''}`}
    >
      {leading}
      <View className="flex-1 gap-0.5">
        <Text variant="body">{title}</Text>
        {subtitle ? (
          <Text variant="callout" tone="muted">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing ?? (onPress ? <Icon icon={ChevronRight} size={20} color="fgSubtle" /> : null)}
    </View>
  );

  if (!onPress) return content(false);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
    >
      {({ pressed }) => content(pressed)}
    </Pressable>
  );
}

/** Inset grouped list (iOS settings style) with hairline separators. */
export function ListGroup({ children }: { children: ReactNode }) {
  const { shadows } = useTheme();
  const items = Children.toArray(children).filter(isValidElement);
  return (
    <View
      className="overflow-hidden rounded-xl border border-border bg-surface"
      style={{ boxShadow: shadows.card }}
    >
      {items.map((child, i) => (
        <Fragment key={child.key ?? i}>
          {i > 0 ? <View className="ml-4 h-px bg-border" /> : null}
          {child}
        </Fragment>
      ))}
    </View>
  );
}

/** Rounded icon tile for list leadings and cards. */
export function IconTile({
  children,
  tone = 'primary',
  size = 40,
}: {
  children: ReactNode;
  tone?: 'primary' | 'accent' | 'ochre' | 'info' | 'muted';
  size?: number;
}) {
  const bg = {
    primary: 'bg-primary-soft',
    accent: 'bg-accent-soft',
    ochre: 'bg-ochre-soft',
    info: 'bg-info-soft',
    muted: 'bg-surface-muted',
  }[tone];
  return (
    <View className={`items-center justify-center rounded-md ${bg}`} style={{ width: size, height: size }}>
      {children}
    </View>
  );
}
