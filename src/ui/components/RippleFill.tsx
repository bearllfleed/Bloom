/**
 * 圆形扩散底色（动效 M02 的卡片部分）：完成打卡时，从花苞按钮中心向外铺满项目浅色；撤销时收回。
 * 放在卡片内部最底层，卡片需要 overflow: hidden。
 */
import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { curves, useMotionReduced } from '@/ui/motion';
import { duration } from '@/ui/tokens';

export interface RippleFillProps {
  filled: boolean;
  color: string;
  /** 扩散中心（相对卡片左上角） */
  originX: number;
  originY: number;
  /** 卡片对角线长度，决定最终半径 */
  reach: number;
}

export function RippleFill({ filled, color, originX, originY, reach }: RippleFillProps) {
  const reduced = useMotionReduced();
  const progress = useSharedValue(filled ? 1 : 0);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    progress.value = withTiming(filled ? 1 : 0, {
      duration: reduced ? duration.reduced : filled ? duration.slow : duration.base,
      easing: filled ? curves.enter : curves.exit,
    });
  }, [filled, progress, reduced]);

  const size = reach * 2;
  const style = useAnimatedStyle(() =>
    reduced
      ? { opacity: progress.value, transform: [{ scale: 1 }] }
      : { opacity: progress.value > 0 ? 1 : 0, transform: [{ scale: progress.value }] },
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: reach,
            left: originX - reach,
            top: originY - reach,
            backgroundColor: color,
          },
          style,
        ]}
      />
    </View>
  );
}
