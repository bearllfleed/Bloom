/**
 * 底部面板（设计规范第 8 节、动效 M15）：顶部圆角 28、抓手 36×5、遮罩墨色 30%。
 * 从底部弹簧滑入；拖动抓手区域向下可关闭；面板声明 canDismiss 为 false 时下拉会回弹。
 * 键盘弹出时整体上移；系统已经把窗口缩小的部分不再重复上移。
 */
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { overlay, type SheetSpec } from '@/stores/overlayQueue';
import { springs, timing, useMotionReduced } from '@/ui/motion';
import { useKeyboardHeight } from '@/ui/motion/useKeyboardHeight';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { radius } from '@/ui/tokens';

const CLOSE_DISTANCE = 120;
const CLOSE_VELOCITY = 900;

export function SheetView({ sheet }: { sheet: SheetSpec }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const reduced = useMotionReduced();
  const offset = useSharedValue(screenHeight);
  const scrim = useSharedValue(0);
  const keyboard = useKeyboardHeight();
  const [containerHeight, setContainerHeight] = useState(0);
  const restingHeight = useRef(0);
  if (keyboard === 0 && containerHeight > 0) restingHeight.current = containerHeight;
  const resizedBy = Math.max(0, restingHeight.current - containerHeight);
  const lift = Math.max(0, keyboard - resizedBy);

  useEffect(() => {
    offset.value = reduced ? withTiming(0, timing.reduced) : withSpring(0, springs.gentle);
    scrim.value = withTiming(1, timing.base);
  }, [offset, reduced, scrim]);

  const close = () => {
    scrim.value = withTiming(0, timing.fast);
    offset.value = withTiming(screenHeight, timing.base, () => {
      scheduleOnRN(overlay.closeSheet, sheet.id);
    });
  };

  const tryDismiss = () => {
    if (sheet.canDismiss && !sheet.canDismiss()) {
      offset.value = withSpring(0, springs.bouncy);
      return;
    }
    close();
  };

  const pan = usePanGesture({
    activeOffsetY: 6,
    onUpdate: (e) => {
      'worklet';
      offset.value = Math.max(0, e.translationY);
    },
    onDeactivate: (e) => {
      'worklet';
      if (e.translationY > CLOSE_DISTANCE || e.velocityY > CLOSE_VELOCITY) scheduleOnRN(tryDismiss);
      else offset.value = withSpring(0, springs.gentle);
    },
  });

  const panelStyle = useAnimatedStyle(() => ({ transform: [{ translateY: offset.value }] }));
  const scrimStyle = useAnimatedStyle(() => ({ opacity: scrim.value }));

  return (
    <View style={StyleSheet.absoluteFill} onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim }, scrimStyle]}>
        <Pressable accessibilityLabel="关闭" style={StyleSheet.absoluteFill} onPress={tryDismiss} />
      </Animated.View>
      <Animated.View
        accessibilityViewIsModal
        style={[
          styles.panel,
          {
            backgroundColor: colors.card,
            bottom: lift,
            paddingBottom: (lift > 0 ? 12 : insets.bottom) + 16,
            maxHeight: (containerHeight || screenHeight) - lift - insets.top - 24,
          },
          panelStyle,
        ]}
      >
        <GestureDetector gesture={pan}>
          <View style={styles.handleArea}>
            <View style={[styles.handle, { backgroundColor: colors.hairline }]} />
          </View>
        </GestureDetector>
        {sheet.render(close)}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingHorizontal: 20,
  },
  handleArea: { height: 28, alignItems: 'center', justifyContent: 'center' },
  handle: { width: 36, height: 5, borderRadius: 2.5 },
});
