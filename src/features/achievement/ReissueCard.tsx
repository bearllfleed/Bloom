/**
 * 补发徽章卡（第 3 期 3-4）：首次升级、导入备份或一次结算出 ≥5 枚时使用。
 * 朵朵撒花 + 一句感谢 + 前 5 枚依次弹入，多出的显示 +N。
 * 去成就馆看看：把这一卡全部标为已看并跳转；收下啦：关闭并继续队列。
 */
import { useEffect } from 'react';
import { BackHandler, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';

import { achievementById } from '@/domain/achievement/catalog';
import { achievementCopy } from '@/copy/phase3';
import { haptics } from '@/platform/haptics';
import { Badge } from '@/ui/badges';
import { AppText } from '@/ui/components/AppText';
import { CandyButton } from '@/ui/components/CandyButton';
import { DotPaper } from '@/ui/components/DotPaper';
import { Duoduo } from '@/ui/illustrations/Duoduo';
import { useMotionReduced } from '@/ui/motion';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { radius, shadow, space } from '@/ui/tokens';

const PREVIEW_COUNT = 5;

export interface ReissueCardProps {
  ids: readonly string[];
  onAccept: () => void;
  onVisitMuseum: () => void;
}

export function ReissueCard({ ids, onAccept, onVisitMuseum }: ReissueCardProps) {
  const { colors } = useTheme();
  const reduced = useMotionReduced();
  const { width } = useWindowDimensions();
  const preview = ids.slice(0, PREVIEW_COUNT);
  const extra = ids.length - preview.length;
  const badgeSize = Math.min(56, Math.floor((Math.min(width, 340) - 80) / PREVIEW_COUNT));

  useEffect(() => {
    haptics.success();
  }, []);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onAccept();
      return true;
    });
    return () => sub.remove();
  }, [onAccept]);

  return (
    <View style={[StyleSheet.absoluteFill, styles.center]}>
      <Animated.View
        entering={FadeIn.duration(reduced ? 160 : 200)}
        style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim }]}
      />
      <Animated.View
        entering={reduced ? FadeIn.duration(160) : FadeInDown.duration(280)}
        accessibilityViewIsModal
        style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.shadow }]}
      >
        <DotPaper style={StyleSheet.absoluteFill} />
        <Duoduo size={104} mood="cheer" pose="seed" />
        <AppText variant="title2" align="center">
          {achievementCopy.reissueTitle}
        </AppText>
        <AppText variant="body" tone="secondary" align="center">
          {achievementCopy.reissueCount(ids.length)}
        </AppText>
        <View style={styles.badges}>
          {preview.map((id, index) => {
            const def = achievementById(id);
            if (!def) return null;
            return (
              <Animated.View
                key={id}
                entering={
                  reduced
                    ? undefined
                    : ZoomIn.delay(200 + index * 80)
                        .springify()
                        .damping(12)
                }
                accessibilityLabel={def.name}
              >
                <Badge id={id} size={badgeSize} mode="static" rays={false} />
              </Animated.View>
            );
          })}
          {extra > 0 ? (
            <AppText variant="caption" tone="secondary" style={styles.extra}>
              +{extra}
            </AppText>
          ) : null}
        </View>
        <View style={styles.actions}>
          <CandyButton label={achievementCopy.visit} onPress={onVisitMuseum} />
          <Pressable accessibilityRole="button" onPress={onAccept} hitSlop={8} style={styles.accept}>
            <AppText variant="callout" tone="link">
              {achievementCopy.accept}
            </AppText>
          </Pressable>
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
    gap: space.md,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: shadow.overlay.offsetY },
    shadowRadius: shadow.overlay.blur / 2,
    shadowOpacity: shadow.overlay.opacity,
    elevation: 8,
  },
  badges: { flexDirection: 'row', alignItems: 'center', gap: space.xs, marginVertical: space.xs },
  extra: { marginLeft: 2 },
  actions: { alignSelf: 'stretch', gap: space.sm },
  accept: { alignSelf: 'center', paddingVertical: space.xs },
});
