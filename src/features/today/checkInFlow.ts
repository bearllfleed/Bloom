/**
 * 一次打卡在界面上的完整流程（第 1 期 1-2"打卡交互"）：
 * 写入 → 撤销条 → 需要时弹成绩面板 → 完美日庆祝（有成绩面板时等面板关闭后再播）。
 * 今日页、项目详情、某天记录面板共用。
 */
import type { LocalDate, ProjectEntity } from '@/domain/types';
import { blockReasonCopy, toastCopy } from '@/copy/today';
import { haptics } from '@/platform/haptics';
import { checkinService } from '@/services/checkinService';
import { getDayRecords } from '@/services/queries';
import { overlay } from '@/stores/overlayQueue';

import { useCelebration } from './celebration';
import { openNoteSheet } from './NoteSheet';

/** 花苞绽放 520ms + 400ms 后弹成绩面板 */
const NOTE_DELAY_MS = 920;
/** 绽放结束 300ms 后开始庆祝 */
const CELEBRATE_DELAY_MS = 820;

export function checkInWithFeedback(project: ProjectEntity, date: LocalDate): boolean {
  const result = checkinService.checkIn(project.id, date);
  if (!result.ok) {
    if (result.reason === 'tooFast') return false;
    if (result.reason === 'writeFailed' || result.reason === 'notFound') {
      overlay.toast(toastCopy.writeFailed);
    } else {
      haptics.warning();
      overlay.toast(blockReasonCopy[result.reason]);
    }
    return false;
  }

  const message =
    result.target !== null && result.target > 1
      ? toastCopy.multiCheckedIn(project.name, Math.min(result.countAfter, result.target), result.target, project.unit)
      : toastCopy.checkedIn(project.name);
  overlay.toast(message, {
    actionLabel: toastCopy.undo,
    onAction: () => {
      checkinService.undo(result.checkinId);
    },
  });

  const celebrate = () => {
    if (result.perfect !== 'none') useCelebration.getState().celebrate(result.perfect, date);
  };
  if (result.completing && project.noteEnabled) {
    setTimeout(() => {
      openNoteSheet({ checkinId: result.checkinId, projectName: project.name, date, onClosed: celebrate });
    }, NOTE_DELAY_MS);
  } else if (result.perfect !== 'none') {
    setTimeout(celebrate, CELEBRATE_DELAY_MS);
  }
  return true;
}

/** 已完成菜单里的"撤销一次" */
export function undoLatestCheckIn(projectId: string, date: LocalDate): void {
  checkinService.undoLatest(projectId, date);
}

/** 给某天最近一条记录写/改成绩 */
export function editLatestNote(project: ProjectEntity, date: LocalDate): void {
  const record = getDayRecords(project.id, date)?.records[0];
  if (!record) return;
  openNoteSheet({ checkinId: record.id, projectName: project.name, date, initial: record.note ?? '' });
}

export function blockedFeedback(reason: keyof typeof blockReasonCopy): void {
  overlay.toast(blockReasonCopy[reason]);
}
