/**
 * 某天记录面板（第 1 期 1-6）：这一天的打卡记录，点一条改备注、左滑删除；
 * 可打卡时显示"打卡 / 再打一次"，不能时换成一行原因说明。背后月历同步开花。
 */
import { Pressable, StyleSheet, View } from 'react-native';

import { formatMonthDayWeekday } from '@/domain/date';
import { isTimesKind } from '@/domain/rule';
import type { LocalDate } from '@/domain/types';
import { detailCopy, historyCopy } from '@/copy/project';
import { blockReasonCopy } from '@/copy/today';
import { useLiveQuery } from '@/features/common/useLiveQuery';
import { deleteRecordWithUndo, recordTimeLabel } from '@/features/history/recordActions';
import { openNoteSheet } from '@/features/today/NoteSheet';
import { checkInWithFeedback } from '@/features/today/checkInFlow';
import { getDayRecords } from '@/services/queries';
import { overlay } from '@/stores/overlayQueue';
import { AppText } from '@/ui/components/AppText';
import { CandyButton } from '@/ui/components/CandyButton';
import { SheetTitle } from '@/ui/components/SheetTitle';
import { SwipeToDelete } from '@/ui/components/SwipeToDelete';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { radius, space } from '@/ui/tokens';

function DayRecordsContent({ projectId, date }: { projectId: string; date: LocalDate }) {
  const { colors } = useTheme();
  const view = useLiveQuery(() => getDayRecords(projectId, date), [projectId, date]);
  if (!view) return null;
  const { project, state, records } = view;
  const status =
    records.length === 0
      ? detailCopy.notDone
      : isTimesKind(state.rule.kind) || state.target === null
        ? detailCopy.timesOnDay(state.count, project.unit)
        : detailCopy.completed(Math.min(state.count, state.target), state.target);
  const reason =
    state.tapAction === 'checkIn'
      ? null
      : state.tapAction === 'menu'
        ? blockReasonCopy.dailyFull
        : state.blockReason
          ? blockReasonCopy[state.blockReason]
          : null;

  return (
    <View style={styles.root}>
      <SheetTitle title={`${formatMonthDayWeekday(date)} · ${project.name}`} subtitle={status} />
      {records.map((record) => (
        <SwipeToDelete key={record.id} label={historyCopy.delete} onDelete={() => deleteRecordWithUndo(record.id)}>
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              openNoteSheet({ checkinId: record.id, projectName: project.name, date, initial: record.note ?? '' })
            }
            style={[styles.record, { backgroundColor: colors.sunken }]}
          >
            <AppText variant="numberS">{recordTimeLabel(record)}</AppText>
            <AppText variant="callout" tone={record.note ? 'primary' : 'muted'} numberOfLines={2} style={styles.note}>
              {record.note ?? historyCopy.notePlaceholder}
            </AppText>
          </Pressable>
        </SwipeToDelete>
      ))}
      {reason ? (
        <AppText variant="callout" tone="secondary" align="center" style={styles.reason}>
          {reason}
        </AppText>
      ) : (
        <CandyButton
          label={state.count > 0 ? detailCopy.checkAgain : detailCopy.checkIn}
          onPress={() => checkInWithFeedback(project, date)}
        />
      )}
    </View>
  );
}

export function openDayRecords(projectId: string, date: LocalDate) {
  overlay.openSheet(() => <DayRecordsContent projectId={projectId} date={date} />);
}

const styles = StyleSheet.create({
  root: { gap: space.md, paddingBottom: space.sm },
  record: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md, borderRadius: radius.small },
  note: { flex: 1 },
  reason: { paddingVertical: space.md },
});
