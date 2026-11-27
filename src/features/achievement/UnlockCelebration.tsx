/**
 * 徽章弹窗（第 3 期 3-3、动效 M19）：
 * 遮罩淡入 → 卡片上移放大 → 徽章弹入转正 + 成功触感 → 光芒/星星 → 文字依次淡入；
 * 底部进度点表示队列，剩余 ≥1 时提供"一次收下 N 枚"。
 * 收下啦：标为已看并关闭；去成就馆看看：标为已看并跳转成就页定位这枚徽章。
 * Android 返回键 = 收下啦；点遮罩不关闭，避免误触。
 */
import { useEffect } from 'react';
import { BackHandler, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { achievementById } from '@/domain/achievement/catalog';
import { achievementCopy } from '@/copy/phase3';
import { haptics } from '@/platform/haptics';
import { Badge } from '@/ui/badges';
import { AppText } from '@/ui/components/AppText';
import { CandyButton } from '@/ui/components/CandyButton';
import { DotPaper } from '@/ui/components/DotPaper';
import { springs, useMotionReduced } from '@/ui/motion';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { radius, shadow, space } from '@/ui/tokens';

export interface UnlockCelebrationProps {
  id: string;
  /** 队列里的位置与总数，用于进度点 */
  index: number;
  total: number;
  /** 当前弹窗之后还有几枚，按钮显示"一次收下 N 枚" */
  remaining: number;
  /** 收下并展示下一枚 */
  onAccept: () => void;
  /** 一次收下当前与剩余全部 */
  onAcceptAll: () => void;
  /** 去成就馆看看并定位到这一枚 */
  onVisitMuseum: () => void;
}

export function UnlockCelebration({
  id,
  index,
  total,
  remaining,
  onAccept,
  onAcceptAll,
  onVisitMuseum,
}: UnlockCelebrationProps) {
  const { colors } = useTheme();
  const reduced = useMotionReduced();
  const { width } = useWindowDimensions();
  const def = achievementById(id);
  const scale = useSharedValue(reduced ? 1 : 0.92);

  useEffect(() => {
    if (!reduced) scale.value = withSpring(1, springs.gentle);
    haptics.success();
  }, [reduced, scale]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onAccept();
      return true;
    });
    return () => sub.remove();
  }, [onAccept]);

  const cardStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const badgeSize = Math.min(180, width - 160);

  if (!def) return null;

  return (
    <View style={[StyleSheet.absoluteFill, styles.center]}>
      <Animated.View
        entering={FadeIn.duration(reduced ? 160 : 200)}
        style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim }]}
      />
      <Animated.View
        entering={reduced ? FadeIn.duration(160) : FadeInUp.duration(260)}
        accessibilityViewIsModal
        style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.shadow }, cardStyle]}
      >
        <DotPaper style={StyleSheet.absoluteFill} />
        <Animated.View entering={reduced ? undefined : FadeInDown.delay(200)}>
          <Badge id={id} size={badgeSize} mode="celebrate" accessibilityLabel={`新徽章：${def.name}`} />
        </Animated.View>
        <Animated.View entering={reduced ? undefined : FadeInDown.delay(650)} style={styles.text}>
          <AppText variant="title1" align="center">
            {def.name}
          </AppText>
          <AppText variant="body" tone="secondary" align="center">
            {def.condition}
          </AppText>
          <AppText variant="caption" tone="muted" align="center">
            {achievementCopy.tierLabel[def.tier]}
          </AppText>
        </Animated.View>
        <Animated.View entering={reduced ? undefined : FadeInUp.delay(720)} style={styles.actions}>
          <CandyButton label={achievementCopy.accept} onPress={onAccept} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={achievementCopy.visit}
            onPress={onVisitMuseum}
            hitSlop={8}
            style={styles.visit}
          >
            <AppText variant="callout" tone="link">
              {achievementCopy.visit}
            </AppText>
          </Pressable>
        </Animated.View>
        <View style={styles.footer}>
          {total > 1 ? (
            <View style={styles.dots} accessibilityLabel={`第 ${index + 1} 枚，共 ${total} 枚`}>
              {Array.from({ length: total }, (_, i) => (
                <View
                  key={i}
                  style={[styles.dot, { backgroundColor: i === index ? colors.accent : colors.hairline }]}
                />
              ))}
            </View>
          ) : null}
          {remaining > 0 ? (
            <Pressable accessibilityRole="button" onPress={onAcceptAll} hitSlop={8} style={styles.acceptAll}>
              <AppText variant="caption" tone="link">
                {achievementCopy.acceptAll(remaining + 1)}
              </AppText>
            </Pressable>
          ) : null}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', padding: space.xxl },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: radius.card + 8,
    paddingVertical: space.xxl,
    paddingHorizontal: space.xl,
    alignItems: 'center',
    gap: space.lg,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: shadow.overlay.offsetY },
    shadowRadius: shadow.overlay.blur / 2,
    shadowOpacity: shadow.overlay.opacity,
    elevation: 8,
  },
  text: { gap: space.xs, alignSelf: 'stretch' },
  actions: { alignSelf: 'stretch', gap: space.sm, marginTop: space.xs },
  visit: { alignSelf: 'center', paddingVertical: space.xs },
  footer: { alignItems: 'center', gap: space.sm },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  acceptAll: { paddingVertical: 2 },
});
