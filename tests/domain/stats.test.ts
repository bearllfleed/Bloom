/**
 * 统计口径单测：连续、完成率、累计完成、日历花朵与热力分级（需求 5.9）。
 */
import { completionRateOf, dayOverview, flowerMarkOf, heatLevelOf, streakOf, totalCompletedOf } from '@/domain/stats';
import type { FrequencyRule } from '@/domain/types';
import { DAILY, MONDAY_START, TODAY, everyDay, makeCounts, makeProject } from './helpers';

const MWF: FrequencyRule = { kind: 'weekdays', weekdays: [1, 3, 5], timesPerDay: 1 };

describe('按天连续', () => {
  test('今天还没完成不会让连续变成 0', () => {
    const r = streakOf(makeProject(), makeCounts(everyDay('2026-11-17', '2026-11-21')), TODAY, MONDAY_START);
    expect(r).toEqual({ current: 5, best: 5, unit: 'day' });
  });

  test('今天完成后连续 +1', () => {
    const r = streakOf(makeProject(), makeCounts(everyDay('2026-11-17', TODAY)), TODAY, MONDAY_START);
    expect(r.current).toBe(6);
  });

  test('中间漏一天会重新计数', () => {
    const counts = makeCounts(['2026-11-16', '2026-11-17', '2026-11-19', '2026-11-20', '2026-11-21']);
    expect(streakOf(makeProject(), counts, TODAY, MONDAY_START)).toMatchObject({ current: 3, best: 3 });
  });

  test('最长连续记住过去的纪录', () => {
    const counts = makeCounts([...everyDay('2026-11-01', '2026-11-10'), '2026-11-20', '2026-11-21']);
    expect(streakOf(makeProject(), counts, TODAY, MONDAY_START)).toMatchObject({ current: 2, best: 10 });
  });

  test('昨天没完成时当前连续为 0', () => {
    expect(streakOf(makeProject(), makeCounts(['2026-11-19', '2026-11-20']), TODAY, MONDAY_START).current).toBe(0);
  });

  test('每周一三五：非计划日跳过', () => {
    const counts = makeCounts(['2026-11-13', '2026-11-16', '2026-11-18', '2026-11-20']);
    expect(streakOf(makeProject({ rule: MWF }), counts, TODAY, MONDAY_START).current).toBe(4);
  });

  test('每周一三五：漏了周三会断', () => {
    const counts = makeCounts(['2026-11-16', '2026-11-20']);
    expect(streakOf(makeProject({ rule: MWF }), counts, TODAY, MONDAY_START).current).toBe(1);
  });

  test('暂停的日子不打断连续（需求 5.7）', () => {
    const p = makeProject({ pauses: [{ startDate: '2026-11-15', endDate: '2026-11-17' }] });
    const counts = makeCounts([...everyDay('2026-11-10', '2026-11-14'), ...everyDay('2026-11-18', '2026-11-21')]);
    expect(streakOf(p, counts, TODAY, MONDAY_START).current).toBe(9);
  });

  test('每天 3 次只打 2 次的日子算没完成', () => {
    const p = makeProject({ rule: { kind: 'daily', timesPerDay: 3 } });
    const counts = makeCounts({ '2026-11-20': 3, '2026-11-21': 2 });
    expect(streakOf(p, counts, TODAY, MONDAY_START).current).toBe(0);
  });

  test('补卡后连续重新计算', () => {
    const before = makeCounts(['2026-11-19', '2026-11-21']);
    const after = makeCounts(['2026-11-19', '2026-11-20', '2026-11-21']);
    expect(streakOf(makeProject(), before, TODAY, MONDAY_START).current).toBe(1);
    expect(streakOf(makeProject(), after, TODAY, MONDAY_START).current).toBe(3);
  });

  test('毕业后统计截止到毕业日', () => {
    const p = makeProject({ status: 'graduated', graduatedOn: '2026-11-15' });
    const counts = makeCounts(everyDay('2026-11-10', '2026-11-15'));
    expect(streakOf(p, counts, TODAY, MONDAY_START).current).toBe(6);
  });

  test('截止日期已过时统计截止到截止日', () => {
    const p = makeProject({ endDate: '2026-11-20' });
    expect(streakOf(p, makeCounts(everyDay('2026-11-18', '2026-11-20')), TODAY, MONDAY_START).current).toBe(3);
  });

  test('开始日期在未来时为 0', () => {
    expect(streakOf(makeProject({ startDate: '2026-11-25' }), makeCounts(), TODAY, MONDAY_START)).toEqual({
      current: 0,
      best: 0,
      unit: 'day',
    });
  });

  test('从每天改为每周一三五后，前后连续衔接', () => {
    const p = makeProject({
      versions: [
        { effectiveFrom: '2026-11-01', rule: DAILY },
        { effectiveFrom: '2026-11-18', rule: MWF },
      ],
    });
    const counts = makeCounts(['2026-11-15', '2026-11-16', '2026-11-17', '2026-11-18', '2026-11-20']);
    expect(streakOf(p, counts, TODAY, MONDAY_START).current).toBe(5);
  });

  test('从弹性频率改为每天后，过去弹性日没打卡不算断', () => {
    const p = makeProject({
      versions: [
        { effectiveFrom: '2026-11-01', rule: { kind: 'weeklyDays', days: 2, timesPerDay: 1 } },
        { effectiveFrom: '2026-11-20', rule: DAILY },
      ],
    });
    const counts = makeCounts(['2026-11-16', '2026-11-18', '2026-11-20', '2026-11-21']);
    expect(streakOf(p, counts, TODAY, MONDAY_START).current).toBe(4);
  });
});

describe('按周期连续', () => {
  const weekly3: FrequencyRule = { kind: 'weeklyDays', days: 3, timesPerDay: 1 };

  test('连续 2 周达标，单位为周', () => {
    const counts = makeCounts(['2026-11-03', '2026-11-04', '2026-11-05', '2026-11-10', '2026-11-11', '2026-11-12']);
    const r = streakOf(makeProject({ startDate: '2026-11-02', rule: weekly3 }), counts, TODAY, MONDAY_START);
    expect(r).toEqual({ current: 2, best: 2, unit: 'week' });
  });

  test('本周还没达标不打断连续', () => {
    const counts = makeCounts(['2026-11-10', '2026-11-11', '2026-11-12', '2026-11-16']);
    expect(streakOf(makeProject({ startDate: '2026-11-09', rule: weekly3 }), counts, TODAY, MONDAY_START).current).toBe(
      1,
    );
  });

  test('本周达标后连续 +1', () => {
    const counts = makeCounts(['2026-11-10', '2026-11-11', '2026-11-12', '2026-11-16', '2026-11-17', '2026-11-18']);
    expect(streakOf(makeProject({ startDate: '2026-11-09', rule: weekly3 }), counts, TODAY, MONDAY_START).current).toBe(
      2,
    );
  });

  test('过去某周没达标会断', () => {
    const counts = makeCounts([
      '2026-11-03',
      '2026-11-04',
      '2026-11-05',
      '2026-11-10',
      '2026-11-17',
      '2026-11-18',
      '2026-11-19',
    ]);
    const r = streakOf(makeProject({ startDate: '2026-11-02', rule: weekly3 }), counts, TODAY, MONDAY_START);
    expect(r).toMatchObject({ current: 1, best: 1 });
  });

  test('每月累计次数：单位为月', () => {
    const p = makeProject({ startDate: '2026-10-01', rule: { kind: 'monthlyTimes', times: 4 } });
    const counts = makeCounts({ '2026-10-05': 4, '2026-11-02': 2 });
    expect(streakOf(p, counts, TODAY, MONDAY_START)).toEqual({ current: 1, best: 1, unit: 'month' });
  });

  test('整周暂停的周跳过，不打断', () => {
    const p = makeProject({
      startDate: '2026-11-02',
      rule: weekly3,
      pauses: [{ startDate: '2026-11-09', endDate: '2026-11-15' }],
    });
    const counts = makeCounts(['2026-11-03', '2026-11-04', '2026-11-05', '2026-11-16', '2026-11-17', '2026-11-18']);
    expect(streakOf(p, counts, TODAY, MONDAY_START).current).toBe(2);
  });
});

describe('完成率', () => {
  test('按天：今天未完成不进分母', () => {
    const p = makeProject({ startDate: '2026-11-13' });
    const counts = makeCounts([
      '2026-11-13',
      '2026-11-14',
      '2026-11-15',
      '2026-11-17',
      '2026-11-18',
      '2026-11-20',
      '2026-11-21',
    ]);
    expect(completionRateOf(p, counts, TODAY, MONDAY_START)).toMatchObject({ numerator: 7, denominator: 9 });
  });

  test('按天：今天完成后进分母和分子', () => {
    const p = makeProject({ startDate: '2026-11-13' });
    const counts = makeCounts([
      '2026-11-13',
      '2026-11-14',
      '2026-11-15',
      '2026-11-17',
      '2026-11-18',
      '2026-11-20',
      '2026-11-21',
      TODAY,
    ]);
    expect(completionRateOf(p, counts, TODAY, MONDAY_START)).toMatchObject({ numerator: 8, denominator: 10 });
  });

  test('非计划日不计入', () => {
    const p = makeProject({ startDate: '2026-11-16', rule: MWF });
    expect(completionRateOf(p, makeCounts(['2026-11-16', '2026-11-20']), TODAY, MONDAY_START)).toMatchObject({
      numerator: 2,
      denominator: 3,
    });
  });

  test('暂停日不计入', () => {
    const p = makeProject({ startDate: '2026-11-16', pauses: [{ startDate: '2026-11-18', endDate: '2026-11-21' }] });
    expect(completionRateOf(p, makeCounts(['2026-11-16']), TODAY, MONDAY_START)).toMatchObject({
      numerator: 1,
      denominator: 2,
    });
  });

  test('今天刚开始且还没打卡时为 null', () => {
    expect(completionRateOf(makeProject({ startDate: TODAY }), makeCounts(), TODAY, MONDAY_START).rate).toBeNull();
  });

  test('按周期：已结束 3 周达标 2 周、本周未达标 = 2/3', () => {
    const p = makeProject({ startDate: '2026-10-26', rule: { kind: 'weeklyDays', days: 2, timesPerDay: 1 } });
    const counts = makeCounts(['2026-10-27', '2026-10-28', '2026-11-10', '2026-11-11', '2026-11-16']);
    expect(completionRateOf(p, counts, TODAY, MONDAY_START)).toMatchObject({
      numerator: 2,
      denominator: 3,
      unit: 'week',
    });
  });

  test('按周期：本周达标后进分母 = 3/4', () => {
    const p = makeProject({ startDate: '2026-10-26', rule: { kind: 'weeklyDays', days: 2, timesPerDay: 1 } });
    const counts = makeCounts(['2026-10-27', '2026-10-28', '2026-11-10', '2026-11-11', '2026-11-16', '2026-11-17']);
    expect(completionRateOf(p, counts, TODAY, MONDAY_START)).toMatchObject({ numerator: 3, denominator: 4 });
  });

  test('比率为分子除以分母', () => {
    const p = makeProject({ startDate: '2026-11-19' });
    expect(completionRateOf(p, makeCounts(['2026-11-19', '2026-11-21']), TODAY, MONDAY_START).rate).toBeCloseTo(2 / 3);
  });
});

describe('累计完成', () => {
  test('按天项目为完成日数', () => {
    const p = makeProject({ rule: { kind: 'daily', timesPerDay: 2 } });
    expect(totalCompletedOf(p, makeCounts({ '2026-11-20': 2, '2026-11-21': 1, [TODAY]: 3 }), TODAY)).toEqual({
      value: 2,
      unit: 'days',
    });
  });
  test('累计次数类为总次数', () => {
    const p = makeProject({ rule: { kind: 'weeklyTimes', times: 3 } });
    expect(totalCompletedOf(p, makeCounts({ '2026-11-20': 2, '2026-11-21': 1 }), TODAY)).toEqual({
      value: 3,
      unit: 'times',
    });
  });
});

describe('某天汇总与日历花朵', () => {
  const daily = { project: { ...makeProject(), id: 'a' }, counts: makeCounts(['2026-11-20', '2026-11-21']) };
  const mwf = { project: { ...makeProject({ rule: MWF }), id: 'b' }, counts: makeCounts(['2026-11-20']) };
  const flex = {
    project: { ...makeProject({ rule: { kind: 'weeklyDays', days: 2, timesPerDay: 1 } }), id: 'c' },
    counts: makeCounts(['2026-11-19']),
  };

  test('周五：两个必须项目都完成，弹性项目没打不扣分 → 完美日', () => {
    expect(dayOverview([daily, mwf, flex], '2026-11-20')).toMatchObject({
      planned: 2,
      completed: 2,
      isPerfect: true,
      level: 4,
    });
  });

  test('周四：弹性项目打了卡就计入', () => {
    expect(dayOverview([daily, mwf, flex], '2026-11-19')).toMatchObject({
      planned: 2,
      completed: 1,
      required: 1,
      isPerfect: false,
    });
  });

  test('周六：只有每天项目在计划里', () => {
    expect(dayOverview([daily, mwf, flex], '2026-11-21')).toMatchObject({ planned: 1, completed: 1, isPerfect: true });
  });

  test('今天：有计划但没完成', () => {
    expect(dayOverview([daily, mwf, flex], TODAY)).toMatchObject({ planned: 1, completed: 0, level: 0 });
  });

  test('开始之前没有计划', () => {
    expect(dayOverview([daily], '2026-10-30')).toMatchObject({ planned: 0, level: null, isPerfect: false });
  });

  test.each([
    [0, 0, null],
    [3, 0, 0],
    [3, 1, 1],
    [6, 2, 1],
    [3, 2, 2],
    [4, 3, 3],
    [5, 4, 3],
    [3, 3, 4],
  ] as const)('计划 %i 完成 %i → 热力 %s', (planned, completed, expected) => {
    expect(heatLevelOf(planned, completed)).toBe(expected);
  });

  test.each([
    ['2026-11-23', 2, 0, 'none'],
    [TODAY, 2, 0, 'none'],
    ['2026-11-20', 2, 0, 'dot'],
    ['2026-11-20', 2, 1, 'bud'],
    ['2026-11-20', 2, 2, 'bloom'],
    [TODAY, 2, 2, 'bloom'],
    ['2026-11-20', 0, 0, 'none'],
  ] as const)('%s 计划 %i 完成 %i → %s', (date, planned, completed, expected) => {
    const overview = {
      planned,
      completed,
      required: planned,
      isPerfect: planned > 0 && planned === completed,
      level: heatLevelOf(planned, completed),
    };
    expect(flowerMarkOf(overview, date, TODAY)).toBe(expected);
  });
});
