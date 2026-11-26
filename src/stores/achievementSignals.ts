/**
 * 成就页签的"新徽章"信号（第 3 期 3-5）：徽章格与页签图标右上角的莓果圆点。
 * 与数据库里的 seen 不同：seen 表示弹窗展示过；圆点表示进过详情，两者互不覆盖。
 * 放在 stores 层，界面与页签都可读取，避免 ui 反向依赖 features。
 */
import { create } from 'zustand';

interface NewBadgesState {
  ids: readonly string[];
  add: (ids: readonly string[]) => void;
  /** 打开这枚徽章的详情后圆点消失 */
  dismiss: (id: string) => void;
  clear: () => void;
}

export const useNewBadges = create<NewBadgesState>((set) => ({
  ids: [],
  add(ids) {
    if (ids.length === 0) return;
    set((state) => ({ ids: [...new Set([...state.ids, ...ids])] }));
  },
  dismiss(id) {
    set((state) => ({ ids: state.ids.filter((item) => item !== id) }));
  },
  clear() {
    set({ ids: [] });
  },
}));
