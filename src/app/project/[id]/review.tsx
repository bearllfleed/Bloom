/**
 * 毕业回顾：从种下到毕业的时间线，证书可以再看一次典礼（不再计入未看）。
 * 第 3 期 3-10：时间线插入"获得徽章"（这段时间里得到的）与"心情片段"（最多 3 张缩略图）。
 */
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { badgesEarnedDuring } from '@/domain/achievement/presentation';
import { formatClock, formatMonthDay, formatYearMonth } from '@/domain/date';
import { reviewPhotoPicks } from '@/domain/mood';
import { describeRule } from '@/domain/project';
import { ruleOn } from '@/domain/rule';
import { graduationCopy } from '@/copy/phase2';
import { reviewCopy } from '@/copy/phase3';
import { openBadgeDetail } from '@/features/achievement';
import { useLiveQuery } from '@/features/common/useLiveQuery';
import { readMoodPath } from '@/features/mood/links';
import { media } from '@/platform/media';
import { achievementService } from '@/services/achievementService';
import { moodService } from '@/services/moodService';
import { getProject, getProjectRecords, getProjectSummary } from '@/services/queries';
import { usePrefs } from '@/stores/prefsStore';
import { Badge } from '@/ui/badges';
import { AppText } from '@/ui/components/AppText';
import { CandyButton } from '@/ui/components/CandyButton';
import { DotPaper } from '@/ui/components/DotPaper';
import { EmptyState } from '@/ui/components/EmptyState';
import { StickerCard } from '@/ui/components/StickerCard';
import { TopBar } from '@/ui/components/TopBar';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { inset, radius, space } from '@/ui/tokens';

export default function ReviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const dayEndHour = usePrefs((s) => s.dayEndHour);
  const summary = useLiveQuery(() => getProjectSummary(id), [id], ['projects', 'checkins', 'clock']);
  const project = useLiveQuery(() => getProject(id), [id], ['projects']);
  const records = useLiveQuery(() => getProjectRecords(id), [id], ['checkins']);
  const moods = useLiveQuery(() => moodService.listForProject(id), [id], ['moods']);
  const unlocks = useLiveQuery(() => achievementService.unlocked(), [], ['achievements']);

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
  const badgeIds = badgesEarnedDuring(unlocks, project.startDate, end, dayEndHour);
  const photoPicks = reviewPhotoPicks(moods);

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
            {badgeIds.length > 0 ? (
              <Node
                title={formatMonthDay(end)}
                body={reviewCopy.badges}
                detail={reviewCopy.badgeCount(badgeIds.length)}
                extra={
                  <View style={styles.badges}>
                    {badgeIds.slice(0, 8).map((badgeId) => (
                      <Pressable
                        key={badgeId}
                        accessibilityRole="button"
                        onPress={() => openBadgeDetail(badgeId)}
                        style={styles.badgeCell}
                      >
                        <Badge id={badgeId} size={44} mode="static" rays={false} />
                      </Pressable>
                    ))}
                  </View>
                }
              />
            ) : null}
            {moods.length > 0 ? (
              <Node
                title={reviewCopy.mood}
                body={reviewCopy.moodCount(moods.length)}
                extra={
                  photoPicks.length > 0 ? (
                    <View style={styles.photos}>
                      {photoPicks.map(({ mood, photo }) => (
                        <Pressable
                          key={photo.id}
                          accessibilityRole="button"
                          accessibilityLabel={reviewCopy.openMood}
                          onPress={() => router.push(readMoodPath(mood.id))}
                        >
                          <Image
                            source={{ uri: media.thumbUri(photo.fileName) }}
                            style={styles.thumb}
                            resizeMode="cover"
                          />
                        </Pressable>
                      ))}
                    </View>
                  ) : undefined
                }
              />
            ) : null}
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

function Node({
  title,
  body,
  detail,
  extra,
}: {
  title: string;
  body: string;
  detail?: string;
  extra?: React.ReactNode;
}) {
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
        {extra}
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
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs, marginTop: space.xs },
  badgeCell: { alignItems: 'center', justifyContent: 'center' },
  photos: { flexDirection: 'row', gap: space.sm, marginTop: space.xs },
  thumb: { width: 76, height: 76, borderRadius: radius.small },
});
