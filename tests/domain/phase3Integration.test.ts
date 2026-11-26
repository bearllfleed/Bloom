/**
 * 第三期成就展示与心情入口的纯规则。
 */
import {
  badgeDisplayName,
  badgesEarnedDuring,
  canShowProjectMood,
  canShowDayMood,
  groupAchievementUnlocks,
} from '@/domain/achievement/presentation';
import { moodMarkerKey, moodMarkerMap, reviewPhotoPicks } from '@/domain/mood';

const unlock = (id: string, presentation: 'popup' | 'reissue') => ({
  id,
  unlockedAt: 1,
  presentation,
  seen: false,
  reissue: presentation === 'reissue',
});

describe('成就展示', () => {
  it('普通徽章逐枚弹出，补发合并一张卡；多组保持获得顺序', () => {
    expect(groupAchievementUnlocks([unlock('A02', 'popup'), unlock('A01', 'popup')])).toEqual([
      { kind: 'popup', ids: ['A02'] },
      { kind: 'popup', ids: ['A01'] },
    ]);
    expect(groupAchievementUnlocks([unlock('A03', 'reissue'), unlock('A01', 'reissue')])).toEqual([
      { kind: 'reissue', ids: ['A03', 'A01'] },
    ]);
  });

  it('隐藏徽章未获得时完全遮蔽名称', () => {
    expect(badgeDisplayName({ id: 'A68', name: '新年第一朵花', hidden: true }, false)).toBe('神秘徽章');
    expect(badgeDisplayName({ id: 'A68', name: '新年第一朵花', hidden: true }, true)).toBe('新年第一朵花');
  });
});

describe('心情入口', () => {
  it('项目只有完成后才出现，未来或撤销后已有心情仍可查看', () => {
    expect(canShowProjectMood({ completed: false, hasMood: false, future: false })).toBe(false);
    expect(canShowProjectMood({ completed: true, hasMood: false, future: false })).toBe(true);
    expect(canShowProjectMood({ completed: false, hasMood: true, future: false })).toBe(true);
    expect(canShowProjectMood({ completed: true, hasMood: false, future: true })).toBe(false);
  });

  it('当天入口只在完美日或已有当天心情时出现', () => {
    expect(canShowDayMood({ perfect: false, hasMood: false, future: false })).toBe(false);
    expect(canShowDayMood({ perfect: true, hasMood: false, future: false })).toBe(true);
    expect(canShowDayMood({ perfect: false, hasMood: true, future: false })).toBe(true);
    expect(canShowDayMood({ perfect: true, hasMood: false, future: true })).toBe(false);
  });
});

describe('打卡记录的心情标记与回顾', () => {
  const marked = (id: string, date: string, projectId: string | null) => ({ id, date, projectId, photos: [] });

  it('按日期与项目建立标记索引，当天整体心情单独占位', () => {
    const map = moodMarkerMap([
      marked('a', '2026-11-22', 'p1'),
      marked('b', '2026-11-22', null),
      marked('c', '2026-11-21', 'p2'),
    ]);
    expect(map.get(moodMarkerKey('2026-11-22', 'p1'))?.id).toBe('a');
    expect(map.get(moodMarkerKey('2026-11-22', null))?.id).toBe('b');
    expect(map.get(moodMarkerKey('2026-11-21', 'p2'))?.id).toBe('c');
    expect(map.get(moodMarkerKey('2026-11-21', 'p1'))).toBeUndefined();
  });

  it('回顾照片按时间先后排列，超过 3 张时均匀取首、中、尾', () => {
    const mood = (id: string, date: string, photos: string[]) => ({ id, date, photos });
    const picks = reviewPhotoPicks([mood('new', '2026-11-22', ['e', 'f']), mood('old', '2026-11-01', ['a', 'b', 'c'])]);
    expect(picks.map((pick) => pick.photo)).toEqual(['a', 'c', 'f']);
    expect(picks.map((pick) => pick.mood.id)).toEqual(['old', 'old', 'new']);
    expect(reviewPhotoPicks([mood('only', '2026-11-01', ['a'])])).toHaveLength(1);
    expect(reviewPhotoPicks([])).toEqual([]);
  });
});

describe('回顾徽章', () => {
  const at = (month: number, day: number, hour = 12) => new Date(2026, month - 1, day, hour, 0).getTime();

  it('只挑项目起止期间获得的徽章，含两端', () => {
    const unlocks = [
      { id: 'A01', unlockedAt: at(10, 31) },
      { id: 'A02', unlockedAt: at(11, 1) },
      { id: 'A03', unlockedAt: at(11, 20) },
      { id: 'A04', unlockedAt: at(12, 1) },
    ];
    expect(badgesEarnedDuring(unlocks, '2026-11-01', '2026-11-30')).toEqual(['A02', 'A03']);
    expect(badgesEarnedDuring([], '2026-11-01', '2026-11-30')).toEqual([]);
  });

  it('按逻辑日期算：凌晨结束时间之前算前一天', () => {
    const late = at(11, 23, 2);
    expect(badgesEarnedDuring([{ id: 'X', unlockedAt: late }], '2026-11-22', '2026-11-22', 4)).toEqual(['X']);
    expect(badgesEarnedDuring([{ id: 'X', unlockedAt: late }], '2026-11-22', '2026-11-22', 0)).toEqual([]);
  });
});
