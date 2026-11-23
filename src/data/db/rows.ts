/**
 * 数据库行类型与"行 → 领域对象"的转换。
 * 列名保持数据库里的下划线写法，转换后才进入领域层。
 */
import type {
  CheckinRecord,
  FrequencyRule,
  PauseInterval,
  ProjectEntity,
  ProjectRuleVersion,
  ProjectSnapshot,
  ProjectStatus,
  ReminderSlot,
} from '@/domain/types';

export interface ProjectRow {
  id: string;
  name: string;
  icon_id: string;
  color_id: string;
  motto: string;
  unit: string;
  start_date: string;
  end_date: string | null;
  duration_preset: string | null;
  status: ProjectStatus;
  graduated_on: string | null;
  graduation_seen: number;
  note_enabled: number;
  remind_skip_done: number;
  remind_skip_period_met: number;
  sort_order: number;
  previous_project_id: string | null;
  deleted_at: number | null;
  created_at: number;
  updated_at: number;
}

export interface ProjectRuleRow {
  id: string;
  project_id: string;
  effective_from: string;
  rule_json: string;
  created_at: number;
}

export interface PauseRow {
  id: string;
  project_id: string;
  start_date: string;
  end_date: string | null;
}

export interface ReminderRow {
  id: string;
  project_id: string;
  time: string;
  enabled: number;
  created_at: number;
}

export interface CheckinRow {
  id: string;
  project_id: string;
  date: string;
  checked_at: number;
  note: string | null;
  source: 'app' | 'widget' | 'notification';
  created_at: number;
}

export function toRuleVersion(row: ProjectRuleRow): ProjectRuleVersion {
  return { effectiveFrom: row.effective_from, rule: JSON.parse(row.rule_json) as FrequencyRule };
}

export function toPause(row: PauseRow): PauseInterval {
  return { startDate: row.start_date, endDate: row.end_date };
}

export function toSnapshot(project: ProjectRow, rules: ProjectRuleRow[], pauses: PauseRow[]): ProjectSnapshot {
  return {
    id: project.id,
    startDate: project.start_date,
    endDate: project.end_date,
    status: project.status,
    graduatedOn: project.graduated_on,
    ruleVersions: rules.sort((a, b) => a.effective_from.localeCompare(b.effective_from)).map(toRuleVersion),
    pauses: pauses.sort((a, b) => a.start_date.localeCompare(b.start_date)).map(toPause),
  };
}

export function toReminder(row: ReminderRow): ReminderSlot {
  return { id: row.id, time: row.time, enabled: row.enabled === 1 };
}

export function toEntity(
  project: ProjectRow,
  rules: ProjectRuleRow[],
  pauses: PauseRow[],
  reminders: ReminderRow[] = [],
): ProjectEntity {
  return {
    ...toSnapshot(project, rules, pauses),
    name: project.name,
    iconId: project.icon_id,
    colorId: project.color_id,
    motto: project.motto,
    unit: project.unit,
    noteEnabled: project.note_enabled === 1,
    durationPreset: project.duration_preset,
    sortOrder: project.sort_order,
    createdAt: project.created_at,
    reminders: reminders
      .slice()
      .sort((a, b) => a.created_at - b.created_at)
      .map(toReminder),
    remindSkipDone: project.remind_skip_done === 1,
    remindSkipPeriodMet: project.remind_skip_period_met === 1,
    graduationSeen: project.graduation_seen === 1,
    previousProjectId: project.previous_project_id,
  };
}

export function toCheckin(row: CheckinRow): CheckinRecord {
  return {
    id: row.id,
    projectId: row.project_id,
    date: row.date,
    checkedAt: row.checked_at,
    note: row.note,
    source: row.source,
    createdAt: row.created_at,
  };
}
