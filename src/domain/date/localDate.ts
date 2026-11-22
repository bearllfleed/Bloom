/**
 * 本地日期工具：对 YYYY-MM-DD 字符串做加减、比较、取周/月边界。
 * 负责：所有业务日期运算（全部基于"日序号"，不受时区和夏令时影响）。
 * 不负责：取当前时间（见 platform/clock）、把时间戳换成逻辑日期（见 logicalToday）。
 */
import type { LocalDate, WeekStart, Weekday } from '../types';

const MS_PER_DAY = 86_400_000;

/** 把 YYYY-MM-DD 解析为年月日；格式不对直接抛错，避免脏数据悄悄进入统计 */
export function parseLocalDate(date: LocalDate): { year: number; month: number; day: number } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) throw new Error(`日期格式不正确：${date}`);
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

/** 由年月日组装 LocalDate（月、日从 1 开始） */
export function makeLocalDate(year: number, month: number, day: number): LocalDate {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** 日序号：1970-01-01 为 0，便于做差和循环 */
export function toDayNumber(date: LocalDate): number {
  const { year, month, day } = parseLocalDate(date);
  return Math.floor(Date.UTC(year, month - 1, day) / MS_PER_DAY);
}

export function fromDayNumber(dayNumber: number): LocalDate {
  const d = new Date(dayNumber * MS_PER_DAY);
  return makeLocalDate(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
}

export function addDays(date: LocalDate, days: number): LocalDate {
  return fromDayNumber(toDayNumber(date) + days);
}

/** b − a 的天数 */
export function diffDays(a: LocalDate, b: LocalDate): number {
  return toDayNumber(b) - toDayNumber(a);
}

/** 字符串格式固定，直接按字典序比较即可 */
export function compareDates(a: LocalDate, b: LocalDate): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

export function minDate(a: LocalDate, b: LocalDate): LocalDate {
  return a <= b ? a : b;
}

export function maxDate(a: LocalDate, b: LocalDate): LocalDate {
  return a >= b ? a : b;
}

/** ISO 星期：1 = 周一 … 7 = 周日 */
export function weekdayOf(date: LocalDate): Weekday {
  // 1970-01-01 是周四
  const index = (((toDayNumber(date) + 3) % 7) + 7) % 7; // 0 = 周一
  return (index + 1) as Weekday;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function startOfMonth(date: LocalDate): LocalDate {
  const { year, month } = parseLocalDate(date);
  return makeLocalDate(year, month, 1);
}

export function endOfMonth(date: LocalDate): LocalDate {
  const { year, month } = parseLocalDate(date);
  return makeLocalDate(year, month, daysInMonth(year, month));
}

/** 所在周的第一天，weekStart 决定周一还是周日开始 */
export function startOfWeek(date: LocalDate, weekStart: WeekStart): LocalDate {
  const weekday = weekdayOf(date);
  const offset = weekStart === 1 ? weekday - 1 : weekday % 7;
  return addDays(date, -offset);
}

export function endOfWeek(date: LocalDate, weekStart: WeekStart): LocalDate {
  return addDays(startOfWeek(date, weekStart), 6);
}

/**
 * 加 N 个月，日期超出目标月天数时取该月最后一天（1月31日 + 1 个月 = 2月28/29日）。
 */
export function addMonths(date: LocalDate, months: number): LocalDate {
  const { year, month, day } = parseLocalDate(date);
  const total = year * 12 + (month - 1) + months;
  const targetYear = Math.floor(total / 12);
  const targetMonth = (total % 12) + 1;
  return makeLocalDate(targetYear, targetMonth, Math.min(day, daysInMonth(targetYear, targetMonth)));
}

/** 闭区间内的每一天 */
export function eachDay(from: LocalDate, to: LocalDate): LocalDate[] {
  const result: LocalDate[] = [];
  for (let n = toDayNumber(from), end = toDayNumber(to); n <= end; n++) result.push(fromDayNumber(n));
  return result;
}

/** ISO 周序号（周四所在的年份决定归属），用于"第 47 周" */
export function isoWeekNumber(date: LocalDate): number {
  const thursday = addDays(date, 4 - weekdayOf(date));
  const { year } = parseLocalDate(thursday);
  return Math.floor(diffDays(makeLocalDate(year, 1, 1), thursday) / 7) + 1;
}

/** 从时间戳取设备本地时区下的日期 */
export function localDateFromTimestamp(ms: number): LocalDate {
  const d = new Date(ms);
  return makeLocalDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
}
