/**
 * 徽章详情面板（第 3 期 3-6、动效 M21）：
 * - 已获得：200pt 徽章 + idle 动效；拖动随手指立体倾斜（最大 15°），松手弹回；点击重播弹入并触感；
 * - 未获得：静态剪影 + "还差 N 天" + 进度条 + 条件；
 * - 隐藏未获得：礼盒剪影 + 一句提示；
 * - 底部同系列横向滚动，当前高亮，点击切换。
 */
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { achievementById, SERIES } from '@/domain/achievement/catalog';
import { achievementCopy } from '@/copy/phase3';
import { haptics } from '@/platform/haptics';
import { achievementService } from '@/services/achievementService';
import { overlay } from '@/stores/overlayQueue';
import { useNewBadges } from '@/stores/achievementSignals';
import { Badge } from '@/ui/badges';
import { AppText } from '@/ui/components/AppText';
import { SheetTitle } from '@/ui/components/SheetTitle';
import { springs } from '@/ui/motion';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { radius, space } from '@/ui/tokens';

import { badgeDetail, sameSeriesBadges } from './badgeDetail';

const MAX_TILT = 15;
const SIZE = 200;

function BadgeDetail({ initialId }: { initialId: string }) {
  const { colors } = useTheme();
  const [id, setId] = useState(initialId);
  const [replayKey, setReplayKey] = useState(0);
  const dismissNew = useNewBadges((s) => s.dismiss);

  const data = achievementService.unlocked();
  const owned = new Set(data.map((unlock) => unlock.id));
  const unlock = data.find((item) => item.id === id) ?? null;
  const progress = achievementService.progress();
  const def = achievementById(id);
  const info = def
    ? badgeDetail({
        def,
        unlocked: unlock !== null,
        current: progress[def.metric] ?? null,
        unlockedAt: unlock?.unlockedAt ?? null,
      })
    : null;

  const tiltX = useSharedValue(0);
  const tiltY = useSharedValue(0);
  const tilt = useSharedValue(0);

  useEffect(() => {
    dismissNew(id);
  }, [dismissNew, id]);

  const tiltStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 600 },
      { rotateX: `${tiltX.value}deg` },
      { rotateY: `${tiltY.value}deg` },
      { scale: 1 + tilt.value * 0.02 },
    ],
  }));

  const pan = usePanGesture({
    onUpdate: (e) => {
      'worklet';
      const max = SIZE / 2;
      tiltY.value = Math.max(-MAX_TILT, Math.min(MAX_TILT, (e.translationX / max) * MAX_TILT));
      tiltX.value = Math.max(-MAX_TILT, Math.min(MAX_TILT, (-e.translationY / max) * MAX_TILT));
      tilt.value = Math.min(1, Math.hypot(tiltX.value, tiltY.value) / MAX_TILT);
    },
    onDeactivate: () => {
      'worklet';
      tiltX.value = withSpring(0, springs.bouncy);
      tiltY.value = withSpring(0, springs.bouncy);
      tilt.value = withSpring(0, springs.bouncy);
    },
  });

  if (!def || !info) return null;
  const seriesBadges = sameSeriesBadges(id);
  const series = SERIES.find((item) => item.id === def.series);
  const unlocked = unlock !== null;

  return (
    <View style={styles.root}>
      <SheetTitle title={info.name} subtitle={info.seriesLine} />
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.stage, tiltStyle]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${info.name}，${achievementCopy.replay}`}
            onPress={() => {
              haptics.light();
              setReplayKey((value) => value + 1);
            }}
          >
            <Badge
              key={`${id}-${replayKey}`}
              id={id}
              size={SIZE}
              mode={unlocked ? 'celebrate' : 'static'}
              locked={!unlocked}
              hidden={def.hidden && !unlocked}
            />
          </Pressable>
        </Animated.View>
      </GestureDetector>

      <View style={styles.body}>
        <AppText variant="body" align="center">
          {info.condition}
        </AppText>
        {info.remaining ? (
          <AppText variant="caption" tone="secondary" align="center">
            {info.remaining}
          </AppText>
        ) : null}
        {info.ratio !== null ? (
          <View style={[styles.track, { backgroundColor: colors.weak }]}>
            <View
              style={[styles.fill, { width: `${Math.round(info.ratio * 100)}%`, backgroundColor: colors.accent }]}
            />
          </View>
        ) : null}
        {info.earnedLine ? (
          <AppText variant="caption" tone="muted" align="center">
            {info.earnedLine}
          </AppText>
        ) : null}
      </View>

      {seriesBadges.length > 1 ? (
        <View style={styles.seriesBlock}>
          <AppText variant="caption" tone="secondary">
            {`${achievementCopy.sameSeries} · ${series?.name ?? ''}`}
          </AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.seriesRow}>
            {seriesBadges.map((item) => {
              const has = owned.has(item.id);
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: item.id === id }}
                  onPress={() => {
                    haptics.selection();
                    setId(item.id);
                  }}
                  style={[
                    styles.seriesCell,
                    item.id === id && { backgroundColor: colors.accentSofter, borderColor: colors.accent },
                  ]}
                >
                  <Badge id={item.id} size={46} mode="static" locked={!has} rays={false} />
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

export function openBadgeDetail(id: string): void {
  overlay.openSheet(() => <BadgeDetail initialId={id} />);
}

const styles = StyleSheet.create({
  root: { gap: space.md, paddingBottom: space.sm },
  stage: { alignSelf: 'center' },
  body: { alignItems: 'center', gap: space.xs, paddingHorizontal: space.md },
  track: { height: 8, borderRadius: 4, alignSelf: 'stretch', overflow: 'hidden', marginTop: space.xs },
  fill: { height: '100%', borderRadius: 4 },
  seriesBlock: { gap: space.xs, marginTop: space.sm },
  seriesRow: { gap: space.sm, paddingVertical: space.xs },
  seriesCell: {
    width: 62,
    height: 62,
    borderRadius: radius.small,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
