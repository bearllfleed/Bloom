/**
 * 成就馆（第 3 期 3-5）：收集进度、花藤、最近获得、筛选与 12 个系列的三列虚拟化网格。
 * 徽章为静态模式，滚动不启动循环动画；新徽章右上角莓果圆点，打开详情后消失。
 */
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, SectionList, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ACHIEVEMENTS, type AchievementDef, type SeriesDef } from '@/domain/achievement/catalog';
import {
  badgeProgressLabel,
  galleryCounts,
  seriesGroups,
  seriesProgress,
  type GalleryFilter,
} from '@/domain/achievement/presentation';
import { achievementCopy } from '@/copy/phase3';
import { useCommitPerfTrace } from '@/features/common/useCommitPerfTrace';
import { useLiveQuery } from '@/features/common/useLiveQuery';
import { achievementService } from '@/services/achievementService';
import { useNewBadges } from '@/stores/achievementSignals';
import { usePrefs } from '@/stores/prefsStore';
import { Badge } from '@/ui/badges';
import { AppText } from '@/ui/components/AppText';
import { DotPaper } from '@/ui/components/DotPaper';
import { EmptyState } from '@/ui/components/EmptyState';
import { SegmentedControl } from '@/ui/components/SegmentedControl';
import { StickerCard } from '@/ui/components/StickerCard';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { inset, space } from '@/ui/tokens';

import { openBadgeDetail } from './BadgeDetailSheet';
import { VineProgress } from './VineProgress';

const FILTERS: readonly { value: GalleryFilter; label: string }[] = [
  { value: 'all', label: achievementCopy.all },
  { value: 'owned', label: achievementCopy.owned },
  { value: 'locked', label: achievementCopy.locked },
];

interface GallerySection {
  series: SeriesDef;
  ownedCount: number;
  totalCount: number;
  data: AchievementDef[][];
}

function badgeRows(badges: readonly AchievementDef[]): AchievementDef[][] {
  const rows: AchievementDef[][] = [];
  for (let index = 0; index < badges.length; index += 3) rows.push(badges.slice(index, index + 3));
  return rows;
}

export function AchievementGallery() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ focus?: string }>();
  const [filter, setFilter] = useState<GalleryFilter>('all');
  const newIds = useNewBadges((state) => state.ids);
  const weekStart = usePrefs((state) => state.weekStart);
  const dayEndHour = usePrefs((state) => state.dayEndHour);
  const startAchievementTrace = useCommitPerfTrace('interaction.achievement', filter);

  const data = useLiveQuery(
    () => achievementService.gallerySnapshot(),
    [weekStart, dayEndHour],
    ['projects', 'checkins', 'moods', 'achievements', 'clock'],
  );
  const { owned, unlocks, progress } = data;

  const counts = galleryCounts(ACHIEVEMENTS, owned);
  const groups = useMemo(() => seriesGroups(ACHIEVEMENTS, owned, filter), [owned, filter]);
  const sections = useMemo<GallerySection[]>(
    () =>
      groups.map((group) => {
        const seriesCounts = seriesProgress(ACHIEVEMENTS, owned, group.series.id);
        return {
          series: group.series,
          ownedCount: seriesCounts.owned,
          totalCount: seriesCounts.total,
          data: badgeRows(group.badges),
        };
      }),
    [groups, owned],
  );
  const recent = unlocks.slice(-3).reverse();

  // 从弹窗“去成就馆看看”过来时，直接打开这枚徽章的详情
  const focused = useRef(false);
  useEffect(() => {
    if (focused.current || !params.focus) return;
    focused.current = true;
    if (ACHIEVEMENTS.some((definition) => definition.id === params.focus)) openBadgeDetail(params.focus);
  }, [params.focus]);

  const pageWidth = Math.min(width, 560) - inset.page * 2;
  const cell = (pageWidth - space.md * 2) / 3;

  return (
    <DotPaper style={{ paddingTop: insets.top }}>
      <SectionList<AchievementDef[], GallerySection>
        sections={sections}
        keyExtractor={(row) => row.map((definition) => definition.id).join(':')}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 96 }]}
        ListHeaderComponent={
          <View style={styles.listHeader}>
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
                        accessibilityLabel={ACHIEVEMENTS.find((definition) => definition.id === unlock.id)?.name}
                        onPress={() => openBadgeDetail(unlock.id)}
                      >
                        <Badge id={unlock.id} size={44} mode="static" rays={false} />
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : null}
            </StickerCard>

            <SegmentedControl
              options={FILTERS}
              value={filter}
              onChange={(next) => {
                startAchievementTrace();
                setFilter(next);
              }}
            />
          </View>
        }
        ListEmptyComponent={<EmptyState message={achievementCopy.emptyGallery} mood="expectant" pose="seed" />}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <AppText variant="title3">
              {achievementCopy.seriesTitle(section.series.name, section.ownedCount, section.totalCount)}
            </AppText>
          </View>
        )}
        renderItem={({ item: row }) => (
          <View style={styles.grid}>
            {row.map((definition) => {
              const unlocked = owned.has(definition.id);
              const current = progress[definition.metric] ?? null;
              const hint =
                badgeProgressLabel(definition, current, unlocked) ?? (unlocked ? null : definition.condition);
              return (
                <Pressable
                  key={definition.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${definition.name}，${unlocked ? achievementCopy.owned : achievementCopy.locked}`}
                  onPress={() => openBadgeDetail(definition.id)}
                  style={[styles.cell, { width: cell }]}
                >
                  <View>
                    <Badge
                      id={definition.id}
                      size={Math.min(88, cell - 8)}
                      mode="static"
                      locked={!unlocked}
                      rays={false}
                    />
                    {newIds.includes(definition.id) ? (
                      <View style={[styles.newDot, { backgroundColor: colors.accent }]} />
                    ) : null}
                  </View>
                  <AppText variant="caption" align="center" numberOfLines={1} tone={unlocked ? 'primary' : 'secondary'}>
                    {unlocked ? definition.name : definition.hidden ? achievementCopy.mystery : definition.name}
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
        )}
      />
    </DotPaper>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: inset.page, paddingTop: space.sm },
  listHeader: { gap: space.lg, marginBottom: space.sm },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  collectTop: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: space.xs },
  recent: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.xs },
  recentList: { flexDirection: 'row', gap: space.sm },
  sectionHeader: { paddingTop: space.lg, paddingBottom: space.sm },
  grid: { flexDirection: 'row', columnGap: space.md, paddingBottom: space.md },
  cell: { alignItems: 'center', gap: 2 },
  newDot: { position: 'absolute', right: 2, top: 2, width: 8, height: 8, borderRadius: 4 },
});
