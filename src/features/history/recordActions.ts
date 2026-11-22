/**
 * 单条记录的删除（不确认，5 秒撤销）与补卡时间写法。
 */
import { formatClock, formatMonthDay, localDateFromTimestamp } from '@/domain/date';
import type { CheckinRecord } from '@/domain/types';
import { toastCopy } from '@/copy/today';
import { haptics } from '@/platform/haptics';
import { checkinService } from '@/services/checkinService';
import { overlay } from '@/stores/overlayQueue';

export function deleteRecordWithUndo(recordId: string): void {
  const removed = checkinService.deleteRecord(recordId);
  if (!removed) return;
  haptics.warning();
  overlay.toast(toastCopy.deletedRecord, {
    actionLabel: toastCopy.undo,
    onAction: () => checkinService.restoreRecord(removed),
    durationMs: 5000,
  });
}

/** 归属日期与实际打卡不在同一天时写"11月20日 07:56"，否则只写"07:56" */
export function recordTimeLabel(record: CheckinRecord): string {
  const actual = localDateFromTimestamp(record.checkedAt);
  return actual === record.date
    ? formatClock(record.checkedAt)
    : `${formatMonthDay(actual)} ${formatClock(record.checkedAt)}`;
}
