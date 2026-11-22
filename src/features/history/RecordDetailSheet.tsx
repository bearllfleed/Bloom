/**
 * 记录详情面板（第 1 期 1-7）：项目、归属日期、实际打卡时间、来源（仅小组件/通知）、备注（可编辑）、删除。
 */
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { formatClock, formatMonthDay, formatMonthDayWeekday, localDateFromTimestamp } from '@/domain/date';
import type { CheckinRecord, ProjectEntity } from '@/domain/types';
import { historyCopy } from '@/copy/project';
import { toastCopy } from '@/copy/today';
import { checkinService } from '@/services/checkinService';
import { overlay } from '@/stores/overlayQueue';
import { AppText } from '@/ui/components/AppText';
import { CandyButton } from '@/ui/components/CandyButton';
import { ProjectBadge } from '@/ui/components/ProjectBadge';
import { TextField } from '@/ui/components/TextField';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { space } from '@/ui/tokens';

import { deleteRecordWithUndo } from './recordActions';

function Row({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.row, { borderBottomColor: colors.hairline }]}>
      <AppText variant="callout" tone="secondary">
        {label}
      </AppText>
      <AppText variant="callout">{value}</AppText>
    </View>
  );
}

function RecordDetail({
  record,
  project,
  onClose,
}: {
  record: CheckinRecord;
  project: ProjectEntity;
  onClose: () => void;
}) {
  const [note, setNote] = useState(record.note ?? '');
  const actualDate = localDateFromTimestamp(record.checkedAt);
  return (
    <View style={styles.root}>
      <View style={styles.title}>
        <ProjectBadge iconId={project.iconId} colorId={project.colorId} size={40} />
        <AppText variant="title3">{project.name}</AppText>
      </View>
      <View>
        <Row label={historyCopy.belongsTo} value={formatMonthDayWeekday(record.date)} />
        <Row label={historyCopy.checkedAt} value={`${formatMonthDay(actualDate)} ${formatClock(record.checkedAt)}`} />
        {record.source !== 'app' ? (
          <Row
            label={historyCopy.source}
            value={record.source === 'widget' ? historyCopy.sourceWidget : historyCopy.sourceNotification}
          />
        ) : null}
      </View>
      <TextField
        value={note}
        onChangeText={setNote}
        maxLength={200}
        placeholder={historyCopy.notePlaceholder}
        multiline
      />
      <CandyButton
        label={historyCopy.saveNote}
        size="md"
        disabled={note === (record.note ?? '')}
        onPress={() => {
          checkinService.updateNote(record.id, note);
          onClose();
          overlay.toast(toastCopy.noteSaved);
        }}
      />
      <CandyButton
        label={historyCopy.deleteRecord}
        variant="text"
        size="md"
        onPress={() => {
          onClose();
          deleteRecordWithUndo(record.id);
        }}
      />
    </View>
  );
}

export function openRecordDetail(record: CheckinRecord, project: ProjectEntity) {
  overlay.openSheet((close) => <RecordDetail record={record} project={project} onClose={close} />);
}

const styles = StyleSheet.create({
  root: { gap: space.md, paddingBottom: space.sm },
  title: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
