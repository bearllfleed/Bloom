/**
 * 项目状态、暂停继续、自动毕业、频率与时长描述、卡片状态的单测（需求 5.3、5.7、5.8，第 1 期断言）。
 */
import { formatClock, formatDotDate, formatMonthDay, formatMonthDayWeekday, weekdayLabel } from '@/domain/date';
import {
  daysUntilStart,
  describeDuration,
  describeRule,
  displayStatusOf,
  durationLabel,
  endDateForPreset,
  hasMonthEndDates,
  isPresetAvailable,
  isRuleValid,
  isSameRule,
  journeyProgress,
  needsAutoGraduation,
  pausedDays,
  pausePlanOnGraduation,
  pauseStartDate,
  resumePlan,
} from '@/domain/project';
import { dayCardState, isCompletingCheckIn, visibilityOn } from '@/domain/rule';
import { streakOf } from '@/domain/stats';

import { MONDAY_START, TODAY, everyDay, makeCounts, makeProject } from './helpers';

describe('界面状态', () => {
  test('开始日期在未来为未开始', () => {
    expect(displayStatusOf(makeProject({ startDate: '2026-11-25' }), TODAY)).toBe('notStarted');
  });
  test('开始日期是今天为进行中', () => {
    expect(displayStatusOf(makeProject({ startDate: TODAY }), TODAY)).toBe('active');
  });
  test('暂停优先于日期判断', () => {
    expect(displayStatusOf(makeProject({ status: 'paused' }), TODAY)).toBe('paused');
  });
  test('毕业优先于一切', () => {
    expect(displayStatusOf(makeProject({ status: 'graduated', graduatedOn: '2026-11-20' }), TODAY)).toBe('graduated');
  });
  test('未开始的项目距离开始还有几天', () => {
    expect(daysUntilStart(makeProject({ startDate: '2026-11-25' }), TODAY)).toBe(3);
  });
});

describe('暂停与继续（需求 5.7）', () => {
  test('今天没打卡：从今天开始暂停', () => {
    expect(pauseStartDate(TODAY, false)).toBe(TODAY);
  });
  test('今天已打卡：从明天开始暂停（A1-18）', () => {
    expect(pauseStartDate(TODAY, true)).toBe('2026-11-23');
  });
  test('今天已打卡后暂停：今天仍出现，明天起不出现', () => {
    const p = makeProject({ status: 'paused', pauses: [{ startDate: '2026-11-23', endDate: null }] });
    expect(visibilityOn(p, TODAY).visible).toBe(true);
    expect(visibilityOn(p, '2026-11-23')).toEqual({ visible: false, reason: 'paused' });
  });
  test('当天暂停又继续，等于没暂停过', () => {
    expect(resumePlan({ startDate: TODAY, endDate: null }, TODAY)).toEqual({ kind: 'discard' });
  });
  test('暂停从明天才开始时继续，整段丢弃', () => {
    expect(resumePlan({ startDate: '2026-11-23', endDate: null }, TODAY)).toEqual({ kind: 'discard' });
  });
  test('暂停几天后继续：截止到昨天', () => {
    expect(resumePlan({ startDate: '2026-11-19', endDate: null }, TODAY)).toEqual({
      kind: 'close',
      endDate: '2026-11-21',
    });
  });
  test('已暂停天数含今天', () => {
    const p = makeProject({ status: 'paused', pauses: [{ startDate: '2026-11-18', endDate: null }] });
    expect(pausedDays(p, TODAY)).toBe(5);
  });
  test('暂停从明天开始时已暂停 0 天', () => {
    const p = makeProject({ status: 'paused', pauses: [{ startDate: '2026-11-23', endDate: null }] });
    expect(pausedDays(p, TODAY)).toBe(0);
  });
  test('A1-17 暂停前连续 5 天，暂停 3 天后继续并打卡：当前连续 6 天', () => {
    const p = makeProject({
      startDate: '2026-11-14',
      pauses: [{ startDate: '2026-11-19', endDate: '2026-11-21' }],
    });
    const counts = makeCounts([...everyDay('2026-11-14', '2026-11-18'), TODAY]);
    expect(streakOf(p, counts, TODAY, MONDAY_START).current).toBe(6);
  });
});

describe('自动毕业（需求 5.8、A1-21）', () => {
  test('截止日期是昨天：需要毕业', () => {
    expect(needsAutoGraduation(makeProject({ endDate: '2026-11-21' }), TODAY)).toBe(true);
  });
  test('截止日期是今天：还没毕业', () => {
    expect(needsAutoGraduation(makeProject({ endDate: TODAY }), TODAY)).toBe(false);
  });
  test('一直坚持的项目不会毕业', () => {
    expect(needsAutoGraduation(makeProject(), TODAY)).toBe(false);
  });
  test('已毕业的不再重复处理', () => {
    const p = makeProject({ endDate: '2026-11-21', status: 'graduated', graduatedOn: '2026-11-21' });
    expect(needsAutoGraduation(p, TODAY)).toBe(false);
  });
  test('毕业后今天不出现，截止日期当天仍出现（可补卡）', () => {
    const p = makeProject({ endDate: '2026-11-21', status: 'graduated', graduatedOn: '2026-11-21' });
    expect(visibilityOn(p, TODAY).visible).toBe(false);
    expect(visibilityOn(p, '2026-11-21').visible).toBe(true);
  });
  test('暂停中毕业：暂停截止到毕业日', () => {
    expect(pausePlanOnGraduation({ startDate: '2026-11-15', endDate: null }, '2026-11-21')).toEqual({
      kind: 'close',
      endDate: '2026-11-21',
    });
  });
  test('暂停晚于毕业日开始：整段丢弃', () => {
    expect(pausePlanOnGraduation({ startDate: '2026-11-22', endDate: null }, '2026-11-21')).toEqual({
      kind: 'discard',
    });
  });
});

describe('旅程进度', () => {
  test('一直坚持没有进度', () => {
    expect(journeyProgress(makeProject(), TODAY)).toBeNull();
  });
  test('第 22/30 天', () => {
    expect(journeyProgress(makeProject({ startDate: '2026-11-01', endDate: '2026-11-30' }), TODAY)).toEqual({
      day: 22,
      total: 30,
    });
  });
  test('未开始时为第 0 天', () => {
    expect(journeyProgress(makeProject({ startDate: '2026-11-25', endDate: '2026-12-01' }), TODAY)).toEqual({
      day: 0,
      total: 7,
    });
  });
  test('毕业后停在毕业日', () => {
    const p = makeProject({
      startDate: '2026-11-01',
      endDate: '2026-11-10',
      status: 'graduated',
      graduatedOn: '2026-11-10',
    });
    expect(journeyProgress(p, TODAY)).toEqual({ day: 10, total: 10 });
  });
});

describe('频率描述', () => {
  test.each([
    [{ kind: 'daily', timesPerDay: 1 }, '次', '每天 1 次'],
    [{ kind: 'daily', timesPerDay: 8 }, '杯', '每天 8 杯'],
    [{ kind: 'weekdays', weekdays: [5, 1, 3], timesPerDay: 1 }, '次', '每周一、三、五，每天 1 次'],
    [{ kind: 'weekdays', weekdays: [1, 2, 3, 4, 5, 6, 7], timesPerDay: 2 }, '组', '每天 2 组'],
    [{ kind: 'weeklyDays', days: 3, timesPerDay: 1 }, '次', '每周任选 3 天，每天 1 次'],
    [{ kind: 'weeklyTimes', times: 5 }, '次', '每周累计 5 次'],
    [{ kind: 'monthDates', dates: [15, 1], timesPerDay: 1 }, '次', '每月 1 号、15 号，每天 1 次'],
    [{ kind: 'monthlyDays', days: 10, timesPerDay: 2 }, '页', '每月任选 10 天，每天 2 页'],
    [{ kind: 'monthlyTimes', times: 12 }, '遍', '每月累计 12 遍'],
  ] as const)('%j → %s', (rule, unit, expected) => {
    expect(describeRule(rule as never, unit)).toBe(expected);
  });

  test('周几顺序不同视为同一规则', () => {
    expect(
      isSameRule(
        { kind: 'weekdays', weekdays: [1, 3], timesPerDay: 1 },
        { kind: 'weekdays', weekdays: [3, 1], timesPerDay: 1 },
      ),
    ).toBe(true);
  });
  test('次数不同视为不同规则', () => {
    expect(isSameRule({ kind: 'daily', timesPerDay: 1 }, { kind: 'daily', timesPerDay: 2 })).toBe(false);
  });
  test('固定几天一个都没选不可保存', () => {
    expect(isRuleValid({ kind: 'weekdays', weekdays: [], timesPerDay: 1 })).toBe(false);
    expect(isRuleValid({ kind: 'monthDates', dates: [], timesPerDay: 1 })).toBe(false);
    expect(isRuleValid({ kind: 'daily', timesPerDay: 1 })).toBe(true);
  });
  test('选了 29/30/31 号要提示', () => {
    expect(hasMonthEndDates({ kind: 'monthDates', dates: [1, 31], timesPerDay: 1 })).toBe(true);
    expect(hasMonthEndDates({ kind: 'monthDates', dates: [1, 28], timesPerDay: 1 })).toBe(false);
  });
});

describe('坚持多久', () => {
  test.each([
    ['d7', '2026-11-22', '2026-11-28'],
    ['d21', '2026-11-22', '2026-12-12'],
    ['m1', '2026-11-22', '2026-12-21'],
    ['m1', '2026-01-31', '2026-02-27'],
    ['m3', '2026-11-22', '2027-02-21'],
    ['m6', '2026-11-22', '2027-05-21'],
    ['y1', '2026-11-22', '2027-11-21'],
  ] as const)('%s 从 %s 开始，截止 %s', (preset, start, end) => {
    expect(endDateForPreset(preset, start)).toBe(end);
  });
  test('一直坚持没有截止日期', () => {
    expect(endDateForPreset('forever', TODAY)).toBeNull();
  });
  test('从很早开始的 7 天已经过去，不可选', () => {
    expect(isPresetAvailable('d7', '2026-11-01', TODAY)).toBe(false);
    expect(isPresetAvailable('m1', '2026-11-01', TODAY)).toBe(true);
  });
  test('预览句', () => {
    expect(describeDuration('2026-11-22', '2026-12-12')).toBe('11月22日 到 12月12日，共 21 天');
    expect(describeDuration('2026-11-22', null)).toBe('从 11月22日 开始，一直坚持');
  });
  test('表单行简写', () => {
    expect(durationLabel('d21', '2026-11-22', '2026-12-12')).toBe('21 天');
    expect(durationLabel('custom', '2026-11-22', '2026-12-31')).toBe('到 12月31日');
    expect(durationLabel(null, '2026-11-22', null)).toBe('一直坚持');
  });
});

describe('日期写法', () => {
  test('月日与周几', () => {
    expect(formatMonthDay('2026-11-02')).toBe('11月2日');
    expect(weekdayLabel(TODAY)).toBe('周日');
    expect(formatMonthDayWeekday('2026-11-20')).toBe('11月20日 周五');
  });
  test('点分日期', () => {
    expect(formatDotDate('2026-11-08')).toBe('2026.11.8');
  });
  test('时分补零', () => {
    expect(formatClock(new Date(2026, 10, 22, 7, 5).getTime())).toBe('07:05');
  });
});

describe('卡片状态', () => {
  test('单次项目未打卡：花苞，点一下打卡', () => {
    const s = dayCardState(makeProject(), TODAY, TODAY, makeCounts(), MONDAY_START);
    expect(s).toMatchObject({ bloomed: false, segments: null, tapAction: 'checkIn' });
  });
  test('单次项目已打卡：盛开，点一下打开菜单', () => {
    const s = dayCardState(makeProject(), TODAY, TODAY, makeCounts([TODAY]), MONDAY_START);
    expect(s).toMatchObject({ bloomed: true, tapAction: 'menu' });
  });
  test('A1-03 每天 3 次打了 2 次：分段 2/3', () => {
    const p = makeProject({ rule: { kind: 'daily', timesPerDay: 3 } });
    const s = dayCardState(p, TODAY, TODAY, makeCounts({ [TODAY]: 2 }), MONDAY_START);
    expect(s).toMatchObject({ bloomed: false, segments: { done: 2, total: 3 }, tapAction: 'checkIn' });
  });
  test('A1-09 明天：不可打卡，原因是未来', () => {
    const s = dayCardState(makeProject(), '2026-11-23', TODAY, makeCounts(), MONDAY_START);
    expect(s).toMatchObject({ tapAction: 'blocked', blockReason: 'future' });
  });
  test('A1-05 每周任选 3 天完成 3 天：本周达标，今天未打仍可打卡', () => {
    const p = makeProject({ rule: { kind: 'weeklyDays', days: 3, timesPerDay: 1 } });
    const s = dayCardState(p, TODAY, TODAY, makeCounts(['2026-11-16', '2026-11-17', '2026-11-18']), MONDAY_START);
    expect(s).toMatchObject({ met: true, bloomed: true, tapAction: 'checkIn' });
  });
  test('A1-06 每周累计 5 次打满 5 次：达标且仍可再打', () => {
    const p = makeProject({ rule: { kind: 'weeklyTimes', times: 5 } });
    const s = dayCardState(p, TODAY, TODAY, makeCounts({ [TODAY]: 5 }), MONDAY_START);
    expect(s).toMatchObject({ met: true, bloomed: true, tapAction: 'checkIn', segments: { done: 5, total: 5 } });
  });
  test('累计次数类当天打满 99 次：打开菜单', () => {
    const p = makeProject({ rule: { kind: 'weeklyTimes', times: 5 } });
    const s = dayCardState(p, TODAY, TODAY, makeCounts({ [TODAY]: 99 }), MONDAY_START);
    expect(s.tapAction).toBe('menu');
  });
  test('A1-08 三天前：可以直接补卡', () => {
    const s = dayCardState(makeProject(), '2026-11-19', TODAY, makeCounts(), MONDAY_START);
    expect(s.tapAction).toBe('checkIn');
  });
  test('成绩面板时机：单次每次、多次最后一次、累计次数类每次', () => {
    expect(isCompletingCheckIn({ kind: 'daily', timesPerDay: 1 }, 1)).toBe(true);
    expect(isCompletingCheckIn({ kind: 'daily', timesPerDay: 3 }, 2)).toBe(false);
    expect(isCompletingCheckIn({ kind: 'daily', timesPerDay: 3 }, 3)).toBe(true);
    expect(isCompletingCheckIn({ kind: 'weeklyTimes', times: 5 }, 1)).toBe(true);
  });
  test('A1-07 每月 31 号：2026年2月28日出现', () => {
    const p = makeProject({ startDate: '2026-01-01', rule: { kind: 'monthDates', dates: [31], timesPerDay: 1 } });
    expect(visibilityOn(p, '2026-02-28').visible).toBe(true);
    expect(visibilityOn(p, '2026-02-27').visible).toBe(false);
  });
  test('A1-04 每周一、三、五：周二不出现，周三出现', () => {
    const p = makeProject({ rule: { kind: 'weekdays', weekdays: [1, 3, 5], timesPerDay: 1 } });
    expect(visibilityOn(p, '2026-11-17').visible).toBe(false);
    expect(visibilityOn(p, '2026-11-18').visible).toBe(true);
  });
  test('A1-10 开始日期 11月25日：24 日不出现，25 日出现但不可打卡', () => {
    const p = makeProject({ startDate: '2026-11-25' });
    expect(visibilityOn(p, '2026-11-24').visible).toBe(false);
    const s = dayCardState(p, '2026-11-25', TODAY, makeCounts(), MONDAY_START);
    expect(s.tapAction).toBe('blocked');
  });
});
