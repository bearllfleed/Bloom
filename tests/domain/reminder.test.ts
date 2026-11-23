/**
 * 提醒排期：计划日、完成后跳过、暂停、周期达标、晚间汇总、条数上限。
 */
import { planReminders, type SchedulableProject } from '@/domain/reminder';
import type { DailyCounts, FrequencyRule } from '@/domain/types';

import { MONDAY_START, TODAY, makeCounts, makeProject } from './helpers';

const NOW = { nowDate: TODAY, nowMinutes: 7 * 60, logicalToday: TODAY };

function project(patch: Partial<SchedulableProject> & { rule?: FrequencyRule; id?: string }): SchedulableProject {
  const snapshot = makeProject({ rule: patch.rule, startDate: '2026-11-01', ...patch.snapshot });
  if (patch.id) snapshot.id = patch.id;
  return {
    snapshot,
    name: patch.name ?? '喝水',
    reminders: patch.reminders ?? [{ id: 'r1', time: '08:00', enabled: true }],
    skipDone: patch.skipDone ?? true,
    skipPeriodMet: patch.skipPeriodMet ?? true,
  };
}

function plan(
  projects: SchedulableProject[],
  daily: DailyCounts = new Map(),
  extra: Partial<Parameters<typeof planReminders>[0]> = {},
) {
  const countsMap = new Map<string, DailyCounts>();
  for (const item of projects) countsMap.set(item.snapshot.id, daily);
  return planReminders({
    ...NOW,
    projects,
    counts: countsMap,
    settings: MONDAY_START,
    evening: { enabled: false, time: '21:30' },
    horizonDays: 7,
    ...extra,
  });
}

describe('提醒排期', () => {
  it('每天项目会排上还没到的 08:00', () => {
    const result = plan([project({})]);
    expect(result.notices.some((n) => n.date === TODAY && n.time === '08:00' && n.body.includes('喝水'))).toBe(true);
    expect(result.coverageShort).toBe(false);
  });

  it('今天已经过了的时间不再排', () => {
    const result = plan([project({ reminders: [{ id: 'r1', time: '06:00', enabled: true }] })]);
    expect(result.notices.some((n) => n.date === TODAY)).toBe(false);
    expect(result.notices.some((n) => n.date === '2026-11-23' && n.time === '06:00')).toBe(true);
  });

  it('当天完成后不再提醒，撤销后恢复', () => {
    const item = project({});
    const done = plan([item], makeCounts(['2026-11-22']));
    expect(done.notices.some((n) => n.date === TODAY)).toBe(false);
    const undone = plan([item], new Map());
    expect(undone.notices.some((n) => n.date === TODAY && n.time === '08:00')).toBe(true);
  });

  it('关掉“完成后不再提醒”时，完成了当天仍会响', () => {
    const result = plan([project({ skipDone: false })], makeCounts(['2026-11-22']));
    expect(result.notices.some((n) => n.date === TODAY)).toBe(true);
  });

  it('每周一三五：周二周四不提醒', () => {
    const result = plan([project({ rule: { kind: 'weekdays', weekdays: [1, 3, 5], timesPerDay: 1 } })]);
    const dates = result.notices.map((n) => n.date);
    expect(dates).not.toContain('2026-11-24');
    expect(dates).not.toContain('2026-11-26');
    expect(dates).toContain('2026-11-23');
    expect(dates).toContain('2026-11-25');
  });

  it('暂停的项目不提醒', () => {
    const paused = project({});
    paused.snapshot = makeProject({ status: 'paused', pauses: [{ startDate: '2026-11-20', endDate: null }] });
    expect(plan([paused]).notices).toHaveLength(0);
  });

  it('关闭的提醒时间不排', () => {
    const result = plan([project({ reminders: [{ id: 'r1', time: '08:00', enabled: false }] })]);
    expect(result.notices).toHaveLength(0);
  });

  it('每周任选 1 天，本周已达标后不再提醒', () => {
    const item = project({ rule: { kind: 'weeklyDays', days: 1, timesPerDay: 1 }, id: 'p1' });
    const met = plan([item], makeCounts(['2026-11-16']));
    expect(met.notices.some((n) => n.date === TODAY)).toBe(false);
    expect(met.notices.some((n) => n.date === '2026-11-23')).toBe(true);
    const open = plan([project({ rule: { kind: 'weeklyDays', days: 3, timesPerDay: 1 }, skipPeriodMet: false })]);
    expect(open.notices.length).toBeGreaterThan(0);
  });

  it('晚间汇总列出未完成的名字；全部完成则今天不发', () => {
    const water = project({ name: '喝水', id: 'a' });
    const sleep = project({ name: '早睡', id: 'b' });
    const countsMap = new Map<string, DailyCounts>([
      ['a', new Map()],
      ['b', new Map()],
    ]);
    const pending = planReminders({
      ...NOW,
      nowMinutes: 20 * 60,
      projects: [water, sleep],
      counts: countsMap,
      settings: MONDAY_START,
      evening: { enabled: true, time: '21:30' },
      horizonDays: 2,
    });
    const tonight = pending.notices.find((n) => n.id === `evening:${TODAY}`);
    expect(tonight?.body).toBe('还有 2 个小目标在等你：喝水、早睡');
    const doneMap = new Map<string, DailyCounts>([
      ['a', makeCounts(['2026-11-22'])],
      ['b', makeCounts(['2026-11-22'])],
    ]);
    const clear = planReminders({
      ...NOW,
      nowMinutes: 20 * 60,
      projects: [water, sleep],
      counts: doneMap,
      settings: MONDAY_START,
      evening: { enabled: true, time: '21:30' },
      horizonDays: 1,
    });
    expect(clear.notices.some((n) => n.id.startsWith('evening:'))).toBe(false);
  });

  it('条数不够覆盖 3 天时标记覆盖不足，并只保留最近的几条', () => {
    const projects = Array.from({ length: 4 }, (_, index) =>
      project({
        id: `p${index}`,
        name: `项目${index}`,
        reminders: [
          { id: 'a', time: '08:00', enabled: true },
          { id: 'b', time: '09:00', enabled: true },
        ],
      }),
    );
    const result = plan(projects, new Map(), { cap: 3, horizonDays: 7, nowMinutes: 7 * 60 });
    expect(result.notices).toHaveLength(3);
    expect(result.coverageShort).toBe(true);
    expect(result.notices.every((n) => n.date === TODAY)).toBe(true);
  });
});
