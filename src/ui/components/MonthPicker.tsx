/**
 * 小月历选择器：开始日期、截止日期等面板里选一天。
 * 超出可选范围的日期置灰，点击时回调 onDisabledPress 由调用方提示原因。
 */
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  addMonths,
  eachDay,
  endOfMonth,
  endOfWeek,
  formatYearMonth,
  startOfMonth,
  startOfWeek,
  weekdayChar,
} from '@/domain/date';
import type { LocalDate, WeekStart } from '@/domain/types';
import { Icon } from '@/ui/icons/Icon';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { radius } from '@/ui/tokens';

import { AppText } from './AppText';

export interface MonthPickerProps {
  value: LocalDate | null;
  today: LocalDate;
  min?: LocalDate;
  max?: LocalDate;
  weekStart: WeekStart;
  onChange: (date: LocalDate) => void;
  onDisabledPress?: (date: LocalDate) => void;
}

export function MonthPicker({ value, today, min, max, weekStart, onChange, onDisabledPress }: MonthPickerProps) {
  const { colors } = useTheme();
  const [month, setMonth] = useState(startOfMonth(value ?? today));
  const weeks = useMemo(() => {
    const days = eachDay(startOfWeek(month, weekStart), endOfWeek(endOfMonth(month), weekStart));
    const rows: LocalDate[][] = [];
    for (let i = 0; i < days.length; i += 7) rows.push(days.slice(i, i + 7));
    return rows;
  }, [month, weekStart]);
  const header = weekStart === 1 ? [1, 2, 3, 4, 5, 6, 7] : [7, 1, 2, 3, 4, 5, 6];
  const canPrev = !min || startOfMonth(min) < month;
  const canNext = !max || startOfMonth(max) > month;

  return (
    <View style={styles.root}>
      <View style={styles.head}>
        <Pressable
          accessibilityLabel="上个月"
          disabled={!canPrev}
          onPress={() => setMonth(addMonths(month, -1))}
          hitSlop={10}
          style={{ opacity: canPrev ? 1 : 0.3 }}
        >
          <Icon name="chevron-left" size={20} />
        </Pressable>
        <AppText variant="title3">{formatYearMonth(month)}</AppText>
        <Pressable
          accessibilityLabel="下个月"
          disabled={!canNext}
          onPress={() => setMonth(addMonths(month, 1))}
          hitSlop={10}
          style={{ opacity: canNext ? 1 : 0.3 }}
        >
          <Icon name="chevron-right" size={20} />
        </Pressable>
      </View>
      <View style={styles.week}>
        {header.map((d) => (
          <AppText key={d} variant="micro" tone="muted" style={styles.cellText}>
            {weekdayChar(d)}
          </AppText>
        ))}
      </View>
      {weeks.map((week) => (
        <View key={week[0]} style={styles.week}>
          {week.map((date) => {
            const inMonth = date >= month && date <= endOfMonth(month);
            const disabled = (min !== undefined && date < min) || (max !== undefined && date > max);
            const selected = date === value;
            return (
              <Pressable
                key={date}
                accessibilityRole="button"
                accessibilityState={{ selected, disabled }}
                accessibilityLabel={date}
                onPress={() => (disabled ? onDisabledPress?.(date) : onChange(date))}
                style={[
                  styles.cell,
                  selected && { backgroundColor: colors.accent },
                  date === today && !selected && { borderWidth: 1.5, borderColor: colors.accent },
                ]}
              >
                <AppText
                  variant="callout"
                  color={selected ? '#3F2A33' : disabled || !inMonth ? colors.hairline : colors.text}
                >
                  {Number(date.slice(8))}
                </AppText>
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
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  week: { flexDirection: 'row', justifyContent: 'space-between' },
  cellText: { width: 40, textAlign: 'center' },
  cell: { width: 40, height: 36, borderRadius: radius.small, alignItems: 'center', justifyContent: 'center' },
});
