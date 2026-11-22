/**
 * 项目详情（第 1 期 1-6 基础版）：头卡 + 4 个数据块 + 月历 + 最近打卡。
 * "更多"菜单：暂停（或继续）/ 删除。
 */
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, type ComponentRef } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatMonthDay } from '@/domain/date';
import { detailCopy, projectsCopy } from '@/copy/project';
import { useLiveQuery } from '@/features/common/useLiveQuery';
import { ProjectCalendar } from '@/features/detail/ProjectCalendar';
import { recordTimeLabel } from '@/features/history/recordActions';
import { deleteProject, pauseProject, resumeProject } from '@/features/projects/projectActions';
import { clock } from '@/platform/clock';
import { getProjectSummary, getRecentRecords } from '@/services/queries';
import { overlay, type MenuItem } from '@/stores/overlayQueue';
import { usePrefs } from '@/stores/prefsStore';
import { AppText } from '@/ui/components/AppText';
import { DotPaper } from '@/ui/components/DotPaper';
import { EmptyState } from '@/ui/components/EmptyState';
import { projectColorOf } from '@/ui/components/ProjectBadge';
import { StatTile } from '@/ui/components/StatTile';
import { StickerCard } from '@/ui/components/StickerCard';
import { RoundIconButton, TopBar } from '@/ui/components/TopBar';
import { Icon } from '@/ui/icons/Icon';
import { ProjectIcon } from '@/ui/icons/ProjectIcon';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { inset, radius, space } from '@/ui/tokens';

function unitOf(unit: string, projectUnit: string): string {
  if (unit === 'week') return '周';
  if (unit === 'month') return '月';
  if (unit === 'times') return projectUnit;
  return '天';
}

export default function ProjectDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const weekStart = usePrefs((s) => s.weekStart);
  const summary = useLiveQuery(() => getProjectSummary(id), [id]);
  const recent = useLiveQuery(() => getRecentRecords(id, 5), [id]);
  const moreAnchor = useRef<ComponentRef<typeof View>>(null);

  if (!summary) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <TopBar onBack={() => router.back()} />
        <EmptyState message="这个项目找不到了" mood="puzzled" />
      </View>
    );
  }
  const { project, status } = summary;
  const color = projectColorOf(project.colorId);

  const openMore = () => {
    const items: MenuItem[] = [];
    if (status === 'active')
      items.push({ label: projectsCopy.pause, icon: 'moon', onPress: () => pauseProject(project) });
    if (status === 'paused')
      items.push({ label: projectsCopy.resume, icon: 'sun', onPress: () => resumeProject(project) });
    items.push({
      label: projectsCopy.delete,
      icon: 'trash',
      destructive: true,
      onPress: () => {
        void deleteProject(project).then((deleted) => deleted && router.back());
      },
    });
    moreAnchor.current?.measureInWindow((_x: number, y: number, _w: number, h: number) =>
      overlay.openMenu(items, y + h),
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingBottom: insets.bottom }]}>
      <TopBar
        title={project.name}
        onBack={() => router.back()}
        right={
          <>
            <RoundIconButton
              icon="edit"
              label={projectsCopy.edit}
              onPress={() => router.push(`/project/${project.id}/edit`)}
            />
            <View ref={moreAnchor} collapsable={false}>
              <RoundIconButton icon="more" label={detailCopy.more} onPress={openMore} />
            </View>
          </>
        }
      />
      <DotPaper>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={[styles.head, { backgroundColor: color.base }]}>
            <ProjectIcon id={project.iconId} size={64} sticker />
            <View style={styles.headText}>
              <AppText variant="title2" color="#3F2A33" numberOfLines={1}>
                {project.name}
              </AppText>
              <AppText variant="caption" color="#3F2A33" numberOfLines={2}>
                {project.motto ? `${project.motto} · ${summary.ruleText}` : summary.ruleText}
              </AppText>
            </View>
          </View>

          <StickerCard>
            <View style={styles.stats}>
              <StatTile
                label={projectsCopy.streak}
                value={summary.streak.current}
                unit={unitOf(summary.streak.unit, project.unit)}
                size="M"
              />
              <StatTile
                label={projectsCopy.bestStreak}
                value={summary.streak.best}
                unit={unitOf(summary.streak.unit, project.unit)}
                size="M"
              />
              <StatTile
                label={projectsCopy.monthDone}
                value={summary.monthDone.value}
                unit={unitOf(summary.monthDone.unit, project.unit)}
                size="M"
              />
              <StatTile
                label={projectsCopy.total}
                value={summary.total.value}
                unit={unitOf(summary.total.unit, project.unit)}
                size="M"
              />
            </View>
          </StickerCard>

          <StickerCard>
            <ProjectCalendar
              projectId={project.id}
              today={clock.today()}
              weekStart={weekStart}
              flowerColor={color.base}
            />
          </StickerCard>

          <View style={styles.recentHead}>
            <AppText variant="title3">{detailCopy.recent}</AppText>
            <Pressable
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => router.push({ pathname: '/history', params: { projectId: project.id } })}
              style={styles.seeAll}
            >
              <AppText variant="callout" tone="link">
                {detailCopy.seeAll}
              </AppText>
              <Icon name="chevron-right" size={16} color={colors.link} />
            </Pressable>
          </View>
          <StickerCard padding={0}>
            {recent.length === 0 ? (
              <AppText variant="callout" tone="muted" style={styles.recentEmpty}>
                {detailCopy.noRecent}
              </AppText>
            ) : (
              recent.map((record, index) => (
                <View
                  key={record.id}
                  style={[
                    styles.recentRow,
                    index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.hairline },
                  ]}
                >
                  <AppText variant="callout" style={styles.recentDate}>
                    {formatMonthDay(record.date)}
                  </AppText>
                  <AppText variant="numberS" tone="secondary">
                    {recordTimeLabel(record)}
                  </AppText>
                  {record.note ? (
                    <AppText variant="callout" tone="secondary" numberOfLines={1} style={styles.recentNote}>
                      {record.note}
                    </AppText>
                  ) : null}
                </View>
              ))
            )}
          </StickerCard>
        </ScrollView>
      </DotPaper>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: inset.page, gap: space.lg, paddingBottom: space.giant },
  head: {
    minHeight: 120,
    borderRadius: radius.card,
    padding: space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  headText: { flex: 1, gap: 4 },
  stats: { flexDirection: 'row', gap: space.sm },
  recentHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: -space.sm },
  seeAll: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  recentEmpty: { padding: inset.card },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: inset.card,
    paddingVertical: 12,
  },
  recentDate: { width: 68 },
  recentNote: { flex: 1 },
});
