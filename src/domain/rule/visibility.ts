/**
 * 项目在某天"出现不出现、能不能打卡"（口径见需求 5.4、5.5）。
 * 负责：结合开始/截止/毕业/暂停/频率版本做判断。
 * 不负责：进度和统计（见 progress.ts 与 stats/）。
 */
import { compareDates } from '../date';
import type { FrequencyRule, LocalDate, PauseInterval, ProjectRuleVersion, ProjectSnapshot } from '../types';
import { dayCapOf, isPlanDayByRule } from './frequency';

/** 某天不出现的原因，界面按原因选择提示文案 */
export type HiddenReason = 'beforeStart' | 'afterEnd' | 'afterGraduation' | 'paused' | 'notPlanDay';

/** 不能打卡的原因 */
export type CheckInBlockReason = 'future' | HiddenReason | 'dailyFull';

export type Visibility = { visible: true } | { visible: false; reason: HiddenReason };

export type CheckInVerdict = { ok: true } | { ok: false; reason: CheckInBlockReason };

/** 取某天生效的频率；早于第一个版本时按第一个版本处理 */
export function ruleOn(versions: readonly ProjectRuleVersion[], date: LocalDate): FrequencyRule {
  if (versions.length === 0) throw new Error('项目至少要有一个频率版本');
  let current = versions[0];
  for (const version of versions) {
    if (compareDates(version.effectiveFrom, date) <= 0) current = version;
    else break;
  }
  return current.rule;
}

export function isPausedOn(pauses: readonly PauseInterval[], date: LocalDate): boolean {
  return pauses.some((p) => date >= p.startDate && (p.endDate === null || date <= p.endDate));
}

/** 项目的最后一个有效日期：毕业日期、截止日期中较早的一个；都没有时为 null */
export function lastActiveDate(project: ProjectSnapshot): LocalDate | null {
  const candidates = [project.endDate, project.status === 'graduated' ? project.graduatedOn : null].filter(
    (d): d is LocalDate => d !== null,
  );
  if (candidates.length === 0) return null;
  return candidates.reduce((a, b) => (a <= b ? a : b));
}

/** 不看频率，只看日期是否在项目的有效范围内且没有暂停 */
export function isInActiveRange(project: ProjectSnapshot, date: LocalDate): Visibility {
  if (date < project.startDate) return { visible: false, reason: 'beforeStart' };
  if (project.endDate !== null && date > project.endDate) return { visible: false, reason: 'afterEnd' };
  if (project.status === 'graduated' && project.graduatedOn !== null && date > project.graduatedOn) {
    return { visible: false, reason: 'afterGraduation' };
  }
  if (isPausedOn(project.pauses, date)) return { visible: false, reason: 'paused' };
  return { visible: true };
}

/** 需求 5.4 的五条判断，按顺序命中即返回 */
export function visibilityOn(project: ProjectSnapshot, date: LocalDate): Visibility {
  const range = isInActiveRange(project, date);
  if (!range.visible) return range;
  if (!isPlanDayByRule(ruleOn(project.ruleVersions, date), date)) return { visible: false, reason: 'notPlanDay' };
  return { visible: true };
}

/**
 * 能否在某天再打一次卡。
 * @param countOnDate 该项目在这一天已有的打卡次数
 * @param today 逻辑今天
 */
export function canCheckIn(
  project: ProjectSnapshot,
  date: LocalDate,
  today: LocalDate,
  countOnDate: number,
): CheckInVerdict {
  if (date > today) return { ok: false, reason: 'future' };
  const visibility = visibilityOn(project, date);
  if (!visibility.visible) return { ok: false, reason: visibility.reason };
  if (countOnDate >= dayCapOf(ruleOn(project.ruleVersions, date))) return { ok: false, reason: 'dailyFull' };
  return { ok: true };
}
