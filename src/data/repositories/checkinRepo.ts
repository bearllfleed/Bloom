/**
 * 打卡记录仓储：写入、撤销、删除与恢复、备注、按项目与日期统计、打卡记录分页。
 */
import type { CheckinRecord, DailyCounts, LocalDate } from '@/domain/types';
import { clock } from '@/platform/clock';
import { newId } from '@/utils/id';

import { getDatabase } from '../db/client';
import { toCheckin, type CheckinRow } from '../db/rows';

export const checkinRepo = {
  /** 写入一条打卡记录；date 为归属日期，checked_at 为此刻（补卡时两者不同，见需求 5.5） */
  insert(projectId: string, date: LocalDate, source: CheckinRow['source'] = 'app'): string {
    const id = newId();
    const now = clock.now();
    getDatabase().runSync(
      'INSERT INTO checkins (id, project_id, date, checked_at, source, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [id, projectId, date, now, source, now],
    );
    return id;
  },

  /** 撤销删除：按原样写回 */
  restore(record: CheckinRecord): void {
    getDatabase().runSync(
      'INSERT OR IGNORE INTO checkins (id, project_id, date, checked_at, note, source, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [record.id, record.projectId, record.date, record.checkedAt, record.note, record.source, record.createdAt],
    );
  },

  getById(id: string): CheckinRecord | null {
    const row = getDatabase().getFirstSync<CheckinRow>('SELECT * FROM checkins WHERE id = ?', [id]);
    return row ? toCheckin(row) : null;
  },

  /** 删除一条记录，返回被删的记录以便撤销 */
  deleteById(id: string): CheckinRecord | null {
    const record = this.getById(id);
    if (record) getDatabase().runSync('DELETE FROM checkins WHERE id = ?', [id]);
    return record;
  },

  /** 撤销：删除该项目当天最近的一条记录 */
  deleteLatest(projectId: string, date: LocalDate): CheckinRecord | null {
    const row = getDatabase().getFirstSync<CheckinRow>(
      'SELECT * FROM checkins WHERE project_id = ? AND date = ? ORDER BY checked_at DESC LIMIT 1',
      [projectId, date],
    );
    if (!row) return null;
    getDatabase().runSync('DELETE FROM checkins WHERE id = ?', [row.id]);
    return toCheckin(row);
  },

  updateNote(id: string, note: string | null): void {
    getDatabase().runSync('UPDATE checkins SET note = ? WHERE id = ?', [note, id]);
  },

  /** 某项目在日期区间内每天的次数 */
  dailyCounts(projectId: string, from: LocalDate, to: LocalDate): DailyCounts {
    const rows = getDatabase().getAllSync<{ date: string; n: number }>(
      'SELECT date, COUNT(*) AS n FROM checkins WHERE project_id = ? AND date BETWEEN ? AND ? GROUP BY date',
      [projectId, from, to],
    );
    return new Map(rows.map((r) => [r.date, r.n]));
  },

  /** 所有项目在日期区间内每天的次数；不传区间时取全部历史 */
  countsByProject(from?: LocalDate, to?: LocalDate): Map<string, Map<LocalDate, number>> {
    const rows =
      from && to
        ? getDatabase().getAllSync<{ project_id: string; date: string; n: number }>(
            'SELECT project_id, date, COUNT(*) AS n FROM checkins WHERE date BETWEEN ? AND ? GROUP BY project_id, date',
            [from, to],
          )
        : getDatabase().getAllSync<{ project_id: string; date: string; n: number }>(
            'SELECT project_id, date, COUNT(*) AS n FROM checkins GROUP BY project_id, date',
          );
    const result = new Map<string, Map<LocalDate, number>>();
    for (const row of rows) {
      let map = result.get(row.project_id);
      if (!map) {
        map = new Map();
        result.set(row.project_id, map);
      }
      map.set(row.date, row.n);
    }
    return result;
  },

  /** 某项目某天的全部记录，按实际时间倒序 */
  listOnDate(projectId: string, date: LocalDate): CheckinRecord[] {
    return getDatabase()
      .getAllSync<CheckinRow>('SELECT * FROM checkins WHERE project_id = ? AND date = ? ORDER BY checked_at DESC', [
        projectId,
        date,
      ])
      .map(toCheckin);
  },

  /** 所有项目某天最后一次打卡时间 */
  latestTimesOn(date: LocalDate): Map<string, number> {
    const rows = getDatabase().getAllSync<{ project_id: string; t: number }>(
      'SELECT project_id, MAX(checked_at) AS t FROM checkins WHERE date = ? GROUP BY project_id',
      [date],
    );
    return new Map(rows.map((r) => [r.project_id, r.t]));
  },

  countForProject(projectId: string): number {
    return (
      getDatabase().getFirstSync<{ n: number }>('SELECT COUNT(*) AS n FROM checkins WHERE project_id = ?', [projectId])
        ?.n ?? 0
    );
  },

  earliestDate(projectId: string): LocalDate | null {
    return (
      getDatabase().getFirstSync<{ d: string | null }>('SELECT MIN(date) AS d FROM checkins WHERE project_id = ?', [
        projectId,
      ])?.d ?? null
    );
  },

  listForProject(projectId: string): CheckinRecord[] {
    return getDatabase()
      .getAllSync<CheckinRow>('SELECT * FROM checkins WHERE project_id = ? ORDER BY date, checked_at', [projectId])
      .map(toCheckin);
  },

  recent(projectId: string, limit: number): CheckinRecord[] {
    return getDatabase()
      .getAllSync<CheckinRow>(
        'SELECT * FROM checkins WHERE project_id = ? ORDER BY date DESC, checked_at DESC LIMIT ?',
        [projectId, limit],
      )
      .map(toCheckin);
  },

  /** 有记录的月份（YYYY-MM）及条数，新的在前；只统计未删除项目 */
  monthsWithRecords(projectId: string | null): { month: string; count: number }[] {
    const where = projectId ? 'AND c.project_id = ?' : '';
    return getDatabase().getAllSync<{ month: string; count: number }>(
      `SELECT substr(c.date, 1, 7) AS month, COUNT(*) AS count
       FROM checkins c JOIN projects p ON p.id = c.project_id
       WHERE p.deleted_at IS NULL ${where}
       GROUP BY month ORDER BY month DESC`,
      projectId ? [projectId] : [],
    );
  },

  /** 某个月的记录：按归属日期倒序，同一天按实际时间倒序 */
  listMonth(month: string, projectId: string | null): CheckinRecord[] {
    const where = projectId ? 'AND c.project_id = ?' : '';
    return getDatabase()
      .getAllSync<CheckinRow>(
        `SELECT c.* FROM checkins c JOIN projects p ON p.id = c.project_id
         WHERE p.deleted_at IS NULL AND c.date BETWEEN ? AND ? ${where}
         ORDER BY c.date DESC, c.checked_at DESC`,
        projectId ? [`${month}-01`, `${month}-31`, projectId] : [`${month}-01`, `${month}-31`],
      )
      .map(toCheckin);
  },

  /** 有备注的记录，新的在前 */
  listNotes(projectId: string, limit: number): CheckinRecord[] {
    return getDatabase()
      .getAllSync<CheckinRow>(
        `SELECT * FROM checkins WHERE project_id = ? AND note IS NOT NULL AND note != ''
         ORDER BY date DESC, checked_at DESC LIMIT ?`,
        [projectId, limit],
      )
      .map(toCheckin);
  },

  noteCount(projectId: string): number {
    return (
      getDatabase().getFirstSync<{ n: number }>(
        `SELECT COUNT(*) AS n FROM checkins WHERE project_id = ? AND note IS NOT NULL AND note != ''`,
        [projectId],
      )?.n ?? 0
    );
  },

  /** 习惯统计用：归属日期和实际打卡时刻 */
  listInstants(): { projectId: string; date: LocalDate; checkedAt: number }[] {
    return getDatabase()
      .getAllSync<{ project_id: string; date: string; checked_at: number }>(
        'SELECT project_id, date, checked_at FROM checkins',
      )
      .map((row) => ({ projectId: row.project_id, date: row.date, checkedAt: row.checked_at }));
  },

  listAll(): CheckinRecord[] {
    return getDatabase().getAllSync<CheckinRow>('SELECT * FROM checkins ORDER BY date, checked_at').map(toCheckin);
  },

  totalCount(): number {
    return getDatabase().getFirstSync<{ n: number }>('SELECT COUNT(*) AS n FROM checkins')?.n ?? 0;
  },
};
