/**
 * 我的项目（第 1 期 1-5）：进行中 / 已暂停 / 已毕业 三组；进行中可排序。
 * 暂停/继续后卡片飞出当前组，分段控件上的数字同步变化；删除后卡片飘走（M13）。
 */
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, Keyframe, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { projectsCopy } from '@/copy/project';
import { useLiveQuery } from '@/features/common/useLiveQuery';
import { ProjectListCard } from '@/features/projects/ProjectListCard';
import { SortList } from '@/features/projects/SortList';
import { projectService } from '@/services/projectService';
import { getProjectGroups } from '@/services/queries';
import { AppText } from '@/ui/components/AppText';
import { DotPaper } from '@/ui/components/DotPaper';
import { EmptyState } from '@/ui/components/EmptyState';
import { SegmentedControl } from '@/ui/components/SegmentedControl';
import { useMotionReduced } from '@/ui/motion';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { inset, space } from '@/ui/tokens';

type Group = 'active' | 'paused' | 'graduated';

/** M13 删除飘走：缩小到 0.9、向右上飘走并淡出 */
const flyAway = new Keyframe({
  0: { opacity: 1, transform: [{ scale: 1 }, { translateX: 0 }, { translateY: 0 }] },
  100: { opacity: 0, transform: [{ scale: 0.9 }, { translateX: 80 }, { translateY: -40 }] },
}).duration(300);

export default function ProjectsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const reduced = useMotionReduced();
  const [group, setGroup] = useState<Group>('active');
  const [sorting, setSorting] = useState(false);
  const groups = useLiveQuery(getProjectGroups, []);
  const list = groups[group];
  const canSort = group === 'active' && groups.active.filter((s) => s.status === 'active').length > 1;

  const empty =
    group === 'active' ? (
      <EmptyState
        message={projectsCopy.emptyActive}
        pose="seed"
        actionLabel={projectsCopy.emptyActiveAction}
        onAction={() => router.push('/project/new')}
      />
    ) : group === 'paused' ? (
      <EmptyState message={projectsCopy.emptyPaused} mood="sleepy" pose="cloud" />
    ) : (
      <EmptyState message={projectsCopy.emptyGraduated} mood="cheer" />
    );

  return (
    <DotPaper style={{ paddingTop: insets.top }}>
      <View style={styles.header}>
        <AppText variant="title1">{projectsCopy.title}</AppText>
        {canSort || sorting ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setSorting((s) => !s)}
            hitSlop={8}
            style={[styles.sortButton, { backgroundColor: sorting ? colors.accentSoft : colors.card }]}
          >
            <AppText variant="callout" tone="link">
              {sorting ? projectsCopy.sortDone : projectsCopy.sort}
            </AppText>
          </Pressable>
        ) : null}
      </View>
      <View style={styles.segment}>
        <SegmentedControl
          options={[
            { value: 'active', label: `${projectsCopy.groupActive} ${groups.active.length}` },
            { value: 'paused', label: `${projectsCopy.groupPaused} ${groups.paused.length}` },
            { value: 'graduated', label: `${projectsCopy.groupGraduated} ${groups.graduated.length}` },
          ]}
          value={group}
          onChange={(g) => {
            setGroup(g);
            setSorting(false);
          }}
        />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {sorting && group === 'active' ? (
          <Animated.View entering={FadeIn.duration(160)}>
            <SortList
              projects={groups.active.filter((s) => s.status === 'active').map((s) => s.project)}
              onReorder={(ids) => {
                const notStarted = groups.active.filter((s) => s.status === 'notStarted').map((s) => s.project.id);
                const others = [...groups.paused, ...groups.graduated].map((s) => s.project.id);
                projectService.reorder([...ids, ...notStarted, ...others]);
              }}
            />
          </Animated.View>
        ) : list.length === 0 ? (
          empty
        ) : (
          list.map((summary) => (
            <Animated.View
              key={summary.project.id}
              layout={reduced ? undefined : LinearTransition.springify().damping(18)}
              entering={reduced ? undefined : FadeIn.duration(200)}
              exiting={reduced ? undefined : flyAway}
            >
              <ProjectListCard summary={summary} />
            </Animated.View>
          ))
        )}
      </ScrollView>
    </DotPaper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: inset.page,
    paddingTop: space.md,
    paddingBottom: space.sm,
  },
  sortButton: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16 },
  segment: { paddingHorizontal: inset.page, paddingBottom: space.md },
  content: { paddingHorizontal: inset.page, gap: inset.cardGap, paddingBottom: space.giant * 2, paddingTop: space.xs },
});
