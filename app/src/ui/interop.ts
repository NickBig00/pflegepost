import { cssInterop } from 'nativewind';
import Animated from 'react-native-reanimated';

// Allow `className` on Reanimated views – for layout only. Token colors
// (CSS variables) do not resolve on animated views on native, so animated
// components take colors from useTheme() via `style`.
cssInterop(Animated.View, { className: 'style' });
