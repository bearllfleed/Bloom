/**
 * 解锁判定与结算计划（第 3 期文档第 3 节）。
 * - 指标达到阈值即解锁；已获得的不再判定，也从不收回；
 * - 只判定这次算过的指标，没算的分组保持原样；
 * - 静默结算（首次升级到本期、导入备份后）全部进补发卡；普通结算 ≥ 5 枚也合并为补发卡，否则逐个弹出；
 * - "双倍快乐"看同一天普通获得的数量，补发的不算。
 */
import { logicalDateOf, type DayEndHour } from '../date';
import { ACHIEVEMENTS } from './catalog';
import type { Metrics } from './metrics';

/** 一次结算出这么多枚时合并成补发卡 */
export const REISSUE_MIN = 5;

export type UnlockPresentation = 'popup' | 'reissue';

export interface OwnedUnlock {
  id: string;
  unlockedAt: number;
  /** 静默结算补发的 */
  reissue: boolean;
}

export interface SettlePlan {
  /** 按编号排列 */
  ids: string[];
  /** 没有新徽章时为 null */
  presentation: UnlockPresentation | null;
}

export function newlyUnlocked(metrics: Metrics, owned: ReadonlySet<string>): string[] {
  return ACHIEVEMENTS.filter((def) => {
    if (owned.has(def.id)) return false;
    const value = metrics[def.metric];
    return value !== undefined && value >= def.threshold;
  }).map((def) => def.id);
}

export interface SettleInput {
  metrics: Metrics;
  owned: readonly OwnedUnlock[];
  now: number;
  dayEndHour: DayEndHour;
  silent: boolean;
}

export function planSettle({ metrics, owned, now, dayEndHour, silent }: SettleInput): SettlePlan {
  const ownedIds = new Set(owned.map((u) => u.id));
  const ids = newlyUnlocked(metrics, ownedIds);
  if (!silent && ids.length > 0) {
    const today = logicalDateOf(now, dayEndHour);
    const earlier = owned.filter((u) => !u.reissue && logicalDateOf(u.unlockedAt, dayEndHour) === today).length;
    ids.push(...newlyUnlocked({ unlocksInDay: earlier + ids.length }, new Set([...ownedIds, ...ids])));
  }
  if (ids.length === 0) return { ids, presentation: null };
  return { ids, presentation: silent || ids.length >= REISSUE_MIN ? 'reissue' : 'popup' };
}
