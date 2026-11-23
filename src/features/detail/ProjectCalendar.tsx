/**
 * 项目详情月历：花朵三态用项目颜色；非计划日数字淡色、无标记；暂停日加浅斜线底纹。
 * 点日期打开某天记录面板。
 */
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';

import { addMonths, formatMonthDayWeekday, formatYearMonth, startOfMonth, weekdayChar } from '@/domain/date';
import type { LocalDate, WeekStart } from '@/domain/types';
import { useLiveQuery } from '@/features/common/useLiveQuery';
import { getProjectMonth, getProjectMonthBounds } from '@/services/queries';
import { projectMonthDone } from '@/services/statsQuery';
import { AppText } from '@/ui/components/AppText';
import { FlowerMark } from '@/ui/components/FlowerMark';
import { Icon } from '@/ui/icons/Icon';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { radius } from '@/ui/tokens';

import { openDayRecords } from './DayRecordsSheet';

const CELL_W = 40;
const CELL_H = 48;

function Hatch({ color }: { color: string }) {
  return (
    <Svg width={CELL_W} height={CELL_H} style={StyleSheet.absoluteFill}>
      {[-24, -12, 0, 12, 24, 36].map((x) => (
        <Line key={x} x1={x} y1={CELL_H} x2={x + CELL_H} y2={0} stroke={color} strokeWidth={1} />
      ))}
    </Svg>
  );
}

export function ProjectCalendar({
  projectId,
  today,
  weekStart,
  flowerColor,
  unit,
}: {
  projectId: string;
  today: LocalDate;
  weekStart: WeekStart;
  flowerColor: string;
  unit: string;
}) {
  const { colors } = useTheme();
  const [month, setMonth] = useState(startOfMonth(today));
  const bounds = useLiveQuery(() => getProjectMonthBounds(projectId), [projectId]);
  const weeks = useLiveQuery(() => getProjectMonth(projectId, month), [projectId, month, weekStart]);
  const done = useLiveQuery(() => projectMonthDone(projectId, month), [projectId, month]);
  const canPrev = month > bounds.min;
  const canNext = month < bounds.max;
  const header = weekStart === 1 ? [1, 2, 3, 4, 5, 6, 7] : [7, 1, 2, 3, 4, 5, 6];

  return (
    <View style={styles.root}>
      <View style={styles.head}>
        <Pressable
          accessibilityLabel="上个月"
          disabled={!canPrev}
          hitSlop={10}
          onPress={() => setMonth(addMonths(month, -1))}
          style={{ opacity: canPrev ? 1 : 0.3 }}
        >
          <Icon name="chevron-left" size={20} />
        </Pressable>
        <AppText variant="title3">
          {formatYearMonth(month)} · 本月完成 {done.value} {done.unit === 'times' ? unit : '天'}
        </AppText>
        <Pressable
          accessibilityLabel="下个月"
          disabled={!canNext}
          hitSlop={10}
          onPress={() => setMonth(addMonths(month, 1))}
          style={{ opacity: canNext ? 1 : 0.3 }}
        >
          <Icon name="chevron-right" size={20} />
        </Pressable>
      </View>
      <View style={styles.week}>
        {header.map((d) => (
          <AppText key={d} variant="micro" tone="muted" style={styles.headCell}>
            {weekdayChar(d)}
          </AppText>
        ))}
      </View>
      {weeks.map((week) => (
        <View key={week[0].date} style={styles.week}>
          {week.map((cell) => {
            const numberColor = !cell.inMonth
              ? 'transparent'
              : cell.isToday
                ? colors.link
                : cell.planned && !cell.isFuture
                  ? colors.text
                  : colors.textMuted;
            return (
              <Pressable
                key={cell.date}
                accessibilityRole="button"
                accessibilityLabel={formatMonthDayWeekday(cell.date)}
                disabled={!cell.inMonth}
                onPress={() => openDayRecords(projectId, cell.date)}
                style={[
                  styles.cell,
                  cell.isToday && cell.inMonth && { borderWidth: 2, borderColor: colors.accent },
                  cell.paused && cell.inMonth && { backgroundColor: colors.sunken },
                ]}
              >
                {cell.paused && cell.inMonth ? <Hatch color={colors.hairline} /> : null}
                <AppText variant="numberS" color={numberColor}>
                  {Number(cell.date.slice(8))}
                </AppText>
                <View style={styles.mark}>
                  {cell.inMonth ? <FlowerMark mark={cell.mark} size={14} color={flowerColor} /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 4 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 6 },
  week: { flexDirection: 'row', justifyContent: 'space-between' },
  headCell: { width: CELL_W, textAlign: 'center' },
  cell: {
    width: CELL_W,
    height: CELL_H,
    borderRadius: radius.small,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    overflow: 'hidden',
  },
  mark: { height: 14 },
});
