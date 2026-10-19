import type { LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { Button, type ButtonProps } from './Button';
import { Icon } from './Icon';
import { Text } from './Text';

export type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  message: string;
  action?: Pick<ButtonProps, 'label' | 'onPress' | 'icon'>;
};

/** Friendly empty state – always says what to do next. */
export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <View className="items-center gap-4 px-6 py-10">
      <View className="h-20 w-20 items-center justify-center rounded-full bg-primary-soft">
        <View className="h-14 w-14 items-center justify-center rounded-full bg-surface">
          <Icon icon={icon} size={26} color="primary" />
        </View>
      </View>
      <View className="items-center gap-1.5">
        <Text variant="title3" className="text-center">
          {title}
        </Text>
        <Text variant="callout" tone="muted" className="max-w-[300px] text-center">
          {message}
        </Text>
      </View>
      {action ? <Button {...action} variant="secondary" align="center" className="mt-2" /> : null}
    </View>
  );
}
