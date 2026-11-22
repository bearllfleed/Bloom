/**
 * 打卡频率与时长的一句话描述（创建页预览句、项目详情副标题）。
 * 负责：把规则翻译成"每周任选 3 天，每天 1 次"这类句子，以及时长预设的截止日期计算。
 * 不负责：频率是否合法的界面提示（见表单）。
 */
import { addDays, addMonths, diffDays, formatMonthDay, weekdayChar } from '../date';
import type { FrequencyRule, LocalDate, Weekday } from '../types';

/** 每天次数的写法：1 次时固定写"1 次"，多次时带单位 */
function perDay(times: number, unit: string): string {
  return times > 1 ? `每天 ${times} ${unit}` : '每天 1 次';
}

/** 周几列表：一、三、五；连续 7 天写"每天" */
export function describeWeekdays(weekdays: readonly Weekday[]): string {
  return [...weekdays]
    .sort((a, b) => a - b)
    .map(weekdayChar)
    .join('、');
}

/** 几号列表：1 号、15 号 */
export function describeMonthDates(dates: readonly number[]): string {
  return [...dates]
    .sort((a, b) => a - b)
    .map((d) => `${d} 号`)
    .join('、');
}

/** 频率的完整一句话 */
export function describeRule(rule: FrequencyRule, unit: string): string {
  switch (rule.kind) {
    case 'daily':
      return rule.timesPerDay > 1 ? `每天 ${rule.timesPerDay} ${unit}` : '每天 1 次';
    case 'weekdays':
      if (rule.weekdays.length === 7) return perDay(rule.timesPerDay, unit);
      return `每周${describeWeekdays(rule.weekdays)}，${perDay(rule.timesPerDay, unit)}`;
    case 'weeklyDays':
      return `每周任选 ${rule.days} 天，${perDay(rule.timesPerDay, unit)}`;
    case 'weeklyTimes':
      return `每周累计 ${rule.times} ${unit}`;
    case 'monthDates':
      return `每月 ${describeMonthDates(rule.dates)}，${perDay(rule.timesPerDay, unit)}`;
    case 'monthlyDays':
      return `每月任选 ${rule.days} 天，${perDay(rule.timesPerDay, unit)}`;
    case 'monthlyTimes':
      return `每月累计 ${rule.times} ${unit}`;
  }
}

/** 两条规则是否完全一样（编辑时判断频率有没有改） */
export function isSameRule(a: FrequencyRule, b: FrequencyRule): boolean {
  const normalize = (r: FrequencyRule) =>
    JSON.stringify(r, (key, value: unknown) =>
      Array.isArray(value) ? [...(value as number[])].sort((x, y) => x - y) : value,
    );
  return normalize(a) === normalize(b);
}

/** 规则是否可保存：固定几天/几号至少选一个 */
export function isRuleValid(rule: FrequencyRule): boolean {
  if (rule.kind === 'weekdays') return rule.weekdays.length > 0;
  if (rule.kind === 'monthDates') return rule.dates.length > 0;
  return true;
}

/** 选了 29/30/31 号，需要提示"会在当月最后一天打卡" */
export function hasMonthEndDates(rule: FrequencyRule): boolean {
  return rule.kind === 'monthDates' && rule.dates.some((d) => d >= 29);
}

/** 坚持多久的预设 */
export type DurationPreset = 'forever' | 'd7' | 'd21' | 'm1' | 'm3' | 'm6' | 'y1' | 'custom';

export const DURATION_PRESETS: readonly { id: Exclude<DurationPreset, 'custom'>; label: string }[] = [
  { id: 'forever', label: '一直坚持' },
  { id: 'd7', label: '7 天' },
  { id: 'd21', label: '21 天' },
  { id: 'm1', label: '1 个月' },
  { id: 'm3', label: '3 个月' },
  { id: 'm6', label: '半年' },
  { id: 'y1', label: '1 年' },
];

/** N 天：截止 = 开始 + N − 1；N 个月/年：截止 = 开始加 N 个月再减 1 天 */
export function endDateForPreset(preset: Exclude<DurationPreset, 'custom'>, start: LocalDate): LocalDate | null {
  switch (preset) {
    case 'forever':
      return null;
    case 'd7':
      return addDays(start, 6);
    case 'd21':
      return addDays(start, 20);
    case 'm1':
      return addDays(addMonths(start, 1), -1);
    case 'm3':
      return addDays(addMonths(start, 3), -1);
    case 'm6':
      return addDays(addMonths(start, 6), -1);
    case 'y1':
      return addDays(addMonths(start, 12), -1);
  }
}

/** 预设对应的截止日期已早于今天时不可选 */
export function isPresetAvailable(
  preset: Exclude<DurationPreset, 'custom'>,
  start: LocalDate,
  today: LocalDate,
): boolean {
  const end = endDateForPreset(preset, start);
  return end === null || end >= today;
}

/** "11月22日 到 12月12日，共 21 天" / "从 11月22日 开始，一直坚持" */
export function describeDuration(start: LocalDate, end: LocalDate | null): string {
  if (end === null) return `从 ${formatMonthDay(start)} 开始，一直坚持`;
  return `${formatMonthDay(start)} 到 ${formatMonthDay(end)}，共 ${diffDays(start, end) + 1} 天`;
}

/** 表单行里"坚持多久"的简写 */
export function durationLabel(preset: DurationPreset | null, start: LocalDate, end: LocalDate | null): string {
  if (end === null) return '一直坚持';
  const found = DURATION_PRESETS.find((p) => p.id === preset);
  if (found && endDateForPreset(found.id, start) === end) return found.label;
  return `到 ${formatMonthDay(end)}`;
}
