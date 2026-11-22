/**
 * 某一天所有项目的汇总：日历花朵标记、热力分级、完美日（口径见需求 5.9）。
 */
import { isDayCompleted, isRequiredKind, ruleOn, visibilityOn } from '../rule';
import type { DailyCounts, LocalDate, ProjectSnapshot } from '../types';

export interface ProjectWithCounts {
  project: ProjectSnapshot;
  counts: DailyCounts;
}

/** 日历格下方的标记：无 / 小圆点 / 花苞 / 盛开 */
export type FlowerMark = 'none' | 'dot' | 'bud' | 'bloom';

/** 热力分级 0–4；当天没有计划时为 null */
export type HeatLevel = 0 | 1 | 2 | 3 | 4;

export interface DayOverview {
  /** 计划项目数：必须打卡类全部计入，弹性类只计入当天打过卡的 */
  planned: number;
  completed: number;
  /** 必须打卡类项目数 */
  required: number;
  isPerfect: boolean;
  level: HeatLevel | null;
}

export function dayOverview(items: readonly ProjectWithCounts[], date: LocalDate): DayOverview {
  let planned = 0;
  let completed = 0;
  let required = 0;
  for (const { project, counts } of items) {
    if (!visibilityOn(project, date).visible) continue;
    const rule = ruleOn(project.ruleVersions, date);
    const count = counts.get(date) ?? 0;
    const requiredKind = isRequiredKind(rule.kind);
    // 弹性项目当天没打卡不算进计划，"没打不扣分"
    if (!requiredKind && count === 0) continue;
    planned++;
    if (requiredKind) required++;
    if (isDayCompleted(rule, count)) completed++;
  }
  const isPerfect = planned > 0 && completed === planned;
  return { planned, completed, required, isPerfect, level: heatLevelOf(planned, completed) };
}

export function heatLevelOf(planned: number, completed: number): HeatLevel | null {
  if (planned === 0) return null;
  if (completed === 0) return 0;
  const ratio = completed / planned;
  if (ratio >= 1) return 4;
  if (ratio <= 1 / 3) return 1;
  if (ratio <= 2 / 3) return 2;
  return 3;
}

/** 日历格标记：未来不显示；今天还没完成任何一个时不显示小圆点 */
export function flowerMarkOf(overview: DayOverview, date: LocalDate, today: LocalDate): FlowerMark {
  if (date > today || overview.planned === 0) return 'none';
  if (overview.completed === 0) return date === today ? 'none' : 'dot';
  return overview.completed === overview.planned ? 'bloom' : 'bud';
}
