/**
 * 逻辑日期：把"此刻"换算成业务上的"今天"（口径见需求 5.2）。
 * 一天的结束时间可设为 0–4 点：设为 2 点时，凌晨 1:30 仍属于前一天。
 */
import type { LocalDate } from '../types';
import { localDateFromTimestamp } from './localDate';

/** 允许的一天结束时间（小时） */
export const DAY_END_HOURS = [0, 1, 2, 3, 4] as const;
export type DayEndHour = (typeof DAY_END_HOURS)[number];

const MS_PER_HOUR = 3_600_000;

/**
 * 某个时间戳对应的逻辑日期。
 * @param ms 时间戳（毫秒）
 * @param dayEndHour 一天的结束时间，默认 0 点
 */
export function logicalDateOf(ms: number, dayEndHour: DayEndHour = 0): LocalDate {
  return localDateFromTimestamp(ms - dayEndHour * MS_PER_HOUR);
}

/** 下一次逻辑日期翻篇的时间戳，用于跨天刷新、小组件时间线 */
export function nextDayBoundary(ms: number, dayEndHour: DayEndHour = 0): number {
  const shifted = new Date(ms - dayEndHour * MS_PER_HOUR);
  const nextMidnight = new Date(shifted.getFullYear(), shifted.getMonth(), shifted.getDate() + 1, 0, 0, 0, 0);
  return nextMidnight.getTime() + dayEndHour * MS_PER_HOUR;
}
