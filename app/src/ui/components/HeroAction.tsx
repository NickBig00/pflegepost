import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { haptics } from '../haptics';
import { useTheme } from '../theme';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

export type HeroActionProps = {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  onPress: () => void;
  accessibilityHint?: string;
};

/** The one big main action of a screen, e.g. "Brief erfassen". */
export function HeroAction({ icon, title, subtitle, onPress, accessibilityHint }: HeroActionProps) {
  const { shadows } = useTheme();
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint ?? subtitle}
      pressedScale={0.98}
      onPress={() => {
        haptics.tap();
        onPress();
      }}
    >
      {({ pressed }) => (
        <View
          className={`min-h-[96px] flex-row items-center gap-4 rounded-xl bg-primary px-5 py-5 ${
            pressed ? 'opacity-95' : ''
          }`}
          style={{ boxShadow: shadows.raised }}
        >
          <View className="h-14 w-14 items-center justify-center rounded-full bg-on-primary/15">
            <Icon icon={icon} size={26} color="onPrimary" strokeWidth={2} />
          </View>
          <View className="flex-1 gap-1">
            <Text variant="title3" tone="onPrimary">
              {title}
            </Text>
            <Text variant="callout" tone="onPrimary" className="opacity-90">
              {subtitle}
            </Text>
          </View>
          <Icon icon={ChevronRight} size={22} color="onPrimary" strokeWidth={2} />
        </View>
      )}
    </PressableScale>
  );
}
