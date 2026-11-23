/**
 * 提醒排期（技术方案第 10 节）：纯计算，不碰系统通知。
 * 进行中的项目、未来若干天里每个计划日的每个开启时间，排成单次通知；
 * 当天已完成、周期已达标、暂停、非计划日都跳过。结果按时间排序后截断。
 */
import { addDays, diffDays } from '../date';
import { isDayCompleted, isPeriodMet, periodContaining, periodTypeOf, ruleOn, visibilityOn } from '../rule';
import type { DailyCounts, LocalDate, ProjectSnapshot, RuleSettings } from '../types';

export interface ReminderSlotInput {
  id: string;
  /** HH:mm */
  time: string;
  enabled: boolean;
}

export interface SchedulableProject {
  snapshot: ProjectSnapshot;
  name: string;
  reminders: readonly ReminderSlotInput[];
  skipDone: boolean;
  skipPeriodMet: boolean;
}

export interface PlannedNotice {
  /** 项目:提醒:日期，或 evening:日期 */
  id: string;
  projectId: string | null;
  /** 点开通知后要定位的项目 */
  focusId: string | null;
  date: LocalDate;
  time: string;
  title: string;
  body: string;
}

export interface PlanInput {
  /** 墙上时钟的日期与当天分钟数，用来丢掉已经过去的时间 */
  nowDate: LocalDate;
  nowMinutes: number;
  /** 逻辑今天：完成后不再提醒只看这一天 */
  logicalToday: LocalDate;
  projects: readonly SchedulableProject[];
  counts: ReadonlyMap<string, DailyCounts>;
  settings: RuleSettings;
  evening: { enabled: boolean; time: string };
  horizonDays?: number;
  cap?: number;
}

export interface PlanResult {
  notices: PlannedNotice[];
  /** 60 条不够覆盖未来 3 天 */
  coverageShort: boolean;
}

const DEFAULT_HORIZON = 14;
const DEFAULT_CAP = 60;

export function minutesOf(time: string): number {
  const [h, m] = time.split(':');
  return Number(h) * 60 + Number(m);
}

export function isUpcoming(date: LocalDate, time: string, nowDate: LocalDate, nowMinutes: number): boolean {
  if (date > nowDate) return true;
  if (date < nowDate) return false;
  return minutesOf(time) > nowMinutes;
}

function countsOf(counts: ReadonlyMap<string, DailyCounts>, projectId: string): DailyCounts {
  return counts.get(projectId) ?? new Map();
}

function dayFinished(project: SchedulableProject, date: LocalDate, counts: DailyCounts): boolean {
  const rule = ruleOn(project.snapshot.ruleVersions, date);
  return isDayCompleted(rule, counts.get(date) ?? 0);
}

/** 周期型项目本周期是否已经达标；按天计数的项目没有"周期达标" */
function periodMet(
  project: SchedulableProject,
  date: LocalDate,
  counts: DailyCounts,
  settings: RuleSettings,
  logicalToday: LocalDate,
): boolean {
  const rule = ruleOn(project.snapshot.ruleVersions, date);
  const type = periodTypeOf(rule);
  if (type === 'day') return false;
  const period = periodContaining(type, date, settings);
  return isPeriodMet(project.snapshot, period, counts, logicalToday) === true;
}

function unfinished(
  projects: readonly SchedulableProject[],
  date: LocalDate,
  counts: ReadonlyMap<string, DailyCounts>,
  settings: RuleSettings,
  logicalToday: LocalDate,
): { id: string; name: string }[] {
  const waiting: { id: string; name: string }[] = [];
  for (const project of projects) {
    if (project.snapshot.status !== 'active') continue;
    if (!visibilityOn(project.snapshot, date).visible) continue;
    const daily = countsOf(counts, project.snapshot.id);
    const rule = ruleOn(project.snapshot.ruleVersions, date);
    const done =
      periodTypeOf(rule) === 'day'
        ? dayFinished(project, date, daily)
        : periodMet(project, date, daily, settings, logicalToday);
    if (!done) waiting.push({ id: project.snapshot.id, name: project.name });
  }
  return waiting;
}

function eveningBody(names: readonly string[]): string {
  const shown = names.slice(0, 6).join('、');
  const tail = names.length > 6 ? '等' : '';
  return `还有 ${names.length} 个小目标在等你：${shown}${tail}`;
}

export function planReminders(input: PlanInput): PlanResult {
  const horizon = input.horizonDays ?? DEFAULT_HORIZON;
  const cap = input.cap ?? DEFAULT_CAP;
  const candidates: PlannedNotice[] = [];
  const lastDay = addDays(input.nowDate, horizon - 1);

  for (let date = input.nowDate; date <= lastDay; date = addDays(date, 1)) {
    for (const project of input.projects) {
      if (project.snapshot.status !== 'active') continue;
      if (!visibilityOn(project.snapshot, date).visible) continue;
      const daily = countsOf(input.counts, project.snapshot.id);
      if (project.skipDone && date === input.logicalToday && dayFinished(project, date, daily)) continue;
      if (project.skipPeriodMet && periodMet(project, date, daily, input.settings, input.logicalToday)) continue;
      for (const slot of project.reminders) {
        if (!slot.enabled) continue;
        if (!isUpcoming(date, slot.time, input.nowDate, input.nowMinutes)) continue;
        candidates.push({
          id: `${project.snapshot.id}:${slot.id}:${date}`,
          projectId: project.snapshot.id,
          focusId: project.snapshot.id,
          date,
          time: slot.time,
          title: project.name,
          body: `该去完成「${project.name}」啦`,
        });
      }
    }

    if (input.evening.enabled && isUpcoming(date, input.evening.time, input.nowDate, input.nowMinutes)) {
      const waiting = unfinished(input.projects, date, input.counts, input.settings, input.logicalToday);
      const anyVisible = input.projects.some(
        (p) => p.snapshot.status === 'active' && visibilityOn(p.snapshot, date).visible,
      );
      if (date === input.logicalToday ? waiting.length > 0 : anyVisible) {
        candidates.push({
          id: `evening:${date}`,
          projectId: null,
          focusId: waiting[0]?.id ?? null,
          date,
          time: input.evening.time,
          title: '晚间汇总',
          body: date === input.logicalToday ? eveningBody(waiting.map((item) => item.name)) : '还有小目标在等你',
        });
      }
    }
  }

  candidates.sort(
    (a, b) => a.date.localeCompare(b.date) || minutesOf(a.time) - minutesOf(b.time) || a.id.localeCompare(b.id),
  );
  const notices = candidates.slice(0, cap);
  const dropped = candidates.length > cap;
  const coverageShort = dropped && notices.length > 0 && diffDays(input.nowDate, notices[notices.length - 1].date) < 3;
  return { notices, coverageShort };
}
