/**
 * 项目详情（第 1 期 1-6 基础版）：头卡 + 4 个数据块 + 月历 + 最近打卡。
 * "更多"菜单：暂停（或继续）/ 删除。
 */
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState, type ComponentRef } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatMonthDay } from '@/domain/date';
import { graduationCopy } from '@/copy/phase2';
import { detailCopy, projectsCopy } from '@/copy/project';
import { useLiveQuery } from '@/features/common/useLiveQuery';
import { ProjectCalendar } from '@/features/detail/ProjectCalendar';
import { recordTimeLabel } from '@/features/history/recordActions';
import { deleteProject, graduateEarly, pauseProject, resumeProject } from '@/features/projects/projectActions';
import { clock } from '@/platform/clock';
import { getProjectSummary, getRecentRecords } from '@/services/queries';
import { projectNotes, projectYearCells } from '@/services/statsQuery';
import { overlay, type MenuItem } from '@/stores/overlayQueue';
import { usePrefs } from '@/stores/prefsStore';
import { SegmentedControl } from '@/ui/components/SegmentedControl';
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
  const notes = useLiveQuery(() => projectNotes(id, 3), [id]);
  const [view, setView] = useState<'month' | 'year'>('month');
  const year = Number(clock.today().slice(0, 4));
  const yearCells = useLiveQuery(() => (view === 'year' ? projectYearCells(id, year) : []), [id, view, year]);
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
    if (status === 'active' || status === 'paused') {
      items.push({
        label: graduationCopy.early,
        icon: 'graduation',
        onPress: () => {
          void graduateEarly(project);
        },
      });
    }
    if (status === 'graduated') {
      items.push({
        label: graduationCopy.review,
        icon: 'graduation',
        onPress: () => router.push(`/project/${project.id}/review`),
      });
      items.push({
        label: graduationCopy.again,
        icon: 'plus',
        onPress: () => router.push({ pathname: '/project/new', params: { from: project.id } }),
      });
    }
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
                label={projectsCopy.rate}
                value={summary.rate.rate === null ? 0 : Math.round(summary.rate.rate * 100)}
                unit={summary.rate.rate === null ? '—' : '%'}
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

          {summary.journey ? (
            <StickerCard>
              <View style={styles.vine}>
                {Array.from({ length: Math.min(summary.journey.total, 24) }, (_, index) => {
                  const grown =
                    index <
                    Math.round((summary.journey!.day / summary.journey!.total) * Math.min(summary.journey!.total, 24));
                  return (
                    <View key={index} style={[styles.leaf, { backgroundColor: grown ? color.base : colors.weak }]} />
                  );
                })}
              </View>
              <AppText variant="caption" tone="secondary">
                {status === 'graduated'
                  ? graduationCopy.vineDone(summary.journey.total)
                  : graduationCopy.vineLeft(
                      summary.journey.day,
                      summary.journey.total,
                      Math.max(0, summary.journey.total - summary.journey.day),
                    )}
              </AppText>
            </StickerCard>
          ) : null}

          <SegmentedControl
            options={[
              { value: 'month', label: '月历' },
              { value: 'year', label: '年度' },
            ]}
            value={view}
            onChange={setView}
          />
          {view === 'month' ? (
            <StickerCard>
              <ProjectCalendar
                projectId={project.id}
                today={clock.today()}
                weekStart={weekStart}
                flowerColor={color.base}
                unit={project.unit}
              />
            </StickerCard>
          ) : (
            <StickerCard>
              <AppText variant="title3">
                {year} · {yearCells.filter((cell) => cell.state === 'done').length} 天
              </AppText>
              <View style={styles.yearHeat}>
                {yearCells.map((cell) => (
                  <View
                    key={cell.date}
                    style={[
                      styles.yearCell,
                      {
                        backgroundColor:
                          cell.state === 'done' ? color.base : cell.state === 'missed' ? colors.weak : 'transparent',
                      },
                    ]}
                  />
                ))}
              </View>
            </StickerCard>
          )}

          {project.noteEnabled || notes.total > 0 ? (
            <>
              <View style={styles.recentHead}>
                <AppText variant="title3">{graduationCopy.notes}</AppText>
                <Pressable onPress={() => router.push({ pathname: '/history', params: { projectId: project.id } })}>
                  <AppText variant="callout" tone="link">
                    {graduationCopy.allNotes}
                  </AppText>
                </Pressable>
              </View>
              <StickerCard>
                {notes.notes.length === 0 ? (
                  <AppText variant="callout" tone="muted">
                    还没有写下成绩
                  </AppText>
                ) : (
                  notes.notes.map((record) => (
                    <View key={record.id} style={styles.note}>
                      <AppText variant="caption" tone="secondary">
                        {formatMonthDay(record.date)}
                      </AppText>
                      <AppText variant="callout">{record.note}</AppText>
                    </View>
                  ))
                )}
              </StickerCard>
            </>
          ) : null}

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
  vine: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  leaf: { width: 14, height: 10, borderRadius: 6 },
  yearHeat: { flexDirection: 'row', flexWrap: 'wrap', gap: 2, marginTop: space.sm },
  yearCell: { width: 8, height: 8, borderRadius: 2 },
  note: { gap: 2, paddingVertical: 6 },
});
