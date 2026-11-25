/**
 * 成就结算（第 3 期文档 3-1、第 3 节）：数据变化后只重算受影响的指标，把新获得的徽章写库。
 * - 首次升级到本期（还没做过基线结算）时，启动先静默结算一次，结果进补发卡；
 * - 导入备份后由 backupService 调用 settleSilently，同样进补发卡；
 * - 新徽章写库时 seen = 0，弹窗（3-3）和补发卡（3-4）展示后再标记已看，杀掉 App 也能补弹；
 * - 停手 1.2 秒后才通知界面展示，连续快速打卡只弹一轮。
 */
import {
  METRIC_GROUPS,
  computeMetrics,
  groupsForTrigger,
  planSettle,
  type AchievementInput,
  type MetricGroup,
  type SettlePlan,
} from '@/domain/achievement';
import { achievementRepo, type StoredUnlock } from '@/data/repositories/achievementRepo';
import { checkinRepo } from '@/data/repositories/checkinRepo';
import { metaRepo } from '@/data/repositories/metaRepo';
import { projectRepo } from '@/data/repositories/projectRepo';
import { clock } from '@/platform/clock';
import { createLogger } from '@/platform/logger';
import { usePrefs } from '@/stores/prefsStore';

import { events } from './events';

const log = createLogger('achievement');

/** 停手多久后展示新徽章（验收 A3-05） */
export const PRESENT_DELAY_MS = 1200;

/** 做过基线结算的标记；在 meta 表里，随备份一起走 */
const BASELINE_KEY = 'achievement_baseline_at';

const ALL_GROUPS: ReadonlySet<MetricGroup> = new Set(METRIC_GROUPS);

function loadInput(groups: ReadonlySet<MetricGroup>): AchievementInput {
  const { weekStart, dayEndHour } = usePrefs.getState();
  const entities = projectRepo.listEntities();
  const live = new Set(entities.map((p) => p.id));
  const counts = checkinRepo.countsByProject();
  return {
    today: clock.today(),
    settings: { weekStart },
    dayEndHour,
    projects: entities.map((p) => ({
      project: p,
      iconId: p.iconId,
      counts: counts.get(p.id) ?? new Map(),
      reminderTimes: p.reminders.filter((r) => r.enabled).map((r) => r.time),
      hasReminder: p.reminders.length > 0,
      rerun: p.previousProjectId !== null,
    })),
    // 打卡明细和心情只在对应分组要算时才读；已删除项目的记录不算
    checkins: groups.has('checkins')
      ? checkinRepo
          .listAll()
          .filter((c) => live.has(c.projectId))
          .map((c) => ({
            projectId: c.projectId,
            date: c.date,
            checkedAt: c.checkedAt,
            hasNote: c.note !== null,
            source: c.source,
          }))
      : [],
    moods: groups.has('mood') ? achievementRepo.listMoodFacts() : [],
    counters: achievementRepo.counters(),
  };
}

let presentTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

/** 有新徽章、或者还在等停手时重新计时 */
function schedulePresent(): void {
  if (presentTimer) clearTimeout(presentTimer);
  presentTimer = setTimeout(() => {
    presentTimer = null;
    listeners.forEach((listener) => listener());
  }, PRESENT_DELAY_MS);
}

function settle(groups: ReadonlySet<MetricGroup>, silent: boolean): SettlePlan | null {
  try {
    const now = clock.now();
    const plan = planSettle({
      metrics: computeMetrics(loadInput(groups), groups),
      owned: achievementRepo.listUnlocks(),
      now,
      dayEndHour: usePrefs.getState().dayEndHour,
      silent,
    });
    if (plan.presentation !== null) {
      achievementRepo.insertUnlocks(plan.ids, now, { silent, presentation: plan.presentation });
      log.info(`获得徽章 ${plan.ids.join('、')}${silent ? '（补发）' : ''}`);
    }
    if (plan.presentation !== null || presentTimer) schedulePresent();
    return plan;
  } catch (error) {
    // 结算失败不能影响打卡等主流程；下次数据变化时会再结算
    log.warn('成就结算失败', error);
    return null;
  }
}

let started = false;

export const achievementService = {
  /** 启动时调用一次：必要时先做基线静默结算，再订阅数据事件 */
  start(): void {
    if (started) return;
    started = true;
    if (metaRepo.get(BASELINE_KEY) === null) this.settleSilently();
    events.subscribe((event) => {
      settle(groupsForTrigger(event.type), false);
    });
  },

  /** 静默结算：首次升级到本期、导入备份后。新徽章全部进补发卡 */
  settleSilently(): SettlePlan | null {
    const plan = settle(ALL_GROUPS, true);
    if (plan) metaRepo.set(BASELINE_KEY, String(clock.now()));
    return plan;
  },

  /** 计数器变了但没有数据事件时调用（如导出备份） */
  settleCounters(): void {
    settle(new Set<MetricGroup>(['counters']), false);
  },

  /** 全部已获徽章，按获得时间、编号排列 */
  unlocked(): StoredUnlock[] {
    return achievementRepo.listUnlocks();
  },

  /** 还没展示过的新徽章 */
  unseen(): StoredUnlock[] {
    return achievementRepo.listUnlocks().filter((u) => !u.seen);
  },

  markSeen(ids: readonly string[]): void {
    achievementRepo.markSeen(ids);
  },

  /** 新徽章可以展示了（停手 1.2 秒后）；返回取消订阅 */
  onUnlocked(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
