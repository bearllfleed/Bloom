/**
 * 打卡用例：打卡、撤销、删除与恢复记录、改备注（需求 5.5、5.13）。
 * 打卡后顺带判断是否"第一次"成为完美日，供今日页播放庆祝。
 */
import { dayOverview } from '@/domain/stats';
import { canCheckIn, isCompletingCheckIn, ruleOn, type CheckInBlockReason } from '@/domain/rule';
import type { CheckinRecord, LocalDate } from '@/domain/types';
import { checkinRepo } from '@/data/repositories/checkinRepo';
import { metaRepo } from '@/data/repositories/metaRepo';
import { projectRepo } from '@/data/repositories/projectRepo';
import { clock } from '@/platform/clock';
import { createLogger } from '@/platform/logger';

import { events } from './events';

const log = createLogger('checkin');

/** 同一项目同一天 0.25 秒内的第二次点击忽略 */
const DEBOUNCE_MS = 250;
const lastTap = new Map<string, number>();

/** 完美日只在第一次达成时庆祝：today 播放全套，past 只让日历格的花弹一下 */
export type PerfectCelebration = 'none' | 'today' | 'past';

export type CheckInResult =
  | {
      ok: true;
      checkinId: string;
      countAfter: number;
      target: number | null;
      /** 这一下"打完了"：决定是否弹成绩面板 */
      completing: boolean;
      perfect: PerfectCelebration;
    }
  | { ok: false; reason: CheckInBlockReason | 'tooFast' | 'writeFailed' | 'notFound' };

function isPerfectOn(date: LocalDate): boolean {
  const entities = projectRepo.listEntities();
  const counts = checkinRepo.countsByProject(date, date);
  return dayOverview(
    entities.map((project) => ({ project, counts: counts.get(project.id) ?? new Map() })),
    date,
  ).isPerfect;
}

export const checkinService = {
  checkIn(projectId: string, date: LocalDate): CheckInResult {
    const key = `${projectId}|${date}`;
    const now = clock.now();
    if (now - (lastTap.get(key) ?? 0) < DEBOUNCE_MS) return { ok: false, reason: 'tooFast' };
    lastTap.set(key, now);

    const project = projectRepo.getSnapshot(projectId);
    if (!project) return { ok: false, reason: 'notFound' };
    const today = clock.today();
    const before = checkinRepo.dailyCounts(projectId, date, date).get(date) ?? 0;
    const verdict = canCheckIn(project, date, today, before);
    if (!verdict.ok) return { ok: false, reason: verdict.reason };

    const wasPerfect = isPerfectOn(date);
    let checkinId: string;
    try {
      checkinId = checkinRepo.insert(projectId, date);
    } catch (error) {
      log.error('写入打卡失败', error);
      return { ok: false, reason: 'writeFailed' };
    }
    const rule = ruleOn(project.ruleVersions, date);
    const countAfter = before + 1;
    let perfect: PerfectCelebration = 'none';
    if (!wasPerfect && isPerfectOn(date) && metaRepo.setOnce(`perfect:${date}`, String(now))) {
      perfect = date === today ? 'today' : 'past';
    }
    events.emit({ type: 'checkinChanged', projectId, date });
    return {
      ok: true,
      checkinId,
      countAfter,
      target: rule.kind === 'weeklyTimes' || rule.kind === 'monthlyTimes' ? null : rule.timesPerDay,
      completing: isCompletingCheckIn(rule, countAfter),
      perfect,
    };
  },

  /** 撤销条：删掉刚才那一条 */
  undo(checkinId: string): CheckinRecord | null {
    const record = checkinRepo.deleteById(checkinId);
    if (record) events.emit({ type: 'checkinChanged', projectId: record.projectId, date: record.date });
    return record;
  },

  /** 已完成菜单里的"撤销一次"：删除该项目当天最近的一条 */
  undoLatest(projectId: string, date: LocalDate): CheckinRecord | null {
    const record = checkinRepo.deleteLatest(projectId, date);
    if (record) events.emit({ type: 'checkinChanged', projectId, date });
    return record;
  },

  deleteRecord(checkinId: string): CheckinRecord | null {
    return this.undo(checkinId);
  },

  restoreRecord(record: CheckinRecord): void {
    checkinRepo.restore(record);
    events.emit({ type: 'checkinChanged', projectId: record.projectId, date: record.date });
  },

  updateNote(checkinId: string, note: string): void {
    const record = checkinRepo.getById(checkinId);
    if (!record) return;
    const trimmed = note.trim();
    checkinRepo.updateNote(checkinId, trimmed === '' ? null : trimmed);
    events.emit({ type: 'checkinChanged', projectId: record.projectId, date: record.date });
  },

  getRecord(checkinId: string): CheckinRecord | null {
    return checkinRepo.getById(checkinId);
  },
};
