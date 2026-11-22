/**
 * 偏好设置（技术方案第 6 节末）：存在键值存储里，启动时同步读出。
 * 第 1 期用到昵称、头像、是否看过欢迎页、今日页月/周视图；其余字段在后续各期接入页面。
 */
import { create } from 'zustand';

import type { DayEndHour } from '@/domain/date';
import type { WeekStart } from '@/domain/types';
import { clock } from '@/platform/clock';
import { kv } from '@/platform/kv';

export type Appearance = 'system' | 'light' | 'dark';
export type CalendarMode = 'month' | 'week';

export interface Prefs {
  nickname: string;
  /** 8 个朵朵头像之一 */
  avatarId: string;
  /** 首次启动的欢迎页是否已完成 */
  onboarded: boolean;
  /** 今日页日历上次选择的视图 */
  calendarMode: CalendarMode;
  appearance: Appearance;
  weekStart: WeekStart;
  dayEndHour: DayEndHour;
  haptics: boolean;
  sound: boolean;
  /** 仅开发版：在组件陈列页模拟系统"减弱动态效果" */
  devReduceMotion: boolean;
}

const DEFAULTS: Prefs = {
  nickname: '',
  avatarId: 'plain',
  onboarded: false,
  calendarMode: 'month',
  appearance: 'system',
  weekStart: 1,
  dayEndHour: 0,
  haptics: true,
  sound: false,
  devReduceMotion: false,
};

const STORAGE_KEY = 'prefs';

function load(): Prefs {
  return { ...DEFAULTS, ...(kv.getJSON<Partial<Prefs>>(STORAGE_KEY) ?? {}) };
}

interface PrefsState extends Prefs {
  update: (patch: Partial<Prefs>) => void;
}

export const usePrefs = create<PrefsState>((set, get) => ({
  ...load(),
  update: (patch) => {
    set(patch);
    const { update: _update, ...prefs } = get();
    kv.setJSON(STORAGE_KEY, prefs);
    if (patch.dayEndHour !== undefined) clock.setDayEndHour(patch.dayEndHour);
  },
}));

/** 启动时把需要同步到其他模块的偏好推送出去 */
export function applyPrefsOnLaunch() {
  clock.setDayEndHour(usePrefs.getState().dayEndHour);
}
