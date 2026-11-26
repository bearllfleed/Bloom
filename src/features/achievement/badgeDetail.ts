/**
 * 徽章详情与成就馆展示的纯规则（第 3 期 3-5、3-6）。
 * 不依赖 React 或数据库；获得来源由调用方传入，未知时只显示日期。
 */
import { ACHIEVEMENTS, SERIES, type AchievementDef } from '@/domain/achievement/catalog';
import { badgeDisplayName, METRIC_UNIT } from '@/domain/achievement/presentation';

import { achievementCopy } from '@/copy/phase3';

/** 展示用的徽章定义字段，测试可传最小对象 */
export type BadgeDefLike = Pick<
  AchievementDef,
  'id' | 'name' | 'hidden' | 'series' | 'tier' | 'metric' | 'threshold' | 'condition'
>;

export interface BadgeDetailInfo {
  /** 显示名；隐藏未获得为"神秘徽章" */
  name: string;
  /** 繁花 · 连续绽放系列 */
  seriesLine: string;
  /** "11月22日 因「早睡」获得"；未获得为 null */
  earnedLine: string | null;
  /** 条件文案；隐藏未获得为一句提示 */
  condition: string;
  /** 还差 N 天的进度文案；没有可量化进度时为 null */
  remaining: string | null;
  /** 0–1 的未获得进度；已获得或无法量化时为 null */
  ratio: number | null;
}

export interface BadgeDetailInput {
  def: BadgeDefLike;
  unlocked: boolean;
  /** 当前指标值；还没算过传 null */
  current: number | null;
  /** 获得时间（毫秒），未获得为 null */
  unlockedAt: number | null;
  /** 触发解锁的项目名快照，未知为 null */
  reason?: string | null;
}

const SERIES_NAME = new Map(SERIES.map((series) => [series.id, series.name]));

export function badgeDetail(input: BadgeDetailInput): BadgeDetailInfo {
  const { def, unlocked } = input;
  const name = badgeDisplayName(def, unlocked);
  const seriesLine = `${achievementCopy.tierLabel[def.tier]} · ${SERIES_NAME.get(def.series) ?? ''}系列`;
  const earnedLine =
    unlocked && input.unlockedAt !== null ? formatEarnedAt(input.unlockedAt, input.reason ?? null) : null;

  if (def.hidden && !unlocked) {
    return { name, seriesLine, earnedLine: null, condition: achievementCopy.mysteryHint, remaining: null, ratio: null };
  }

  const unit = METRIC_UNIT[def.metric] ?? '';
  const remaining =
    !unlocked && input.current !== null
      ? achievementCopy.remaining(Math.max(0, def.threshold - Math.floor(input.current)), unit)
      : null;
  const current = input.current === null ? 0 : Math.max(0, Math.min(def.threshold, input.current));

  return {
    name,
    seriesLine,
    earnedLine,
    condition: def.condition,
    remaining,
    ratio: unlocked || def.threshold === 0 ? null : current / def.threshold,
  };
}

/** "11月22日 因「早睡」获得"；来源未知时只说日期 */
export function formatEarnedAt(ms: number, reason: string | null): string {
  const date = new Date(ms);
  const label = `${date.getMonth() + 1}月${date.getDate()}日`;
  return reason ? achievementCopy.earnedFrom(label, reason) : label;
}

const BY_SERIES = new Map<string, AchievementDef[]>();
for (const def of ACHIEVEMENTS) {
  BY_SERIES.set(def.series, [...(BY_SERIES.get(def.series) ?? []), def]);
}

/** 同系列徽章，按目录顺序；当前徽章也在列表里，由界面高亮 */
export function sameSeriesBadges(id: string): AchievementDef[] {
  const def = ACHIEVEMENTS.find((item) => item.id === id);
  return def ? (BY_SERIES.get(def.series) ?? []) : [];
}
