/**
 * 成就展示分组和心情入口的纯规则，不依赖 React 或数据库。
 */
import { logicalDateOf, type DayEndHour } from '../date';
import type { LocalDate } from '../types';
import type { AchievementDef, SeriesDef } from './catalog';
import { SERIES } from './catalog';
import type { MetricKey } from './metrics';
import type { OwnedUnlock, UnlockPresentation } from './settle';

/** 展示分组只依赖解锁记录的核心字段，避免领域层反向依赖仓储 */
export type PresentableUnlock = OwnedUnlock & { presentation: UnlockPresentation; seen: boolean };

export interface AchievementPresentationGroup {
  kind: 'popup' | 'reissue';
  ids: string[];
}

/** 普通徽章保持逐枚队列，补发徽章合并成一张卡 */
export function groupAchievementUnlocks(unlocks: readonly PresentableUnlock[]): AchievementPresentationGroup[] {
  const groups: AchievementPresentationGroup[] = [];
  for (const item of unlocks) {
    const last = groups.at(-1);
    if (item.presentation === 'popup' || last?.kind !== item.presentation) {
      groups.push({ kind: item.presentation, ids: [item.id] });
    } else last.ids.push(item.id);
  }
  return groups;
}

/** 隐藏徽章只在获得后展示真实名字 */
export function badgeDisplayName(def: { name: string; hidden: boolean }, unlocked: boolean): string {
  return def.hidden && !unlocked ? '神秘徽章' : def.name;
}

/** 已完成可写心情；撤销后保留已有心情入口；未来不可写 */
export function canShowProjectMood(input: { completed: boolean; hasMood: boolean; future: boolean }): boolean {
  return !input.future && (input.completed || input.hasMood);
}

/** 当天入口只出现在完美日或已有当天心情时 */
export function canShowDayMood(input: { perfect: boolean; hasMood: boolean; future: boolean }): boolean {
  return !input.future && (input.perfect || input.hasMood);
}

/**
 * 项目起止期间获得的徽章（毕业回顾的"获得徽章"节点）。
 * 按逻辑日期比较，凌晨结束时间之前获得的徽章算前一天。
 */
export function badgesEarnedDuring(
  unlocks: readonly Pick<OwnedUnlock, 'id' | 'unlockedAt'>[],
  from: LocalDate,
  to: LocalDate,
  dayEndHour: DayEndHour = 0,
): string[] {
  return unlocks
    .filter((unlock) => {
      const date = logicalDateOf(unlock.unlockedAt, dayEndHour);
      return date >= from && date <= to;
    })
    .map((unlock) => unlock.id);
}

// ———————————————— 成就馆（3-5） ————————————————

export type GalleryFilter = 'all' | 'owned' | 'locked';

/** 筛选徽章；系列顺序与目录顺序都保持不变 */
export function filterAchievements(
  defs: readonly AchievementDef[],
  owned: ReadonlySet<string>,
  filter: GalleryFilter,
): AchievementDef[] {
  if (filter === 'owned') return defs.filter((def) => owned.has(def.id));
  if (filter === 'locked') return defs.filter((def) => !owned.has(def.id));
  return [...defs];
}

export interface SeriesGroup {
  series: SeriesDef;
  badges: AchievementDef[];
}

/** 按系列分组；筛选后没有徽章的系列不出现，避免大片空标题 */
export function seriesGroups(
  defs: readonly AchievementDef[],
  owned: ReadonlySet<string>,
  filter: GalleryFilter,
): SeriesGroup[] {
  const visible = filterAchievements(defs, owned, filter);
  return SERIES.map((series) => ({ series, badges: visible.filter((def) => def.series === series.id) })).filter(
    (group) => group.badges.length > 0,
  );
}

export interface SeriesProgress {
  owned: number;
  total: number;
}

export function seriesProgress(
  defs: readonly AchievementDef[],
  owned: ReadonlySet<string>,
  series: SeriesDef['id'],
): SeriesProgress {
  const badges = defs.filter((def) => def.series === series);
  return { owned: badges.filter((def) => owned.has(def.id)).length, total: badges.length };
}

export function galleryCounts(
  defs: readonly AchievementDef[],
  owned: ReadonlySet<string>,
): SeriesProgress & {
  ratio: number;
} {
  const count = defs.filter((def) => owned.has(def.id)).length;
  return { owned: count, total: defs.length, ratio: defs.length === 0 ? 0 : count / defs.length };
}

/** 指标的单位：天、次、篇、周、种…… */
export const METRIC_UNIT: Partial<Record<MetricKey, string>> = {
  totalCheckins: '次',
  notesWritten: '篇',
  recordDays: '天',
  bestDayStreak: '天',
  bestWeekStreak: '周',
  bestMonthStreak: '月',
  bestAnyDayStreak: '天',
  bestMultiFullStreak: '天',
  perfectDays: '天',
  bestPerfectStreak: '天',
  perfectMonths: '月',
  bestMondayStreak: '周',
  bestWeekendStreak: '周',
  maxProjectsDoneInDay: '个',
  projectsCreated: '个',
  remindersSet: '个',
  reruns: '次',
  maxActiveProjects: '个',
  maxActiveCategories: '种',
  graduations: '个项目',
  graduations30At80: '个项目',
  perfectGraduations: '个项目',
  graduations90: '个项目',
  moodCount: '篇',
  moodPhotos: '张',
  bestMoodStreak: '天',
  longestMoodText: '字',
  moodFacesUsed: '种',
  maxTapsInDay: '次',
  unlocksInDay: '枚',
};

/**
 * 未获得徽章的进度文案，例如 "8/10 天"。
 * 已获得、隐藏未获得、指标还没算过时返回 null，由界面决定显示条件或提示。
 */
export function badgeProgressLabel(
  def: Pick<AchievementDef, 'hidden' | 'metric' | 'threshold'>,
  current: number | null | undefined,
  unlocked: boolean,
): string | null {
  if (unlocked || def.hidden || current === null || current === undefined) return null;
  const value = Math.max(0, Math.min(def.threshold, Math.floor(current)));
  return `${value}/${def.threshold} ${METRIC_UNIT[def.metric] ?? ''}`.trim();
}
