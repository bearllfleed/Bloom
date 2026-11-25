/**
 * 成就指标（附录 A）：把项目、打卡、心情和计数器算成一组数字，每枚徽章 = 某个指标 ≥ 阈值。
 * 负责：全部指标的计算；按分组只算受影响的部分（事件 → 分组见 groupsForTrigger）。
 * 不负责：读库（见 services/achievementService）、判定谁解锁（见 settle.ts）。
 * 口径：指标都取历史最大值，补卡一样算；撤销、删除后指标可能变小，但已获得的徽章不收回。
 */
import {
  addDays,
  compareDates,
  diffDays,
  eachDay,
  endOfMonth,
  logicalDateOf,
  startOfMonth,
  weekdayOf,
  type DayEndHour,
} from '../date';
import {
  isDayCompleted,
  isInActiveRange,
  isPeriodMet,
  nextPeriod,
  periodContaining,
  periodTypeOf,
  ruleForPeriod,
  ruleOn,
  visibilityOn,
} from '../rule';
import { completionRateOf, dayOverview, statsEndDate, streakOf, type DayOverview } from '../stats';
import type { CheckinSource, DailyCounts, LocalDate, ProjectSnapshot, RuleSettings } from '../types';

export const METRIC_GROUPS = ['checkins', 'streaks', 'days', 'projects', 'graduation', 'mood', 'counters'] as const;
export type MetricGroup = (typeof METRIC_GROUPS)[number];

/** 每个指标属于哪一组；unlocksInDay 不在这里算，结算时按当天已获得的数量补上 */
export const METRIC_GROUP = {
  totalCheckins: 'checkins',
  notesWritten: 'checkins',
  widgetCheckins: 'checkins',
  recordDays: 'checkins',
  earlyCheckins: 'checkins',
  nightCheckins: 'checkins',
  onTimeCheckins: 'checkins',
  makeupCheckins: 'checkins',
  newYearCheckins: 'checkins',
  date520Checkins: 'checkins',
  maxTapsInDay: 'checkins',
  longestBreak: 'checkins',
  bestAnyDayStreak: 'checkins',
  bestDayStreak: 'streaks',
  bestWeekStreak: 'streaks',
  bestMonthStreak: 'streaks',
  bestMultiFullStreak: 'streaks',
  perfectDays: 'days',
  bestPerfectStreak: 'days',
  perfectMonths: 'days',
  bestMondayStreak: 'days',
  bestWeekendStreak: 'days',
  maxProjectsDoneInDay: 'days',
  projectsCreated: 'projects',
  remindersSet: 'projects',
  reruns: 'projects',
  maxActiveProjects: 'projects',
  maxActiveCategories: 'projects',
  graduations: 'graduation',
  graduations30At80: 'graduation',
  perfectGraduations: 'graduation',
  graduations90: 'graduation',
  moodCount: 'mood',
  moodPhotos: 'mood',
  bestMoodStreak: 'mood',
  longestMoodText: 'mood',
  moodFacesUsed: 'mood',
  backupExports: 'counters',
  pauseResumes: 'counters',
  maxUndosInDay: 'counters',
  unlocksInDay: null,
} as const satisfies Record<string, MetricGroup | null>;

export type MetricKey = keyof typeof METRIC_GROUP;

/** 只含这次算过的指标；没算的指标不参与判定 */
export type Metrics = Partial<Record<MetricKey, number>>;

/** 触发结算的数据变化，与 services/events 的事件类型一致 */
export type SettleTrigger = 'checkinChanged' | 'projectChanged' | 'moodChanged' | 'dataReplaced';

const TRIGGER_GROUPS: Record<SettleTrigger, readonly MetricGroup[]> = {
  // 撤销会改变"每天撤销次数"计数器
  checkinChanged: ['checkins', 'streaks', 'days', 'graduation', 'counters'],
  // 提醒时间影响"准时赴约"，所以项目变化也要重算打卡类
  projectChanged: ['checkins', 'streaks', 'days', 'projects', 'graduation', 'counters'],
  moodChanged: ['mood'],
  dataReplaced: METRIC_GROUPS,
};

export function groupsForTrigger(trigger: SettleTrigger): ReadonlySet<MetricGroup> {
  return new Set(TRIGGER_GROUPS[trigger]);
}

export interface AchievementProject {
  project: ProjectSnapshot;
  /** 形如 health/apple，斜杠前是图标分类 */
  iconId: string;
  counts: DailyCounts;
  /** 已开启的提醒时间 HH:mm */
  reminderTimes: readonly string[];
  /** 设置过提醒（开关关着也算） */
  hasReminder: boolean;
  /** 由"再来一轮"创建 */
  rerun: boolean;
}

export interface AchievementCheckin {
  projectId: string;
  /** 归属日期 */
  date: LocalDate;
  /** 实际打卡时刻 */
  checkedAt: number;
  hasNote: boolean;
  source: CheckinSource;
}

export interface MoodFact {
  date: LocalDate;
  face: string | null;
  /** 按字符计（表情算 1 个） */
  textLength: number;
  photoCount: number;
}

export interface AchievementCounters {
  backupExports: number;
  pauseResumes: number;
  maxUndosInDay: number;
}

export interface AchievementInput {
  today: LocalDate;
  settings: RuleSettings;
  dayEndHour: DayEndHour;
  projects: readonly AchievementProject[];
  checkins: readonly AchievementCheckin[];
  moods: readonly MoodFact[];
  counters: AchievementCounters;
}

export function computeMetrics(
  input: AchievementInput,
  groups: ReadonlySet<MetricGroup> = new Set(METRIC_GROUPS),
): Metrics {
  const out: Metrics = {};
  if (groups.has('checkins')) Object.assign(out, checkinMetrics(input));
  if (groups.has('streaks')) Object.assign(out, streakMetrics(input));
  if (groups.has('days')) Object.assign(out, dayMetrics(input));
  if (groups.has('projects')) Object.assign(out, projectMetrics(input));
  if (groups.has('graduation')) Object.assign(out, graduationMetrics(input));
  if (groups.has('mood')) Object.assign(out, moodMetrics(input));
  if (groups.has('counters')) Object.assign(out, { ...input.counters });
  return out;
}

// ---------- 打卡记录 ----------

const ON_TIME_MS = 15 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function checkinMetrics({ checkins, projects, dayEndHour }: AchievementInput): Metrics {
  const remindersOf = new Map(projects.map((p) => [p.project.id, p.reminderTimes]));
  const days = new Set<LocalDate>();
  const tapsOf = new Map<string, number>();
  let notes = 0;
  let widget = 0;
  let early = 0;
  let night = 0;
  let onTime = 0;
  let makeup = 0;
  let newYear = 0;
  let date520 = 0;
  let maxTaps = 0;
  for (const c of checkins) {
    days.add(c.date);
    const key = `${c.projectId}|${c.date}`;
    const taps = (tapsOf.get(key) ?? 0) + 1;
    tapsOf.set(key, taps);
    maxTaps = Math.max(maxTaps, taps);
    if (c.hasNote) notes++;
    if (c.source === 'widget') widget++;
    const monthDay = c.date.slice(5);
    if (monthDay === '01-01') newYear++;
    if (monthDay === '05-20') date520++;
    // 时段类只算当天打的卡：归属日期早于打卡时刻的逻辑日期就是补卡
    if (compareDates(c.date, logicalDateOf(c.checkedAt, dayEndHour)) < 0) {
      makeup++;
      continue;
    }
    const hour = new Date(c.checkedAt).getHours();
    if (hour >= 5 && hour < 7) early++;
    if (hour >= 23 || hour < 2) night++;
    if (isOnTime(c.checkedAt, remindersOf.get(c.projectId) ?? [])) onTime++;
  }
  const { best, longestBreak } = runsOf(days);
  return {
    totalCheckins: checkins.length,
    notesWritten: notes,
    widgetCheckins: widget,
    recordDays: days.size,
    earlyCheckins: early,
    nightCheckins: night,
    onTimeCheckins: onTime,
    makeupCheckins: makeup,
    newYearCheckins: newYear,
    date520Checkins: date520,
    maxTapsInDay: maxTaps,
    longestBreak,
    bestAnyDayStreak: best,
  };
}

/** 打卡时刻落在某个提醒之后 15 分钟内（23:55 的提醒、次日 0:05 打卡也算） */
function isOnTime(checkedAt: number, times: readonly string[]): boolean {
  return times.some((time) => {
    const [hour, minute] = time.split(':').map(Number);
    const slot = new Date(checkedAt);
    slot.setHours(hour, minute, 0, 0);
    let diff = checkedAt - slot.getTime();
    if (diff < 0) diff += DAY_MS;
    return diff <= ON_TIME_MS;
  });
}

/** 一组日期里最长的连续天数，以及两个日期之间最长的空档天数 */
function runsOf(dates: Iterable<LocalDate>): { best: number; longestBreak: number } {
  const sorted = [...new Set(dates)].sort(compareDates);
  let run = 0;
  let best = 0;
  let longestBreak = 0;
  sorted.forEach((date, i) => {
    const gap = i === 0 ? null : diffDays(sorted[i - 1], date);
    run = gap === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    if (gap !== null) longestBreak = Math.max(longestBreak, gap - 1);
  });
  return { best, longestBreak };
}

// ---------- 单个项目的连续 ----------

function streakMetrics({ projects, today, settings }: AchievementInput): Metrics {
  let day = 0;
  let week = 0;
  let month = 0;
  let multi = 0;
  for (const { project, counts } of projects) {
    const streak = streakOf(project, counts, today, settings);
    if (streak.unit === 'day') day = Math.max(day, streak.best);
    week = Math.max(week, bestPeriodRun(project, counts, 'week', today, settings));
    month = Math.max(month, bestPeriodRun(project, counts, 'month', today, settings));
    multi = Math.max(multi, bestMultiFullRun(project, counts, today));
  }
  return { bestDayStreak: day, bestWeekStreak: week, bestMonthStreak: month, bestMultiFullStreak: multi };
}

/**
 * 连续达标的周/月数（任何频率都算，口径见 isPeriodMet）。
 * 周期型频率达到目标就算数；其他频率要等周期最后一天才能确定"所有计划日都完成"。
 * 当前周期还没达标不打断连续。
 */
function bestPeriodRun(
  project: ProjectSnapshot,
  counts: DailyCounts,
  type: 'week' | 'month',
  today: LocalDate,
  settings: RuleSettings,
): number {
  const end = statsEndDate(project, today);
  let run = 0;
  let best = 0;
  for (
    let p = periodContaining(type, project.startDate, settings);
    compareDates(p.start, end) <= 0;
    p = nextPeriod(p, settings)
  ) {
    const met = isPeriodMet(project, p, counts, today);
    if (met === null) continue;
    const settled = compareDates(p.end, today) <= 0 || periodTypeOf(ruleForPeriod(project, p)) === type;
    if (met && settled) best = Math.max(best, ++run);
    else if (!met && compareDates(p.end, today) < 0) run = 0;
  }
  return best;
}

/** "每天多次"的日子连续打满的天数；当天还没打满不打断 */
function bestMultiFullRun(project: ProjectSnapshot, counts: DailyCounts, today: LocalDate): number {
  if (!project.ruleVersions.some(({ rule }) => rule.kind === 'daily' && rule.timesPerDay >= 2)) return 0;
  const end = statsEndDate(project, today);
  if (compareDates(project.startDate, end) > 0) return 0;
  let run = 0;
  let best = 0;
  for (const date of eachDay(project.startDate, end)) {
    if (!visibilityOn(project, date).visible) continue;
    const rule = ruleOn(project.ruleVersions, date);
    if (rule.kind !== 'daily' || rule.timesPerDay < 2) run = 0;
    else if ((counts.get(date) ?? 0) >= rule.timesPerDay) best = Math.max(best, ++run);
    else if (date !== today) run = 0;
  }
  return best;
}

// ---------- 跨项目的每一天 ----------

/** 完美日判定：没有计划的日子不算也不打断；今天还没完成算"待定" */
type DayVerdict = 'perfect' | 'missed' | 'pending' | 'none';

function verdictOf(overview: DayOverview, date: LocalDate, today: LocalDate): DayVerdict {
  if (overview.isPerfect) return 'perfect';
  if (overview.planned === 0) return 'none';
  return date === today ? 'pending' : 'missed';
}

function bestPerfectRun(verdicts: Iterable<DayVerdict>): number {
  let run = 0;
  let best = 0;
  for (const verdict of verdicts) {
    if (verdict === 'perfect') best = Math.max(best, ++run);
    else if (verdict === 'missed') run = 0;
  }
  return best;
}

/** 周六、周日合成一个周末：有一天没做到就断；有一天待定就先不算 */
function weekendVerdict(saturday: DayVerdict, sunday: DayVerdict): DayVerdict {
  const both = [saturday, sunday];
  if (both.includes('missed')) return 'missed';
  if (both.includes('pending')) return 'pending';
  return both.includes('perfect') ? 'perfect' : 'none';
}

function earliestStart(projects: readonly AchievementProject[]): LocalDate | null {
  let first: LocalDate | null = null;
  for (const { project } of projects) {
    if (first === null || compareDates(project.startDate, first) < 0) first = project.startDate;
  }
  return first;
}

function dayMetrics({ projects, today }: AchievementInput): Metrics {
  const items = projects.map(({ project, counts }) => ({ project, counts }));
  const first = earliestStart(projects);
  const verdicts = new Map<LocalDate, DayVerdict>();
  if (first !== null && compareDates(first, today) <= 0) {
    for (const date of eachDay(first, today)) verdicts.set(date, verdictOf(dayOverview(items, date), date, today));
  }

  const mondays: DayVerdict[] = [];
  const weekends: DayVerdict[] = [];
  const months = new Map<string, DayVerdict[]>();
  let perfectDays = 0;
  verdicts.forEach((verdict, date) => {
    if (verdict === 'perfect') perfectDays++;
    const weekday = weekdayOf(date);
    if (weekday === 1) mondays.push(verdict);
    if (weekday === 7) weekends.push(weekendVerdict(verdicts.get(addDays(date, -1)) ?? 'none', verdict));
    const month = startOfMonth(date);
    months.set(month, [...(months.get(month) ?? []), verdict]);
  });

  // 整月圆满：月份要完整落在使用期内并已过完，有完美日、没有没做到或待定的日子
  let perfectMonths = 0;
  months.forEach((list, month) => {
    if (first === null || compareDates(first, month) > 0 || compareDates(endOfMonth(month), today) > 0) return;
    if (list.includes('perfect') && list.every((v) => v === 'perfect' || v === 'none')) perfectMonths++;
  });

  const doneOn = new Map<LocalDate, number>();
  for (const { project, counts } of projects) {
    counts.forEach((n, date) => {
      if (n > 0 && isDayCompleted(ruleOn(project.ruleVersions, date), n)) doneOn.set(date, (doneOn.get(date) ?? 0) + 1);
    });
  }

  return {
    perfectDays,
    bestPerfectStreak: bestPerfectRun(verdicts.values()),
    perfectMonths,
    bestMondayStreak: bestPerfectRun(mondays),
    bestWeekendStreak: bestPerfectRun(weekends),
    maxProjectsDoneInDay: Math.max(0, ...doneOn.values()),
  };
}

// ---------- 项目 ----------

function categoryOf(iconId: string): string {
  return iconId.split('/')[0];
}

function projectMetrics({ projects, today }: AchievementInput): Metrics {
  let maxActive = 0;
  let maxCategories = 0;
  const first = earliestStart(projects);
  if (first !== null && compareDates(first, today) <= 0) {
    for (const date of eachDay(first, today)) {
      // 进行中 = 在有效范围内且没有暂停；还没开始、已毕业的不算
      const active = projects.filter((p) => isInActiveRange(p.project, date).visible);
      maxActive = Math.max(maxActive, active.length);
      maxCategories = Math.max(maxCategories, new Set(active.map((p) => categoryOf(p.iconId))).size);
    }
  }
  return {
    projectsCreated: projects.length,
    remindersSet: projects.filter((p) => p.hasReminder).length,
    reruns: projects.filter((p) => p.rerun).length,
    maxActiveProjects: maxActive,
    maxActiveCategories: maxCategories,
  };
}

// ---------- 毕业 ----------

function graduationMetrics({ projects, today, settings }: AchievementInput): Metrics {
  let graduations = 0;
  let at30 = 0;
  let perfect = 0;
  let at90 = 0;
  for (const { project, counts } of projects) {
    if (project.status !== 'graduated' || project.graduatedOn === null) continue;
    graduations++;
    const length = diffDays(project.startDate, project.graduatedOn) + 1;
    const { numerator, denominator } = completionRateOf(project, counts, today, settings);
    // 用整数比较，避免 24/30 这类小数误差
    if (length >= 30 && denominator > 0 && numerator * 5 >= denominator * 4) at30++;
    if (length >= 7 && denominator > 0 && numerator === denominator) perfect++;
    if (length >= 90) at90++;
  }
  return { graduations, graduations30At80: at30, perfectGraduations: perfect, graduations90: at90 };
}

// ---------- 心情 ----------

function moodMetrics({ moods }: AchievementInput): Metrics {
  const faces = new Set(moods.map((m) => m.face).filter((face): face is string => face !== null));
  return {
    moodCount: moods.length,
    moodPhotos: moods.reduce((sum, m) => sum + m.photoCount, 0),
    bestMoodStreak: runsOf(moods.map((m) => m.date)).best,
    longestMoodText: Math.max(0, ...moods.map((m) => m.textLength)),
    moodFacesUsed: faces.size,
  };
}
