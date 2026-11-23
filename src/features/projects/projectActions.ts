/**
 * 项目的暂停/继续/删除操作及其提示（需求 5.7、5.13）：我的项目页与项目详情共用。
 * 暂停给 3 秒撤销；删除先确认、写明记录数，之后 5 秒撤销。
 */
import type { ProjectEntity } from '@/domain/types';
import { graduationCopy } from '@/copy/phase2';
import { confirmCopy } from '@/copy/project';
import { toastCopy } from '@/copy/today';
import { haptics } from '@/platform/haptics';
import { projectService } from '@/services/projectService';
import { overlay } from '@/stores/overlayQueue';

const DELETE_UNDO_MS = 5000;

export function pauseProject(project: ProjectEntity): void {
  if (!projectService.pause(project.id)) return;
  haptics.soft();
  overlay.toast(toastCopy.paused(project.name), {
    actionLabel: toastCopy.undo,
    onAction: () => projectService.resume(project.id),
  });
}

export function resumeProject(project: ProjectEntity): void {
  if (!projectService.resume(project.id)) return;
  haptics.soft();
  overlay.toast(toastCopy.resumed(project.name));
}

/** 提前毕业：确认后进入已毕业，典礼由队列补上 */
export async function graduateEarly(project: ProjectEntity): Promise<boolean> {
  const confirmed = await overlay.confirm({
    title: graduationCopy.earlyTitle(project.name),
    message: graduationCopy.earlyMessage,
    confirmLabel: graduationCopy.earlyConfirm,
    cancelLabel: graduationCopy.earlyCancel,
  });
  if (!confirmed) return false;
  haptics.success();
  return projectService.graduateNow(project.id);
}

/** 删除：确认后返回 true（调用方可据此离开详情页） */
export async function deleteProject(project: ProjectEntity): Promise<boolean> {
  const count = projectService.recordCount(project.id);
  const confirmed = await overlay.confirm({
    title: confirmCopy.deleteTitle(project.name),
    message: confirmCopy.deleteMessage(count),
    confirmLabel: confirmCopy.deleteConfirm,
    cancelLabel: confirmCopy.deleteCancel,
    destructive: true,
  });
  if (!confirmed) return false;
  haptics.warning();
  projectService.softDelete(project.id);
  overlay.toast(toastCopy.deletedProject(project.name), {
    actionLabel: toastCopy.undo,
    onAction: () => projectService.undoDelete(project.id),
    durationMs: DELETE_UNDO_MS,
  });
  return true;
}
