import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemeScope, useTheme } from '../theme';
import { motion } from '../tokens';
import { Text } from './Text';

export type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  /** One calm sentence under the title. */
  description?: string;
  children: ReactNode;
};

const OFFSCREEN = 800;
const DISMISS_DISTANCE = 120;

/** Modal sheet from the bottom. Close by drag, backdrop tap or system back. */
export function BottomSheet({ visible, onClose, title, description, children }: BottomSheetProps) {
  const [mounted, setMounted] = useState(visible);
  const translateY = useSharedValue(OFFSCREEN);
  const backdrop = useSharedValue(0);

  // Mount immediately when opened; unmount only after the exit animation.
  if (visible && !mounted) setMounted(true);

  useEffect(() => {
    if (visible) {
      backdrop.set(withTiming(1, { duration: motion.base }));
      translateY.set(withSpring(0, motion.spring));
    } else if (mounted) {
      backdrop.set(withTiming(0, { duration: motion.fast }));
      translateY.set(
        withTiming(OFFSCREEN, { duration: motion.base, easing: Easing.in(Easing.cubic) }, (finished) => {
          if (finished) runOnJS(setMounted)(false);
        }),
      );
    }
  }, [visible, mounted, backdrop, translateY]);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY(8)
        .onUpdate((e) => {
          translateY.set(Math.max(0, e.translationY));
        })
        .onEnd((e) => {
          if (e.translationY > DISMISS_DISTANCE || e.velocityY > 900) {
            runOnJS(onClose)();
          } else {
            translateY.set(withSpring(0, motion.spring));
          }
        }),
    [translateY, onClose],
  );

  const insets = useSafeAreaInsets();
  const { colors, shadows } = useTheme();
  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdrop.get() * 0.45 }));
  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.get() }] }));

  if (!mounted) return null;

  return (
    <Modal
      transparent
      visible
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
      animationType="none"
    >
      <ThemeScope>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Animated.View
            className="absolute inset-0"
            style={[{ backgroundColor: colors.overlay }, backdropStyle]}
          >
            <Pressable
              className="flex-1"
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Schließen"
            />
          </Animated.View>
          <View className="flex-1 justify-end" pointerEvents="box-none">
            <Animated.View
              accessibilityViewIsModal
              className="w-full max-w-[640px] self-center rounded-t-xl"
              style={[
                sheetStyle,
                {
                  backgroundColor: colors.surfaceRaised,
                  boxShadow: shadows.floating,
                  paddingBottom: Math.max(insets.bottom, 16) + 8,
                },
              ]}
            >
              <GestureDetector gesture={pan}>
                <View className="items-center pb-2 pt-3">
                  <View className="h-1.5 w-10 rounded-full bg-border-strong" />
                </View>
              </GestureDetector>
              <View className="gap-5 px-5 pt-2">
                {title || description ? (
                  <View className="gap-1.5">
                    {title ? <Text variant="title2">{title}</Text> : null}
                    {description ? (
                      <Text variant="callout" tone="muted">
                        {description}
                      </Text>
                    ) : null}
                  </View>
                ) : null}
                {children}
              </View>
            </Animated.View>
          </View>
        </GestureHandlerRootView>
      </ThemeScope>
    </Modal>
  );
}
