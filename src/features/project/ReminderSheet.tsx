/**
 * 提醒设置面板：最多 5 个时间，可开关、左滑删除。
 * 第一次添加时先问一句，再弹出系统通知权限。
 */
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { describeMonthDates, describeWeekdays } from '@/domain/project';
import { periodTypeOf } from '@/domain/rule';
import type { FrequencyRule } from '@/domain/types';
import { reminderCopy } from '@/copy/phase2';
import { clock } from '@/platform/clock';
import { kv } from '@/platform/kv';
import { notifications } from '@/platform/notifications';
import type { ReminderDraft } from '@/services/projectService';
import { overlay } from '@/stores/overlayQueue';
import { AppText } from '@/ui/components/AppText';
import { CandyButton } from '@/ui/components/CandyButton';
import { CandySwitch } from '@/ui/components/CandySwitch';
import { SheetTitle } from '@/ui/components/SheetTitle';
import { Stepper } from '@/ui/components/Stepper';
import { SwipeToDelete } from '@/ui/components/SwipeToDelete';
import { Icon } from '@/ui/icons/Icon';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { space } from '@/ui/tokens';

const PRIMER_KEY = 'notificationPrimerSeen';
const MAX = 5;

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function nextHour(): { hour: number; minute: number } {
  const hour = Math.floor(clock.wallClock().minutes / 60);
  return { hour: (hour + 1) % 24, minute: 0 };
}

export function ReminderSheet({
  reminders,
  skipDone,
  skipPeriodMet,
  rule,
  onDone,
  onOpenCheck,
}: {
  reminders: ReminderDraft[];
  skipDone: boolean;
  skipPeriodMet: boolean;
  rule: FrequencyRule;
  onDone: (value: { reminders: ReminderDraft[]; skipDone: boolean; skipPeriodMet: boolean }) => void;
  onOpenCheck: () => void;
}) {
  const { colors } = useTheme();
  const [items, setItems] = useState(reminders);
  const [done, setDone] = useState(skipDone);
  const [period, setPeriod] = useState(skipPeriodMet);
  const [adding, setAdding] = useState<{ hour: number; minute: number } | null>(null);
  const periodKind = periodTypeOf(rule);

  const add = async () => {
    if (items.length >= MAX) return;
    if (items.length === 0 && !kv.getString(PRIMER_KEY)) {
      kv.setString(PRIMER_KEY, '1');
      const agreed = await overlay.confirm({
        title: reminderCopy.primerTitle,
        message: reminderCopy.primerMessage,
        confirmLabel: reminderCopy.primerYes,
        cancelLabel: reminderCopy.primerNo,
      });
      if (agreed) await notifications.request();
    }
    setAdding(nextHour());
  };

  const confirmAdd = () => {
    if (!adding) return;
    const time = `${pad(adding.hour)}:${pad(adding.minute)}`;
    if (items.some((item) => item.time === time)) {
      overlay.toast(reminderCopy.duplicate);
      return;
    }
    setItems((list) => [...list, { time, enabled: true }].sort((a, b) => a.time.localeCompare(b.time)));
    setAdding(null);
  };

  const hint =
    rule.kind === 'weekdays' && rule.weekdays.length < 7
      ? reminderCopy.weekdays(describeWeekdays(rule.weekdays))
      : rule.kind === 'monthDates'
        ? reminderCopy.monthDates(describeMonthDates(rule.dates))
        : null;

  return (
    <View style={styles.root}>
      <SheetTitle title={reminderCopy.title} />
      {items.map((item) => (
        <SwipeToDelete
          key={item.time}
          label="删除"
          onDelete={() => setItems((list) => list.filter((row) => row.time !== item.time))}
        >
          <View style={[styles.row, { borderBottomColor: colors.hairline }]}>
            <AppText variant="numberS">{item.time}</AppText>
            <View style={styles.rowTail}>
              <CandySwitch
                value={item.enabled}
                accessibilityLabel={item.time}
                onValueChange={(enabled) =>
                  setItems((list) => list.map((row) => (row.time === item.time ? { ...row, enabled } : row)))
                }
              />
            </View>
          </View>
        </SwipeToDelete>
      ))}
      {items.length < MAX && !adding ? (
        <Pressable accessibilityRole="button" onPress={() => void add()} style={styles.add}>
          <Icon name="plus" size={18} color={colors.link} />
          <AppText variant="callout" tone="link">
            {reminderCopy.add}
          </AppText>
        </Pressable>
      ) : null}
      {adding ? (
        <View style={styles.picker}>
          <Stepper
            value={adding.hour}
            min={0}
            max={23}
            unit={reminderCopy.hour}
            accessibilityLabel="小时"
            onChange={(hour) => setAdding({ ...adding, hour })}
          />
          <Stepper
            value={adding.minute}
            min={0}
            max={59}
            unit={reminderCopy.minute}
            accessibilityLabel="分钟"
            onChange={(minute) => setAdding({ ...adding, minute })}
          />
          <CandyButton label={reminderCopy.addThis} size="sm" onPress={confirmAdd} />
        </View>
      ) : null}
      <View style={[styles.flags, { borderTopColor: colors.hairline }]}>
        <View style={styles.flag}>
          <AppText variant="body" style={styles.flex}>
            {reminderCopy.skipDone}
          </AppText>
          <CandySwitch value={done} onValueChange={setDone} accessibilityLabel={reminderCopy.skipDone} />
        </View>
        {periodKind !== 'day' ? (
          <View style={styles.flag}>
            <AppText variant="body" style={styles.flex}>
              {periodKind === 'month' ? reminderCopy.skipPeriodMonth : reminderCopy.skipPeriod}
            </AppText>
            <CandySwitch value={period} onValueChange={setPeriod} accessibilityLabel={reminderCopy.skipPeriod} />
          </View>
        ) : null}
      </View>
      {hint ? (
        <AppText variant="caption" tone="secondary">
          {hint}
        </AppText>
      ) : null}
      <Pressable onPress={onOpenCheck} hitSlop={6}>
        <AppText variant="caption" tone="link">
          {reminderCopy.checkTitle}
        </AppText>
      </Pressable>
      <CandyButton
        label={reminderCopy.done}
        onPress={() => onDone({ reminders: items, skipDone: done, skipPeriodMet: period })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: space.md, paddingBottom: space.sm },
  row: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  rowTail: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  add: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8 },
  picker: { gap: space.sm },
  flags: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: space.md, gap: space.md },
  flag: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  flex: { flex: 1 },
});
