/**
 * 徽章详情与成就馆展示的纯规则测试（第 3 期 3-5、3-6）。
 */
import { achievementCopy } from '@/copy/phase3';
import { badgeDetail, formatEarnedAt, sameSeriesBadges } from '@/features/achievement/badgeDetail';
import { ACHIEVEMENTS } from '@/domain/achievement/catalog';

const def = (id: string) => ACHIEVEMENTS.find((item) => item.id === id)!;

describe('徽章详情', () => {
  it('已获得显示等级、系列与获得日期', () => {
    const info = badgeDetail({
      def: def('A11'),
      unlocked: true,
      current: 7,
      unlockedAt: new Date(2026, 10, 22, 10, 0).getTime(),
      reason: '早睡',
    });
    expect(info.name).toBe('一周花开');
    expect(info.seriesLine).toBe('小花 · 连续绽放系列');
    expect(info.earnedLine).toBe('11月22日 因「早睡」获得');
    expect(info.remaining).toBeNull();
    expect(info.ratio).toBeNull();
  });

  it('未获得显示还差多少与进度比例', () => {
    const info = badgeDetail({ def: def('A12'), unlocked: false, current: 8, unlockedAt: null });
    expect(info.name).toBe('十全十美');
    expect(info.condition).toBe('任一项目连续 10 天完成');
    expect(info.remaining).toBe('还差 2 天');
    expect(info.ratio).toBe(0.8);
    expect(info.earnedLine).toBeNull();
  });

  it('隐藏未获得只给一句提示，不泄露条件与进度', () => {
    const info = badgeDetail({ def: def('A68'), unlocked: false, current: 0, unlockedAt: null });
    expect(info.name).toBe('神秘徽章');
    expect(info.condition).toBe(achievementCopy.mysteryHint);
    expect(info.remaining).toBeNull();
    expect(info.ratio).toBeNull();
    expect(info.earnedLine).toBeNull();
  });

  it('隐藏已获得恢复真实名称与条件', () => {
    const info = badgeDetail({
      def: def('A68'),
      unlocked: true,
      current: 1,
      unlockedAt: new Date(2027, 0, 1).getTime(),
      reason: null,
    });
    expect(info.name).toBe('新年第一朵花');
    expect(info.condition).toBe('1月1日 完成打卡');
    expect(info.earnedLine).toBe('1月1日');
  });

  it('指标还没算过时不显示差值', () => {
    expect(badgeDetail({ def: def('A12'), unlocked: false, current: null, unlockedAt: null }).remaining).toBeNull();
  });
});

describe('同系列切换', () => {
  it('返回该系列全部徽章，按目录顺序，包含当前徽章', () => {
    const list = sameSeriesBadges('A12');
    expect(list.map((item) => item.id)).toEqual(['A09', 'A10', 'A11', 'A12', 'A13', 'A14', 'A15', 'A16', 'A17']);
    expect(sameSeriesBadges('missing')).toEqual([]);
  });
});

describe('获得时间文案', () => {
  it('没有来源时只说日期', () => {
    expect(formatEarnedAt(new Date(2026, 10, 22).getTime(), null)).toBe('11月22日');
  });
});
