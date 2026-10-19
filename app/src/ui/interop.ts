import { cssInterop } from 'nativewind';
import Animated from 'react-native-reanimated';

// Allow `className` on Reanimated views.
cssInterop(Animated.View, { className: 'style' });
