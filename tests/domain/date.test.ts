/**
 * 本地日期工具与逻辑日期的单测。
 */
import {
  addDays,
  addMonths,
  daysInMonth,
  diffDays,
  eachDay,
  endOfMonth,
  endOfWeek,
  logicalDateOf,
  nextDayBoundary,
  parseLocalDate,
  startOfMonth,
  startOfWeek,
  weekdayOf,
} from '@/domain/date';

describe('weekdayOf', () => {
  test.each([
    ['2026-11-16', 1],
    ['2026-11-17', 2],
    ['2026-11-18', 3],
    ['2026-11-19', 4],
    ['2026-11-20', 5],
    ['2026-11-21', 6],
    ['2026-11-22', 7],
    ['1970-01-01', 4],
    ['2024-02-29', 4],
    ['2027-01-01', 5],
  ])('%s 是星期 %i', (date, expected) => {
    expect(weekdayOf(date)).toBe(expected);
  });
});

describe('addDays / diffDays', () => {
  test.each([
    ['2026-12-31', 1, '2027-01-01'],
    ['2026-03-01', -1, '2026-02-28'],
    ['2028-03-01', -1, '2028-02-29'],
    ['2026-11-22', 0, '2026-11-22'],
    ['2026-01-31', 30, '2026-03-02'],
    ['2026-11-22', -22, '2026-10-31'],
  ])('%s 加 %i 天 = %s', (date, n, expected) => {
    expect(addDays(date, n)).toBe(expected);
  });

  test.each([
    ['2026-11-01', '2026-11-22', 21],
    ['2026-11-22', '2026-11-01', -21],
    ['2026-12-25', '2027-01-05', 11],
    ['2028-02-28', '2028-03-01', 2],
  ])('%s 到 %s 相差 %i 天', (a, b, expected) => {
    expect(diffDays(a, b)).toBe(expected);
  });
});

describe('周边界', () => {
  test.each([
    ['2026-11-22', 1, '2026-11-16', '2026-11-22'],
    ['2026-11-16', 1, '2026-11-16', '2026-11-22'],
    ['2026-11-19', 1, '2026-11-16', '2026-11-22'],
    ['2026-11-22', 7, '2026-11-22', '2026-11-28'],
    ['2026-11-21', 7, '2026-11-15', '2026-11-21'],
    ['2026-11-16', 7, '2026-11-15', '2026-11-21'],
    ['2027-01-01', 1, '2026-12-28', '2027-01-03'],
  ] as const)('%s（周起始 %i）所在周为 %s ~ %s', (date, weekStart, start, end) => {
    expect(startOfWeek(date, weekStart)).toBe(start);
    expect(endOfWeek(date, weekStart)).toBe(end);
  });
});

describe('月边界与天数', () => {
  test.each([
    ['2026-02-10', '2026-02-01', '2026-02-28'],
    ['2028-02-10', '2028-02-01', '2028-02-29'],
    ['2026-04-30', '2026-04-01', '2026-04-30'],
    ['2026-12-05', '2026-12-01', '2026-12-31'],
  ])('%s 所在月为 %s ~ %s', (date, start, end) => {
    expect(startOfMonth(date)).toBe(start);
    expect(endOfMonth(date)).toBe(end);
  });

  test.each([
    [2026, 2, 28],
    [2028, 2, 29],
    [2100, 2, 28],
    [2000, 2, 29],
    [2026, 11, 30],
    [2026, 12, 31],
  ])('%i 年 %i 月有 %i 天', (y, m, expected) => {
    expect(daysInMonth(y, m)).toBe(expected);
  });
});

describe('addMonths 超出天数时取月末', () => {
  test.each([
    ['2026-01-31', 1, '2026-02-28'],
    ['2028-01-31', 1, '2028-02-29'],
    ['2026-11-22', 1, '2026-12-22'],
    ['2026-12-15', 1, '2027-01-15'],
    ['2026-03-31', -1, '2026-02-28'],
    ['2026-11-22', 12, '2027-11-22'],
    ['2026-08-31', 6, '2027-02-28'],
  ])('%s 加 %i 个月 = %s', (date, n, expected) => {
    expect(addMonths(date, n)).toBe(expected);
  });
});

describe('eachDay 与解析', () => {
  test('闭区间包含两端', () => {
    expect(eachDay('2026-11-20', '2026-11-22')).toEqual(['2026-11-20', '2026-11-21', '2026-11-22']);
  });
  test('起点晚于终点时为空', () => {
    expect(eachDay('2026-11-22', '2026-11-21')).toEqual([]);
  });
  test('跨年天数正确', () => {
    expect(eachDay('2026-12-30', '2027-01-02')).toHaveLength(4);
  });
  test.each(['2026-1-1', '20261122', '2026/11/22', ''])('格式不正确的 "%s" 抛错', (bad) => {
    expect(() => parseLocalDate(bad)).toThrow();
  });
});

describe('逻辑日期（夜猫子模式，需求 5.2）', () => {
  const at = (h: number, m = 0, s = 0) => new Date(2026, 10, 22, h, m, s).getTime();
  test.each([
    [0, 0, 0, 0, '2026-11-22'],
    [23, 59, 0, 0, '2026-11-22'],
    [0, 30, 0, 0, '2026-11-22'],
    [1, 30, 0, 2, '2026-11-21'],
    [1, 59, 59, 2, '2026-11-21'],
    [2, 0, 0, 2, '2026-11-22'],
    [3, 59, 0, 4, '2026-11-21'],
    [4, 0, 0, 4, '2026-11-22'],
    [0, 59, 0, 1, '2026-11-21'],
  ] as const)('%i:%i:%i 在一天结束于 %i 点时属于 %s', (h, m, s, endHour, expected) => {
    expect(logicalDateOf(at(h, m, s), endHour)).toBe(expected);
  });

  test.each([
    [10, 0, new Date(2026, 10, 23, 0, 0).getTime()],
    [10, 2, new Date(2026, 10, 23, 2, 0).getTime()],
    [1, 2, new Date(2026, 10, 22, 2, 0).getTime()],
  ] as const)('%i 点、结束于 %i 点时，下一次翻日在预期时间', (h, endHour, expected) => {
    expect(nextDayBoundary(at(h), endHour)).toBe(expected);
  });
});
