import { Pressable, type PressableProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { motion } from '../tokens';

export type PressableScaleProps = PressableProps & {
  /** Layout classes for the touch target. Visual styling belongs to the children. */
  className?: string;
  /** Scale while pressed; subtle by default. */
  pressedScale?: number;
};

/** Pressable with a soft spring "give" on touch. Respects reduced motion. */
export function PressableScale({
  className,
  pressedScale = 0.97,
  children,
  style,
  onPressIn,
  onPressOut,
  ...rest
}: PressableScaleProps) {
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  return (
    <Pressable
      onPressIn={(e) => {
        if (!reduceMotion) scale.set(withSpring(pressedScale, motion.spring));
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.set(withSpring(1, motion.spring));
        onPressOut?.(e);
      }}
      className={className}
      style={style}
      {...rest}
    >
      {(state) => (
        <Animated.View style={animatedStyle}>
          {typeof children === 'function' ? children(state) : children}
        </Animated.View>
      )}
    </Pressable>
  );
}
