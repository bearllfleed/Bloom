/**
 * 连续与完成率（口径见需求 5.9）。
 * 负责：单个项目的当前连续、最长连续、完成率。
 * 不负责：跨项目汇总（见 overview.ts）。
 */
import { compareDates, eachDay, minDate } from '../date';
import {
  isDayCompleted,
  isPeriodMet,
  isRequiredKind,
  lastActiveDate,
  nextPeriod,
  periodContaining,
  periodTypeOf,
  ruleOn,
  visibilityOn,
  type Period,
} from '../rule';
import type { DailyCounts, LocalDate, ProjectSnapshot, RuleSettings } from '../types';

export type StreakUnit = 'day' | 'week' | 'month';

export interface StreakResult {
  current: number;
  best: number;
  unit: StreakUnit;
}

export interface CompletionRate {
  /** 0–1；分母为 0 时为 null（还没有可统计的日子） */
  rate: number | null;
  numerator: number;
  denominator: number;
  unit: StreakUnit;
}

/** 统计截止日：今天、截止日期、毕业日期中最早的一个 */
export function statsEndDate(project: ProjectSnapshot, today: LocalDate): LocalDate {
  const last = lastActiveDate(project);
  return last === null ? today : minDate(today, last);
}

/** 以项目"现在"的频率决定按天还是按周/月统计 */
export function streakUnitOf(project: ProjectSnapshot, today: LocalDate): StreakUnit {
  return periodTypeOf(ruleOn(project.ruleVersions, statsEndDate(project, today)));
}

type DayVerdict = 'completed' | 'missed' | 'skip';

/**
 * 某天在"按天统计"中的结论：
 * - 不出现的日子（非计划日、暂停、范围外）跳过；
 * - 必须打卡类：完成算 completed，未完成算 missed，但今天未完成只跳过（今天还没过完）；
 * - 历史上曾是弹性频率的日子：完成算 completed，未完成跳过（弹性日不要求每天做）。
 */
function dayVerdict(project: ProjectSnapshot, date: LocalDate, counts: DailyCounts, today: LocalDate): DayVerdict {
  if (!visibilityOn(project, date).visible) return 'skip';
  const rule = ruleOn(project.ruleVersions, date);
  const done = isDayCompleted(rule, counts.get(date) ?? 0);
  if (done) return 'completed';
  if (!isRequiredKind(rule.kind) || date === today) return 'skip';
  return 'missed';
}

function* periodsBetween(
  type: 'week' | 'month',
  from: LocalDate,
  to: LocalDate,
  settings: RuleSettings,
): Generator<Period> {
  for (let p = periodContaining(type, from, settings); compareDates(p.start, to) <= 0; p = nextPeriod(p, settings)) {
    yield p;
  }
}

export function streakOf(
  project: ProjectSnapshot,
  counts: DailyCounts,
  today: LocalDate,
  settings: RuleSettings,
): StreakResult {
  const unit = streakUnitOf(project, today);
  const end = statsEndDate(project, today);
  let run = 0;
  let best = 0;
  if (compareDates(project.startDate, end) > 0) return { current: 0, best: 0, unit };

  if (unit === 'day') {
    for (const date of eachDay(project.startDate, end)) {
      const verdict = dayVerdict(project, date, counts, today);
      if (verdict === 'completed') best = Math.max(best, ++run);
      else if (verdict === 'missed') run = 0;
    }
    return { current: run, best, unit };
  }

  for (const period of periodsBetween(unit, project.startDate, end, settings)) {
    const met = isPeriodMet(project, period, counts, today);
    if (met === null) continue;
    const isCurrent = compareDates(period.start, today) <= 0 && compareDates(today, period.end) <= 0;
    if (met) best = Math.max(best, ++run);
    else if (!isCurrent) run = 0;
  }
  return { current: run, best, unit };
}

export function completionRateOf(
  project: ProjectSnapshot,
  counts: DailyCounts,
  today: LocalDate,
  settings: RuleSettings,
): CompletionRate {
  const unit = streakUnitOf(project, today);
  const end = statsEndDate(project, today);
  let numerator = 0;
  let denominator = 0;
  if (compareDates(project.startDate, end) <= 0) {
    if (unit === 'day') {
      for (const date of eachDay(project.startDate, end)) {
        if (!visibilityOn(project, date).visible) continue;
        const rule = ruleOn(project.ruleVersions, date);
        // 弹性日不进入按天完成率；今天只有完成了才进入分母
        if (!isRequiredKind(rule.kind)) continue;
        const done = isDayCompleted(rule, counts.get(date) ?? 0);
        if (done) numerator++;
        if (done || date !== today) denominator++;
      }
    } else {
      for (const period of periodsBetween(unit, project.startDate, end, settings)) {
        const met = isPeriodMet(project, period, counts, today);
        if (met === null) continue;
        const ended = compareDates(period.end, today) < 0;
        if (met) numerator++;
        if (met || ended) denominator++;
      }
    }
  }
  return { rate: denominator === 0 ? null : numerator / denominator, numerator, denominator, unit };
}

/** 累计完成：按天统计时为完成日数，累计次数类为总次数（需求 5.9） */
export function totalCompletedOf(project: ProjectSnapshot, counts: DailyCounts, today: LocalDate) {
  const end = statsEndDate(project, today);
  const rule = ruleOn(project.ruleVersions, end);
  if (rule.kind === 'weeklyTimes' || rule.kind === 'monthlyTimes') {
    let times = 0;
    counts.forEach((n, date) => {
      if (date <= end) times += n;
    });
    return { value: times, unit: 'times' as const };
  }
  let days = 0;
  counts.forEach((n, date) => {
    if (date <= end && isDayCompleted(ruleOn(project.ruleVersions, date), n)) days++;
  });
  return { value: days, unit: 'days' as const };
}
