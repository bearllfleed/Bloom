/**
 * 成就馆的纯规则：筛选、系列进度、未获得进度文案（第 3 期 3-5）。
 * 界面只负责排版；这里保证隐藏徽章不泄露、进度单位随指标变化。
 */
import { ACHIEVEMENTS } from '@/domain/achievement/catalog';
import {
  badgeProgressLabel,
  filterAchievements,
  galleryCounts,
  seriesGroups,
  seriesProgress,
} from '@/domain/achievement/presentation';

const def = (id: string) => ACHIEVEMENTS.find((item) => item.id === id)!;

describe('成就馆筛选', () => {
  it('全部不筛选，已获得只看已解锁，未获得排除已解锁', () => {
    const owned = new Set(['A01', 'A02']);
    expect(filterAchievements(ACHIEVEMENTS, owned, 'all')).toHaveLength(72);
    expect(filterAchievements(ACHIEVEMENTS, owned, 'owned').map((item) => item.id)).toEqual(['A01', 'A02']);
    expect(filterAchievements(ACHIEVEMENTS, owned, 'locked')).toHaveLength(70);
    expect(filterAchievements(ACHIEVEMENTS, owned, 'locked').some((item) => owned.has(item.id))).toBe(false);
  });

  it('按 12 个系列分组，空系列不出现，系列内保持目录顺序', () => {
    const groups = seriesGroups(ACHIEVEMENTS, new Set(['A01']), 'all');
    expect(groups).toHaveLength(12);
    expect(groups[0].series.id).toBe('S1');
    expect(groups[0].badges.map((item) => item.id)).toEqual(['A01', 'A02', 'A03', 'A04', 'A05', 'A06', 'A07', 'A08']);
    const ownedOnly = seriesGroups(ACHIEVEMENTS, new Set(['A01', 'A09']), 'owned');
    expect(ownedOnly.map((group) => group.series.id)).toEqual(['S1', 'S2']);
  });

  it('系列进度统计已获得与总数；总数与收集数一致', () => {
    const owned = new Set(['A01', 'A02', 'A09']);
    expect(seriesProgress(ACHIEVEMENTS, owned, 'S1')).toEqual({ owned: 2, total: 8 });
    expect(seriesProgress(ACHIEVEMENTS, owned, 'S3')).toEqual({ owned: 0, total: 6 });
    expect(galleryCounts(ACHIEVEMENTS, owned)).toEqual({ owned: 3, total: 72, ratio: 3 / 72 });
  });
});

describe('未获得的进度文案', () => {
  it('按指标单位显示当前值与目标值', () => {
    expect(badgeProgressLabel(def('A12'), 8, false)).toBe('8/10 天');
    expect(badgeProgressLabel(def('A24'), 3, false)).toBe('3/10 次');
    expect(badgeProgressLabel(def('A47'), 1, false)).toBe('1/4 周');
    expect(badgeProgressLabel(def('A59'), 2, false)).toBe('2/30 篇');
    expect(badgeProgressLabel(def('A67'), 0, false)).toBeNull();
  });

  it('已获得不显示进度；隐藏未获得完全不显示', () => {
    expect(badgeProgressLabel(def('A12'), 10, true)).toBeNull();
    expect(badgeProgressLabel(def('A68'), 0, false)).toBeNull();
    expect(badgeProgressLabel(def('A68'), 0, true)).toBeNull();
  });

  it('进度不超过目标，负数和缺失时按 0 处理', () => {
    expect(badgeProgressLabel(def('A12'), 99, false)).toBe('10/10 天');
    expect(badgeProgressLabel(def('A12'), -2, false)).toBe('0/10 天');
    expect(badgeProgressLabel(def('A12'), null, false)).toBeNull();
  });
});
