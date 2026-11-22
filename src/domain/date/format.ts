/**
 * 日期的中文写法：11月22日、周日、2026.11.18、07:55。
 * 负责：界面上所有日期与时间的统一格式。
 * 不负责：取当前时间（见 platform/clock）。
 */
import type { LocalDate } from '../types';
import { parseLocalDate, weekdayOf } from './localDate';

const WEEKDAY_NAMES = ['一', '二', '三', '四', '五', '六', '日'] as const;

/** 周几的单字：1 = 一 … 7 = 日 */
export function weekdayChar(weekday: number): string {
  return WEEKDAY_NAMES[weekday - 1];
}

/** 周日 */
export function weekdayLabel(date: LocalDate): string {
  return `周${weekdayChar(weekdayOf(date))}`;
}

/** 11月22日 */
export function formatMonthDay(date: LocalDate): string {
  const { month, day } = parseLocalDate(date);
  return `${month}月${day}日`;
}

/** 11月22日 周日 */
export function formatMonthDayWeekday(date: LocalDate): string {
  return `${formatMonthDay(date)} ${weekdayLabel(date)}`;
}

/** 2026年11月 */
export function formatYearMonth(date: LocalDate): string {
  const { year, month } = parseLocalDate(date);
  return `${year}年${month}月`;
}

/** 2026.11.18 */
export function formatDotDate(date: LocalDate): string {
  const { year, month, day } = parseLocalDate(date);
  return `${year}.${month}.${day}`;
}

/** 11.21（同一年内的简写） */
export function formatDotMonthDay(date: LocalDate): string {
  const { month, day } = parseLocalDate(date);
  return `${month}.${day}`;
}

/** 时间戳在设备本地时区下的 07:55 */
export function formatClock(ms: number): string {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
