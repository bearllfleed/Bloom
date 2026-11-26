/**
 * 统计页与项目详情要用的汇总。口径与领域层的完成率、热力分级一致。
 */
import {
  addDays,
  daysInMonth,
  diffDays,
  eachDay,
  endOfMonth,
  endOfWeek,
  isoWeekNumber,
  makeLocalDate,
  maxDate,
  minDate,
  parseLocalDate,
  startOfMonth,
  startOfWeek,
  weekdayOf,
} from '@/domain/date';
import { displayStatusOf } from '@/domain/project';
import { isDayCompleted, isRequiredKind, ruleOn, visibilityOn } from '@/domain/rule';
import { completionRateOf, dayOverview, streakOf, type HeatLevel } from '@/domain/stats';
import type { DailyCounts, LocalDate, ProjectEntity, ProjectSnapshot } from '@/domain/types';
import { achievementRepo } from '@/data/repositories/achievementRepo';
import { checkinRepo } from '@/data/repositories/checkinRepo';
import { projectRepo } from '@/data/repositories/projectRepo';
import { clock } from '@/platform/clock';
import { usePrefs } from '@/stores/prefsStore';

export interface HeatCell {
  date: LocalDate;
  level: HeatLevel | null;
  perfect: boolean;
  planned: number;
  completed: number;
}

export interface RankItem {
  id: string;
  name: string;
  iconId: string;
  colorId: string;
  rate: number;
}

export interface WeekPoint {
  start: LocalDate;
  week: number;
  count: number;
}

export interface Habit {
  /** 1–7，出现次数最多的星期 */
  peakWeekday: number;
  weekdayCounts: number[];
  peakHourLabel: string;
  hourCounts: number[];
}

function bundle() {
  const entities = projectRepo.listEntities();
  const counts = checkinRepo.countsByProject();
  const settings = { weekStart: usePrefs.getState().weekStart };
  const today = clock.today();
  const items = entities.map((project) => ({ project, counts: counts.get(project.id) ?? new Map() }));
  return { entities, counts, settings, today, items };
}

function emptyCounts(): DailyCounts {
  return new Map();
}

function scoped(project: ProjectSnapshot, from: LocalDate, to: LocalDate): ProjectSnapshot | null {
  const end = minDate(project.endDate ?? to, to);
  const start = maxDate(project.startDate, from);
  if (start > end) return null;
  return { ...project, startDate: start, endDate: end };
}

function rateBetween(
  project: ProjectEntity,
  counts: DailyCounts,
  from: LocalDate,
  to: LocalDate,
  today: LocalDate,
  settings: { weekStart: 1 | 7 },
) {
  const view = scoped(project, from, minDate(to, today));
  if (!view) return null;
  return completionRateOf(view, counts, minDate(to, today), settings).rate;
}

export function heatOfYear(year: number): (HeatCell | null)[][] {
  const { items, today } = bundle();
  const rows: (HeatCell | null)[][] = [];
  for (let month = 1; month <= 12; month++) {
    const days = Array.from({ length: 31 }, (_, index) => {
      const day = index + 1;
      if (day > daysInMonth(year, month)) return null;
      const date = makeLocalDate(year, month, day);
      if (date > today) return { date, level: null, perfect: false, planned: 0, completed: 0 };
      const overview = dayOverview(items, date);
      return {
        date,
        level: overview.level,
        perfect: overview.isPerfect,
        planned: overview.planned,
        completed: overview.completed,
      };
    });
    rows.push(days);
  }
  return rows;
}

export function getOverview() {
  const { entities, counts, settings, today } = bundle();
  let recordDays = new Set<string>();
  let total = 0;
  counts.forEach((daily) => {
    daily.forEach((n, date) => {
      if (date <= today) {
        recordDays.add(date);
        total += n;
      }
    });
  });
  let best = 0;
  for (const project of entities) {
    const streak = streakOf(project, counts.get(project.id) ?? emptyCounts(), today, settings);
    if (streak.unit === 'day') best = Math.max(best, streak.best);
  }
  const active = entities.filter((project) => displayStatusOf(project, today) === 'active').length;
  const weekStart = startOfWeek(today, settings.weekStart);
  const weeks: WeekPoint[] = [];
  for (let i = 11; i >= 0; i--) {
    const start = addDays(weekStart, -7 * i);
    const end = endOfWeek(start, settings.weekStart);
    let count = 0;
    counts.forEach((daily) => {
      daily.forEach((n, date) => {
        if (date >= start && date <= end && date <= today) count += n;
      });
    });
    weeks.push({ start, week: isoWeekNumber(start), count });
  }
  const instants = checkinRepo.listInstants().filter((row) => row.date <= today);
  let habit: Habit | null = null;
  if (instants.length >= 14) {
    const weekdayCounts = [0, 0, 0, 0, 0, 0, 0];
    const hourCounts = Array.from({ length: 12 }, () => 0);
    for (const row of instants) weekdayCounts[weekdayOf(row.date) - 1] += 1;
    for (const row of instants) {
      const actual = localDateOf(row.checkedAt);
      if (actual !== row.date) continue;
      hourCounts[Math.floor(new Date(row.checkedAt).getHours() / 2)] += 1;
    }
    const peakWeekday = weekdayCounts.indexOf(Math.max(...weekdayCounts)) + 1;
    const peakBucket = hourCounts.indexOf(Math.max(...hourCounts));
    const startHour = peakBucket * 2;
    habit = {
      peakWeekday,
      weekdayCounts,
      hourCounts,
      peakHourLabel: `${partOfDay(startHour)} ${startHour}–${startHour + 2} 点`,
    };
  }
  return { active, recordDays: recordDays.size, total, best, weeks, habit, today, hasRecords: total > 0 };
}

function localDateOf(ms: number): LocalDate {
  const date = new Date(ms);
  return makeLocalDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

function partOfDay(hour: number): string {
  if (hour < 5) return '凌晨';
  if (hour < 11) return '早上';
  if (hour < 13) return '中午';
  if (hour < 18) return '下午';
  return '晚上';
}

function monthRange(month: LocalDate, today: LocalDate) {
  const from = startOfMonth(month);
  const to = minDate(endOfMonth(month), today);
  return { from, to, future: from > today };
}

export function monthCells(month: LocalDate) {
  const { items, today, settings } = bundle();
  const first = startOfMonth(month);
  const last = endOfMonth(month);
  const days = eachDay(startOfWeek(first, settings.weekStart), endOfWeek(last, settings.weekStart));
  return days.map((date) => {
    const future = date > today;
    const overview = future ? null : dayOverview(items, date);
    return { date, inMonth: date >= first && date <= last, overview, isToday: date === today, isFuture: future };
  });
}

export function getMonthStats(month: LocalDate) {
  const { entities, counts, settings, today, items } = bundle();
  const { from, to, future } = monthRange(month, today);
  let checkinDays = 0;
  let perfectDays = 0;
  let planned = 0;
  let completed = 0;
  let busiest = { date: from, count: 0 };
  if (!future) {
    for (const date of eachDay(from, to)) {
      const overview = dayOverview(items, date);
      if (overview.isPerfect) perfectDays += 1;
      planned += overview.planned;
      completed += overview.completed;
      let dayCount = 0;
      counts.forEach((daily) => {
        const n = daily.get(date) ?? 0;
        dayCount += n;
      });
      if (dayCount > 0) checkinDays += 1;
      if (dayCount > busiest.count) busiest = { date, count: dayCount };
    }
  }
  const previousFrom = startOfMonth(addDays(from, -1));
  const previousTo = endOfMonth(previousFrom);
  const rate = planned === 0 ? null : completed / planned;
  const previous = rateOfDays(items, previousFrom, minDate(previousTo, today));
  const ranking = entities
    .map((project) => ({
      id: project.id,
      name: project.name,
      iconId: project.iconId,
      colorId: project.colorId,
      rate: rateBetween(project, counts.get(project.id) ?? emptyCounts(), from, endOfMonth(month), today, settings),
    }))
    .filter((item): item is RankItem => item.rate !== null)
    .sort((a, b) => b.rate - a.rate);
  let streak: { name: string; length: number; from: LocalDate; to: LocalDate } | null = null;
  if (!future) {
    for (const project of entities) {
      const daily = counts.get(project.id) ?? emptyCounts();
      let run = 0;
      let runFrom = from;
      for (const date of eachDay(from, to)) {
        const visible = visibilityOn(project, date);
        if (!visible.visible) {
          if (visible.reason === 'paused' || visible.reason === 'notPlanDay') continue;
          run = 0;
          continue;
        }
        const done = isDayCompleted(ruleOn(project.ruleVersions, date), daily.get(date) ?? 0);
        if (done) {
          if (run === 0) runFrom = date;
          run += 1;
          if (!streak || run > streak.length) streak = { name: project.name, length: run, from: runFrom, to: date };
        } else if (date !== today) {
          run = 0;
        }
      }
    }
  }
  return {
    checkinDays,
    perfectDays,
    rate,
    previousRate: previous,
    ranking,
    streak,
    busiest: busiest.count > 0 ? busiest : null,
    future,
  };
}

function rateOfDays(
  items: { project: ProjectSnapshot; counts: DailyCounts }[],
  from: LocalDate,
  to: LocalDate,
): number | null {
  if (from > to) return null;
  let planned = 0;
  let completed = 0;
  for (const date of eachDay(from, to)) {
    const overview = dayOverview(items, date);
    planned += overview.planned;
    completed += overview.completed;
  }
  return planned === 0 ? null : completed / planned;
}

export function getYearStats(year: number) {
  const { entities, counts, settings, today } = bundle();
  const months = Array.from({ length: 12 }, (_, index) => {
    const from = makeLocalDate(year, index + 1, 1);
    const to = minDate(endOfMonth(from), today);
    let days = 0;
    if (from <= today) {
      const seen = new Set<string>();
      counts.forEach((daily) => {
        daily.forEach((n, date) => {
          if (n > 0 && date >= from && date <= to) seen.add(date);
        });
      });
      days = seen.size;
    }
    return { month: index + 1, days, date: from };
  });
  const from = makeLocalDate(year, 1, 1);
  const to = minDate(makeLocalDate(year, 12, 31), today);
  let recordDays = 0;
  let total = 0;
  let perfect = 0;
  if (from <= today) {
    const seen = new Set<string>();
    counts.forEach((daily) => {
      daily.forEach((n, date) => {
        if (date >= from && date <= to) {
          total += n;
          if (n > 0) seen.add(date);
        }
      });
    });
    recordDays = seen.size;
  }
  const items = entities.map((project) => ({ project, counts: counts.get(project.id) ?? new Map() }));
  if (from <= today) {
    for (const date of eachDay(from, to)) if (dayOverview(items, date).isPerfect) perfect += 1;
  }
  const graduated = entities.filter((project) => project.graduatedOn?.startsWith(String(year))).length;
  const ranking = entities
    .map((project) => ({
      id: project.id,
      name: project.name,
      iconId: project.iconId,
      colorId: project.colorId,
      rate:
        from > today ? null : rateBetween(project, counts.get(project.id) ?? emptyCounts(), from, to, today, settings),
    }))
    .filter((item): item is RankItem => item.rate !== null)
    .sort((a, b) => b.rate - a.rate);
  return {
    months,
    recordDays,
    total,
    perfect,
    graduated,
    achievements: achievementRepo.listUnlocks().filter((unlock) => new Date(unlock.unlockedAt).getFullYear() === year)
      .length,
    ranking,
  };
}

export function statsBounds() {
  const { counts, today } = bundle();
  let first: LocalDate | null = null;
  counts.forEach((daily) => {
    daily.forEach((n, date) => {
      if (n > 0 && date <= today && (!first || date < first)) first = date;
    });
  });
  return {
    min: first ? startOfMonth(first) : startOfMonth(today),
    max: startOfMonth(today),
    today,
    hasRecords: first !== null,
  };
}

export function projectMonthDone(projectId: string, month: LocalDate): { value: number; unit: 'days' | 'times' } {
  const project = projectRepo.getEntity(projectId);
  if (!project) return { value: 0, unit: 'days' };
  const today = clock.today();
  const from = startOfMonth(month);
  const to = minDate(endOfMonth(month), today);
  if (from > to) return { value: 0, unit: 'days' };
  const counts = checkinRepo.countsByProject().get(projectId) ?? emptyCounts();
  const rule = ruleOn(project.ruleVersions, to);
  if (rule.kind === 'weeklyTimes' || rule.kind === 'monthlyTimes') {
    let value = 0;
    counts.forEach((n, date) => {
      if (date >= from && date <= to) value += n;
    });
    return { value, unit: 'times' };
  }
  let value = 0;
  counts.forEach((n, date) => {
    if (date >= from && date <= to && isDayCompleted(ruleOn(project.ruleVersions, date), n)) value += 1;
  });
  return { value, unit: 'days' };
}

export function projectYearCells(
  projectId: string,
  year: number,
): { date: LocalDate; state: 'done' | 'missed' | 'none' }[] {
  const project = projectRepo.getEntity(projectId);
  const today = clock.today();
  const counts = project
    ? checkinRepo.dailyCounts(projectId, makeLocalDate(year, 1, 1), makeLocalDate(year, 12, 31))
    : emptyCounts();
  const cells: { date: LocalDate; state: 'done' | 'missed' | 'none' }[] = [];
  if (!project) return cells;
  for (const date of eachDay(makeLocalDate(year, 1, 1), makeLocalDate(year, 12, 31))) {
    if (date > today || !visibilityOn(project, date).visible) {
      cells.push({ date, state: 'none' });
      continue;
    }
    const rule = ruleOn(project.ruleVersions, date);
    const done = isDayCompleted(rule, counts.get(date) ?? 0);
    const missed = !done && date !== today && isRequiredKind(rule.kind);
    cells.push({ date, state: done ? 'done' : missed ? 'missed' : 'none' });
  }
  return cells;
}

export function projectNotes(projectId: string, limit: number) {
  return { notes: checkinRepo.listNotes(projectId, limit), total: checkinRepo.noteCount(projectId) };
}

export function daysInYearSoFar(today: LocalDate): { day: number; left: number; week: number } {
  const { year } = parseLocalDate(today);
  return {
    day: diffDays(makeLocalDate(year, 1, 1), today) + 1,
    left: diffDays(today, makeLocalDate(year, 12, 31)),
    week: isoWeekNumber(today),
  };
}
