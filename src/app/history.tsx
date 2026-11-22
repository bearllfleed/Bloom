/**
 * 打卡记录（第 1 期 1-7）：项目筛选芯片 + 按月分段（月份标题吸顶）。
 * 按归属日期倒序、同一天按实际时间倒序；首次加载最近 3 个月，滚到底再加载。
 * 左滑删除（5 秒撤销）；点一行打开记录详情。
 */
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, SectionList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatYearMonth, weekdayLabel } from '@/domain/date';
import type { ProjectEntity } from '@/domain/types';
import { historyCopy } from '@/copy/project';
import { useLiveQuery } from '@/features/common/useLiveQuery';
import { openRecordDetail } from '@/features/history/RecordDetailSheet';
import { deleteRecordWithUndo, recordTimeLabel } from '@/features/history/recordActions';
import { getHistoryMonth, getHistoryMonths, listProjects, type HistoryDay } from '@/services/queries';
import { AppText } from '@/ui/components/AppText';
import { Chip } from '@/ui/components/Chip';
import { EmptyState } from '@/ui/components/EmptyState';
import { ProjectBadge } from '@/ui/components/ProjectBadge';
import { SwipeToDelete } from '@/ui/components/SwipeToDelete';
import { TopBar } from '@/ui/components/TopBar';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { inset, radius, space } from '@/ui/tokens';

const PAGE_MONTHS = 3;

function DayGroup({ day, projects }: { day: HistoryDay; projects: Map<string, ProjectEntity> }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.day, { backgroundColor: colors.card, borderBottomColor: colors.cardEdge }]}>
      <View style={styles.dateCol}>
        <AppText variant="numberM">{Number(day.date.slice(8))}</AppText>
        <AppText variant="micro" tone="muted">
          {weekdayLabel(day.date)}
        </AppText>
      </View>
      <View style={styles.records}>
        {day.records.map((record, index) => {
          const project = projects.get(record.projectId);
          if (!project) return null;
          return (
            <SwipeToDelete key={record.id} label={historyCopy.delete} onDelete={() => deleteRecordWithUndo(record.id)}>
              <Pressable
                accessibilityRole="button"
                onPress={() => openRecordDetail(record, project)}
                style={[
                  styles.record,
                  { backgroundColor: colors.card },
                  index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.hairline },
                ]}
              >
                <View style={styles.recordMain}>
                  <ProjectBadge iconId={project.iconId} colorId={project.colorId} size={30} />
                  <AppText variant="body" numberOfLines={1} style={styles.recordName}>
                    {project.name}
                  </AppText>
                  <AppText variant="numberS" tone="secondary">
                    {recordTimeLabel(record)}
                  </AppText>
                </View>
                {record.note ? (
                  <AppText variant="caption" tone="secondary" numberOfLines={1} style={styles.recordNote}>
                    {record.note}
                  </AppText>
                ) : null}
              </Pressable>
            </SwipeToDelete>
          );
        })}
      </View>
    </View>
  );
}

export default function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ projectId?: string }>();
  const [filter, setFilter] = useState<string | null>(params.projectId ?? null);
  const [loaded, setLoaded] = useState(PAGE_MONTHS);

  const projects = useLiveQuery(listProjects, []);
  const projectMap = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);
  const months = useLiveQuery(() => getHistoryMonths(filter), [filter]);
  const sections = useLiveQuery(
    () =>
      months.slice(0, loaded).map((m) => ({
        key: m.month,
        title: historyCopy.monthTitle(formatYearMonth(`${m.month}-01`), m.count),
        data: getHistoryMonth(m.month, filter),
      })),
    [months, loaded, filter],
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <TopBar title={historyCopy.title} onBack={() => router.back()} />
      {projects.length > 0 ? (
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            <Chip label={historyCopy.all} selected={filter === null} onPress={() => setFilter(null)} />
            {projects.map((p) => (
              <Chip key={p.id} label={p.name} selected={filter === p.id} onPress={() => setFilter(p.id)} />
            ))}
          </ScrollView>
        </View>
      ) : null}
      <SectionList
        sections={sections}
        keyExtractor={(day) => day.date}
        stickySectionHeadersEnabled
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + space.giant }]}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (loaded < months.length) setLoaded((n) => n + PAGE_MONTHS);
        }}
        renderSectionHeader={({ section }) => (
          <View style={[styles.sectionHead, { backgroundColor: colors.background }]}>
            <AppText variant="callout" tone="secondary">
              {section.title}
            </AppText>
          </View>
        )}
        renderItem={({ item }) => <DayGroup day={item} projects={projectMap} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          filter === null ? (
            <EmptyState
              message={historyCopy.empty}
              actionLabel={historyCopy.emptyAction}
              onAction={() => router.navigate('/')}
            />
          ) : (
            <EmptyState message={historyCopy.emptyFiltered} mood="puzzled" />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  chips: { paddingHorizontal: inset.page, gap: space.sm, paddingBottom: space.md },
  list: { paddingHorizontal: inset.page },
  sectionHead: { paddingVertical: space.sm },
  separator: { height: space.sm },
  day: {
    flexDirection: 'row',
    borderRadius: radius.card,
    borderBottomWidth: 4,
    overflow: 'hidden',
  },
  dateCol: { width: 56, alignItems: 'center', paddingTop: 14, gap: 2 },
  records: { flex: 1 },
  record: { paddingVertical: 12, paddingRight: inset.card, gap: 4 },
  recordMain: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  recordName: { flex: 1 },
  recordNote: { marginLeft: 38 },
});
