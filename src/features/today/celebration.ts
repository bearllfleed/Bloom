/**
 * 完美日庆祝的触发信号（M05）：today 播放全套（朵朵跳起、花瓣雨、日历格的花弹一下、横幅），
 * past 只让日历格的花弹一下。
 */
import { create } from 'zustand';

import type { LocalDate } from '@/domain/types';

interface CelebrationState {
  /** 每次触发 +1，页面据此播放 */
  fullToken: number;
  popToken: number;
  popDate: LocalDate | null;
  celebrate: (kind: 'today' | 'past', date: LocalDate) => void;
}

/** 刚种下的项目：回到今日页时这张卡片播放种下动画（M11） */
export const usePlanted = create<{ projectId: string | null; plant: (id: string) => void; clear: () => void }>(
  (set) => ({
    projectId: null,
    plant: (id) => set({ projectId: id }),
    clear: () => set({ projectId: null }),
  }),
);

export const useCelebration = create<CelebrationState>((set) => ({
  fullToken: 0,
  popToken: 0,
  popDate: null,
  celebrate: (kind, date) =>
    set((s) => ({
      fullToken: kind === 'today' ? s.fullToken + 1 : s.fullToken,
      popToken: s.popToken + 1,
      popDate: date,
    })),
}));
