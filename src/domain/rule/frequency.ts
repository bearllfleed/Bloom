/**
 * 打卡频率的基础判断：某种频率属于哪类、当天目标几次、某天是不是计划日。
 * 负责：只看"一条频率规则 + 一个日期"就能回答的问题。
 * 不负责：开始/截止/暂停等项目层面的判断（见 visibility.ts）。
 */
import { daysInMonth, parseLocalDate, weekdayOf } from '../date';
import type { FrequencyKind, FrequencyRule, LocalDate } from '../types';

/** 周期类型：按天计数的频率为 day，周期型为 week / month */
export type PeriodType = 'day' | 'week' | 'month';

/** 每天累计次数类频率当天最多记几次（防误操作，见需求 5.1） */
export const MAX_TIMES_PER_DAY_FOR_TIMES_KIND = 99;

/**
 * "必须打卡"类频率：每天、每周固定几天、每月固定几号。
 * 其余为"弹性"类：只要求周期内凑够天数或次数，哪天打都行。
 */
export function isRequiredKind(kind: FrequencyKind): boolean {
  return kind === 'daily' || kind === 'weekdays' || kind === 'monthDates';
}

/** 累计次数类：没有当天目标，只看周期内总次数 */
export function isTimesKind(kind: FrequencyKind): boolean {
  return kind === 'weeklyTimes' || kind === 'monthlyTimes';
}

/** 连续与完成率按哪种周期计算 */
export function periodTypeOf(rule: FrequencyRule): PeriodType {
  switch (rule.kind) {
    case 'daily':
    case 'weekdays':
    case 'monthDates':
      return 'day';
    case 'weeklyDays':
    case 'weeklyTimes':
      return 'week';
    case 'monthlyDays':
    case 'monthlyTimes':
      return 'month';
  }
}

/** 当天需要打几次才算完成；累计次数类没有当天目标，返回 null */
export function dayTargetOf(rule: FrequencyRule): number | null {
  return isTimesKind(rule.kind) ? null : (rule as { timesPerDay: number }).timesPerDay;
}

/** 当天最多可打几次 */
export function dayCapOf(rule: FrequencyRule): number {
  return dayTargetOf(rule) ?? MAX_TIMES_PER_DAY_FOR_TIMES_KIND;
}

/** 当天次数是否算"完成日"（累计次数类当天打过 1 次即算） */
export function isDayCompleted(rule: FrequencyRule, count: number): boolean {
  const target = dayTargetOf(rule);
  return target === null ? count >= 1 : count >= target;
}

/**
 * 每月固定几号：选了 29/30/31 号而当月没有这一天时，改到当月最后一天（需求 5.1）。
 */
export function isSelectedMonthDate(dates: readonly number[], date: LocalDate): boolean {
  const { year, month, day } = parseLocalDate(date);
  const lastDay = daysInMonth(year, month);
  return dates.some((d) => d === day || (d > lastDay && day === lastDay));
}

/** 仅按频率判断某天是否计划日；弹性类每天都可以打卡，视为计划日 */
export function isPlanDayByRule(rule: FrequencyRule, date: LocalDate): boolean {
  switch (rule.kind) {
    case 'weekdays':
      return rule.weekdays.includes(weekdayOf(date));
    case 'monthDates':
      return isSelectedMonthDate(rule.dates, date);
    default:
      return true;
  }
}
