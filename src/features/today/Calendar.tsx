/**
 * 今日页日历（第 1 期 1-2"日历"）：
 * - 月视图左右滑动切月（M06），范围为最早项目开始月到 12 个月后；
 * - 周视图只保留选中日期所在的一行，左右滑动切周；
 * - 点右上图标或拖动下方把手切换月/周（M07 的按钮切换版，折叠手势留到第 4 期打磨）；
 * - "回到今天"胶囊在选中日期不是今天、或显示的不是本月时出现。
 */
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, PixelRatio, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import {
  addDays,
  addMonths,
  eachDay,
  endOfMonth,
  endOfWeek,
  formatMonthDayWeekday,
  formatYearMonth,
  isoWeekNumber,
  startOfMonth,
  startOfWeek,
  weekdayChar,
  weekdayOf,
} from '@/domain/date';
import type { LocalDate, WeekStart } from '@/domain/types';
import { todayCopy } from '@/copy/today';
import { useLiveQuery } from '@/features/common/useLiveQuery';
import { haptics } from '@/platform/haptics';
import { getDayMarks } from '@/services/queries';
import type { CalendarMode } from '@/stores/prefsStore';
import { AppText } from '@/ui/components/AppText';
import { DAY_CELL_HEIGHT, DayCell } from '@/ui/components/DayCell';
import { Icon } from '@/ui/icons/Icon';
import { springs, timing, useMotionReduced } from '@/ui/motion';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { inset, space } from '@/ui/tokens';

import { useCelebration } from './celebration';

const ROW_GAP = 4;
const ROW_HEIGHT = DAY_CELL_HEIGHT + ROW_GAP;

function weeksOfMonth(month: LocalDate, weekStart: WeekStart): LocalDate[][] {
  const days = eachDay(startOfWeek(month, weekStart), endOfWeek(endOfMonth(month), weekStart));
  const rows: LocalDate[][] = [];
  for (let i = 0; i < days.length; i += 7) rows.push(days.slice(i, i + 7));
  return rows;
}

function monthsBetween(min: LocalDate, max: LocalDate): LocalDate[] {
  const result: LocalDate[] = [];
  for (let m = startOfMonth(min); m <= max; m = addMonths(m, 1)) result.push(m);
  return result;
}

function weeksBetween(min: LocalDate, max: LocalDate, weekStart: WeekStart): LocalDate[] {
  const result: LocalDate[] = [];
  for (let w = startOfWeek(min, weekStart); w <= max; w = addDays(w, 7)) result.push(w);
  return result;
}

/** 完美日时这一格的花弹一下（M05 的日历部分） */
function PoppingCell({ date, children }: { date: LocalDate; children: React.ReactNode }) {
  const popToken = useCelebration((s) => s.popToken);
  const popDate = useCelebration((s) => s.popDate);
  const scale = useSharedValue(1);
  const reduced = useMotionReduced();
  const seen = useRef(popToken);
  useEffect(() => {
    if (popToken === seen.current) return;
    seen.current = popToken;
    if (popDate !== date || reduced) return;
    scale.value = withSequence(withTiming(1.4, { duration: 180 }), withSpring(1, springs.bouncy));
  }, [date, popDate, popToken, reduced, scale]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return <Animated.View style={style}>{children}</Animated.View>;
}

interface RowsProps {
  rows: LocalDate[][];
  month: LocalDate | null;
  selected: LocalDate;
  today: LocalDate;
  onSelect: (date: LocalDate) => void;
}

const WeekRows = memo(function WeekRows({ rows, month, selected, today, onSelect }: RowsProps) {
  const from = rows[0][0];
  const to = rows[rows.length - 1][6];
  const marks = useLiveQuery(() => getDayMarks(from, to), [from, to], ['projects', 'checkins', 'clock']);
  return (
    <View style={styles.rows}>
      {rows.map((week) => (
        <View key={week[0]} style={styles.week}>
          {week.map((date) => (
            <PoppingCell key={date} date={date}>
              <DayCell
                day={Number(date.slice(8))}
                mark={marks.get(date) ?? 'none'}
                isToday={date === today}
                isSelected={date === selected}
                isOutsideMonth={month !== null && (date < month || date > endOfMonth(month))}
                isFuture={date > today}
                onPress={() => onSelect(date)}
                accessibilityLabel={formatMonthDayWeekday(date)}
              />
            </PoppingCell>
          ))}
        </View>
      ))}
    </View>
  );
});

export interface CalendarProps {
  selected: LocalDate;
  today: LocalDate;
  bounds: { min: LocalDate; max: LocalDate };
  mode: CalendarMode;
  weekStart: WeekStart;
  jumpToken: number;
  onSelect: (date: LocalDate) => void;
  onModeChange: (mode: CalendarMode) => void;
  onBackToToday: () => void;
}

export function Calendar({
  selected,
  today,
  bounds,
  mode,
  weekStart,
  jumpToken,
  onSelect,
  onModeChange,
  onBackToToday,
}: CalendarProps) {
  const { colors } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  // 翻页宽度对齐到物理像素，否则安卓分页吸附会差一页
  const width = PixelRatio.roundToNearestPixel(screenWidth - inset.page * 2);
  const reduced = useMotionReduced();

  const months = useMemo(() => monthsBetween(bounds.min, bounds.max), [bounds.min, bounds.max]);
  const weeks = useMemo(() => weeksBetween(bounds.min, bounds.max, weekStart), [bounds.min, bounds.max, weekStart]);
  const [shownMonth, setShownMonth] = useState(startOfMonth(selected));
  const monthList = useRef<FlatList<LocalDate>>(null);
  const weekList = useRef<FlatList<LocalDate>>(null);

  const monthIndex = Math.max(0, months.indexOf(startOfMonth(selected)));
  const weekIndex = Math.max(0, weeks.indexOf(startOfWeek(selected, weekStart)));
  /** 只有手指拖动结束才算"切周"；程序滚动（首次定位、回到今天）也会触发滚动结束事件 */
  const userDragging = useRef(false);
  const monthDragging = useRef(false);
  const mountedJump = useRef(jumpToken);
  const mountedRange = useRef(`${months.length}|${weeks.length}`);

  // 回到今天、跨天时滚动到选中日期；首次渲染由 initialScrollIndex 定位
  useEffect(() => {
    if (mountedJump.current === jumpToken) return;
    mountedJump.current = jumpToken;
    setShownMonth(startOfMonth(selected));
    monthList.current?.scrollToIndex({ index: monthIndex, animated: !reduced });
    weekList.current?.scrollToIndex({ index: weekIndex, animated: !reduced });
    // 只响应跳转信号
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jumpToken]);

  // 新增了更早开始的项目时可滑动范围向前扩展，重新对准选中日期所在的月/周
  useEffect(() => {
    const range = `${months.length}|${weeks.length}`;
    if (mountedRange.current === range) return;
    mountedRange.current = range;
    monthList.current?.scrollToIndex({ index: monthIndex, animated: false });
    weekList.current?.scrollToIndex({ index: weekIndex, animated: false });
    // 只在范围变化时对齐
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [months.length, weeks.length]);

  // 切换月/周视图后列表重新挂载，按精确偏移再对齐一次
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mode === 'month') monthList.current?.scrollToOffset({ offset: monthIndex * width, animated: false });
      else weekList.current?.scrollToOffset({ offset: weekIndex * width, animated: false });
    }, 0);
    return () => clearTimeout(timer);
    // 只在视图切换和宽度变化时对齐
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, width]);

  // 周视图里选中日期变化时，月份标题跟着走
  useEffect(() => {
    if (mode === 'week') setShownMonth(startOfMonth(selected));
  }, [mode, selected]);

  const rowCount = weeksOfMonth(shownMonth, weekStart).length;
  const height = useSharedValue(mode === 'month' ? rowCount * ROW_HEIGHT : ROW_HEIGHT);
  useEffect(() => {
    const target = mode === 'month' ? rowCount * ROW_HEIGHT : ROW_HEIGHT;
    height.value = reduced ? withTiming(target, timing.reduced) : withTiming(target, timing.base);
  }, [height, mode, reduced, rowCount]);
  const heightStyle = useAnimatedStyle(() => ({ height: height.value }));

  const onMonthViewable = useRef(({ viewableItems }: { viewableItems: { item: LocalDate }[] }) => {
    const first = viewableItems[0]?.item;
    if (first) setShownMonth(first);
  }).current;

  const onWeekSettled = (index: number) => {
    if (!userDragging.current) {
      // 程序滚动停在了别的周：拉回选中日期所在的周
      if (index !== weekIndex) weekList.current?.scrollToIndex({ index: weekIndex, animated: false });
      return;
    }
    userDragging.current = false;
    const weekStartDate = weeks[index];
    if (!weekStartDate) return;
    const weekday = weekdayOf(selected);
    const offset = (weekday - weekdayOf(weekStartDate) + 7) % 7;
    const next = addDays(weekStartDate, offset);
    if (next !== selected) {
      haptics.selection();
      onSelect(next < bounds.min ? bounds.min : next > bounds.max ? bounds.max : next);
    }
  };

  const toggle = () => {
    haptics.selection();
    onModeChange(mode === 'month' ? 'week' : 'month');
  };

  const handlePan = usePanGesture({
    activeOffsetY: [-12, 12],
    onDeactivate: (e) => {
      'worklet';
      if (e.translationY < -20 && mode === 'month') scheduleOnRN(onModeChange, 'week');
      else if (e.translationY > 20 && mode === 'week') scheduleOnRN(onModeChange, 'month');
    },
  });

  const showBackToToday = selected !== today || shownMonth !== startOfMonth(today);
  const title =
    mode === 'week' ? `${formatYearMonth(selected)} 第${isoWeekNumber(selected)}周` : formatYearMonth(shownMonth);
  const headerDays = weekStart === 1 ? [1, 2, 3, 4, 5, 6, 7] : [7, 1, 2, 3, 4, 5, 6];

  return (
    <View style={styles.root}>
      <View style={styles.head}>
        <AppText variant="title3">{title}</AppText>
        <View style={styles.headActions}>
          {showBackToToday ? (
            <Animated.View entering={FadeIn.duration(160)}>
              <Pressable
                accessibilityRole="button"
                onPress={onBackToToday}
                style={[styles.pill, { backgroundColor: colors.accentSoft }]}
                hitSlop={6}
              >
                <AppText variant="caption" tone="link">
                  {todayCopy.backToToday}
                </AppText>
              </Pressable>
            </Animated.View>
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={mode === 'month' ? todayCopy.monthView : todayCopy.weekView}
            onPress={toggle}
            hitSlop={8}
            style={[styles.toggle, { backgroundColor: colors.card }]}
          >
            <Icon name="view-toggle" size={20} />
          </Pressable>
        </View>
      </View>
      <View style={styles.week}>
        {headerDays.map((d) => (
          <AppText key={d} variant="micro" tone="muted" style={styles.headCell}>
            {weekdayChar(d)}
          </AppText>
        ))}
      </View>

      <Animated.View style={[styles.viewport, heightStyle]}>
        {mode === 'month' ? (
          <FlatList
            key="month"
            ref={monthList}
            data={months}
            horizontal
            pagingEnabled
            bounces
            style={{ width }}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(m) => m}
            initialScrollIndex={monthIndex}
            getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
            onScrollBeginDrag={() => {
              monthDragging.current = true;
            }}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              if (!monthDragging.current && index !== monthIndex) {
                monthList.current?.scrollToIndex({ index: monthIndex, animated: false });
              }
              monthDragging.current = false;
            }}
            onViewableItemsChanged={onMonthViewable}
            viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
            windowSize={3}
            initialNumToRender={1}
            renderItem={({ item }) => (
              <View style={{ width }}>
                <WeekRows
                  rows={weeksOfMonth(item, weekStart)}
                  month={item}
                  selected={selected}
                  today={today}
                  onSelect={onSelect}
                />
              </View>
            )}
          />
        ) : (
          <FlatList
            key="week"
            ref={weekList}
            data={weeks}
            horizontal
            pagingEnabled
            style={{ width }}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(w) => w}
            initialScrollIndex={weekIndex}
            getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
            onScrollBeginDrag={() => {
              userDragging.current = true;
            }}
            onMomentumScrollEnd={(e) => onWeekSettled(Math.round(e.nativeEvent.contentOffset.x / width))}
            windowSize={3}
            initialNumToRender={1}
            renderItem={({ item }) => (
              <View style={{ width }}>
                <WeekRows
                  rows={[eachDay(item, addDays(item, 6))]}
                  month={null}
                  selected={selected}
                  today={today}
                  onSelect={onSelect}
                />
              </View>
            )}
          />
        )}
      </Animated.View>

      <GestureDetector gesture={handlePan}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={todayCopy.monthView}
          onPress={toggle}
          style={styles.handleArea}
        >
          <View style={[styles.handle, { backgroundColor: colors.hairline }]} />
        </Pressable>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { paddingHorizontal: inset.page, gap: space.xs },
  head: { height: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headActions: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  pill: { height: 28, paddingHorizontal: 12, borderRadius: 14, justifyContent: 'center' },
  toggle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  week: { flexDirection: 'row', justifyContent: 'space-between' },
  headCell: { width: 44, textAlign: 'center' },
  viewport: { overflow: 'hidden' },
  rows: { gap: ROW_GAP },
  handleArea: { height: 20, alignItems: 'center', justifyContent: 'center' },
  handle: { width: 36, height: 5, borderRadius: 2.5 },
});
