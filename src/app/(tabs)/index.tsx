/**
 * 今日页（第 1 期 1-2）：顶栏 + 月/周日历 + 选中日期的项目列表。
 * 选中过去的日期打卡就是补卡，不弹任何提示；未来日期只能看不能打。
 */
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { addDays, formatMonthDayWeekday } from '@/domain/date';
import type { CalendarMode } from '@/stores/prefsStore';
import { listTitle } from '@/copy/today';
import { useLiveQuery } from '@/features/common/useLiveQuery';
import { Calendar } from '@/features/today/Calendar';
import { usePlanted } from '@/features/today/celebration';
import { PerfectDayLayer } from '@/features/today/PerfectDay';
import { TodayCard } from '@/features/today/TodayCard';
import { TodayEmpty } from '@/features/today/TodayEmpty';
import { TodayHeader } from '@/features/today/TodayHeader';
import { getCalendarBounds, getDayView } from '@/services/queries';
import { usePrefs } from '@/stores/prefsStore';
import { useTodayStore } from '@/stores/todayStore';
import { AppText } from '@/ui/components/AppText';
import { DotPaper } from '@/ui/components/DotPaper';
import type { DuoduoMood } from '@/ui/illustrations/Duoduo';
import { useMotionReduced } from '@/ui/motion';
import { inset, space } from '@/ui/tokens';

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

  const view = useLiveQuery(() => getDayView(selected), [selected, weekStart]);
  const todayView = useLiveQuery(() => getDayView(view.today), [view.today, weekStart]);
  const bounds = useLiveQuery(getCalendarBounds, []);

  const noProjects = view.empty === 'noProjects';
  const [sessionMode, setSessionMode] = useState<CalendarMode | null>(null);
  const mode = noProjects ? 'week' : (sessionMode ?? (calendarHome === 'remember' ? calendarMode : calendarHome));
  const plantedVisible = plantedId !== null && view.items.some((i) => i.project.id === plantedId);

  const offsets = useRef<Record<string, number>>({});
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
    todayView.overview.planned === 0
      ? 'sleepy'
      : todayView.overview.isPerfect
        ? 'happy'
        : todayView.overview.completed > 0
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
          onSelect={select}
          onModeChange={(m) => {
            setSessionMode(m);
            if (calendarHome === 'remember') update({ calendarMode: m });
          }}
          onBackToToday={backToToday}
        />
        <Animated.View key={selected} entering={reduced ? undefined : FadeIn.duration(200)} style={styles.list}>
          {view.items.length > 0 ? (
            <AppText variant="callout" tone={view.overview.isPerfect ? 'link' : 'secondary'} style={styles.title}>
              {title}
            </AppText>
          ) : null}
          {view.items.map((item, index) => (
            <Animated.View
              key={item.project.id}
              onLayout={(event) => {
                offsets.current[item.project.id] = event.nativeEvent.layout.y;
              }}
              entering={
                reduced
                  ? undefined
                  : item.project.id === plantedId
                    ? ZoomIn.springify().damping(14)
                    : FadeInDown.delay(Math.min(index, 6) * 40).duration(240)
              }
            >
              <TodayCard
                item={item}
                date={selected}
                today={view.today}
                pulseToken={focusId === item.project.id ? focusToken : 0}
              />
            </Animated.View>
          ))}
          {view.empty ? <TodayEmpty reason={view.empty} isToday={selected === view.today} /> : null}
        </Animated.View>
      </ScrollView>
      <PerfectDayLayer />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingBottom: space.giant * 2 },
  list: { paddingHorizontal: inset.page, gap: inset.cardGap, marginTop: space.sm },
  title: { marginLeft: 4 },
});
