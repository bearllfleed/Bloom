/**
 * 时钟：全 App 获取"现在"和"逻辑今天"的唯一入口（技术方案 17.5）。
 * 开发版支持"时间旅行"：设定一个模拟时刻后，时间从该时刻继续流逝，并在重启后保留。
 * 内测版与正式版始终返回真实时间。
 */
import { logicalDateOf, makeLocalDate, nextDayBoundary, type DayEndHour } from '@/domain/date';
import type { LocalDate } from '@/domain/types';

import { isDevToolsEnabled } from './appVariant';
import { kv } from './kv';

const OFFSET_KEY = 'dev.clockOffsetMs';

type Listener = () => void;

let offsetMs = isDevToolsEnabled ? Number(kv.getString(OFFSET_KEY) ?? 0) || 0 : 0;
let dayEndHour: DayEndHour = 0;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((listener) => listener());
}

export const clock = {
  /** 当前时间戳（毫秒）。时间旅行时是模拟时刻 */
  now(): number {
    return Date.now() + offsetMs;
  },

  /** 系统真实时间，不受时间旅行影响。排通知时用它和系统时钟比较 */
  systemNow(): number {
    return Date.now();
  },

  /** 逻辑今天（受"一天的结束时间"影响，见需求 5.2） */
  today(): LocalDate {
    return logicalDateOf(this.now(), dayEndHour);
  },

  /** 下一次逻辑日期翻篇的时间戳 */
  nextDayBoundary(): number {
    return nextDayBoundary(this.now(), dayEndHour);
  },

  /** 墙上时钟的日期和当天已过的分钟，用来判断提醒是不是已经过点 */
  wallClock(): { date: LocalDate; minutes: number } {
    const date = new Date(this.now());
    return {
      date: makeLocalDate(date.getFullYear(), date.getMonth() + 1, date.getDate()),
      minutes: date.getHours() * 60 + date.getMinutes(),
    };
  },

  /** 把本地日期和 HH:mm 换成时间戳（按设备时区） */
  timestampAt(date: LocalDate, time: string): number {
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);
    return new Date(year, month - 1, day, hour, minute, 0, 0).getTime();
  },

  /**
   * 通知要交给系统时钟。时间旅行时，把模拟时刻换算成真实时间戳，
   * 这样"模拟的明天 8 点"会在真实时间走过同样间隔后响起。
   */
  toSystemTime(logicalMs: number): number {
    return logicalMs - (this.now() - Date.now());
  },

  get dayEndHour(): DayEndHour {
    return dayEndHour;
  },

  setDayEndHour(hour: DayEndHour): void {
    dayEndHour = hour;
    notify();
  },

  /** 是否处于时间旅行中 */
  isSimulated(): boolean {
    return offsetMs !== 0;
  },

  /** 设定模拟时刻；传 null 恢复真实时间。仅开发版生效 */
  setSimulatedNow(ms: number | null): void {
    if (!isDevToolsEnabled) return;
    offsetMs = ms === null ? 0 : ms - Date.now();
    kv.setString(OFFSET_KEY, String(offsetMs));
    notify();
  },

  /** 在当前模拟时刻基础上前进/后退若干天。仅开发版生效 */
  shiftDays(days: number): void {
    this.setSimulatedNow(this.now() + days * 86_400_000);
  },

  /** 订阅时间设置变化（时间旅行、一天结束时间），返回取消函数 */
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
