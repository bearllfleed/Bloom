/**
 * 今日页的界面状态：选中日期。
 * 选中的是"今天"时记为跟随今天，跨过零点回到前台会自动切到新的今天；选中其他日期则不动。
 */
import { create } from 'zustand';

import type { LocalDate } from '@/domain/types';
import { clock } from '@/platform/clock';

interface TodayState {
  selectedDate: LocalDate;
  followsToday: boolean;
  /** 日历要跳转到的日期，每次赋值都会让日历滚动过去 */
  jumpToken: number;
  select: (date: LocalDate) => void;
  backToToday: () => void;
  /** 回到前台、时间旅行后调用 */
  syncWithClock: () => void;
}

export const useTodayStore = create<TodayState>((set, get) => ({
  selectedDate: clock.today(),
  followsToday: true,
  jumpToken: 0,
  select: (date) => set({ selectedDate: date, followsToday: date === clock.today() }),
  backToToday: () => set((s) => ({ selectedDate: clock.today(), followsToday: true, jumpToken: s.jumpToken + 1 })),
  syncWithClock: () => {
    const today = clock.today();
    if (get().followsToday && get().selectedDate !== today) {
      set((s) => ({ selectedDate: today, jumpToken: s.jumpToken + 1 }));
    }
  },
}));

clock.subscribe(() => useTodayStore.getState().syncWithClock());
