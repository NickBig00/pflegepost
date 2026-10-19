import { CircleCheck, Info, type LucideIcon } from 'lucide-react-native';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Pressable, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { haptics } from '../haptics';
import { useTheme } from '../theme';
import { motion, radius } from '../tokens';
import { Icon } from './Icon';
import { Text } from './Text';

type ToastTone = 'success' | 'info';

export type ToastOptions = {
  message: string;
  tone?: ToastTone;
  icon?: LucideIcon;
  /** e.g. "Rückgängig" */
  action?: { label: string; onPress: () => void };
};

type ToastState = ToastOptions & { id: number };

const ToastContext = createContext<((options: ToastOptions) => void) | null>(null);
const InsetContext = createContext<((inset: number) => void) | null>(null);

const DURATION = 3500;

/** Shows toasts at the bottom, above a tab bar when one registers its height. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const [bottomOffset, setBottomOffset] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextId = useRef(0);

  const show = useCallback((options: ToastOptions) => {
    if (timer.current) clearTimeout(timer.current);
    nextId.current += 1;
    setToast({ ...options, id: nextId.current });
    if (options.tone !== 'info') haptics.success();
    AccessibilityInfo.announceForAccessibility(options.message);
    timer.current = setTimeout(() => setToast(null), options.action ? DURATION * 1.6 : DURATION);
  }, []);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return (
    <ToastContext.Provider value={show}>
      <InsetContext.Provider value={setBottomOffset}>{children}</InsetContext.Provider>
      <View pointerEvents="box-none" className="absolute inset-x-0 bottom-0">
        {toast ? (
          <ToastView
            key={toast.id}
            toast={toast}
            bottomOffset={bottomOffset}
            onDismiss={() => setToast(null)}
          />
        ) : null}
      </View>
    </ToastContext.Provider>
  );
}

function ToastView({
  toast,
  bottomOffset,
  onDismiss,
}: {
  toast: ToastState;
  bottomOffset: number;
  onDismiss: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { colors, shadows } = useTheme();
  const tone = toast.tone ?? 'success';
  const icon = toast.icon ?? (tone === 'success' ? CircleCheck : Info);

  return (
    <Animated.View
      entering={FadeInDown.duration(motion.base)}
      exiting={FadeOutDown.duration(motion.fast)}
      style={{
        marginHorizontal: 16,
        maxWidth: 560,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderRadius: radius.lg,
        paddingVertical: 12,
        paddingLeft: 16,
        paddingRight: 8,
        marginBottom: bottomOffset + insets.bottom + 16,
        backgroundColor: colors.fg,
        boxShadow: shadows.floating,
      }}
      accessibilityLiveRegion="polite"
    >
      <Icon icon={icon} size={20} color={tone === 'success' ? 'primarySoft' : 'infoSoft'} strokeWidth={2} />
      <Text variant="calloutStrong" tone="inverse" className="flex-1 py-1">
        {toast.message}
      </Text>
      {toast.action ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={toast.action.label}
          onPress={() => {
            toast.action?.onPress();
            onDismiss();
          }}
          className="min-h-[44px] justify-center rounded-md px-3"
        >
          <Text variant="calloutStrong" tone="inverseAction">
            {toast.action.label}
          </Text>
        </Pressable>
      ) : (
        <View className="w-2" />
      )}
    </Animated.View>
  );
}

/** Keeps toasts above a bar of `inset` points while the caller is mounted. */
export function useToastBottomInset(inset: number) {
  const setInset = useContext(InsetContext);
  useEffect(() => {
    setInset?.(inset);
    return () => setInset?.(0);
  }, [inset, setInset]);
}

export function useToast() {
  const show = useContext(ToastContext);
  if (!show) throw new Error('useToast must be used inside ToastProvider');
  return show;
}
