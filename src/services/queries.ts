/**
 * 页面查询：把仓储数据与规则引擎结论组装成页面直接可用的数据。
 * 全部项目与打卡次数按"数据版本"缓存一份，数据变更、时间旅行后自动失效。
 */
import { addMonths, compareDates, eachDay, endOfMonth, endOfWeek, startOfMonth, startOfWeek } from '@/domain/date';
import {
  daysUntilStart,
  describeRule,
  displayStatusOf,
  journeyProgress,
  pausedDays,
  type DisplayStatus,
} from '@/domain/project';
import {
  dayCardState,
  isDayCompleted,
  isInActiveRange,
  isPausedOn,
  isTimesKind,
  ruleOn,
  visibilityOn,
  type DayCardState,
} from '@/domain/rule';
import {
  completionRateOf,
  dayOverview,
  flowerMarkOf,
  statsEndDate,
  streakOf,
  totalCompletedOf,
  type CompletionRate,
  type DayOverview,
  type FlowerMark,
  type StreakResult,
} from '@/domain/stats';
import type { CheckinRecord, DailyCounts, LocalDate, ProjectEntity, RuleSettings } from '@/domain/types';
import { checkinRepo } from '@/data/repositories/checkinRepo';
import { projectRepo } from '@/data/repositories/projectRepo';
import { clock } from '@/platform/clock';
import { usePrefs } from '@/stores/prefsStore';

import { events } from './events';

interface BaseData {
  entities: ProjectEntity[];
  counts: Map<string, DailyCounts>;
}

let cache: BaseData | null = null;
events.subscribe(() => (cache = null));
clock.subscribe(() => (cache = null));

const EMPTY: DailyCounts = new Map();

function base(): BaseData {
  if (!cache) cache = { entities: projectRepo.listEntities(), counts: checkinRepo.countsByProject() };
  return cache;
}

function countsOf(projectId: string): DailyCounts {
  return base().counts.get(projectId) ?? EMPTY;
}

function settings(): RuleSettings {
  return { weekStart: usePrefs.getState().weekStart };
}

// ———————————————————————— 今日页 ————————————————————————

export interface DayItem {
  project: ProjectEntity;
  state: DayCardState;
  /** 当天最后一次打卡时间 */
  lastCheckedAt: number | null;
}

export type DayEmptyReason = 'noProjects' | 'restDay' | 'beforeAll' | null;

export interface DayView {
  date: LocalDate;
  today: LocalDate;
  items: DayItem[];
  overview: DayOverview;
  empty: DayEmptyReason;
}

export function getDayView(date: LocalDate): DayView {
  const today = clock.today();
  const { entities } = base();
  const visible = entities.filter((p) => visibilityOn(p, date).visible);
  const latest = visible.length > 0 ? checkinRepo.latestTimesOn(date) : new Map<string, number>();
  const items = visible.map((project) => ({
    project,
    state: dayCardState(project, date, today, countsOf(project.id), settings()),
    lastCheckedAt: latest.get(project.id) ?? null,
  }));
  const overview = dayOverview(
    entities.map((project) => ({ project, counts: countsOf(project.id) })),
    date,
  );
  let empty: DayEmptyReason = null;
  if (entities.length === 0) empty = 'noProjects';
  else if (items.length === 0) empty = entities.every((p) => date < p.startDate) ? 'beforeAll' : 'restDay';
  return { date, today, items, overview, empty };
}

export function hasAnyProject(): boolean {
  return base().entities.length > 0;
}

/** 日历区间内每天的花朵标记 */
export function getDayMarks(from: LocalDate, to: LocalDate): Map<LocalDate, FlowerMark> {
  const today = clock.today();
  const items = base().entities.map((project) => ({ project, counts: countsOf(project.id) }));
  const marks = new Map<LocalDate, FlowerMark>();
  if (items.length === 0) return marks;
  for (const date of eachDay(from, to)) {
    marks.set(date, flowerMarkOf(dayOverview(items, date), date, today));
  }
  return marks;
}

/** 日历可滑动范围：最早项目开始日期所在月（没有项目时为本月）到 12 个月后 */
export function getCalendarBounds(): { min: LocalDate; max: LocalDate } {
  const today = clock.today();
  const starts = base().entities.map((p) => p.startDate);
  const earliest = starts.reduce((a, b) => (a < b ? a : b), today);
  return { min: startOfMonth(earliest), max: endOfMonth(addMonths(today, 12)) };
}

// ———————————————————————— 我的项目 ————————————————————————

export interface ProjectSummary {
  project: ProjectEntity;
  status: DisplayStatus;
  streak: StreakResult;
  rate: CompletionRate;
  total: { value: number; unit: 'days' | 'times' };
  monthDone: { value: number; unit: 'days' | 'times' };
  journey: { day: number; total: number } | null;
  pausedDays: number;
  daysUntilStart: number;
  ruleText: string;
}

function monthDoneOf(project: ProjectEntity, counts: DailyCounts, today: LocalDate) {
  const end = statsEndDate(project, today);
  const from = startOfMonth(today);
  const rule = ruleOn(project.ruleVersions, end);
  let value = 0;
  if (isTimesKind(rule.kind)) {
    counts.forEach((n, d) => {
      if (d >= from && d <= end) value += n;
    });
    return { value, unit: 'times' as const };
  }
  counts.forEach((n, d) => {
    if (d >= from && d <= end && isDayCompleted(ruleOn(project.ruleVersions, d), n)) value++;
  });
  return { value, unit: 'days' as const };
}

export function summarize(project: ProjectEntity): ProjectSummary {
  const today = clock.today();
  const counts = countsOf(project.id);
  const s = settings();
  return {
    project,
    status: displayStatusOf(project, today),
    streak: streakOf(project, counts, today, s),
    rate: completionRateOf(project, counts, today, s),
    total: totalCompletedOf(project, counts, today),
    monthDone: monthDoneOf(project, counts, today),
    journey: journeyProgress(project, today),
    pausedDays: pausedDays(project, today),
    daysUntilStart: daysUntilStart(project, today),
    ruleText: describeRule(ruleOn(project.ruleVersions, statsEndDate(project, today)), project.unit),
  };
}

export interface ProjectGroups {
  active: ProjectSummary[];
  paused: ProjectSummary[];
  graduated: ProjectSummary[];
}

/** 进行中（未开始的排在最后）、已暂停、已毕业 */
export function getProjectGroups(): ProjectGroups {
  const all = base().entities.map(summarize);
  const active = all.filter((s) => s.status === 'active' || s.status === 'notStarted');
  active.sort((a, b) => Number(a.status === 'notStarted') - Number(b.status === 'notStarted'));
  return {
    active,
    paused: all.filter((s) => s.status === 'paused'),
    graduated: all.filter((s) => s.status === 'graduated'),
  };
}

export function getProjectSummary(projectId: string): ProjectSummary | null {
  const project = base().entities.find((p) => p.id === projectId);
  return project ? summarize(project) : null;
}

export function listProjects(): ProjectEntity[] {
  return base().entities;
}

export function getProject(projectId: string): ProjectEntity | null {
  return base().entities.find((p) => p.id === projectId) ?? null;
}

// ———————————————————————— 项目详情 ————————————————————————

export interface ProjectDayCell {
  date: LocalDate;
  inMonth: boolean;
  /** 计划日（会出现在列表里） */
  planned: boolean;
  paused: boolean;
  mark: FlowerMark;
  isToday: boolean;
  isFuture: boolean;
}

/** 单个项目的月历：花朵三态用项目颜色，非计划日无标记，暂停日加斜线底纹 */
export function getProjectMonth(projectId: string, monthDate: LocalDate): ProjectDayCell[][] {
  const project = getProject(projectId);
  const today = clock.today();
  const weekStart = settings().weekStart;
  const first = startOfMonth(monthDate);
  const last = endOfMonth(monthDate);
  const counts = countsOf(projectId);
  const days = eachDay(startOfWeek(first, weekStart), endOfWeek(last, weekStart));
  const cells = days.map((date): ProjectDayCell => {
    const inMonth = date >= first && date <= last;
    const isFuture = date > today;
    if (!project)
      return { date, inMonth, planned: false, paused: false, mark: 'none', isToday: date === today, isFuture };
    const planned = visibilityOn(project, date).visible;
    const paused = isPausedOn(project.pauses, date) && date >= project.startDate;
    let mark: FlowerMark = 'none';
    if (planned && !isFuture) {
      const n = counts.get(date) ?? 0;
      const rule = ruleOn(project.ruleVersions, date);
      if (isDayCompleted(rule, n)) mark = 'bloom';
      else if (n > 0) mark = 'bud';
      else if (date !== today) mark = 'dot';
    }
    return { date, inMonth, planned, paused, mark, isToday: date === today, isFuture };
  });
  const weeks: ProjectDayCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** 项目详情月历可翻的范围：开始月到本月（未开始时到开始月） */
export function getProjectMonthBounds(projectId: string): { min: LocalDate; max: LocalDate } {
  const project = getProject(projectId);
  const today = clock.today();
  if (!project) return { min: startOfMonth(today), max: startOfMonth(today) };
  const max = project.startDate > today ? project.startDate : today;
  return { min: startOfMonth(project.startDate), max: startOfMonth(max) };
}

export interface DayRecordsView {
  project: ProjectEntity;
  date: LocalDate;
  records: CheckinRecord[];
  state: DayCardState;
  /** 当天不在范围内时为隐藏原因 */
  inRange: boolean;
}

export function getDayRecords(projectId: string, date: LocalDate): DayRecordsView | null {
  const project = getProject(projectId);
  if (!project) return null;
  return {
    project,
    date,
    records: checkinRepo.listOnDate(projectId, date),
    state: dayCardState(project, date, clock.today(), countsOf(projectId), settings()),
    inRange: isInActiveRange(project, date).visible,
  };
}

export function getRecentRecords(projectId: string, limit = 5): CheckinRecord[] {
  return checkinRepo.recent(projectId, limit);
}

// ———————————————————————— 打卡记录 ————————————————————————

export interface HistoryMonth {
  month: string;
  count: number;
}

export function getHistoryMonths(projectId: string | null): HistoryMonth[] {
  return checkinRepo.monthsWithRecords(projectId);
}

export interface HistoryDay {
  date: LocalDate;
  records: CheckinRecord[];
}

/** 某月的记录按归属日期分组 */
export function getHistoryMonth(month: string, projectId: string | null): HistoryDay[] {
  const days: HistoryDay[] = [];
  for (const record of checkinRepo.listMonth(month, projectId)) {
    const lastDay = days[days.length - 1];
    if (lastDay && lastDay.date === record.date) lastDay.records.push(record);
    else days.push({ date: record.date, records: [record] });
  }
  return days;
}

export function getRecord(checkinId: string): CheckinRecord | null {
  return checkinRepo.getById(checkinId);
}

/** 比较两个日期是否同一天，供界面判断补卡时间写法 */
export function isSameDay(a: LocalDate, b: LocalDate): boolean {
  return compareDates(a, b) === 0;
}
