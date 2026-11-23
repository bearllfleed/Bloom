/**
 * 毕业典礼：证书、评语、盖章。每个项目只播一次，看完就记下来。
 * 安卓返回键等于收下证书。
 */
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';

import { diffDays, formatDotDate, formatDotMonthDay, parseLocalDate } from '@/domain/date';
import { graduationCopy } from '@/copy/phase2';
import { useLiveQuery } from '@/features/common/useLiveQuery';
import { projectService } from '@/services/projectService';
import { getProjectSummary } from '@/services/queries';
import { usePrefs } from '@/stores/prefsStore';
import { AppText } from '@/ui/components/AppText';
import { CandyButton } from '@/ui/components/CandyButton';
import { DotPaper } from '@/ui/components/DotPaper';
import { ProjectIcon } from '@/ui/icons/ProjectIcon';
import { Duoduo } from '@/ui/illustrations/Duoduo';
import { useMotionReduced } from '@/ui/motion';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { radius, space } from '@/ui/tokens';

function comment(rate: number | null): string {
  if (rate !== null && rate >= 0.999) return graduationCopy.full;
  if (rate !== null && rate >= 0.8) return graduationCopy.solid;
  return graduationCopy.gentle;
}

export function Ceremony({ projectId, onDone }: { projectId: string; onDone: () => void }) {
  const router = useRouter();
  const reduced = useMotionReduced();
  const { colors } = useTheme();
  const nickname = usePrefs((s) => s.nickname);
  const summary = useLiveQuery(() => getProjectSummary(projectId), [projectId]);
  const remaining = useLiveQuery(
    () => Math.max(0, projectService.unseenGraduations().filter((project) => project.id !== projectId).length),
    [projectId],
  );

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onDone();
      return true;
    });
    return () => sub.remove();
  }, [onDone]);

  if (!summary) {
    return (
      <View style={[styles.fill, { backgroundColor: colors.background }]}>
        <CandyButton label={graduationCopy.keep} onPress={onDone} />
      </View>
    );
  }

  const { project, rate, streak, total } = summary;
  const end = project.graduatedOn ?? project.endDate ?? project.startDate;
  const days = diffDays(project.startDate, end) + 1;
  const sameYear = parseLocalDate(project.startDate).year === parseLocalDate(end).year;
  const range = sameYear
    ? `${formatDotDate(project.startDate)} — ${formatDotMonthDay(end)}`
    : `${formatDotDate(project.startDate)} — ${formatDotDate(end)}`;
  const unit = streak.unit === 'week' ? '周' : streak.unit === 'month' ? '月' : '天';

  const openReview = () => {
    onDone();
    router.push(`/project/${project.id}/review`);
  };
  const again = () => {
    onDone();
    router.push({ pathname: '/project/new', params: { from: project.id } });
  };

  return (
    <DotPaper style={styles.fill}>
      <View style={styles.body}>
        <Animated.View entering={reduced ? undefined : FadeInDown.delay(150).springify().damping(14)}>
          <Duoduo size={120} mood="cheer" pose="seed" accessory="gradCap" />
        </Animated.View>
        <Animated.View
          entering={reduced ? undefined : FadeInDown.delay(300).springify().damping(12)}
          style={[styles.certificate, { backgroundColor: colors.card, borderColor: colors.cardEdge }]}
        >
          <AppText variant="title2" align="center">
            {graduationCopy.certificate}
          </AppText>
          <ProjectIcon id={project.iconId} size={64} sticker />
          <AppText variant="title3" align="center" numberOfLines={1}>
            {project.name}
          </AppText>
          <AppText variant="caption" tone="secondary" align="center">
            {range} · {graduationCopy.days(days)}
          </AppText>
          <View style={styles.stats}>
            <Stat
              label={graduationCopy.doneDays}
              value={`${total.value}${total.unit === 'times' ? project.unit : '天'}`}
            />
            <Stat label={graduationCopy.rate} value={rate.rate === null ? '—' : `${Math.round(rate.rate * 100)}%`} />
            <Stat label={graduationCopy.best} value={`${streak.best}${unit}`} />
          </View>
          <AppText variant="callout" align="center">
            {comment(rate.rate)}
          </AppText>
          <View style={styles.award}>
            <AppText variant="caption" tone="secondary">
              {graduationCopy.awardedTo(nickname)}
            </AppText>
            <Animated.View
              entering={reduced ? undefined : ZoomIn.delay(900).springify()}
              style={[styles.stamp, { borderColor: colors.danger }]}
            >
              <AppText variant="caption" tone="danger">
                毕业
              </AppText>
            </Animated.View>
          </View>
        </Animated.View>
        <Animated.View entering={reduced ? undefined : FadeIn.delay(1100)} style={styles.actions}>
          <CandyButton label={graduationCopy.lookBack} onPress={openReview} />
          <View style={styles.row}>
            <CandyButton
              label={graduationCopy.again}
              variant="secondary"
              size="md"
              onPress={again}
              style={styles.half}
            />
            <CandyButton
              label={graduationCopy.keep}
              variant="secondary"
              size="md"
              onPress={onDone}
              style={styles.half}
            />
          </View>
          {remaining > 0 ? (
            <AppText variant="caption" tone="secondary" align="center">
              {graduationCopy.more(remaining)}
            </AppText>
          ) : null}
        </Animated.View>
      </View>
    </DotPaper>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <AppText variant="caption" tone="secondary">
        {label}
      </AppText>
      <AppText variant="numberS">{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, justifyContent: 'center' },
  body: { padding: space.xl, alignItems: 'center', gap: space.lg },
  certificate: {
    width: '100%',
    borderRadius: radius.card,
    borderWidth: 1,
    padding: space.xl,
    alignItems: 'center',
    gap: space.sm,
  },
  stats: { flexDirection: 'row', gap: space.lg, marginVertical: space.sm },
  stat: { alignItems: 'center', gap: 2 },
  award: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginTop: space.sm },
  stamp: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-12deg' }],
  },
  actions: { width: '100%', gap: space.sm },
  row: { flexDirection: 'row', gap: space.sm },
  half: { flex: 1 },
});
