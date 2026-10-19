import { router } from 'expo-router';
import { FileUp, ScanLine, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LetterThumbnail } from '@/features/capture/LetterThumbnail';
import { Chip, haptics, Icon, IconButton, Text, useTheme } from '@/ui';

// Simulated document scanner. The real native scanner replaces this in milestone 2.

const DETECT_AFTER_MS = 1200;

function Corner({ position, color }: { position: 'tl' | 'tr' | 'bl' | 'br'; color: string }) {
  const size = 28;
  const t = 3;
  const top = position[0] === 't';
  const left = position[1] === 'l';
  return (
    <View
      style={{
        position: 'absolute',
        width: size,
        height: size,
        [top ? 'top' : 'bottom']: -12,
        [left ? 'left' : 'right']: -12,
        borderColor: color,
        borderTopWidth: top ? t : 0,
        borderBottomWidth: top ? 0 : t,
        borderLeftWidth: left ? t : 0,
        borderRightWidth: left ? 0 : t,
        [`border${top ? 'Top' : 'Bottom'}${left ? 'Left' : 'Right'}Radius`]: 10,
      }}
    />
  );
}

export default function CameraScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [detected, setDetected] = useState(false);
  const flash = useSharedValue(0);
  const flashStyle = useAnimatedStyle(() => ({ opacity: flash.get() }));

  useEffect(() => {
    const t = setTimeout(() => {
      setDetected(true);
      haptics.select();
    }, DETECT_AFTER_MS);
    return () => clearTimeout(t);
  }, []);

  const capture = () => {
    haptics.tap();
    flash.set(withSequence(withTiming(0.9, { duration: 80 }), withTiming(0, { duration: 220 })));
    setTimeout(() => router.replace('/erfassen/analyse'), 260);
  };

  const cornerColor = detected ? colors.primarySoft : colors.onCamera;

  return (
    <View className="flex-1" style={{ backgroundColor: colors.camera, paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-5 pt-2">
        <IconButton icon={X} variant="camera" accessibilityLabel="Schließen" onPress={() => router.back()} />
        <Text variant="calloutStrong" tone="onCamera" className="opacity-80">
          Seite 1
        </Text>
        <View className="w-11" />
      </View>

      <View className="flex-1 items-center justify-center gap-8 px-10">
        <View>
          <LetterThumbnail width={220} />
          <Corner position="tl" color={cornerColor} />
          <Corner position="tr" color={cornerColor} />
          <Corner position="bl" color={cornerColor} />
          <Corner position="br" color={cornerColor} />
        </View>
        <View className="min-h-[64px] items-center gap-3">
          {detected ? (
            <Animated.View entering={FadeIn.duration(250)}>
              <Chip label="Brief erkannt" icon={ScanLine} tone="primary" />
            </Animated.View>
          ) : null}
          <Text variant="body" tone="onCamera" className="text-center" accessibilityLiveRegion="polite">
            {detected ? 'Gut so – jetzt auslösen.' : 'Halte das Handy ruhig über den Brief.'}
          </Text>
        </View>
      </View>

      <View className="items-center gap-4" style={{ paddingBottom: Math.max(insets.bottom, 16) + 12 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Foto aufnehmen"
          accessibilityHint="Der Brief wird danach gelesen"
          onPress={capture}
        >
          {({ pressed }) => (
            <View
              className="h-[78px] w-[78px] items-center justify-center rounded-full border-4"
              style={{ borderColor: colors.onCamera }}
            >
              <View
                className="h-[62px] w-[62px] rounded-full"
                style={{ backgroundColor: colors.onCamera, opacity: pressed ? 0.7 : 1 }}
              />
            </View>
          )}
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="PDF importieren"
          onPress={() => router.replace('/erfassen/analyse')}
          className="min-h-[44px] flex-row items-center gap-2 px-4"
        >
          <Icon icon={FileUp} size={18} color="onCamera" />
          <Text variant="calloutStrong" tone="onCamera">
            PDF importieren
          </Text>
        </Pressable>
      </View>

      <Animated.View
        pointerEvents="none"
        className="absolute inset-0"
        style={[{ backgroundColor: colors.onCamera }, flashStyle]}
      />
    </View>
  );
}
