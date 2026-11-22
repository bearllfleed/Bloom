/**
 * 开始和时长面板（第 1 期 1-3b）：从哪天开始 + 坚持多久 + 预览句。
 * - 开始日期可选过去任意日期（补录），未来最多 1 年；编辑时不能晚于最早一条记录；
 * - 截止日期必须 ≥ 今天且 ≥ 开始日期；按所选开始日期算出的截止日期已过去的时长芯片置灰。
 */
import { useRef, useState, type ComponentRef } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';

import { addDays, addMonths, formatMonthDay, weekdayOf } from '@/domain/date';
import {
  DURATION_PRESETS,
  describeDuration,
  endDateForPreset,
  isPresetAvailable,
  type DurationPreset,
} from '@/domain/project';
import type { LocalDate, WeekStart } from '@/domain/types';
import { formCopy, scheduleCopy } from '@/copy/project';
import { overlay } from '@/stores/overlayQueue';
import { AppText } from '@/ui/components/AppText';
import { CandyButton } from '@/ui/components/CandyButton';
import { Chip } from '@/ui/components/Chip';
import { MonthPicker } from '@/ui/components/MonthPicker';
import { SheetTitle } from '@/ui/components/SheetTitle';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { radius, space } from '@/ui/tokens';

type StartChoice = 'today' | 'tomorrow' | 'nextMonday' | 'pick';

export interface ScheduleValue {
  startDate: LocalDate;
  endDate: LocalDate | null;
  durationPreset: DurationPreset;
}

interface ScheduleSheetProps {
  value: ScheduleValue;
  today: LocalDate;
  weekStart: WeekStart;
  /** 编辑时最早一条记录的日期，开始日期不能晚于它 */
  earliestRecord: LocalDate | null;
  focus: 'start' | 'duration';
  onDone: (value: ScheduleValue) => void;
}

function nextMonday(today: LocalDate): LocalDate {
  const wd = weekdayOf(today);
  return addDays(today, wd === 1 ? 7 : 8 - wd);
}

function startChoiceOf(start: LocalDate, today: LocalDate): StartChoice {
  if (start === today) return 'today';
  if (start === addDays(today, 1)) return 'tomorrow';
  if (start === nextMonday(today)) return 'nextMonday';
  return 'pick';
}

export function ScheduleSheet({ value, today, weekStart, earliestRecord, focus, onDone }: ScheduleSheetProps) {
  const { colors } = useTheme();
  const { height } = useWindowDimensions();
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const [start, setStart] = useState(value.startDate);
  const [preset, setPreset] = useState<DurationPreset>(value.durationPreset);
  const [customEnd, setCustomEnd] = useState<LocalDate | null>(
    value.durationPreset === 'custom' ? value.endDate : null,
  );
  const [startChoice, setStartChoice] = useState<StartChoice>(startChoiceOf(value.startDate, today));
  const maxStart =
    earliestRecord !== null && earliestRecord < addMonths(today, 12) ? earliestRecord : addMonths(today, 12);

  const end = preset === 'custom' ? customEnd : endDateForPreset(preset, start);
  const valid = preset !== 'custom' || (customEnd !== null && customEnd >= today && customEnd >= start);

  const chooseStart = (choice: StartChoice, date?: LocalDate) => {
    if (date && date > maxStart) {
      overlay.toast(
        earliestRecord !== null && date > earliestRecord
          ? formCopy.earliestRecord(formatMonthDay(earliestRecord))
          : scheduleCopy.tooFar,
      );
      return;
    }
    setStartChoice(choice);
    if (date) setStart(date);
    // 换了开始日期后，原来的预设已过去就退回一直坚持
    if (date && preset !== 'custom' && !isPresetAvailable(preset, date, today)) setPreset('forever');
  };

  const startChips: { id: StartChoice; label: string; date?: LocalDate }[] = [
    { id: 'today', label: scheduleCopy.today, date: today },
    { id: 'tomorrow', label: scheduleCopy.tomorrow, date: addDays(today, 1) },
    { id: 'nextMonday', label: scheduleCopy.nextMonday, date: nextMonday(today) },
    { id: 'pick', label: scheduleCopy.pickDate },
  ];

  return (
    <View style={{ maxHeight: height * 0.82 }}>
      <ScrollView ref={scroll} style={styles.scroll} contentContainerStyle={styles.body}>
        <SheetTitle title={scheduleCopy.startTitle} />
        <View style={styles.chips}>
          {startChips.map((c) => (
            <Chip
              key={c.id}
              label={c.label}
              selected={startChoice === c.id}
              disabled={c.date !== undefined && c.date > maxStart}
              onPress={() => chooseStart(c.id, c.date)}
              onDisabledPress={() => chooseStart(c.id, c.date)}
            />
          ))}
        </View>
        {startChoice === 'pick' ? (
          <MonthPicker
            value={start}
            today={today}
            max={maxStart}
            weekStart={weekStart}
            onChange={(d) => chooseStart('pick', d)}
            onDisabledPress={(d) => chooseStart('pick', d)}
          />
        ) : null}

        <View
          style={[styles.divider, { backgroundColor: colors.hairline }]}
          onLayout={(e) => {
            if (focus === 'duration') scroll.current?.scrollTo({ y: e.nativeEvent.layout.y, animated: false });
          }}
        />
        <SheetTitle title={scheduleCopy.durationTitle} />
        <View style={styles.chips}>
          {DURATION_PRESETS.map((p) => {
            const available = isPresetAvailable(p.id, start, today);
            return (
              <Chip
                key={p.id}
                label={p.label}
                selected={preset === p.id}
                disabled={!available}
                onPress={() => setPreset(p.id)}
                onDisabledPress={() => overlay.toast(scheduleCopy.passed)}
              />
            );
          })}
          <Chip label={scheduleCopy.pickEnd} selected={preset === 'custom'} onPress={() => setPreset('custom')} />
        </View>
        {preset === 'custom' ? (
          <MonthPicker
            value={customEnd}
            today={today}
            min={start > today ? start : today}
            weekStart={weekStart}
            onChange={setCustomEnd}
            onDisabledPress={() => overlay.toast(scheduleCopy.passed)}
          />
        ) : null}

        <View style={[styles.preview, { backgroundColor: colors.accentSofter }]}>
          <AppText variant="title3" tone="link" align="center">
            {describeDuration(start, end)}
          </AppText>
        </View>
      </ScrollView>
      <CandyButton
        label={scheduleCopy.done}
        disabled={!valid}
        onPress={() => onDone({ startDate: start, endDate: end, durationPreset: preset })}
        style={styles.done}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0 },
  body: { gap: space.md, paddingBottom: space.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: space.sm },
  preview: { borderRadius: radius.card, padding: space.lg },
  done: { marginTop: space.sm },
});
