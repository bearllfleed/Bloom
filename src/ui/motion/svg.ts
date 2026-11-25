/**
 * 可在 UI 线程驱动的 SVG 分组：用 useAnimatedProps 更新 matrix（由 partMatrix 计算）和 opacity，
 * 让同一张 SVG 里的叶子、星星、眼睛等部件单独动起来，不必每层套一个 Animated.View。
 */
import Animated from 'react-native-reanimated';
import { G } from 'react-native-svg';

export const AnimatedG = Animated.createAnimatedComponent(G);
