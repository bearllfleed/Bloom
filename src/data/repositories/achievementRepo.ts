/**
 * 已获徽章与成就计数器（achievement_unlocks、counters 两张表，都随备份走）。
 * 负责：解锁记录与"已看过"状态；导出备份、暂停后继续、每天撤销次数三个计数器；成就要用的心情摘要。
 * 不负责：判定谁解锁（见 domain/achievement）、何时结算（见 services/achievementService）。
 */
import type { AchievementCounters, MoodFact, OwnedUnlock, UnlockPresentation } from '@/domain/achievement';
import type { LocalDate } from '@/domain/types';

import { getDatabase } from '../db/client';

/** 解锁时的上下文，存在 context_json 里 */
export interface UnlockContext {
  /** 静默结算（首次升级、导入备份）补发的 */
  silent: boolean;
  presentation: UnlockPresentation;
}

export interface StoredUnlock extends OwnedUnlock {
  presentation: UnlockPresentation;
  seen: boolean;
}

interface UnlockRow {
  achievement_id: string;
  unlocked_at: number;
  context_json: string | null;
  seen: number;
}

const BACKUP_EXPORTS = 'backup_exports';
const PAUSE_RESUMES = 'pause_resumes';
const MAX_UNDOS_IN_DAY = 'max_undos_in_day';
/** 当天撤销次数存成 undos@YYYY-MM-DD，只保留最近一天 */
const UNDOS_PREFIX = 'undos@';

/** 没有或解析不了上下文时按补发处理，不参与"双倍快乐" */
function parseContext(json: string | null): UnlockContext {
  try {
    const value = json ? (JSON.parse(json) as Partial<UnlockContext>) : {};
    return { silent: value.silent ?? true, presentation: value.presentation === 'popup' ? 'popup' : 'reissue' };
  } catch {
    return { silent: true, presentation: 'reissue' };
  }
}

function counter(key: string): number {
  return getDatabase().getFirstSync<{ value: number }>('SELECT value FROM counters WHERE key = ?', [key])?.value ?? 0;
}

function increment(key: string, now: number): void {
  getDatabase().runSync(
    'INSERT INTO counters (key, value, updated_at) VALUES (?, 1, ?) ON CONFLICT (key) DO UPDATE SET value = value + 1, updated_at = excluded.updated_at',
    [key, now],
  );
}

export const achievementRepo = {
  /** 按获得时间、编号排列 */
  listUnlocks(): StoredUnlock[] {
    return getDatabase()
      .getAllSync<UnlockRow>('SELECT * FROM achievement_unlocks ORDER BY unlocked_at, achievement_id')
      .map((row) => {
        const context = parseContext(row.context_json);
        return {
          id: row.achievement_id,
          unlockedAt: row.unlocked_at,
          reissue: context.silent,
          presentation: context.presentation,
          seen: row.seen !== 0,
        };
      });
  },

  /** 已经有的不覆盖：获得时间和上下文保持第一次的 */
  insertUnlocks(ids: readonly string[], unlockedAt: number, context: UnlockContext): void {
    const db = getDatabase();
    const json = JSON.stringify(context);
    db.withTransactionSync(() => {
      for (const id of ids) {
        db.runSync(
          'INSERT OR IGNORE INTO achievement_unlocks (achievement_id, unlocked_at, context_json, seen) VALUES (?, ?, ?, 0)',
          [id, unlockedAt, json],
        );
      }
    });
  },

  markSeen(ids: readonly string[]): void {
    if (ids.length === 0) return;
    getDatabase().runSync(
      `UPDATE achievement_unlocks SET seen = 1 WHERE achievement_id IN (${ids.map(() => '?').join(', ')})`,
      [...ids],
    );
  },

  counters(): AchievementCounters {
    return {
      backupExports: counter(BACKUP_EXPORTS),
      pauseResumes: counter(PAUSE_RESUMES),
      maxUndosInDay: counter(MAX_UNDOS_IN_DAY),
    };
  },

  recordBackupExport(now: number): void {
    increment(BACKUP_EXPORTS, now);
  },

  recordPauseResume(now: number): void {
    increment(PAUSE_RESUMES, now);
  },

  /** 撤销一次：当天次数 +1，并刷新历史上单日最多的次数 */
  recordUndo(date: LocalDate, now: number): void {
    const db = getDatabase();
    const key = `${UNDOS_PREFIX}${date}`;
    db.withTransactionSync(() => {
      db.runSync('DELETE FROM counters WHERE key LIKE ? AND key <> ?', [`${UNDOS_PREFIX}%`, key]);
      increment(key, now);
      db.runSync(
        'INSERT INTO counters (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT (key) DO UPDATE SET value = MAX(value, excluded.value), updated_at = excluded.updated_at',
        [MAX_UNDOS_IN_DAY, counter(key), now],
      );
    });
  },

  /** 心情摘要：字数按 Unicode 字符算，常见表情算 1 个 */
  listMoodFacts(): MoodFact[] {
    return getDatabase()
      .getAllSync<{ date: string; face: string | null; text: string; photos: number }>(
        `SELECT m.date AS date, m.face AS face, m.text AS text,
          (SELECT COUNT(*) FROM mood_photos p WHERE p.mood_id = m.id) AS photos
        FROM moods m`,
      )
      .map((row) => ({
        date: row.date,
        face: row.face,
        textLength: Array.from(row.text).length,
        photoCount: row.photos,
      }));
  },
};
