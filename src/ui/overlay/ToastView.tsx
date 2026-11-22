/**
 * 撤销条（设计规范第 8 节、动效 M14）：标签栏上方，墨色底白字，右侧柠檬色"撤销"。
 * 出现时从下方 12px 上滑并由 -1° 转正；到时自动淡出；新的替换旧的。
 */
import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { FadeOut, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { overlay, type ToastSpec } from '@/stores/overlayQueue';
import { AppText } from '@/ui/components/AppText';
import { springs, timing, useMotionReduced } from '@/ui/motion';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { inset, radius } from '@/ui/tokens';

/** 标签栏高度（不含安全区），撤销条贴在它上方 */
const TAB_BAR_HEIGHT = 64;

export function ToastView({ toast }: { toast: ToastSpec }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const reduced = useMotionReduced();
  const enter = useSharedValue(0);

  useEffect(() => {
    enter.value = 0;
    enter.value = reduced ? withTiming(1, timing.reduced) : withSpring(1, springs.gentle);
    const timer = setTimeout(() => overlay.hideToast(toast.id), toast.durationMs);
    return () => clearTimeout(timer);
  }, [enter, reduced, toast.durationMs, toast.id]);

  const style = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: reduced ? [] : [{ translateY: (1 - enter.value) * 12 }, { rotate: `${(1 - enter.value) * -1}deg` }],
  }));

  return (
    <Animated.View
      exiting={FadeOut.duration(160)}
      accessibilityLiveRegion="polite"
      style={[styles.root, { bottom: insets.bottom + TAB_BAR_HEIGHT + 12, backgroundColor: colors.toast }, style]}
    >
      <AppText variant="callout" color={colors.onToast} style={styles.message} numberOfLines={2}>
        {toast.message}
      </AppText>
      {toast.actionLabel ? (
        <Pressable
          accessibilityRole="button"
          hitSlop={10}
          onPress={() => {
            overlay.hideToast(toast.id);
            toast.onAction?.();
          }}
        >
          <AppText variant="callout" color={colors.toastAction} style={styles.action}>
            {toast.actionLabel}
          </AppText>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: inset.page,
    right: inset.page,
    minHeight: 48,
    borderRadius: radius.menu,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  message: { flex: 1 },
  action: { fontWeight: '600' },
});
