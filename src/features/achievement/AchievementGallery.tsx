/**
 * 成就馆（第 3 期 3-5）：收集进度、花藤、最近获得、筛选与 12 个系列的三列静态网格。
 * 徽章为静态模式，滚动不启动循环动画；新徽章右上角莓果圆点，打开详情后消失。
 */
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ACHIEVEMENTS } from '@/domain/achievement/catalog';
import { badgeProgressLabel, galleryCounts, seriesGroups, type GalleryFilter } from '@/domain/achievement/presentation';
import { achievementCopy } from '@/copy/phase3';
import { useLiveQuery } from '@/features/common/useLiveQuery';
import { achievementService } from '@/services/achievementService';
import { useNewBadges } from '@/stores/achievementSignals';
import { Badge } from '@/ui/badges';
import { AppText } from '@/ui/components/AppText';
import { DotPaper } from '@/ui/components/DotPaper';
import { EmptyState } from '@/ui/components/EmptyState';
import { SegmentedControl } from '@/ui/components/SegmentedControl';
import { StickerCard } from '@/ui/components/StickerCard';
import { useMotionReduced } from '@/ui/motion';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { inset, space } from '@/ui/tokens';

import { openBadgeDetail } from './BadgeDetailSheet';
import { VineProgress } from './VineProgress';

const FILTERS: readonly { value: GalleryFilter; label: string }[] = [
  { value: 'all', label: achievementCopy.all },
  { value: 'owned', label: achievementCopy.owned },
  { value: 'locked', label: achievementCopy.locked },
];

export function AchievementGallery() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const reduced = useMotionReduced();
  const params = useLocalSearchParams<{ focus?: string }>();
  const [filter, setFilter] = useState<GalleryFilter>('all');
  const newIds = useNewBadges((s) => s.ids);

  const data = useLiveQuery(() => {
    const unlocks = achievementService.unlocked();
    return { unlocks, owned: new Set(unlocks.map((unlock) => unlock.id)), progress: achievementService.progress() };
  }, []);
  const { owned, unlocks, progress } = data;

  const counts = galleryCounts(ACHIEVEMENTS, owned);
  const groups = useMemo(() => seriesGroups(ACHIEVEMENTS, owned, filter), [owned, filter]);
  const recent = unlocks.slice(-3).reverse();

  // 从弹窗"去成就馆看看"过来时，直接打开这枚徽章的详情
  const focused = useRef(false);
  useEffect(() => {
    if (focused.current || !params.focus) return;
    focused.current = true;
    if (ACHIEVEMENTS.some((def) => def.id === params.focus)) openBadgeDetail(params.focus);
  }, [params.focus]);

  const pageWidth = Math.min(width, 560) - inset.page * 2;
  const cell = (pageWidth - space.md * 2) / 3;

  return (
    <DotPaper style={{ paddingTop: insets.top }}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <AppText variant="title1" accessibilityRole="header">
            {achievementCopy.title}
          </AppText>
        </View>

        <StickerCard>
          <View style={styles.collectTop}>
            <AppText variant="numberM">{achievementCopy.collected(counts.owned, counts.total)}</AppText>
            <AppText variant="caption" tone="secondary">
              {`${Math.round(counts.ratio * 100)}%`}
            </AppText>
          </View>
          <VineProgress ratio={counts.ratio} width={pageWidth - inset.card * 2} />
          {recent.length > 0 ? (
            <View style={styles.recent}>
              <AppText variant="caption" tone="secondary">
                {achievementCopy.recent}
              </AppText>
              <View style={styles.recentList}>
                {recent.map((unlock) => (
                  <Pressable
                    key={unlock.id}
                    accessibilityRole="button"
                    accessibilityLabel={ACHIEVEMENTS.find((def) => def.id === unlock.id)?.name}
                    onPress={() => openBadgeDetail(unlock.id)}
                  >
                    <Badge id={unlock.id} size={44} mode="static" rays={false} />
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}
        </StickerCard>

        <SegmentedControl options={FILTERS} value={filter} onChange={setFilter} />

        {groups.length === 0 ? (
          <EmptyState message={achievementCopy.emptyGallery} mood="expectant" pose="seed" />
        ) : null}

        {groups.map((group, groupIndex) => {
          const ownedInSeries = group.badges.filter((def) => owned.has(def.id)).length;
          const totalInSeries = ACHIEVEMENTS.filter((def) => def.series === group.series.id).length;
          const body = (
            <View style={styles.section}>
              <AppText variant="title3">
                {achievementCopy.seriesTitle(group.series.name, ownedInSeries, totalInSeries)}
              </AppText>
              <View style={styles.grid}>
                {group.badges.map((def) => {
                  const unlocked = owned.has(def.id);
                  const current = progress[def.metric] ?? null;
                  const hint = badgeProgressLabel(def, current, unlocked) ?? (unlocked ? null : def.condition);
                  return (
                    <Pressable
                      key={def.id}
                      accessibilityRole="button"
                      accessibilityLabel={`${def.name}，${unlocked ? achievementCopy.owned : achievementCopy.locked}`}
                      onPress={() => openBadgeDetail(def.id)}
                      style={[styles.cell, { width: cell }]}
                    >
                      <View>
                        <Badge
                          id={def.id}
                          size={Math.min(88, cell - 8)}
                          mode="static"
                          locked={!unlocked}
                          rays={false}
                        />
                        {newIds.includes(def.id) ? (
                          <View style={[styles.newDot, { backgroundColor: colors.accent }]} />
                        ) : null}
                      </View>
                      <AppText
                        variant="caption"
                        align="center"
                        numberOfLines={1}
                        tone={unlocked ? 'primary' : 'secondary'}
                      >
                        {unlocked ? def.name : def.hidden ? achievementCopy.mystery : def.name}
                      </AppText>
                      {hint ? (
                        <AppText variant="micro" tone="muted" align="center" numberOfLines={1}>
                          {hint}
                        </AppText>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
          const animate = !reduced && groupIndex < 6;
          return animate ? (
            <Animated.View key={group.series.id} entering={FadeInDown.delay(groupIndex * 40).duration(240)}>
              {body}
            </Animated.View>
          ) : (
            <View key={group.series.id}>{body}</View>
          );
        })}

        <View style={{ height: insets.bottom + 96 }} />
      </ScrollView>
    </DotPaper>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: inset.page, paddingTop: space.sm, gap: space.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  collectTop: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: space.xs },
  recent: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.xs },
  recentList: { flexDirection: 'row', gap: space.sm },
  section: { gap: space.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: space.md },
  cell: { alignItems: 'center', gap: 2 },
  newDot: { position: 'absolute', right: 2, top: 2, width: 8, height: 8, borderRadius: 4 },
});
