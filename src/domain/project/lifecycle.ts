/**
 * 项目状态的判定与转换（口径见需求 5.3、5.7、5.8）。
 * 负责：未开始/进行中/暂停/毕业的界面状态、暂停与继续的日期区间、自动毕业。
 * 不负责：读写数据库（服务层按这里的结论写库）。
 */
import { addDays, diffDays } from '../date';
import type { LocalDate, PauseInterval, ProjectSnapshot } from '../types';

/** 界面上的状态："未开始"由开始日期派生，不单独存储 */
export type DisplayStatus = 'notStarted' | 'active' | 'paused' | 'graduated';

export function displayStatusOf(project: ProjectSnapshot, today: LocalDate): DisplayStatus {
  if (project.status === 'graduated') return 'graduated';
  if (project.status === 'paused') return 'paused';
  return today < project.startDate ? 'notStarted' : 'active';
}

/** 未结束的暂停区间 */
export function openPauseOf(project: ProjectSnapshot): PauseInterval | null {
  return project.pauses.find((p) => p.endDate === null) ?? null;
}

/** 能否暂停：只有进行中的项目可以 */
export function canPause(project: ProjectSnapshot, today: LocalDate): boolean {
  return displayStatusOf(project, today) === 'active';
}

/** 暂停从今天开始；今天已经打过卡，则从明天开始（今天照常算） */
export function pauseStartDate(today: LocalDate, checkedInToday: boolean): LocalDate {
  return checkedInToday ? addDays(today, 1) : today;
}

export type ResumePlan = { kind: 'discard' } | { kind: 'close'; endDate: LocalDate };

/**
 * 继续：从今天恢复，暂停区间截止到昨天。
 * 暂停还没真正开始（当天暂停又继续、或暂停从明天才开始），等于没暂停过，整段丢弃。
 */
export function resumePlan(openPause: PauseInterval, today: LocalDate): ResumePlan {
  if (openPause.startDate >= today) return { kind: 'discard' };
  return { kind: 'close', endDate: addDays(today, -1) };
}

/** 已暂停了几天（含今天）；暂停从明天开始时为 0 */
export function pausedDays(project: ProjectSnapshot, today: LocalDate): number {
  const open = openPauseOf(project);
  if (!open || open.startDate > today) return 0;
  return diffDays(open.startDate, today) + 1;
}

/** 截止日期那天过完（逻辑今天 > 截止日期）就该自动毕业 */
export function needsAutoGraduation(project: ProjectSnapshot, today: LocalDate): boolean {
  return project.status !== 'graduated' && project.endDate !== null && today > project.endDate;
}

/** 毕业时，未结束的暂停截止到毕业日；暂停晚于毕业日开始的整段丢弃 */
export function pausePlanOnGraduation(openPause: PauseInterval, graduatedOn: LocalDate): ResumePlan {
  if (openPause.startDate > graduatedOn) return { kind: 'discard' };
  return { kind: 'close', endDate: graduatedOn };
}

/** 未开始的项目还有几天开始 */
export function daysUntilStart(project: ProjectSnapshot, today: LocalDate): number {
  return Math.max(0, diffDays(today, project.startDate));
}

/** 有截止日期时：今天是第几天、共几天（"第 18/90 天"）；没有截止日期时为 null */
export function journeyProgress(project: ProjectSnapshot, today: LocalDate): { day: number; total: number } | null {
  if (project.endDate === null) return null;
  const total = diffDays(project.startDate, project.endDate) + 1;
  const last = project.status === 'graduated' && project.graduatedOn ? project.graduatedOn : today;
  const day = Math.min(total, Math.max(0, diffDays(project.startDate, last) + 1));
  return { day, total };
}
