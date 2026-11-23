/**
 * 毕业回顾：从种下到毕业的时间线，证书可以再看一次典礼（不再计入未看）。
 */
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatClock, formatMonthDay, formatYearMonth } from '@/domain/date';
import { describeRule } from '@/domain/project';
import { ruleOn } from '@/domain/rule';
import { graduationCopy } from '@/copy/phase2';
import { useLiveQuery } from '@/features/common/useLiveQuery';
import { getProject, getProjectRecords, getProjectSummary } from '@/services/queries';
import { AppText } from '@/ui/components/AppText';
import { CandyButton } from '@/ui/components/CandyButton';
import { DotPaper } from '@/ui/components/DotPaper';
import { EmptyState } from '@/ui/components/EmptyState';
import { StickerCard } from '@/ui/components/StickerCard';
import { TopBar } from '@/ui/components/TopBar';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { inset, space } from '@/ui/tokens';

export default function ReviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const summary = useLiveQuery(() => getProjectSummary(id), [id]);
  const project = useLiveQuery(() => getProject(id), [id]);
  const records = useLiveQuery(() => getProjectRecords(id), [id]);

  if (!summary || !project) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <TopBar onBack={() => router.back()} />
        <EmptyState message="这个项目找不到了" mood="puzzled" />
      </View>
    );
  }

  const first = records[0];
  const notes = records.filter((record) => record.note).slice(0, 5);
  const end = project.graduatedOn ?? project.endDate ?? project.startDate;
  const rule = ruleOn(project.ruleVersions, project.startDate);

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingBottom: insets.bottom }]}>
      <TopBar title={graduationCopy.journey(project.name)} onBack={() => router.back()} />
      <DotPaper>
        <ScrollView contentContainerStyle={styles.content}>
          <Pressable onPress={() => router.push(`/project/${project.id}`)}>
            <StickerCard>
              <AppText variant="title3">{graduationCopy.certificate}</AppText>
              <AppText variant="caption" tone="secondary">
                {formatMonthDay(project.startDate)} — {formatMonthDay(end)}
              </AppText>
            </StickerCard>
          </Pressable>

          <View style={[styles.line, { borderColor: colors.accentSoft }]}>
            <Node
              title={formatMonthDay(project.startDate)}
              body={graduationCopy.planted}
              detail={describeRule(rule, project.unit)}
            />
            {first ? (
              <Node
                title={formatMonthDay(first.date)}
                body={graduationCopy.firstFlower}
                detail={formatClock(first.checkedAt)}
              />
            ) : null}
            {summary.streak.best > 1 ? (
              <Node title={graduationCopy.best} body={graduationCopy.bestRun(summary.streak.best)} />
            ) : null}
            <Node title={formatYearMonth(end)} body={graduationCopy.monthGarden} />
            {notes.map((record) => (
              <Node key={record.id} title={formatMonthDay(record.date)} body={`“${record.note}”`} />
            ))}
            <Node title={formatMonthDay(end)} body={graduationCopy.graduated} />
          </View>

          <CandyButton
            label={graduationCopy.again}
            onPress={() => router.push({ pathname: '/project/new', params: { from: project.id } })}
          />
          <Pressable
            onPress={() => router.push({ pathname: '/history', params: { projectId: project.id } })}
            style={styles.center}
          >
            <AppText variant="callout" tone="link">
              {graduationCopy.seeRecords(records.length)}
            </AppText>
          </Pressable>
        </ScrollView>
      </DotPaper>
    </View>
  );
}

function Node({ title, body, detail }: { title: string; body: string; detail?: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.node}>
      <View style={[styles.dot, { backgroundColor: colors.accent }]} />
      <View style={styles.nodeText}>
        <AppText variant="caption" tone="secondary">
          {title}
        </AppText>
        <AppText variant="body">{body}</AppText>
        {detail ? (
          <AppText variant="caption" tone="muted">
            {detail}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: inset.page, gap: space.lg, paddingBottom: space.giant },
  line: { borderLeftWidth: 2, marginLeft: 10, paddingLeft: space.lg, gap: space.lg },
  node: { flexDirection: 'row', gap: space.sm },
  dot: { width: 12, height: 12, borderRadius: 6, marginLeft: -space.lg - 7, marginTop: 4 },
  nodeText: { flex: 1, gap: 2 },
  center: { alignItems: 'center' },
});
