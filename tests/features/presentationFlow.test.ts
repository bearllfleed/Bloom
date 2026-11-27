/**
 * 新徽章的展示流程：分组、收下后标记已看、跳馆处理剩余。
 */
import { createPresentationQueue } from '@/features/achievement/presentationFlow';
import type { PresentableUnlock } from '@/domain/achievement/presentation';

function unlock(id: string, presentation: 'popup' | 'reissue', seen = false): PresentableUnlock {
  return { id, unlockedAt: 1, presentation, reissue: presentation === 'reissue', seen };
}

function source(items: PresentableUnlock[]) {
  const marked: string[][] = [];
  return {
    marked,
    unseen: () => items.filter((item) => !item.seen),
    /** 模拟数据库：标记后不再出现 */
    markSeen: (ids: readonly string[]) => {
      marked.push([...ids]);
      items.forEach((item) => {
        if (ids.includes(item.id)) item.seen = true;
      });
    },
  };
}

describe('新徽章展示流程', () => {
  it('普通徽章逐枚展示，收下后标记已看并前进', () => {
    const store = source([unlock('A01', 'popup'), unlock('A02', 'popup')]);
    const queue = createPresentationQueue(store);
    expect(queue.total()).toBe(2);
    expect(queue.next()).toEqual({ kind: 'popup', ids: ['A01'] });
    expect(queue.remaining()).toBe(1);
    queue.finish();
    expect(store.marked).toEqual([['A01']]);
    expect(queue.next()).toEqual({ kind: 'popup', ids: ['A02'] });
    queue.finish();
    expect(queue.next()).toBeNull();
    expect(queue.remaining()).toBe(0);
  });

  it('补发徽章合并成一张卡，一次收下全部', () => {
    const store = source([unlock('A03', 'reissue'), unlock('A09', 'reissue'), unlock('A10', 'reissue')]);
    const queue = createPresentationQueue(store);
    expect(queue.total()).toBe(1);
    expect(queue.next()).toEqual({ kind: 'reissue', ids: ['A03', 'A09', 'A10'] });
    queue.finish();
    expect(store.marked).toEqual([['A03', 'A09', 'A10']]);
  });

  it('去成就馆看看：当前组与剩余一起标为已看', () => {
    const store = source([unlock('A01', 'popup'), unlock('A02', 'popup'), unlock('A04', 'reissue')]);
    const queue = createPresentationQueue(store);
    expect(queue.finishAll()).toEqual(['A01', 'A02', 'A04']);
    expect(store.marked).toEqual([['A01', 'A02', 'A04']]);
    expect(queue.next()).toBeNull();
  });

  it('已经展示过的徽章不会重新入队', () => {
    const queue = createPresentationQueue(source([unlock('A01', 'popup', true)]));
    expect(queue.total()).toBe(0);
    expect(queue.next()).toBeNull();
    queue.finish();
    queue.finishAll();
  });
});
