/**
 * 成就引擎单测：72 枚徽章的阈值、各项指标口径、结算方式（第 3 期文档 3-1、附录 A，验收 A3-02/03/04/07/10）。
 * 时间都按上海时区（见 jest.config），今天是 2026-11-22（周日）。
 */
import {
  ACHIEVEMENTS,
  SERIES,
  achievementById,
  computeMetrics,
  groupsForTrigger,
  newlyUnlocked,
  planSettle,
  type AchievementCheckin,
  type AchievementInput,
  type AchievementProject,
  type MoodFact,
  type OwnedUnlock,
} from '@/domain/achievement';
import type { DailyCounts, FrequencyRule, LocalDate, ProjectSnapshot } from '@/domain/types';
import { MONDAY_START, TODAY, everyDay, makeCounts, makeProject } from './helpers';

function project(
  snapshot: ProjectSnapshot,
  counts: DailyCounts = new Map(),
  extra: Partial<AchievementProject> = {},
): AchievementProject {
  return {
    project: snapshot,
    iconId: 'health/apple',
    counts,
    reminderTimes: [],
    hasReminder: false,
    rerun: false,
    ...extra,
  };
}

function withId(snapshot: ProjectSnapshot, id: string): ProjectSnapshot {
  return { ...snapshot, id };
}

function input(patch: Partial<AchievementInput> = {}): AchievementInput {
  return {
    today: TODAY,
    settings: MONDAY_START,
    dayEndHour: 0,
    projects: [],
    checkins: [],
    moods: [],
    counters: { backupExports: 0, pauseResumes: 0, maxUndosInDay: 0 },
    ...patch,
  };
}

/** 上海时间的某一时刻 */
function at(date: LocalDate, time: string): number {
  return new Date(`${date}T${time}:00+08:00`).getTime();
}

function checkin(date: LocalDate, time = '12:00', patch: Partial<AchievementCheckin> = {}): AchievementCheckin {
  return { projectId: 'p1', date, checkedAt: at(date, time), hasNote: false, source: 'app', ...patch };
}

function mood(date: LocalDate, patch: Partial<MoodFact> = {}): MoodFact {
  return { date, face: null, textLength: 0, photoCount: 0, ...patch };
}

const metricsOf = (i: AchievementInput) => computeMetrics(i);

describe('徽章定义表', () => {
  test('72 枚，编号 A01–A72 连续排列，标识不重复', () => {
    expect(ACHIEVEMENTS.map((d) => d.id)).toEqual(
      Array.from({ length: 72 }, (_, i) => `A${String(i + 1).padStart(2, '0')}`),
    );
    expect(new Set(ACHIEVEMENTS.map((d) => d.key)).size).toBe(72);
  });

  test('每个系列的数量与附录 A 一致', () => {
    const count = Object.fromEntries(SERIES.map((s) => [s.id, ACHIEVEMENTS.filter((d) => d.series === s.id).length]));
    expect(count).toEqual({ S1: 8, S2: 9, S3: 6, S4: 6, S5: 6, S6: 6, S7: 6, S8: 5, S9: 5, S10: 6, S11: 4, S12: 5 });
  });

  test('隐藏的是亡羊补牢和整个彩蛋系列', () => {
    expect(ACHIEVEMENTS.filter((d) => d.hidden).map((d) => d.id)).toEqual(['A67', 'A68', 'A69', 'A70', 'A71', 'A72']);
  });

  test('按编号查找', () => {
    expect(achievementById('A01')?.name).toBe('种下种子');
    expect(achievementById('A99')).toBeNull();
  });
});

describe('每枚徽章的阈值', () => {
  test.each(ACHIEVEMENTS)('$id $name：到阈值解锁，差 1 不解锁', (def) => {
    expect(newlyUnlocked({ [def.metric]: def.threshold }, new Set())).toContain(def.id);
    expect(newlyUnlocked({ [def.metric]: def.threshold - 1 }, new Set())).not.toContain(def.id);
  });

  test('没算过的指标不参与判定，已获得的不再判定', () => {
    expect(newlyUnlocked({}, new Set())).toEqual([]);
    expect(newlyUnlocked({ projectsCreated: 1 }, new Set(['A01']))).toEqual([]);
  });
});

describe('打卡类指标', () => {
  test('累计打卡、写成绩、小组件、记录天数、单个项目一天最多次数', () => {
    const m = metricsOf(
      input({
        checkins: [
          checkin('2026-11-20', '09:00', { hasNote: true }),
          checkin('2026-11-20', '09:05', { source: 'widget' }),
          checkin('2026-11-20', '09:10', { projectId: 'p2' }),
          checkin('2026-11-21', '09:00'),
        ],
      }),
    );
    expect(m).toMatchObject({ totalCheckins: 4, notesWritten: 1, widgetCheckins: 1, recordDays: 2, maxTapsInDay: 2 });
  });

  test('早起：5:00 到 7:00 之前', () => {
    const checkins = [
      checkin('2026-11-18', '04:59'),
      checkin('2026-11-19', '05:00'),
      checkin('2026-11-20', '06:59'),
      checkin('2026-11-21', '07:00'),
    ];
    expect(metricsOf(input({ checkins })).earlyCheckins).toBe(2);
  });

  test('深夜：23:00 到次日 2:00 之前', () => {
    const checkins = [checkin('2026-11-20', '23:00'), checkin('2026-11-21', '02:00'), checkin('2026-11-19', '22:59')];
    expect(metricsOf(input({ checkins })).nightCheckins).toBe(1);
  });

  test('凌晨打卡按日界线归属：日界线 2 点算前一天的深夜，日界线 0 点算补卡', () => {
    const late = checkin('2026-11-20', '12:00', { checkedAt: at('2026-11-21', '01:30') });
    expect(metricsOf(input({ dayEndHour: 2, checkins: [late] }))).toMatchObject({
      nightCheckins: 1,
      makeupCheckins: 0,
    });
    expect(metricsOf(input({ checkins: [late] }))).toMatchObject({ nightCheckins: 0, makeupCheckins: 1 });
  });

  test('补卡算亡羊补牢，不算时段类', () => {
    const p = project(makeProject(), new Map(), { reminderTimes: ['06:00'] });
    const m = metricsOf(
      input({ projects: [p], checkins: [checkin('2026-11-18', '12:00', { checkedAt: at('2026-11-20', '06:05') })] }),
    );
    expect(m).toMatchObject({ makeupCheckins: 1, earlyCheckins: 0, onTimeCheckins: 0 });
  });

  test('准时：提醒后 15 分钟内，跨午夜也算', () => {
    const p = project(makeProject(), new Map(), { reminderTimes: ['08:00', '23:55'] });
    const checkins = [
      checkin('2026-11-18', '08:15'),
      checkin('2026-11-19', '08:16'),
      checkin('2026-11-20', '07:59'),
      checkin('2026-11-21', '00:05'),
    ];
    expect(metricsOf(input({ projects: [p], checkins })).onTimeCheckins).toBe(2);
  });

  test('新年和 5 月 20 日', () => {
    const checkins = [checkin('2027-01-01'), checkin('2027-05-20'), checkin('2027-05-21')];
    expect(metricsOf(input({ checkins }))).toMatchObject({ newYearCheckins: 1, date520Checkins: 1 });
  });

  test('久别重逢看最长空档，风雨无阻看任意项目的连续天数', () => {
    const checkins = [
      checkin('2026-11-01'),
      checkin('2026-11-09'),
      checkin('2026-11-10', '12:00', { projectId: 'p2' }),
      checkin('2026-11-11'),
    ];
    expect(metricsOf(input({ checkins }))).toMatchObject({ longestBreak: 7, bestAnyDayStreak: 3 });
  });
});

describe('单个项目的连续', () => {
  test('按天连续取历史最长', () => {
    const counts = makeCounts([...everyDay('2026-11-01', '2026-11-07'), '2026-11-10']);
    expect(metricsOf(input({ projects: [project(makeProject(), counts)] })).bestDayStreak).toBe(7);
  });

  test('每周任选 2 天：连续达标的周数，不计入按天连续', () => {
    const rule: FrequencyRule = { kind: 'weeklyDays', days: 2, timesPerDay: 1 };
    const counts = makeCounts(['2026-11-02', '2026-11-04', '2026-11-10', '2026-11-12', '2026-11-17', '2026-11-19']);
    const m = metricsOf(input({ projects: [project(makeProject({ startDate: '2026-11-02', rule }), counts)] }));
    expect(m).toMatchObject({ bestWeekStreak: 3, bestDayStreak: 0 });
  });

  test('每天的项目：一周全部完成才算达标，本周今天还没做不打断', () => {
    const counts = makeCounts(everyDay('2026-11-02', '2026-11-21'));
    expect(
      metricsOf(input({ projects: [project(makeProject({ startDate: '2026-11-02' }), counts)] })).bestWeekStreak,
    ).toBe(2);
  });

  test('漏一天的那周打断连续周', () => {
    const counts = makeCounts(everyDay('2026-11-02', '2026-11-21').filter((d) => d !== '2026-11-11'));
    expect(
      metricsOf(input({ projects: [project(makeProject({ startDate: '2026-11-02' }), counts)] })).bestWeekStreak,
    ).toBe(1);
  });

  test('整月达标', () => {
    const counts = makeCounts(everyDay('2026-10-01', '2026-10-31'));
    expect(
      metricsOf(input({ projects: [project(makeProject({ startDate: '2026-10-01' }), counts)] })).bestMonthStreak,
    ).toBe(1);
  });

  test('每天多次：连续打满的天数，少一次就断', () => {
    const rule: FrequencyRule = { kind: 'daily', timesPerDay: 3 };
    const full: Record<LocalDate, number> = Object.fromEntries(everyDay('2026-11-14', '2026-11-21').map((d) => [d, 3]));
    const of = (counts: Record<LocalDate, number>) =>
      metricsOf(input({ projects: [project(makeProject({ startDate: '2026-11-14', rule }), makeCounts(counts))] }));
    expect(of(full).bestMultiFullStreak).toBe(8);
    expect(of({ ...full, '2026-11-17': 2 }).bestMultiFullStreak).toBe(4);
  });

  test('每天 1 次的项目不算勤劳小蜜蜂', () => {
    const counts = makeCounts(everyDay('2026-11-01', '2026-11-21'));
    expect(metricsOf(input({ projects: [project(makeProject(), counts)] })).bestMultiFullStreak).toBe(0);
  });
});

describe('完美日', () => {
  const daily = (dates: LocalDate[], startDate = '2026-11-02', id = 'p1') =>
    project(withId(makeProject({ startDate }), id), makeCounts(dates));

  test('累计、连续、周一和周末；今天还没完成只算待定', () => {
    const m = metricsOf(input({ projects: [daily(everyDay('2026-11-02', '2026-11-21'))] }));
    expect(m).toMatchObject({
      perfectDays: 20,
      bestPerfectStreak: 20,
      bestMondayStreak: 3,
      bestWeekendStreak: 2,
      perfectMonths: 0,
    });
  });

  test('周六没做到，这个周末就断了', () => {
    const m = metricsOf(
      input({ projects: [daily(everyDay('2026-11-02', '2026-11-21').filter((d) => d !== '2026-11-14'))] }),
    );
    expect(m).toMatchObject({ bestWeekendStreak: 1, bestPerfectStreak: 12 });
  });

  test('没有计划的日子不算也不打断', () => {
    const rule: FrequencyRule = { kind: 'weekdays', weekdays: [1, 3, 5], timesPerDay: 1 };
    const dates = [
      '2026-11-02',
      '2026-11-04',
      '2026-11-06',
      '2026-11-09',
      '2026-11-11',
      '2026-11-13',
      '2026-11-16',
      '2026-11-18',
      '2026-11-20',
    ];
    const m = metricsOf(
      input({ projects: [project(makeProject({ startDate: '2026-11-02', rule }), makeCounts(dates))] }),
    );
    expect(m).toMatchObject({ perfectDays: 9, bestPerfectStreak: 9, bestMondayStreak: 3, bestWeekendStreak: 0 });
  });

  test('整月圆满：月份要完整落在使用期内并已过完', () => {
    expect(
      metricsOf(input({ projects: [daily(everyDay('2026-10-01', '2026-10-31'), '2026-10-01')] })).perfectMonths,
    ).toBe(1);
    expect(
      metricsOf(input({ projects: [daily(everyDay('2026-10-02', '2026-10-31'), '2026-10-02')] })).perfectMonths,
    ).toBe(0);
  });

  test('同一天完成的不同项目数', () => {
    const projects = [
      daily(['2026-11-20'], '2026-11-02', 'p1'),
      daily(['2026-11-20', '2026-11-21'], '2026-11-02', 'p2'),
      daily(['2026-11-20'], '2026-11-02', 'p3'),
    ];
    expect(metricsOf(input({ projects })).maxProjectsDoneInDay).toBe(3);
  });
});

describe('项目类指标', () => {
  test('创建、提醒、再来一轮', () => {
    const projects = [
      project(makeProject(), new Map(), { hasReminder: true }),
      project(withId(makeProject(), 'p2'), new Map(), { rerun: true }),
    ];
    expect(metricsOf(input({ projects }))).toMatchObject({ projectsCreated: 2, remindersSet: 1, reruns: 1 });
  });

  test('同时进行中的项目和分类：暂停的、还没开始的不算', () => {
    const projects = [
      project(makeProject(), new Map(), { iconId: 'health/apple' }),
      project(withId(makeProject(), 'p2'), new Map(), { iconId: 'health/milk' }),
      project(
        withId(makeProject({ status: 'paused', pauses: [{ startDate: '2026-11-01', endDate: null }] }), 'p3'),
        new Map(),
        { iconId: 'sport/bicycle' },
      ),
      project(withId(makeProject({ startDate: '2026-11-30' }), 'p4'), new Map(), { iconId: 'study/book' }),
    ];
    expect(metricsOf(input({ projects }))).toMatchObject({ maxActiveProjects: 2, maxActiveCategories: 1 });
  });

  test('历史上同时进行过就算，之后毕业也不影响', () => {
    const projects = [
      project(makeProject(), new Map(), { iconId: 'health/apple' }),
      project(withId(makeProject(), 'p2'), new Map(), { iconId: 'study/book' }),
      project(
        withId(makeProject({ endDate: '2026-11-05', status: 'graduated', graduatedOn: '2026-11-05' }), 'p3'),
        new Map(),
        { iconId: 'sport/bicycle' },
      ),
    ];
    expect(metricsOf(input({ projects }))).toMatchObject({ maxActiveProjects: 3, maxActiveCategories: 3 });
  });
});

describe('毕业', () => {
  const graduated = (startDate: LocalDate, end: LocalDate, dates: LocalDate[] = []) =>
    project(makeProject({ startDate, endDate: end, status: 'graduated', graduatedOn: end }), makeCounts(dates));

  test('30 天、完成率刚好 80% 算满月优等生，少一天不算', () => {
    const days = everyDay('2026-10-01', '2026-10-30');
    expect(metricsOf(input({ projects: [graduated('2026-10-01', '2026-10-30', days.slice(0, 24))] }))).toMatchObject({
      graduations: 1,
      graduations30At80: 1,
      perfectGraduations: 0,
    });
    expect(
      metricsOf(input({ projects: [graduated('2026-10-01', '2026-10-30', days.slice(0, 23))] })).graduations30At80,
    ).toBe(0);
  });

  test('29 天全勤：全勤毕业，但不够满月', () => {
    const m = metricsOf(
      input({ projects: [graduated('2026-10-01', '2026-10-29', everyDay('2026-10-01', '2026-10-29'))] }),
    );
    expect(m).toMatchObject({ graduations30At80: 0, perfectGraduations: 1 });
  });

  test('全勤毕业至少 7 天', () => {
    expect(
      metricsOf(input({ projects: [graduated('2026-11-01', '2026-11-07', everyDay('2026-11-01', '2026-11-07'))] }))
        .perfectGraduations,
    ).toBe(1);
    expect(
      metricsOf(input({ projects: [graduated('2026-11-01', '2026-11-06', everyDay('2026-11-01', '2026-11-06'))] }))
        .perfectGraduations,
    ).toBe(0);
  });

  test('季度毕业生：时长 90 天', () => {
    expect(metricsOf(input({ projects: [graduated('2026-08-01', '2026-10-29')] })).graduations90).toBe(1);
    expect(metricsOf(input({ projects: [graduated('2026-08-01', '2026-10-28')] })).graduations90).toBe(0);
  });

  test('没毕业的不算', () => {
    const counts = makeCounts(everyDay('2026-11-01', '2026-11-21'));
    expect(metricsOf(input({ projects: [project(makeProject(), counts)] })).graduations).toBe(0);
  });
});

describe('心情', () => {
  test('篇数、照片、连续天数、最长字数、用过的表情', () => {
    const moods = [
      mood('2026-11-18', { face: 'happy', photoCount: 2 }),
      mood('2026-11-19', { face: 'happy', textLength: 500 }),
      mood('2026-11-19', { face: 'sad', photoCount: 1 }),
      mood('2026-11-21'),
    ];
    expect(metricsOf(input({ moods }))).toMatchObject({
      moodCount: 4,
      moodPhotos: 3,
      bestMoodStreak: 2,
      longestMoodText: 500,
      moodFacesUsed: 2,
    });
  });

  test('还没有心情', () => {
    expect(metricsOf(input())).toMatchObject({ moodCount: 0, longestMoodText: 0, bestMoodStreak: 0 });
  });
});

describe('按分组结算', () => {
  test('心情变化只算心情指标', () => {
    const m = computeMetrics(input({ moods: [mood('2026-11-21')] }), groupsForTrigger('moodChanged'));
    expect(Object.keys(m).sort()).toEqual([
      'bestMoodStreak',
      'longestMoodText',
      'moodCount',
      'moodFacesUsed',
      'moodPhotos',
    ]);
  });

  test('打卡变化也重算计数器（撤销次数）', () => {
    expect(groupsForTrigger('checkinChanged').has('counters')).toBe(true);
  });

  test('计数器原样带出', () => {
    const counters = { backupExports: 3, pauseResumes: 1, maxUndosInDay: 5 };
    expect(computeMetrics(input({ counters }), new Set(['counters']))).toEqual(counters);
  });

  test('全部分组覆盖徽章用到的每个指标', () => {
    const m = computeMetrics(input());
    const used = ACHIEVEMENTS.map((d) => d.metric).filter((k) => k !== 'unlocksInDay');
    for (const key of used) expect(m[key]).toBeDefined();
  });
});

describe('结算计划', () => {
  const NOW = at(TODAY, '20:00');
  const base = { owned: [] as OwnedUnlock[], now: NOW, dayEndHour: 0 as const, silent: false };
  const owned = (id: string, unlockedAt: number, reissue = false): OwnedUnlock => ({ id, unlockedAt, reissue });

  test('新安装第一次创建项目并打卡：依次是种下种子、第一朵花', () => {
    expect(planSettle({ ...base, metrics: { projectsCreated: 1, totalCheckins: 1 } })).toEqual({
      ids: ['A01', 'A02'],
      presentation: 'popup',
    });
  });

  test('撤销后指标变小：已获得的不收回，也不重复获得', () => {
    const plan = planSettle({
      ...base,
      owned: [owned('A02', NOW - 1000)],
      metrics: { totalCheckins: 0, projectsCreated: 1 },
    });
    expect(plan.ids).toEqual(['A01']);
  });

  test('一次获得 3 枚：逐个弹出，同时拿到双倍快乐', () => {
    expect(planSettle({ ...base, metrics: { projectsCreated: 1, totalCheckins: 1, perfectDays: 1 } })).toEqual({
      ids: ['A01', 'A02', 'A36', 'A72'],
      presentation: 'popup',
    });
  });

  test('不到 5 枚逐个弹出，5 枚起合并成补发卡', () => {
    expect(planSettle({ ...base, metrics: { projectsCreated: 1, totalCheckins: 10 } })).toMatchObject({
      ids: ['A01', 'A02', 'A24', 'A72'],
      presentation: 'popup',
    });
    expect(planSettle({ ...base, metrics: { projectsCreated: 1, totalCheckins: 10, perfectDays: 1 } })).toMatchObject({
      ids: ['A01', 'A02', 'A24', 'A36', 'A72'],
      presentation: 'reissue',
    });
  });

  test('双倍快乐：同一天普通获得的才算', () => {
    const today = [owned('A01', at(TODAY, '09:00')), owned('A02', at(TODAY, '10:00'))];
    expect(planSettle({ ...base, owned: today, metrics: { perfectDays: 1 } }).ids).toEqual(['A36', 'A72']);

    const reissued = today.map((u) => ({ ...u, reissue: true }));
    expect(planSettle({ ...base, owned: reissued, metrics: { perfectDays: 1 } }).ids).toEqual(['A36']);

    const yesterday = [owned('A01', at('2026-11-21', '09:00')), owned('A02', at('2026-11-21', '23:00'))];
    expect(planSettle({ ...base, owned: yesterday, metrics: { perfectDays: 1 } }).ids).toEqual(['A36']);
  });

  test('双倍快乐的"同一天"按日界线算', () => {
    const today = [owned('A01', at(TODAY, '09:00')), owned('A02', at(TODAY, '10:00'))];
    const plan = planSettle({
      ...base,
      owned: today,
      now: at('2026-11-23', '01:00'),
      dayEndHour: 2,
      metrics: { perfectDays: 1 },
    });
    expect(plan.ids).toEqual(['A36', 'A72']);
  });

  test('静默结算：全部进补发卡，不判定双倍快乐', () => {
    expect(
      planSettle({ ...base, silent: true, metrics: { projectsCreated: 1, totalCheckins: 1, perfectDays: 1 } }),
    ).toEqual({
      ids: ['A01', 'A02', 'A36'],
      presentation: 'reissue',
    });
  });

  test('没有新徽章', () => {
    expect(planSettle({ ...base, metrics: { totalCheckins: 0 } })).toEqual({ ids: [], presentation: null });
  });
});
