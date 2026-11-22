/**
 * 成绩面板（第 1 期 1-4）：打卡完成后弹出，自动聚焦；跳过或下滑关闭时打卡照常有效。
 * 补卡时标题写"11月20日的成绩 · 跑步"；也用于之后修改备注。
 */
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { formatMonthDay } from '@/domain/date';
import type { LocalDate } from '@/domain/types';
import { noteCopy, toastCopy } from '@/copy/today';
import { clock } from '@/platform/clock';
import { checkinService } from '@/services/checkinService';
import { overlay } from '@/stores/overlayQueue';
import { CandyButton } from '@/ui/components/CandyButton';
import { SheetTitle } from '@/ui/components/SheetTitle';
import { TextField } from '@/ui/components/TextField';
import { space } from '@/ui/tokens';

interface NoteSheetProps {
  checkinId: string;
  projectName: string;
  date: LocalDate;
  initial: string;
  onClose: () => void;
}

function NoteContent({ checkinId, projectName, date, initial, onClose }: NoteSheetProps) {
  const [text, setText] = useState(initial);
  const title =
    date === clock.today() ? noteCopy.title(projectName) : noteCopy.titleOn(formatMonthDay(date), projectName);
  return (
    <View style={styles.root}>
      <SheetTitle title={title} />
      <TextField
        value={text}
        onChangeText={setText}
        maxLength={noteCopy.maxLength}
        countFrom={0}
        placeholder={noteCopy.placeholder}
        multiline
        autoFocus
      />
      <View style={styles.actions}>
        <CandyButton label={noteCopy.skip} variant="text" size="md" onPress={onClose} />
        <CandyButton
          label={noteCopy.save}
          size="md"
          style={styles.save}
          onPress={() => {
            checkinService.updateNote(checkinId, text);
            onClose();
            overlay.toast(toastCopy.noteSaved);
          }}
        />
      </View>
    </View>
  );
}

/** 打开成绩面板；面板关闭后回调 onClosed（用于之后再播放完美日庆祝） */
export function openNoteSheet(opts: {
  checkinId: string;
  projectName: string;
  date: LocalDate;
  initial?: string;
  onClosed?: () => void;
}) {
  let closed = false;
  const finish = () => {
    if (closed) return;
    closed = true;
    opts.onClosed?.();
  };
  const closeSheet = overlay.openSheet((close) => (
    <NoteContent
      checkinId={opts.checkinId}
      projectName={opts.projectName}
      date={opts.date}
      initial={opts.initial ?? ''}
      onClose={() => {
        close();
        finish();
      }}
    />
  ));
  return () => {
    closeSheet();
    finish();
  };
}

const styles = StyleSheet.create({
  root: { gap: space.md, paddingBottom: space.sm },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  save: { minWidth: 140 },
});
