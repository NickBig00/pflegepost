import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemeScope, useTheme } from '../theme';
import { motion, radius } from '../tokens';
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

  const { colors, shadows } = useTheme();
  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdrop.get() * 0.45 }));
  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.get() }] }));

  if (!mounted) return null;

  // Animated views get plain styles only: class-based colours are dropped on
  // animated views on device, which made the sheet transparent on Android.
  return (
    <Modal
      transparent
      visible
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
      animationType="none"
    >
      {/* A Modal is its own window: it needs its own safe-area provider on Android. */}
      <SafeAreaProvider>
        <ThemeScope>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <Animated.View
              style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }, backdropStyle]}
            >
              <Pressable
                style={{ flex: 1 }}
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Schließen"
              />
            </Animated.View>
            <View style={{ flex: 1, justifyContent: 'flex-end' }} pointerEvents="box-none">
              <Animated.View
                accessibilityViewIsModal
                style={[
                  {
                    width: '100%',
                    maxWidth: 640,
                    alignSelf: 'center',
                    borderTopLeftRadius: radius.xl,
                    borderTopRightRadius: radius.xl,
                    backgroundColor: colors.surfaceRaised,
                    boxShadow: shadows.floating,
                  },
                  sheetStyle,
                ]}
              >
                <SheetContent pan={pan} title={title} description={description}>
                  {children}
                </SheetContent>
              </Animated.View>
            </View>
          </GestureHandlerRootView>
        </ThemeScope>
      </SafeAreaProvider>
    </Modal>
  );
}

function SheetContent({
  pan,
  title,
  description,
  children,
}: {
  pan: ReturnType<typeof Gesture.Pan>;
  title?: string;
  description?: string;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  return (
    <View style={{ paddingBottom: Math.max(insets.bottom, 16) + 12 }}>
      <GestureDetector gesture={pan}>
        <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 8 }}>
          <View style={{ width: 40, height: 6, borderRadius: 3, backgroundColor: colors.borderStrong }} />
        </View>
      </GestureDetector>
      <View style={{ gap: 20, paddingHorizontal: 20, paddingTop: 8 }}>
        {title || description ? (
          <View style={{ gap: 6 }}>
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
    </View>
  );
}
