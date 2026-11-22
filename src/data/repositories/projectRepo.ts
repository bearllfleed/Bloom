/**
 * 项目仓储：项目、频率版本、暂停区间的读写。
 * 页面不直接写 SQL，统一经由服务层调用这里。
 */
import type { FrequencyRule, LocalDate, ProjectEntity, ProjectSnapshot, ProjectStatus } from '@/domain/types';
import { clock } from '@/platform/clock';
import { newId } from '@/utils/id';

import { getDatabase } from '../db/client';
import { toEntity, toSnapshot, type PauseRow, type ProjectRow, type ProjectRuleRow } from '../db/rows';

export interface NewProjectInput {
  name: string;
  iconId: string;
  colorId: string;
  motto: string;
  unit: string;
  startDate: LocalDate;
  endDate: LocalDate | null;
  durationPreset: string | null;
  noteEnabled: boolean;
  rule: FrequencyRule;
}

export interface ProjectInfoPatch {
  name: string;
  iconId: string;
  colorId: string;
  motto: string;
  unit: string;
  noteEnabled: boolean;
}

function groupBy<T extends { project_id: string }>(rows: T[]): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const row of rows) {
    const list = map.get(row.project_id);
    if (list) list.push(row);
    else map.set(row.project_id, [row]);
  }
  return map;
}

export const projectRepo = {
  /** 新建项目，同时写入第一个频率版本（生效日 = 开始日期），返回项目 id */
  create(input: NewProjectInput): string {
    const db = getDatabase();
    const id = newId();
    const now = clock.now();
    db.withTransactionSync(() => {
      const maxOrder = db.getFirstSync<{ m: number | null }>('SELECT MAX(sort_order) AS m FROM projects')?.m ?? 0;
      db.runSync(
        `INSERT INTO projects (id, name, icon_id, color_id, motto, unit, start_date, end_date, duration_preset,
           note_enabled, sort_order, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          input.name,
          input.iconId,
          input.colorId,
          input.motto,
          input.unit,
          input.startDate,
          input.endDate,
          input.durationPreset,
          input.noteEnabled ? 1 : 0,
          maxOrder + 1,
          now,
          now,
        ],
      );
      db.runSync(
        'INSERT INTO project_rules (id, project_id, effective_from, rule_json, created_at) VALUES (?, ?, ?, ?, ?)',
        [newId(), id, input.startDate, JSON.stringify(input.rule), now],
      );
    });
    return id;
  },

  /** 未删除的项目，按排序 */
  listRows(): ProjectRow[] {
    return getDatabase().getAllSync<ProjectRow>('SELECT * FROM projects WHERE deleted_at IS NULL ORDER BY sort_order');
  },

  /** 全部未删除项目的完整信息，按排序；3 条查询一次取齐 */
  listEntities(): ProjectEntity[] {
    const db = getDatabase();
    const projects = this.listRows();
    const rules = groupBy(db.getAllSync<ProjectRuleRow>('SELECT * FROM project_rules'));
    const pauses = groupBy(db.getAllSync<PauseRow>('SELECT * FROM project_pauses'));
    return projects.map((p) => toEntity(p, rules.get(p.id) ?? [], pauses.get(p.id) ?? []));
  },

  getEntity(projectId: string): ProjectEntity | null {
    const db = getDatabase();
    const project = db.getFirstSync<ProjectRow>('SELECT * FROM projects WHERE id = ? AND deleted_at IS NULL', [
      projectId,
    ]);
    if (!project) return null;
    const rules = db.getAllSync<ProjectRuleRow>('SELECT * FROM project_rules WHERE project_id = ?', [projectId]);
    const pauses = db.getAllSync<PauseRow>('SELECT * FROM project_pauses WHERE project_id = ?', [projectId]);
    return toEntity(project, rules, pauses);
  },

  /** 规则引擎需要的项目快照 */
  getSnapshot(projectId: string): ProjectSnapshot | null {
    const db = getDatabase();
    const project = db.getFirstSync<ProjectRow>('SELECT * FROM projects WHERE id = ?', [projectId]);
    if (!project) return null;
    const rules = db.getAllSync<ProjectRuleRow>('SELECT * FROM project_rules WHERE project_id = ?', [projectId]);
    const pauses = db.getAllSync<PauseRow>('SELECT * FROM project_pauses WHERE project_id = ?', [projectId]);
    return toSnapshot(project, rules, pauses);
  },

  count(): number {
    return (
      getDatabase().getFirstSync<{ n: number }>('SELECT COUNT(*) AS n FROM projects WHERE deleted_at IS NULL')?.n ?? 0
    );
  },

  updateInfo(projectId: string, patch: ProjectInfoPatch): void {
    getDatabase().runSync(
      `UPDATE projects SET name = ?, icon_id = ?, color_id = ?, motto = ?, unit = ?, note_enabled = ?, updated_at = ?
       WHERE id = ?`,
      [
        patch.name,
        patch.iconId,
        patch.colorId,
        patch.motto,
        patch.unit,
        patch.noteEnabled ? 1 : 0,
        clock.now(),
        projectId,
      ],
    );
  },

  updateSchedule(
    projectId: string,
    startDate: LocalDate,
    endDate: LocalDate | null,
    durationPreset: string | null,
  ): void {
    getDatabase().runSync(
      'UPDATE projects SET start_date = ?, end_date = ?, duration_preset = ?, updated_at = ? WHERE id = ?',
      [startDate, endDate, durationPreset, clock.now(), projectId],
    );
  },

  /** 从 effectiveFrom 起使用新规则：同一天已有版本则替换，之后的版本全部作废 */
  upsertRule(projectId: string, effectiveFrom: LocalDate, rule: FrequencyRule): void {
    const db = getDatabase();
    db.runSync('DELETE FROM project_rules WHERE project_id = ? AND effective_from >= ?', [projectId, effectiveFrom]);
    db.runSync(
      'INSERT INTO project_rules (id, project_id, effective_from, rule_json, created_at) VALUES (?, ?, ?, ?, ?)',
      [newId(), projectId, effectiveFrom, JSON.stringify(rule), clock.now()],
    );
  },

  /** 项目还没开始时改频率：整个历史只保留这一个版本 */
  replaceRules(projectId: string, effectiveFrom: LocalDate, rule: FrequencyRule): void {
    const db = getDatabase();
    db.runSync('DELETE FROM project_rules WHERE project_id = ?', [projectId]);
    db.runSync(
      'INSERT INTO project_rules (id, project_id, effective_from, rule_json, created_at) VALUES (?, ?, ?, ?, ?)',
      [newId(), projectId, effectiveFrom, JSON.stringify(rule), clock.now()],
    );
  },

  setStatus(projectId: string, status: ProjectStatus, graduatedOn: LocalDate | null = null): void {
    getDatabase().runSync(
      `UPDATE projects SET status = ?, graduated_on = ?, graduation_seen = CASE WHEN ? = 'graduated' THEN 0 ELSE graduation_seen END,
         updated_at = ? WHERE id = ?`,
      [status, graduatedOn, status, clock.now(), projectId],
    );
  },

  insertPause(projectId: string, startDate: LocalDate): void {
    getDatabase().runSync('INSERT INTO project_pauses (id, project_id, start_date, end_date) VALUES (?, ?, ?, NULL)', [
      newId(),
      projectId,
      startDate,
    ]);
  },

  closeOpenPause(projectId: string, endDate: LocalDate): void {
    getDatabase().runSync('UPDATE project_pauses SET end_date = ? WHERE project_id = ? AND end_date IS NULL', [
      endDate,
      projectId,
    ]);
  },

  deleteOpenPause(projectId: string): void {
    getDatabase().runSync('DELETE FROM project_pauses WHERE project_id = ? AND end_date IS NULL', [projectId]);
  },

  /** 删除先打标记，撤销时清掉；超时或进入后台时再彻底删除 */
  softDelete(projectId: string): void {
    getDatabase().runSync('UPDATE projects SET deleted_at = ? WHERE id = ?', [clock.now(), projectId]);
  },

  restore(projectId: string): void {
    getDatabase().runSync('UPDATE projects SET deleted_at = NULL WHERE id = ?', [projectId]);
  },

  /** 彻底删除已打标记的项目；记录、规则、暂停、提醒随外键级联删除 */
  purgeDeleted(): number {
    return getDatabase().runSync('DELETE FROM projects WHERE deleted_at IS NOT NULL').changes;
  },

  /** 按传入顺序重写排序 */
  setOrder(projectIds: readonly string[]): void {
    const db = getDatabase();
    db.withTransactionSync(() => {
      projectIds.forEach((id, index) => {
        db.runSync('UPDATE projects SET sort_order = ? WHERE id = ?', [index + 1, id]);
      });
    });
  },
};
