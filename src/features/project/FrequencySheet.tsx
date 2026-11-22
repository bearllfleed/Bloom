/**
 * 打卡频率面板（第 1 期 1-3a）：每天 / 每周 / 每月 三个分段，各有固定、任选、累计三种方式。
 * - 切换分段时保留各自上次的选择；点任一周几或日期芯片自动选中"固定"；
 * - 预览句随任何改动更新（旧句上淡出、新句下淡入），下方迷你周/月预览；
 * - 固定几天/几号一个都没选时"好的"置灰并提示；选了 29–31 号提示月末规则。
 */
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';

import { describeRule, hasMonthEndDates, isRuleValid } from '@/domain/project';
import type { FrequencyRule, Weekday, WeekStart } from '@/domain/types';
import { UNIT_OPTIONS, frequencyCopy } from '@/copy/project';
import { haptics } from '@/platform/haptics';
import { AppText } from '@/ui/components/AppText';
import { CandyButton } from '@/ui/components/CandyButton';
import { Chip } from '@/ui/components/Chip';
import { BudGlyph } from '@/ui/components/FlowerMark';
import { SegmentedControl } from '@/ui/components/SegmentedControl';
import { SheetTitle } from '@/ui/components/SheetTitle';
import { Stepper } from '@/ui/components/Stepper';
import { TextField } from '@/ui/components/TextField';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { radius, space } from '@/ui/tokens';

type Period = 'day' | 'week' | 'month';
type Mode = 'fixed' | 'anyDays' | 'times';

interface State {
  period: Period;
  dayTimes: number;
  week: { mode: Mode; weekdays: Weekday[]; days: number; times: number; timesPerDay: number };
  month: { mode: Mode; dates: number[]; days: number; times: number; timesPerDay: number };
  unit: string;
}

const WEEKDAY_ORDER: Record<WeekStart, Weekday[]> = { 1: [1, 2, 3, 4, 5, 6, 7], 7: [7, 1, 2, 3, 4, 5, 6] };
const WEEKDAY_CHAR = ['', '一', '二', '三', '四', '五', '六', '日'];

function initialState(rule: FrequencyRule, unit: string): State {
  const s: State = {
    period: 'day',
    dayTimes: 1,
    week: { mode: 'anyDays', weekdays: [], days: 3, times: 5, timesPerDay: 1 },
    month: { mode: 'anyDays', dates: [], days: 10, times: 12, timesPerDay: 1 },
    unit,
  };
  switch (rule.kind) {
    case 'daily':
      s.dayTimes = rule.timesPerDay;
      break;
    case 'weekdays':
      s.period = 'week';
      s.week = { ...s.week, mode: 'fixed', weekdays: rule.weekdays, timesPerDay: rule.timesPerDay };
      break;
    case 'weeklyDays':
      s.period = 'week';
      s.week = { ...s.week, mode: 'anyDays', days: rule.days, timesPerDay: rule.timesPerDay };
      break;
    case 'weeklyTimes':
      s.period = 'week';
      s.week = { ...s.week, mode: 'times', times: rule.times };
      break;
    case 'monthDates':
      s.period = 'month';
      s.month = { ...s.month, mode: 'fixed', dates: rule.dates, timesPerDay: rule.timesPerDay };
      break;
    case 'monthlyDays':
      s.period = 'month';
      s.month = { ...s.month, mode: 'anyDays', days: rule.days, timesPerDay: rule.timesPerDay };
      break;
    case 'monthlyTimes':
      s.period = 'month';
      s.month = { ...s.month, mode: 'times', times: rule.times };
      break;
  }
  return s;
}

function ruleOf(s: State): FrequencyRule {
  if (s.period === 'day') return { kind: 'daily', timesPerDay: s.dayTimes };
  if (s.period === 'week') {
    const w = s.week;
    if (w.mode === 'fixed') {
      return { kind: 'weekdays', weekdays: [...w.weekdays].sort((a, b) => a - b), timesPerDay: w.timesPerDay };
    }
    if (w.mode === 'anyDays') return { kind: 'weeklyDays', days: w.days, timesPerDay: w.timesPerDay };
    return { kind: 'weeklyTimes', times: w.times };
  }
  const m = s.month;
  if (m.mode === 'fixed')
    return { kind: 'monthDates', dates: [...m.dates].sort((a, b) => a - b), timesPerDay: m.timesPerDay };
  if (m.mode === 'anyDays') return { kind: 'monthlyDays', days: m.days, timesPerDay: m.timesPerDay };
  return { kind: 'monthlyTimes', times: m.times };
}

function Radio({
  selected,
  label,
  onPress,
  right,
}: {
  selected: boolean;
  label: string;
  onPress: () => void;
  right?: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={styles.radioRow}
    >
      <View style={[styles.radio, { borderColor: selected ? colors.accent : colors.hairline }]}>
        {selected ? <View style={[styles.radioDot, { backgroundColor: colors.accent }]} /> : null}
      </View>
      <AppText variant="body" style={styles.radioLabel}>
        {label}
      </AppText>
      {right}
    </Pressable>
  );
}

interface FrequencySheetProps {
  rule: FrequencyRule;
  unit: string;
  weekStart: WeekStart;
  onDone: (rule: FrequencyRule, unit: string) => void;
}

export function FrequencySheet({ rule, unit, weekStart, onDone }: FrequencySheetProps) {
  const { colors } = useTheme();
  const { height } = useWindowDimensions();
  const [s, setS] = useState(() => initialState(rule, unit));
  const [customUnit, setCustomUnit] = useState(!(UNIT_OPTIONS as readonly string[]).includes(unit));
  const current = useMemo(() => ruleOf(s), [s]);
  const valid = isRuleValid(current);
  const sentence = describeRule(current, s.unit || '次');
  const showUnit =
    (s.period === 'day' && s.dayTimes > 1) ||
    (s.period !== 'day' && (s[s.period].mode === 'times' || s[s.period].timesPerDay > 1));

  const setWeek = (patch: Partial<State['week']>) => setS((p) => ({ ...p, week: { ...p.week, ...patch } }));
  const setMonth = (patch: Partial<State['month']>) => setS((p) => ({ ...p, month: { ...p.month, ...patch } }));

  const toggleWeekday = (d: Weekday) => {
    haptics.selection();
    const list = s.week.weekdays.includes(d) ? s.week.weekdays.filter((x) => x !== d) : [...s.week.weekdays, d];
    setWeek({ mode: 'fixed', weekdays: list });
  };
  const toggleDate = (d: number) => {
    haptics.selection();
    const list = s.month.dates.includes(d) ? s.month.dates.filter((x) => x !== d) : [...s.month.dates, d];
    setMonth({ mode: 'fixed', dates: list });
  };

  const timesPerDayStepper = (value: number, onChange: (n: number) => void) => (
    <View style={styles.stepRow}>
      <AppText variant="body">{frequencyCopy.timesPerDay}</AppText>
      <Stepper value={value} min={1} max={20} onChange={onChange} unit={s.unit} accessibilityLabel="每天打卡次数" />
    </View>
  );

  return (
    <View style={{ maxHeight: height * 0.82 }}>
      <SheetTitle title={frequencyCopy.title} />
      <SegmentedControl
        options={[
          { value: 'day', label: frequencyCopy.daily },
          { value: 'week', label: frequencyCopy.weekly },
          { value: 'month', label: frequencyCopy.monthly },
        ]}
        value={s.period}
        onChange={(period) => setS((p) => ({ ...p, period }))}
      />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {s.period === 'day' ? timesPerDayStepper(s.dayTimes, (n) => setS((p) => ({ ...p, dayTimes: n }))) : null}

        {s.period === 'week' ? (
          <>
            <Radio
              selected={s.week.mode === 'fixed'}
              label={frequencyCopy.fixedWeekdays}
              onPress={() => setWeek({ mode: 'fixed' })}
            />
            <View style={styles.chipRow}>
              {WEEKDAY_ORDER[weekStart].map((d) => (
                <Chip
                  key={d}
                  label={WEEKDAY_CHAR[d]}
                  square
                  selected={s.week.mode === 'fixed' && s.week.weekdays.includes(d)}
                  onPress={() => toggleWeekday(d)}
                />
              ))}
            </View>
            <Radio
              selected={s.week.mode === 'anyDays'}
              label={frequencyCopy.anyDays}
              onPress={() => setWeek({ mode: 'anyDays' })}
              right={
                <Stepper
                  value={s.week.days}
                  min={1}
                  max={7}
                  unit="天"
                  onChange={(n) => setWeek({ mode: 'anyDays', days: n })}
                  accessibilityLabel="每周任选天数"
                />
              }
            />
            <Radio
              selected={s.week.mode === 'times'}
              label={frequencyCopy.totalTimes}
              onPress={() => setWeek({ mode: 'times' })}
              right={
                <Stepper
                  value={s.week.times}
                  min={1}
                  max={99}
                  unit={s.unit}
                  onChange={(n) => setWeek({ mode: 'times', times: n })}
                  accessibilityLabel="每周累计次数"
                />
              }
            />
            {s.week.mode !== 'times'
              ? timesPerDayStepper(s.week.timesPerDay, (n) => setWeek({ timesPerDay: n }))
              : null}
          </>
        ) : null}

        {s.period === 'month' ? (
          <>
            <Radio
              selected={s.month.mode === 'fixed'}
              label={frequencyCopy.fixedDates}
              onPress={() => setMonth({ mode: 'fixed' })}
            />
            <View style={styles.dateGrid}>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
                const on = s.month.mode === 'fixed' && s.month.dates.includes(d);
                return (
                  <Pressable
                    key={d}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    accessibilityLabel={`${d} 号`}
                    onPress={() => toggleDate(d)}
                    style={[
                      styles.dateCell,
                      {
                        backgroundColor: on ? colors.accentSoft : colors.sunken,
                        borderColor: on ? colors.accent : 'transparent',
                      },
                    ]}
                  >
                    <AppText variant="callout" tone={on ? 'link' : 'secondary'}>
                      {d}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
            <Radio
              selected={s.month.mode === 'anyDays'}
              label={frequencyCopy.anyDays}
              onPress={() => setMonth({ mode: 'anyDays' })}
              right={
                <Stepper
                  value={s.month.days}
                  min={1}
                  max={31}
                  unit="天"
                  onChange={(n) => setMonth({ mode: 'anyDays', days: n })}
                  accessibilityLabel="每月任选天数"
                />
              }
            />
            <Radio
              selected={s.month.mode === 'times'}
              label={frequencyCopy.totalTimes}
              onPress={() => setMonth({ mode: 'times' })}
              right={
                <Stepper
                  value={s.month.times}
                  min={1}
                  max={200}
                  unit={s.unit}
                  onChange={(n) => setMonth({ mode: 'times', times: n })}
                  accessibilityLabel="每月累计次数"
                />
              }
            />
            {s.month.mode !== 'times'
              ? timesPerDayStepper(s.month.timesPerDay, (n) => setMonth({ timesPerDay: n }))
              : null}
          </>
        ) : null}

        {showUnit ? (
          <View style={styles.unitBlock}>
            <AppText variant="callout" tone="secondary">
              {frequencyCopy.unit}
            </AppText>
            <View style={styles.chipRow}>
              {UNIT_OPTIONS.map((u) => (
                <Chip
                  key={u}
                  label={u}
                  selected={!customUnit && s.unit === u}
                  onPress={() => {
                    setCustomUnit(false);
                    setS((p) => ({ ...p, unit: u }));
                  }}
                />
              ))}
              <Chip label={frequencyCopy.customUnit} selected={customUnit} onPress={() => setCustomUnit(true)} />
            </View>
            {customUnit ? (
              <TextField
                value={(UNIT_OPTIONS as readonly string[]).includes(s.unit) ? '' : s.unit}
                onChangeText={(t) => setS((p) => ({ ...p, unit: t.trim() }))}
                maxLength={frequencyCopy.customUnitMax}
                placeholder={frequencyCopy.customUnitTitle}
                autoFocus
              />
            ) : null}
          </View>
        ) : null}

        <View style={[styles.preview, { backgroundColor: colors.accentSofter }]}>
          <Animated.View key={sentence} entering={FadeInUp.duration(180)} exiting={FadeOutUp.duration(120)}>
            <AppText variant="title3" tone="link" align="center">
              {sentence}
            </AppText>
          </Animated.View>
          {s.period === 'week' ? (
            <View style={styles.miniWeek}>
              {WEEKDAY_ORDER[weekStart].map((d) => {
                const on = s.week.mode !== 'fixed' || s.week.weekdays.includes(d);
                return (
                  <View key={d} style={styles.miniDay}>
                    <AppText variant="micro" tone="muted">
                      {WEEKDAY_CHAR[d]}
                    </AppText>
                    <View style={{ opacity: on ? 1 : 0.15 }}>
                      <BudGlyph size={18} />
                    </View>
                  </View>
                );
              })}
            </View>
          ) : null}
          {s.period === 'month' && s.month.mode === 'fixed' ? (
            <View style={styles.miniMonth}>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <View
                  key={d}
                  style={[
                    styles.miniDot,
                    { backgroundColor: s.month.dates.includes(d) ? colors.accent : colors.hairline },
                  ]}
                />
              ))}
            </View>
          ) : null}
        </View>
        {!valid ? (
          <AppText variant="caption" tone="danger" align="center">
            {frequencyCopy.needOneDay}
          </AppText>
        ) : null}
        {hasMonthEndDates(current) ? (
          <AppText variant="caption" tone="secondary" align="center">
            {frequencyCopy.monthEnd}
          </AppText>
        ) : null}
      </ScrollView>
      <CandyButton
        label={frequencyCopy.done}
        disabled={!valid}
        onPress={() => onDone(current, s.unit || '次')}
        style={styles.done}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0 },
  body: { gap: space.md, paddingTop: space.lg, paddingBottom: space.md },
  radioRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 40 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  radioLabel: { flex: 1 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  stepRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  dateCell: {
    width: 40,
    height: 36,
    borderRadius: radius.small,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  unitBlock: { gap: space.sm },
  preview: { borderRadius: radius.card, padding: space.lg, gap: space.md, overflow: 'hidden' },
  miniWeek: { flexDirection: 'row', justifyContent: 'space-between' },
  miniDay: { alignItems: 'center', gap: 2 },
  miniMonth: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, justifyContent: 'center' },
  miniDot: { width: 10, height: 10, borderRadius: 5 },
  done: { marginTop: space.sm },
});
