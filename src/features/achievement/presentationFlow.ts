/**
 * 新徽章的展示流程（第 3 期 3-3、3-4）：
 * - 启动时把数据库里未展示的徽章按 presentation 分组（普通逐枚、补发合并）；
 * - 每关闭一个弹窗，就把该组标为已看；杀死 App 后下次启动仍能补弹；
 * - 用户"去成就馆看看"时，当前这一组连同队列剩余都标为已看，剩下的在成就馆带"新"圆点。
 * 只负责流程与标记；弹窗的外观和动效由 features/achievement 的组件决定。
 */
import {
  groupAchievementUnlocks,
  type AchievementPresentationGroup,
  type PresentableUnlock,
} from '@/domain/achievement/presentation';

export interface PresentationSource {
  /** 还没展示过的徽章，按获得顺序 */
  unseen(): PresentableUnlock[];
  markSeen(ids: readonly string[]): void;
}

export interface PresentationQueue {
  /** 下一组要展示的徽章；全部展示完为 null */
  next(): AchievementPresentationGroup | null;
  /** 当前组展示完毕：标为已看并前进 */
  finish(): void;
  /** 当前组与剩余组一起标为已看，返回被收下的全部编号 */
  finishAll(): string[];
  /** 还没展示的组数（不含当前） */
  remaining(): number;
  /** 已展示的总组数，用于"● ○ ○"进度点 */
  total(): number;
}

export function createPresentationQueue(source: PresentationSource): PresentationQueue {
  let groups = groupAchievementUnlocks(source.unseen());
  const totalGroups = groups.length;
  return {
    next: () => groups[0] ?? null,
    finish() {
      const [current, ...rest] = groups;
      if (!current) return;
      source.markSeen(current.ids);
      groups = rest;
    },
    finishAll() {
      const ids = groups.flatMap((group) => group.ids);
      if (ids.length > 0) source.markSeen(ids);
      groups = [];
      return ids;
    },
    remaining: () => Math.max(0, groups.length - 1),
    total: () => totalGroups,
  };
}
