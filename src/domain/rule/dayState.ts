/**
 * 某个项目在某天的"卡片状态"：花苞按钮显示什么、点一下做什么（第 1 期文档 1-2、第 0 期第 3 节）。
 * 负责：把次数、周期进度、能否打卡合成界面可以直接用的结论。
 * 不负责：文案（由界面按结论选文案）。
 */
import type { DailyCounts, FrequencyRule, LocalDate, ProjectSnapshot, RuleSettings } from '../types';
import { dayTargetOf, isDayCompleted, isTimesKind } from './frequency';
import { periodProgressOn, type PeriodProgress } from './progress';
import { canCheckIn, ruleOn, type CheckInBlockReason } from './visibility';

export type TapAction = 'checkIn' | 'menu' | 'blocked';

export interface DayCardState {
  rule: FrequencyRule;
  count: number;
  /** 当天目标；累计次数类为 null */
  target: number | null;
  dayCompleted: boolean;
  /** 周期型的周期进度；按天计数的为 null */
  period: PeriodProgress | null;
  /** 花苞按钮是否显示盛开 */
  bloomed: boolean;
  /** 周期已达标（盛开 + 小勾） */
  met: boolean;
  /** 外圈分段；不需要分段时为 null */
  segments: { done: number; total: number } | null;
  tapAction: TapAction;
  blockReason: CheckInBlockReason | null;
}

export function dayCardState(
  project: ProjectSnapshot,
  date: LocalDate,
  today: LocalDate,
  counts: DailyCounts,
  settings: RuleSettings,
): DayCardState {
  const rule = ruleOn(project.ruleVersions, date);
  const count = counts.get(date) ?? 0;
  const target = dayTargetOf(rule);
  const dayCompleted = isDayCompleted(rule, count);
  const period = periodProgressOn(project, date, counts, settings);
  const met = period?.met ?? false;
  const verdict = canCheckIn(project, date, today, count);
  const blockReason = verdict.ok ? null : verdict.reason;

  if (isTimesKind(rule.kind)) {
    // 累计次数类：没有当天目标，按周期进度画外圈，达标后仍可继续打卡
    const periodTarget = period?.target ?? 0;
    return {
      rule,
      count,
      target,
      dayCompleted,
      period,
      bloomed: met,
      met,
      segments: periodTarget > 1 ? { done: Math.min(period?.achieved ?? 0, periodTarget), total: periodTarget } : null,
      tapAction: verdict.ok ? 'checkIn' : blockReason === 'dailyFull' ? 'menu' : 'blocked',
      blockReason,
    };
  }

  const segments = target !== null && target > 1 ? { done: Math.min(count, target), total: target } : null;
  return {
    rule,
    count,
    target,
    dayCompleted,
    period,
    // 任选几天类：周期达标后即使今天没打也显示盛开 + 小勾
    bloomed: dayCompleted || met,
    met,
    segments,
    tapAction: dayCompleted ? 'menu' : verdict.ok ? 'checkIn' : 'blocked',
    blockReason: dayCompleted ? null : blockReason,
  };
}

/** 这一次打卡是否"打完了"：决定是否弹成绩面板（单次每次、多次最后一次、累计次数类每次） */
export function isCompletingCheckIn(rule: FrequencyRule, countAfter: number): boolean {
  const target = dayTargetOf(rule);
  return target === null || countAfter === target;
}
