/**
 * 今日页（第 1 期 1-2）：顶栏 + 月/周日历 + 选中日期的项目列表。
 * 选中过去的日期打卡就是补卡，不弹任何提示；未来日期只能看不能打。
 * 第 3 期 3-7：列表标题行右侧在完美日或已有当天心情时出现 20pt 小云朵。
 */
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { canShowDayMood } from '@/domain/achievement/presentation';
import type { MoodEntity } from '@/domain/mood';
import { addDays, formatMonthDayWeekday } from '@/domain/date';
import type { CalendarMode } from '@/stores/prefsStore';
import { listTitle } from '@/copy/today';
import { moodCopy } from '@/copy/phase3';
import { useCommitPerfTrace } from '@/features/common/useCommitPerfTrace';
import { useLiveQuery } from '@/features/common/useLiveQuery';
import { readMoodPath, writeMoodPath } from '@/features/mood/links';
import { Calendar } from '@/features/today/Calendar';
import { assignDayMoods } from '@/features/today/moodAssignments';
import { usePlanted } from '@/features/today/celebration';
import { PerfectDayLayer } from '@/features/today/PerfectDay';
import { TodayCard } from '@/features/today/TodayCard';
import { TodayEmpty } from '@/features/today/TodayEmpty';
import { TodayHeader } from '@/features/today/TodayHeader';
import { getCalendarBounds, getDayOverview, getDayView } from '@/services/queries';
import { moodService } from '@/services/moodService';
import { usePrefs } from '@/stores/prefsStore';
import { useTodayStore } from '@/stores/todayStore';
import { AppText } from '@/ui/components/AppText';
import { DotPaper } from '@/ui/components/DotPaper';
import { Icon } from '@/ui/icons/Icon';
import type { DuoduoMood } from '@/ui/illustrations/Duoduo';
import { useMotionReduced } from '@/ui/motion';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { inset, space } from '@/ui/tokens';

/** 列表标题行右侧的当天心情入口：完美日或当天已有心情时才出现 */
function DayMoodEntry({
  date,
  today,
  perfect,
  dayMood,
  hasAnyMood,
}: {
  date: string;
  today: string;
  perfect: boolean;
  dayMood: MoodEntity | null;
  hasAnyMood: boolean;
}) {
  const router = useRouter();
  const { colors } = useTheme();
  const show = canShowDayMood({ perfect, hasMood: hasAnyMood, future: date > today });
  if (!show) return null;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={dayMood ? moodCopy.dayRead : moodCopy.dayWrite}
      hitSlop={12}
      onPress={() => router.push(dayMood ? readMoodPath(dayMood.id) : writeMoodPath(date, null))}
    >
      <Icon name="cloud" size={20} color={colors.textMuted} />
    </Pressable>
  );
}

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const reduced = useMotionReduced();
  const selected = useTodayStore((s) => s.selectedDate);
  const jumpToken = useTodayStore((s) => s.jumpToken);
  const select = useTodayStore((s) => s.select);
  const backToToday = useTodayStore((s) => s.backToToday);
  const calendarMode = usePrefs((s) => s.calendarMode);
  const calendarHome = usePrefs((s) => s.calendarHome);
  const weekStart = usePrefs((s) => s.weekStart);
  const focusId = useTodayStore((s) => s.focusProjectId);
  const focusToken = useTodayStore((s) => s.focusToken);
  const update = usePrefs((s) => s.update);
  const plantedId = usePlanted((s) => s.projectId);
  const clearPlanted = usePlanted((s) => s.clear);
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);

  const view = useLiveQuery(() => getDayView(selected), [selected, weekStart], ['projects', 'checkins', 'clock']);
  const todayOverview = useLiveQuery(
    () => (selected === view.today ? view.overview : getDayOverview(view.today)),
    [selected, view.today, weekStart],
    ['projects', 'checkins', 'clock'],
  );
  const bounds = useLiveQuery(getCalendarBounds, [], ['projects', 'clock']);
  const moods = useLiveQuery(() => assignDayMoods(moodService.listForDate(selected)), [selected], ['moods']);
  const startTodayTrace = useCommitPerfTrace('interaction.today', selected);

  const noProjects = view.empty === 'noProjects';
  const [sessionMode, setSessionMode] = useState<CalendarMode | null>(null);
  const mode = noProjects ? 'week' : (sessionMode ?? (calendarHome === 'remember' ? calendarMode : calendarHome));
  const plantedVisible = plantedId !== null && view.items.some((i) => i.project.id === plantedId);

  const offsets = useRef<Record<string, number>>({});
  useEffect(() => {
    const visible = new Set(view.items.map((item) => item.project.id));
    for (const projectId of Object.keys(offsets.current)) {
      if (!visible.has(projectId)) delete offsets.current[projectId];
    }
  }, [view.items]);

  useEffect(() => {
    if (!focusId) return;
    const y = offsets.current[focusId];
    if (y !== undefined) scroll.current?.scrollTo({ y: Math.max(0, y - 40), animated: true });
    const timer = setTimeout(() => useTodayStore.getState().clearFocus(), 1400);
    return () => clearTimeout(timer);
  }, [focusId, focusToken, view.items]);

  useEffect(() => {
    if (!plantedVisible) return;
    const timer = setTimeout(() => {
      scroll.current?.scrollToEnd({ animated: true });
      clearPlanted();
    }, 400);
    return () => clearTimeout(timer);
  }, [clearPlanted, plantedVisible]);

  const mood: DuoduoMood =
    todayOverview.planned === 0
      ? 'sleepy'
      : todayOverview.isPerfect
        ? 'happy'
        : todayOverview.completed > 0
          ? 'cheer'
          : 'expectant';

  const title = listTitle({
    date: selected,
    today: view.today,
    yesterday: addDays(view.today, -1),
    dateLabel: formatMonthDayWeekday(selected),
    completed: view.overview.completed,
    planned: view.overview.planned,
    visibleCount: view.items.length,
    perfect: view.overview.isPerfect,
  });

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <DotPaper style={StyleSheet.absoluteFill} />
      <TodayHeader today={view.today} mood={mood} />
      <ScrollView ref={scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Calendar
          selected={selected}
          today={view.today}
          bounds={bounds}
          mode={mode}
          weekStart={weekStart}
          jumpToken={jumpToken}
          onSelect={(date) => {
            if (date !== selected) startTodayTrace();
            select(date);
          }}
          onModeChange={(m) => {
            setSessionMode(m);
            if (calendarHome === 'remember') update({ calendarMode: m });
          }}
          onBackToToday={() => {
            if (selected !== view.today) startTodayTrace();
            backToToday();
          }}
        />
        <View style={styles.list}>
          {view.items.length > 0 ? (
            <View style={styles.titleRow}>
              <AppText
                variant="callout"
                tone={view.overview.isPerfect ? 'link' : 'secondary'}
                style={styles.title}
                numberOfLines={1}
              >
                {title}
              </AppText>
              <DayMoodEntry
                date={selected}
                today={view.today}
                perfect={view.overview.isPerfect}
                dayMood={moods.dayMood}
                hasAnyMood={moods.hasAnyMood}
              />
            </View>
          ) : null}
          {view.items.map((item) => (
            <Animated.View
              key={item.project.id}
              onLayout={(event) => {
                offsets.current[item.project.id] = event.nativeEvent.layout.y;
              }}
              entering={!reduced && item.project.id === plantedId ? ZoomIn.springify().damping(14) : undefined}
            >
              <TodayCard
                item={item}
                date={selected}
                today={view.today}
                mood={moods.projectMoods.get(item.project.id) ?? null}
                pulseToken={focusId === item.project.id ? focusToken : 0}
              />
            </Animated.View>
          ))}
          {view.empty ? <TodayEmpty reason={view.empty} isToday={selected === view.today} /> : null}
        </View>
      </ScrollView>
      <PerfectDayLayer />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingBottom: space.giant * 2 },
  list: { paddingHorizontal: inset.page, gap: inset.cardGap, marginTop: space.sm },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  title: { marginLeft: 4, flexShrink: 1 },
});
