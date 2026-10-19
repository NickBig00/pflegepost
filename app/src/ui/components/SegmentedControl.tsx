import { Pressable, View } from 'react-native';

import { haptics } from '../haptics';
import { useTheme } from '../theme';
import { Text } from './Text';

export type SegmentedControlProps<T extends string> = {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: SegmentedControlProps<T>) {
  const { shadows } = useTheme();
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      className="flex-row rounded-md bg-surface-muted p-1"
    >
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={o.label}
            onPress={() => {
              if (!selected) haptics.select();
              onChange(o.value);
            }}
            className={`min-h-[40px] flex-1 items-center justify-center rounded-sm px-3 ${
              selected ? 'bg-surface' : ''
            }`}
            style={selected ? { boxShadow: shadows.card } : undefined}
          >
            <Text variant="calloutStrong" tone={selected ? 'default' : 'muted'}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
