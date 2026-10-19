import { Check } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { haptics } from '../haptics';
import { useTheme } from '../theme';
import { motion } from '../tokens';
import { Icon } from './Icon';
import { Text } from './Text';

export type CheckRowProps = {
  label: string;
  description?: string;
  checked: boolean;
  onToggle: () => void;
  /** Extra element under the label, e.g. an assignee chip. */
  children?: ReactNode;
};

/** A row the user ticks to confirm a suggestion. */
export function CheckRow({ label, description, checked, onToggle, children }: CheckRowProps) {
  const { colors } = useTheme();
  return (
    <View className="flex-row gap-3.5">
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        accessibilityLabel={label}
        hitSlop={10}
        onPress={() => {
          haptics.select();
          onToggle();
        }}
        className="pt-0.5"
      >
        <View
          className={`h-7 w-7 items-center justify-center rounded-md ${checked ? '' : 'border-2 border-border-strong'}`}
        >
          {checked ? (
            <Animated.View
              entering={ZoomIn.duration(motion.fast)}
              className="h-7 w-7 items-center justify-center rounded-md"
              style={{ backgroundColor: colors.primary }}
            >
              <Icon icon={Check} size={18} color="onPrimary" strokeWidth={2.75} />
            </Animated.View>
          ) : null}
        </View>
      </Pressable>
      <View className="flex-1 gap-2">
        <Pressable onPress={onToggle} accessible={false}>
          <Text variant="body" tone={checked ? 'default' : 'muted'}>
            {label}
          </Text>
          {description ? (
            <Text variant="callout" tone="muted">
              {description}
            </Text>
          ) : null}
        </Pressable>
        {children}
      </View>
    </View>
  );
}
