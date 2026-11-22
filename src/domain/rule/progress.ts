/**
 * 当天进度与周期进度（口径见需求 5.1、5.9）。
 * 负责：某天打了几次/目标几次；某周/某月达标了没有，以及不完整周期的目标折算。
 * 不负责：连续与完成率（见 stats/）。
 */
import { addDays, compareDates, diffDays, eachDay, endOfMonth, endOfWeek, startOfMonth, startOfWeek } from '../date';
import type { DailyCounts, FrequencyRule, LocalDate, ProjectSnapshot, RuleSettings } from '../types';
import { dayTargetOf, isDayCompleted, isRequiredKind, periodTypeOf } from './frequency';
import { isInActiveRange, ruleOn, visibilityOn } from './visibility';

export interface DayProgress {
  count: number;
  /** 当天目标；累计次数类为 null */
  target: number | null;
  completed: boolean;
}

export function dayProgress(project: ProjectSnapshot, date: LocalDate, counts: DailyCounts): DayProgress {
  const rule = ruleOn(project.ruleVersions, date);
  const count = counts.get(date) ?? 0;
  return { count, target: dayTargetOf(rule), completed: isDayCompleted(rule, count) };
}

export interface Period {
  type: 'week' | 'month';
  start: LocalDate;
  end: LocalDate;
}

export function periodContaining(type: 'week' | 'month', date: LocalDate, settings: RuleSettings): Period {
  return type === 'week'
    ? { type, start: startOfWeek(date, settings.weekStart), end: endOfWeek(date, settings.weekStart) }
    : { type, start: startOfMonth(date), end: endOfMonth(date) };
}

export function nextPeriod(period: Period, settings: RuleSettings): Period {
  return periodContaining(period.type, addDays(period.end, 1), settings);
}

export function previousPeriod(period: Period, settings: RuleSettings): Period {
  return periodContaining(period.type, addDays(period.start, -1), settings);
}

/** 周期内的有效天数：在项目起止范围内且未暂停的天数 */
export function effectiveDaysIn(project: ProjectSnapshot, period: Period): number {
  return eachDay(period.start, period.end).filter((d) => isInActiveRange(project, d).visible).length;
}

/** 周期内生效的规则：周期中途改了频率时，整个周期都按新规则（需求 5.6） */
export function ruleForPeriod(project: ProjectSnapshot, period: Period): FrequencyRule {
  return ruleOn(project.ruleVersions, period.end);
}

export interface PeriodProgress {
  period: Period;
  effectiveDays: number;
  /** 折算后的目标：任选几天类为天数，累计次数类为次数 */
  target: number;
  /** 已完成：任选几天类为完成天数，累计次数类为总次数 */
  achieved: number;
  unit: 'days' | 'times';
  met: boolean;
}

/**
 * 周期型频率在某个周期的进度。
 * 不完整周期的目标：任选几天 = min(目标天数, 有效天数)；累计次数 = 向上取整(目标次数 × 有效天数 ÷ 周期天数)。
 */
export function periodProgressFor(
  project: ProjectSnapshot,
  rule: FrequencyRule,
  period: Period,
  counts: DailyCounts,
): PeriodProgress {
  const effectiveDays = effectiveDaysIn(project, period);
  const days = eachDay(period.start, period.end);
  if (rule.kind === 'weeklyTimes' || rule.kind === 'monthlyTimes') {
    const periodLength = diffDays(period.start, period.end) + 1;
    const target = Math.ceil((rule.times * effectiveDays) / periodLength);
    const achieved = days.reduce((sum, d) => sum + (counts.get(d) ?? 0), 0);
    return { period, effectiveDays, target, achieved, unit: 'times', met: target > 0 && achieved >= target };
  }
  if (rule.kind === 'weeklyDays' || rule.kind === 'monthlyDays') {
    const target = Math.min(rule.days, effectiveDays);
    const achieved = days.filter((d) => isDayCompleted(rule, counts.get(d) ?? 0)).length;
    return { period, effectiveDays, target, achieved, unit: 'days', met: target > 0 && achieved >= target };
  }
  throw new Error(`频率 ${rule.kind} 不是周期型`);
}

/** 某天所在周期的进度；当天频率不是周期型时返回 null */
export function periodProgressOn(
  project: ProjectSnapshot,
  date: LocalDate,
  counts: DailyCounts,
  settings: RuleSettings,
): PeriodProgress | null {
  const type = periodTypeOf(ruleOn(project.ruleVersions, date));
  if (type === 'day') return null;
  const period = periodContaining(type, date, settings);
  return periodProgressFor(project, ruleForPeriod(project, period), period, counts);
}

/**
 * 一个周/月是否"达标"，任何频率都适用（成就"周期达人"系列用，见附录 A）。
 * - 周期型且周期类型一致：按周期目标判断；
 * - 必须打卡类：周期内（截至 today）出现的计划日全部完成，且至少有一个计划日；
 * - 其他组合（如按月频率统计周）：周期内有完成日即算达标。
 * 周期内没有有效天数时返回 null，表示该周期不参与统计。
 */
export function isPeriodMet(
  project: ProjectSnapshot,
  period: Period,
  counts: DailyCounts,
  today: LocalDate,
): boolean | null {
  if (effectiveDaysIn(project, period) === 0) return null;
  const rule = ruleForPeriod(project, period);
  if (periodTypeOf(rule) === period.type) return periodProgressFor(project, rule, period, counts).met;

  const lastDay = compareDates(period.end, today) <= 0 ? period.end : today;
  if (compareDates(period.start, lastDay) > 0) return false;
  const days = eachDay(period.start, lastDay);
  const completedOn = (d: LocalDate) => isDayCompleted(ruleOn(project.ruleVersions, d), counts.get(d) ?? 0);
  if (isRequiredKind(rule.kind)) {
    const planDays = days.filter((d) => visibilityOn(project, d).visible);
    return planDays.length > 0 && planDays.every(completedOn);
  }
  return days.filter((d) => isInActiveRange(project, d).visible).some(completedOn);
}
