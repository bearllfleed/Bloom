/**
 * 数据库 v1：第 1–3 期用到的全部业务表（技术方案第 6 节）。
 * 已发布的迁移只能新增，不能修改；改表结构请新建 0002_xxx.ts。
 */
import type { Migration } from '../migrator';

export const migration0001: Migration = {
  version: 1,
  name: '初始表结构',
  sql: `
CREATE TABLE projects (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  icon_id TEXT NOT NULL,
  color_id TEXT NOT NULL,
  motto TEXT NOT NULL DEFAULT '',
  unit TEXT NOT NULL DEFAULT '次',
  start_date TEXT NOT NULL,
  end_date TEXT,
  duration_preset TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'graduated')),
  graduated_on TEXT,
  graduation_seen INTEGER NOT NULL DEFAULT 0,
  note_enabled INTEGER NOT NULL DEFAULT 0,
  remind_skip_done INTEGER NOT NULL DEFAULT 1,
  remind_skip_period_met INTEGER NOT NULL DEFAULT 1,
  sort_order REAL NOT NULL,
  previous_project_id TEXT,
  deleted_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE project_rules (
  id TEXT PRIMARY KEY NOT NULL,
  project_id TEXT NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  effective_from TEXT NOT NULL,
  rule_json TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE (project_id, effective_from)
);

CREATE TABLE project_pauses (
  id TEXT PRIMARY KEY NOT NULL,
  project_id TEXT NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  start_date TEXT NOT NULL,
  end_date TEXT
);
CREATE INDEX idx_pauses_project ON project_pauses (project_id);

CREATE TABLE reminders (
  id TEXT PRIMARY KEY NOT NULL,
  project_id TEXT NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  time TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL
);
CREATE INDEX idx_reminders_project ON reminders (project_id);

CREATE TABLE checkins (
  id TEXT PRIMARY KEY NOT NULL,
  project_id TEXT NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  checked_at INTEGER NOT NULL,
  note TEXT,
  source TEXT NOT NULL DEFAULT 'app' CHECK (source IN ('app', 'widget', 'notification')),
  created_at INTEGER NOT NULL
);
CREATE INDEX idx_checkins_project_date ON checkins (project_id, date);
CREATE INDEX idx_checkins_date ON checkins (date);
CREATE INDEX idx_checkins_checked_at ON checkins (checked_at);

CREATE TABLE moods (
  id TEXT PRIMARY KEY NOT NULL,
  date TEXT NOT NULL,
  project_id TEXT REFERENCES projects (id) ON DELETE SET NULL,
  project_name_snapshot TEXT,
  face TEXT CHECK (face IN ('ecstatic', 'happy', 'calm', 'tired', 'sad')),
  text TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE UNIQUE INDEX idx_moods_day_project ON moods (date, IFNULL(project_id, ''));

CREATE TABLE mood_photos (
  id TEXT PRIMARY KEY NOT NULL,
  mood_id TEXT NOT NULL REFERENCES moods (id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  sort_order INTEGER NOT NULL
);
CREATE INDEX idx_mood_photos_mood ON mood_photos (mood_id);

CREATE TABLE achievement_unlocks (
  achievement_id TEXT PRIMARY KEY NOT NULL,
  unlocked_at INTEGER NOT NULL,
  context_json TEXT,
  seen INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE counters (
  key TEXT PRIMARY KEY NOT NULL,
  value INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL
);

CREATE TABLE meta (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);
`,
};
