import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from './Text';

export type ScreenProps = {
  /** Large title at the top of the content. */
  title?: string;
  /** Small line above the title, e.g. the case name "Für Mama". */
  eyebrow?: string;
  /** Element at the right of the title row (avatar, icon button). */
  headerAccessory?: ReactNode;
  children: ReactNode;
  /** Sticky area for the screen's one main action. */
  footer?: ReactNode;
  scroll?: boolean;
};

/** Page frame: canvas background, safe areas, 20-pt gutters, readable max width. */
export function Screen({ title, eyebrow, headerAccessory, children, footer, scroll = true }: ScreenProps) {
  const insets = useSafeAreaInsets();

  const header =
    title || eyebrow ? (
      <View className="flex-row items-end gap-3 pb-2 pt-4">
        <View className="flex-1 gap-1">
          {eyebrow ? (
            <Text variant="eyebrow" tone="subtle">
              {eyebrow}
            </Text>
          ) : null}
          {title ? <Text variant="title1">{title}</Text> : null}
        </View>
        {headerAccessory}
      </View>
    ) : null;

  const body = (
    <View className="w-full max-w-[640px] gap-6 self-center px-5">
      {header}
      {children}
    </View>
  );

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={{ paddingBottom: footer ? 24 : insets.bottom + 32 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {body}
        </ScrollView>
      ) : (
        <View className="flex-1">{body}</View>
      )}
      {footer ? (
        <View
          className="w-full max-w-[640px] gap-3 self-center px-5 pt-3"
          style={{ paddingBottom: Math.max(insets.bottom, 16) + 8 }}
        >
          {footer}
        </View>
      ) : null}
    </View>
  );
}
