/**
 * 规则引擎单测：频率判断、出现与可打卡、当天与周期进度。
 */
import {
  canCheckIn,
  dayCapOf,
  dayProgress,
  dayTargetOf,
  isDayCompleted,
  isPeriodMet,
  isPlanDayByRule,
  isRequiredKind,
  periodContaining,
  periodProgressOn,
  periodTypeOf,
  ruleOn,
  visibilityOn,
} from '@/domain/rule';
import type { FrequencyRule } from '@/domain/types';
import { DAILY, MONDAY_START, SUNDAY_START, TODAY, everyDay, makeCounts, makeProject } from './helpers';

const MWF: FrequencyRule = { kind: 'weekdays', weekdays: [1, 3, 5], timesPerDay: 1 };

describe('频率分类', () => {
  test.each([
    [{ kind: 'daily', timesPerDay: 2 }, true, 'day', 2],
    [MWF, true, 'day', 1],
    [{ kind: 'monthDates', dates: [1], timesPerDay: 3 }, true, 'day', 3],
    [{ kind: 'weeklyDays', days: 3, timesPerDay: 1 }, false, 'week', 1],
    [{ kind: 'weeklyTimes', times: 5 }, false, 'week', null],
    [{ kind: 'monthlyDays', days: 10, timesPerDay: 2 }, false, 'month', 2],
    [{ kind: 'monthlyTimes', times: 12 }, false, 'month', null],
  ] as [FrequencyRule, boolean, string, number | null][])('%o', (rule, required, period, target) => {
    expect(isRequiredKind(rule.kind)).toBe(required);
    expect(periodTypeOf(rule)).toBe(period);
    expect(dayTargetOf(rule)).toBe(target);
  });

  test('累计次数类当天上限为 99', () => {
    expect(dayCapOf({ kind: 'weeklyTimes', times: 5 })).toBe(99);
    expect(dayCapOf({ kind: 'daily', timesPerDay: 8 })).toBe(8);
  });

  test.each([
    [{ kind: 'daily', timesPerDay: 3 }, 2, false],
    [{ kind: 'daily', timesPerDay: 3 }, 3, true],
    [{ kind: 'daily', timesPerDay: 3 }, 4, true],
    [{ kind: 'weeklyTimes', times: 5 }, 0, false],
    [{ kind: 'weeklyTimes', times: 5 }, 1, true],
  ] as [FrequencyRule, number, boolean][])('%o 打 %i 次是否完成：%s', (rule, n, expected) => {
    expect(isDayCompleted(rule, n)).toBe(expected);
  });
});

describe('计划日判断', () => {
  test.each([
    ['2026-11-16', true],
    ['2026-11-17', false],
    ['2026-11-18', true],
    ['2026-11-19', false],
    ['2026-11-20', true],
    ['2026-11-21', false],
    ['2026-11-22', false],
  ])('每周一三五：%s 是否计划日 %s', (date, expected) => {
    expect(isPlanDayByRule(MWF, date)).toBe(expected);
  });

  test.each([
    [[31], '2026-02-28', true],
    [[31], '2026-02-27', false],
    [[30, 31], '2026-02-28', true],
    [[31], '2026-04-30', true],
    [[31], '2026-03-30', false],
    [[31], '2026-03-31', true],
    [[15], '2026-11-15', true],
    [[15], '2026-11-16', false],
    [[29], '2028-02-29', true],
    [[29], '2028-02-28', false],
    [[29], '2026-02-28', true],
    [[1, 15], '2026-11-01', true],
  ])('每月 %j 号：%s 是否计划日 %s', (dates, date, expected) => {
    expect(isPlanDayByRule({ kind: 'monthDates', dates, timesPerDay: 1 }, date)).toBe(expected);
  });

  test('弹性频率每天都可打卡', () => {
    expect(isPlanDayByRule({ kind: 'weeklyDays', days: 2, timesPerDay: 1 }, '2026-11-17')).toBe(true);
    expect(isPlanDayByRule({ kind: 'monthlyTimes', times: 2 }, '2026-11-17')).toBe(true);
  });
});

describe('频率版本 ruleOn', () => {
  const versions = [
    { effectiveFrom: '2026-11-01', rule: DAILY },
    { effectiveFrom: '2026-11-18', rule: MWF },
  ];
  test.each([
    ['2026-10-20', 'daily'],
    ['2026-11-01', 'daily'],
    ['2026-11-17', 'daily'],
    ['2026-11-18', 'weekdays'],
    ['2026-12-01', 'weekdays'],
  ])('%s 生效的是 %s', (date, kind) => {
    expect(ruleOn(versions, date).kind).toBe(kind);
  });
  test('没有版本时抛错', () => {
    expect(() => ruleOn([], TODAY)).toThrow();
  });
});

describe('某天是否出现（需求 5.4）', () => {
  const project = makeProject({
    startDate: '2026-11-05',
    endDate: '2026-11-30',
    rule: MWF,
    pauses: [{ startDate: '2026-11-09', endDate: '2026-11-11' }],
  });
  test.each([
    ['2026-11-04', false, 'beforeStart'],
    ['2026-12-02', false, 'afterEnd'],
    ['2026-11-09', false, 'paused'],
    ['2026-11-11', false, 'paused'],
    ['2026-11-13', true, undefined],
    ['2026-11-17', false, 'notPlanDay'],
    ['2026-11-18', true, undefined],
    ['2026-11-30', true, undefined],
  ])('%s 出现 %s（原因 %s）', (date, visible, reason) => {
    const v = visibilityOn(project, date);
    expect(v.visible).toBe(visible);
    if (!v.visible) expect(v.reason).toBe(reason);
  });

  test('仍在暂停中的区间覆盖之后所有日期', () => {
    const p = makeProject({ pauses: [{ startDate: '2026-11-20', endDate: null }] });
    expect(visibilityOn(p, '2026-11-19').visible).toBe(true);
    expect(visibilityOn(p, '2026-11-20').visible).toBe(false);
    expect(visibilityOn(p, '2027-03-01').visible).toBe(false);
  });

  test('提前毕业后的日期不出现，毕业当天仍出现', () => {
    const p = makeProject({ status: 'graduated', graduatedOn: '2026-11-20' });
    expect(visibilityOn(p, '2026-11-20').visible).toBe(true);
    const after = visibilityOn(p, '2026-11-21');
    expect(after.visible).toBe(false);
    if (!after.visible) expect(after.reason).toBe('afterGraduation');
  });

  test('截止日期当天仍出现，次日不出现', () => {
    const p = makeProject({ endDate: '2026-11-21' });
    expect(visibilityOn(p, '2026-11-21').visible).toBe(true);
    expect(visibilityOn(p, '2026-11-22').visible).toBe(false);
  });
});

describe('能否打卡 canCheckIn', () => {
  const project = makeProject({ rule: { kind: 'daily', timesPerDay: 2 } });
  test.each([
    ['2026-11-23', 0, false, 'future'],
    ['2026-10-31', 0, false, 'beforeStart'],
    ['2026-11-22', 0, true, undefined],
    ['2026-11-22', 1, true, undefined],
    ['2026-11-22', 2, false, 'dailyFull'],
    ['2026-11-10', 0, true, undefined],
  ])('%s 已有 %i 次：可打卡 %s（原因 %s）', (date, count, ok, reason) => {
    const verdict = canCheckIn(project, date, TODAY, count);
    expect(verdict.ok).toBe(ok);
    if (!verdict.ok) expect(verdict.reason).toBe(reason);
  });

  test('补卡：过去的日期和今天一样可以打', () => {
    expect(canCheckIn(makeProject(), '2026-11-03', TODAY, 0)).toEqual({ ok: true });
  });

  test('累计次数类同一天可多次打卡，到 99 次为止', () => {
    const p = makeProject({ rule: { kind: 'weeklyTimes', times: 5 } });
    expect(canCheckIn(p, TODAY, TODAY, 7).ok).toBe(true);
    expect(canCheckIn(p, TODAY, TODAY, 99).ok).toBe(false);
  });

  test('暂停日不能打卡', () => {
    const p = makeProject({ pauses: [{ startDate: '2026-11-20', endDate: null }] });
    expect(canCheckIn(p, '2026-11-21', TODAY, 0)).toEqual({ ok: false, reason: 'paused' });
  });
});

describe('当天进度 dayProgress', () => {
  test('多次项目显示 2/3', () => {
    const p = makeProject({ rule: { kind: 'daily', timesPerDay: 3 } });
    expect(dayProgress(p, TODAY, makeCounts({ [TODAY]: 2 }))).toEqual({ count: 2, target: 3, completed: false });
  });
  test('累计次数类没有当天目标', () => {
    const p = makeProject({ rule: { kind: 'weeklyTimes', times: 5 } });
    expect(dayProgress(p, TODAY, makeCounts({ [TODAY]: 1 }))).toEqual({ count: 1, target: null, completed: true });
  });
  test('当天没有记录', () => {
    expect(dayProgress(makeProject(), TODAY, makeCounts())).toEqual({ count: 0, target: 1, completed: false });
  });
});

describe('周期进度与折算（需求 5.1）', () => {
  test('每周任选 3 天：本周完成 3 天达标', () => {
    const p = makeProject({ rule: { kind: 'weeklyDays', days: 3, timesPerDay: 1 } });
    const progress = periodProgressOn(p, TODAY, makeCounts(['2026-11-16', '2026-11-18', '2026-11-20']), MONDAY_START)!;
    expect(progress).toMatchObject({ target: 3, achieved: 3, unit: 'days', met: true, effectiveDays: 7 });
  });

  test('每周任选 3 天，每天 2 次：只打 1 次的日子不算', () => {
    const p = makeProject({ rule: { kind: 'weeklyDays', days: 3, timesPerDay: 2 } });
    const counts = makeCounts({ '2026-11-16': 2, '2026-11-17': 1, '2026-11-18': 2 });
    expect(periodProgressOn(p, TODAY, counts, MONDAY_START)).toMatchObject({ achieved: 2, met: false });
  });

  test('周六开始的项目，第一周目标折算为 2 天', () => {
    const p = makeProject({ startDate: '2026-11-21', rule: { kind: 'weeklyDays', days: 3, timesPerDay: 1 } });
    expect(periodProgressOn(p, TODAY, makeCounts(['2026-11-21', TODAY]), MONDAY_START)).toMatchObject({
      effectiveDays: 2,
      target: 2,
      met: true,
    });
  });

  test('暂停 3 天后，每周任选 5 天的目标折算为 4 天', () => {
    const p = makeProject({
      rule: { kind: 'weeklyDays', days: 5, timesPerDay: 1 },
      pauses: [{ startDate: '2026-11-16', endDate: '2026-11-18' }],
    });
    expect(periodProgressOn(p, TODAY, makeCounts(), MONDAY_START)).toMatchObject({ effectiveDays: 4, target: 4 });
  });

  test('每周累计 5 次：一天打 5 次也达标', () => {
    const p = makeProject({ rule: { kind: 'weeklyTimes', times: 5 } });
    expect(periodProgressOn(p, TODAY, makeCounts({ '2026-11-17': 5 }), MONDAY_START)).toMatchObject({
      achieved: 5,
      target: 5,
      unit: 'times',
      met: true,
    });
  });

  test('每周累计 5 次，只有 2 个有效天：目标向上取整为 2', () => {
    const p = makeProject({ startDate: '2026-11-21', rule: { kind: 'weeklyTimes', times: 5 } });
    expect(periodProgressOn(p, TODAY, makeCounts(), MONDAY_START)).toMatchObject({ target: 2 });
  });

  test('每月累计 10 次，11月16日开始：目标折算为 5', () => {
    const p = makeProject({ startDate: '2026-11-16', rule: { kind: 'monthlyTimes', times: 10 } });
    expect(periodProgressOn(p, TODAY, makeCounts(), MONDAY_START)).toMatchObject({ effectiveDays: 15, target: 5 });
  });

  test('每月任选 10 天，11月25日开始：目标折算为 6', () => {
    const p = makeProject({ startDate: '2026-11-25', rule: { kind: 'monthlyDays', days: 10, timesPerDay: 1 } });
    expect(periodProgressOn(p, '2026-11-26', makeCounts(), MONDAY_START)).toMatchObject({
      effectiveDays: 6,
      target: 6,
    });
  });

  test('每月任选 31 天在 2 月最多要求 28 天', () => {
    const p = makeProject({ startDate: '2026-01-01', rule: { kind: 'monthlyDays', days: 31, timesPerDay: 1 } });
    expect(periodProgressOn(p, '2026-02-10', makeCounts(), MONDAY_START)).toMatchObject({ target: 28 });
  });

  test('周日开始一周时，周期范围随之变化', () => {
    const p = makeProject({ rule: { kind: 'weeklyDays', days: 2, timesPerDay: 1 } });
    const progress = periodProgressOn(p, TODAY, makeCounts(['2026-11-21', TODAY]), SUNDAY_START)!;
    expect(progress.period).toMatchObject({ start: '2026-11-22', end: '2026-11-28' });
    expect(progress.achieved).toBe(1);
  });

  test('周中改成周期型频率，整周按新规则', () => {
    const p = makeProject({
      versions: [
        { effectiveFrom: '2026-11-01', rule: DAILY },
        { effectiveFrom: '2026-11-19', rule: { kind: 'weeklyDays', days: 4, timesPerDay: 1 } },
      ],
    });
    const progress = periodProgressOn(
      p,
      TODAY,
      makeCounts(['2026-11-16', '2026-11-17', '2026-11-19', TODAY]),
      MONDAY_START,
    )!;
    expect(progress).toMatchObject({ achieved: 4, target: 4, met: true });
  });

  test('按天计数的频率没有周期进度', () => {
    expect(periodProgressOn(makeProject(), TODAY, makeCounts(), MONDAY_START)).toBeNull();
  });
});

describe('周期是否达标 isPeriodMet（成就用）', () => {
  const week = periodContaining('week', '2026-11-10', MONDAY_START); // 11-09 ~ 11-15
  test('每天：整周都完成算达标', () => {
    expect(isPeriodMet(makeProject(), week, makeCounts(everyDay('2026-11-09', '2026-11-15')), TODAY)).toBe(true);
  });
  test('每天：漏一天不达标', () => {
    const days = everyDay('2026-11-09', '2026-11-15').filter((d) => d !== '2026-11-12');
    expect(isPeriodMet(makeProject(), week, makeCounts(days), TODAY)).toBe(false);
  });
  test('每周一三五：只看计划日', () => {
    const p = makeProject({ rule: MWF });
    expect(isPeriodMet(p, week, makeCounts(['2026-11-09', '2026-11-11', '2026-11-13']), TODAY)).toBe(true);
  });
  test('整周暂停不参与统计', () => {
    const p = makeProject({ pauses: [{ startDate: '2026-11-09', endDate: '2026-11-15' }] });
    expect(isPeriodMet(p, week, makeCounts(), TODAY)).toBeNull();
  });
  test('当前周只看到今天为止', () => {
    const current = periodContaining('week', TODAY, MONDAY_START);
    expect(isPeriodMet(makeProject(), current, makeCounts(everyDay('2026-11-16', '2026-11-22')), TODAY)).toBe(true);
  });
  test('项目开始前的周不参与统计', () => {
    const early = periodContaining('week', '2026-10-20', MONDAY_START);
    expect(isPeriodMet(makeProject(), early, makeCounts(), TODAY)).toBeNull();
  });
});
