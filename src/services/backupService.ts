/**
 * 备份与恢复（技术方案第 12 节）。
 * .bloom 是不压缩的 zip：manifest.json + data.json。照片字段先留空，等心情上线再写入。
 * 导入前先做一份自动快照；写入放在一个事务里，失败则原数据不动。
 */
import { Platform } from 'react-native';

import { diffDays, localDateFromTimestamp, weekdayLabel } from '@/domain/date';
import { describeRule } from '@/domain/project';
import { ruleOn } from '@/domain/rule';
import { completionRateOf, totalCompletedOf } from '@/domain/stats';
import type { FrequencyRule, ProjectStatus } from '@/domain/types';
import { sha256Hex } from '@/data/backup/sha256';
import { unzipStore, zipStore } from '@/data/backup/zipStore';
import { getDatabase } from '@/data/db/client';
import { currentVersion } from '@/data/db/migrator';
import { checkinRepo } from '@/data/repositories/checkinRepo';
import { metaRepo } from '@/data/repositories/metaRepo';
import { projectRepo } from '@/data/repositories/projectRepo';
import { appVersion } from '@/platform/appInfo';
import { clock } from '@/platform/clock';
import { files, type StoredFile } from '@/platform/files';
import { createLogger } from '@/platform/logger';
import { usePrefs, type Prefs } from '@/stores/prefsStore';

import { events } from './events';

const log = createLogger('backup');
const FORMAT_VERSION = 1;
const LAST_BACKUP = 'last_backup_at';

export type BackupError = 'notBackup' | 'corrupt' | 'tooNew' | 'space';

export interface BackupPreview {
  exportedAt: string;
  platform: string;
  projects: number;
  checkins: number;
  moods: number;
  photos: number;
}

interface Payload {
  formatVersion: number;
  prefs: Prefs;
  projects: Record<string, unknown>[];
  rules: Record<string, unknown>[];
  pauses: Record<string, unknown>[];
  reminders: Record<string, unknown>[];
  checkins: Record<string, unknown>[];
  moods: Record<string, unknown>[];
  moodPhotos: Record<string, unknown>[];
  achievements: Record<string, unknown>[];
  counters: Record<string, unknown>[];
  meta: Record<string, unknown>[];
}

export interface ParsedBackup {
  preview: BackupPreview;
  payload: Payload;
}

const text = new TextEncoder();
const decoder = new TextDecoder();

function stamp(ms: number): string {
  const date = new Date(ms);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}${p(date.getMonth() + 1)}${p(date.getDate())}_${p(date.getHours())}${p(date.getMinutes())}`;
}

function isoLocal(ms: number): string {
  const date = new Date(ms);
  const p = (n: number) => String(n).padStart(2, '0');
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const abs = Math.abs(offset);
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}T${p(date.getHours())}:${p(date.getMinutes())}:${p(date.getSeconds())}${sign}${p(Math.floor(abs / 60))}:${p(abs % 60)}`;
}

function rows(sql: string): Record<string, unknown>[] {
  return getDatabase().getAllSync<Record<string, unknown>>(sql);
}

function buildPayload(): Payload {
  const { update: _update, ...prefs } = usePrefs.getState();
  return {
    formatVersion: FORMAT_VERSION,
    prefs,
    projects: rows('SELECT * FROM projects'),
    rules: rows('SELECT * FROM project_rules'),
    pauses: rows('SELECT * FROM project_pauses'),
    reminders: rows('SELECT * FROM reminders'),
    checkins: rows('SELECT * FROM checkins'),
    moods: rows('SELECT * FROM moods'),
    moodPhotos: rows('SELECT * FROM mood_photos'),
    achievements: rows('SELECT * FROM achievement_unlocks'),
    counters: rows('SELECT * FROM counters'),
    meta: rows('SELECT * FROM meta'),
  };
}

function pack(payload: Payload, prefix: string): StoredFile {
  const data = text.encode(JSON.stringify(payload));
  const manifest = {
    format: 'bloom-backup',
    formatVersion: FORMAT_VERSION,
    schemaVersion: currentVersion(getDatabase()),
    appVersion,
    exportedAt: isoLocal(clock.now()),
    platform: Platform.OS,
    counts: {
      projects: payload.projects.filter((row) => row.deleted_at == null).length,
      checkins: payload.checkins.length,
      moods: payload.moods.length,
      photos: payload.moodPhotos.length,
      achievements: payload.achievements.length,
    },
    sha256: sha256Hex(data),
  };
  const bytes = zipStore([
    { name: 'manifest.json', data: text.encode(JSON.stringify(manifest)) },
    { name: 'data.json', data },
  ]);
  const name = `${prefix}${stamp(clock.now())}.bloom`;
  return files.write(name, bytes);
}

function asError(error: unknown): BackupError {
  const message = error instanceof Error ? error.message : String(error);
  if (/space|ENOSPC|quota/i.test(message)) return 'space';
  return 'corrupt';
}

export function parseBackup(uri: string): { ok: true; parsed: ParsedBackup } | { ok: false; error: BackupError } {
  try {
    const unzipped = unzipStore(files.read(uri));
    if (!unzipped) return { ok: false, error: 'notBackup' };
    const manifestBytes = unzipped.get('manifest.json');
    const dataBytes = unzipped.get('data.json');
    if (!manifestBytes || !dataBytes) return { ok: false, error: 'notBackup' };
    const manifest = JSON.parse(decoder.decode(manifestBytes)) as {
      format?: string;
      formatVersion?: number;
      exportedAt?: string;
      platform?: string;
      counts?: { projects?: number; checkins?: number; moods?: number; photos?: number };
      sha256?: string;
    };
    if (manifest.format !== 'bloom-backup') return { ok: false, error: 'notBackup' };
    if ((manifest.formatVersion ?? 0) > FORMAT_VERSION) return { ok: false, error: 'tooNew' };
    if (manifest.sha256 !== sha256Hex(dataBytes)) return { ok: false, error: 'corrupt' };
    const payload = JSON.parse(decoder.decode(dataBytes)) as Payload;
    if (!payload || payload.formatVersion !== 1 || !Array.isArray(payload.projects))
      return { ok: false, error: 'corrupt' };
    return {
      ok: true,
      parsed: {
        payload,
        preview: {
          exportedAt: manifest.exportedAt ?? '',
          platform: manifest.platform ?? '',
          projects: manifest.counts?.projects ?? payload.projects.length,
          checkins: manifest.counts?.checkins ?? payload.checkins.length,
          moods: manifest.counts?.moods ?? 0,
          photos: manifest.counts?.photos ?? 0,
        },
      },
    };
  } catch (error) {
    return { ok: false, error: asError(error) };
  }
}

function insert(table: string, columns: readonly string[], items: readonly Record<string, unknown>[]): void {
  if (items.length === 0) return;
  const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`;
  const db = getDatabase();
  for (const item of items)
    db.runSync(
      sql,
      columns.map((column) => (item[column] === undefined ? null : item[column]) as never),
    );
}

const PROJECT_COLUMNS = [
  'id',
  'name',
  'icon_id',
  'color_id',
  'motto',
  'unit',
  'start_date',
  'end_date',
  'duration_preset',
  'status',
  'graduated_on',
  'graduation_seen',
  'note_enabled',
  'remind_skip_done',
  'remind_skip_period_met',
  'sort_order',
  'previous_project_id',
  'deleted_at',
  'created_at',
  'updated_at',
] as const;

function replaceAll(payload: Payload): void {
  const db = getDatabase();
  db.withTransactionSync(() => {
    db.execSync(`
      DELETE FROM mood_photos;
      DELETE FROM moods;
      DELETE FROM checkins;
      DELETE FROM reminders;
      DELETE FROM project_pauses;
      DELETE FROM project_rules;
      DELETE FROM achievement_unlocks;
      DELETE FROM projects;
      DELETE FROM counters;
      DELETE FROM meta;
    `);
    insert('projects', PROJECT_COLUMNS, payload.projects);
    insert('project_rules', ['id', 'project_id', 'effective_from', 'rule_json', 'created_at'], payload.rules);
    insert('project_pauses', ['id', 'project_id', 'start_date', 'end_date'], payload.pauses);
    insert('reminders', ['id', 'project_id', 'time', 'enabled', 'created_at'], payload.reminders);
    insert('checkins', ['id', 'project_id', 'date', 'checked_at', 'note', 'source', 'created_at'], payload.checkins);
    insert(
      'moods',
      ['id', 'date', 'project_id', 'project_name_snapshot', 'face', 'text', 'created_at', 'updated_at'],
      payload.moods,
    );
    insert('mood_photos', ['id', 'mood_id', 'file_name', 'width', 'height', 'sort_order'], payload.moodPhotos);
    insert('achievement_unlocks', ['achievement_id', 'unlocked_at', 'context_json', 'seen'], payload.achievements);
    insert('counters', ['key', 'value', 'updated_at'], payload.counters);
    insert('meta', ['key', 'value'], payload.meta);
  });
}

function prune(prefix: string, keep: number): void {
  const mine = files.list().filter((file) => file.name.startsWith(prefix));
  mine.slice(keep).forEach((file) => files.remove(file.uri));
}

let staged: ParsedBackup | null = null;

export function stageBackup(parsed: ParsedBackup): void {
  staged = parsed;
}

export function stagedBackup(): ParsedBackup | null {
  return staged;
}

function csvCell(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export const backupService = {
  exportFile(): StoredFile & { projects: number; checkins: number } {
    const payload = buildPayload();
    const file = pack(payload, 'Bloom备份_');
    return {
      ...file,
      projects: payload.projects.filter((row) => row.deleted_at == null).length,
      checkins: payload.checkins.length,
    };
  },

  markExported(): void {
    metaRepo.set(LAST_BACKUP, String(clock.now()));
  },

  /** 导入前自动备份，失败则不允许继续恢复 */
  snapshotBeforeImport(): StoredFile {
    const file = pack(buildPayload(), '导入前自动备份_');
    prune('导入前自动备份_', 8);
    return file;
  },

  maybeWeeklySnapshot(): void {
    try {
      const weekly = files.list().filter((file) => file.name.startsWith('自动快照_'));
      const named = weekly[0]?.name.match(/_(\d{8})_/)?.[1];
      if (named) {
        const previous = `${named.slice(0, 4)}-${named.slice(4, 6)}-${named.slice(6, 8)}`;
        if (diffDays(previous, clock.today()) < 7) return;
      }
      pack(buildPayload(), '自动快照_');
      prune('自动快照_', 4);
    } catch (error) {
      log.warn('自动快照失败', error);
    }
  },

  snapshots(): { file: StoredFile; kind: 'weekly' | 'preimport' }[] {
    return files
      .list()
      .filter(
        (file) =>
          file.name.endsWith('.bloom') &&
          (file.name.startsWith('自动快照_') || file.name.startsWith('导入前自动备份_')),
      )
      .map((file) => ({
        file,
        kind: file.name.startsWith('导入前自动备份_') ? ('preimport' as const) : ('weekly' as const),
      }));
  },

  status(): { daysAgo: number | null; due: boolean; label: string } {
    const raw = metaRepo.get(LAST_BACKUP);
    const every = usePrefs.getState().backupEveryDays;
    if (!raw) return { daysAgo: null, due: every > 0, label: '还没有备份' };
    const daysAgo = diffDays(localDateFromTimestamp(Number(raw)), clock.today());
    const due = every > 0 && daysAgo >= every;
    const label = daysAgo <= 0 ? '今天' : `${daysAgo} 天前`;
    return { daysAgo, due, label };
  },

  restore(payload: Payload): { ok: true } | { ok: false; error: BackupError } {
    try {
      this.snapshotBeforeImport();
    } catch (error) {
      return { ok: false, error: asError(error) };
    }
    try {
      replaceAll(payload);
      usePrefs.getState().update({ ...payload.prefs });
      events.emit({ type: 'dataReplaced' });
      staged = null;
      return { ok: true };
    } catch (error) {
      log.warn('恢复失败', error);
      return { ok: false, error: asError(error) };
    }
  },

  async exportCsv(): Promise<void> {
    const entities = projectRepo.listEntities();
    const counts = checkinRepo.countsByProject();
    const settings = { weekStart: usePrefs.getState().weekStart };
    const today = clock.today();
    const names = new Map(entities.map((project) => [project.id, project.name]));
    const checkinLines = ['日期,星期,项目,打卡时间,成绩'];
    for (const record of checkinRepo.listAll()) {
      const time = new Date(record.checkedAt);
      const clockText = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
      checkinLines.push(
        [record.date, weekdayLabel(record.date), names.get(record.projectId) ?? '', clockText, record.note ?? '']
          .map(csvCell)
          .join(','),
      );
    }
    const projectLines = ['名称,频率,开始,截止,状态,累计,完成率'];
    const statusText: Record<ProjectStatus, string> = { active: '进行中', paused: '已暂停', graduated: '已毕业' };
    for (const project of entities) {
      const daily = counts.get(project.id) ?? new Map();
      const total = totalCompletedOf(project, daily, today);
      const rate = completionRateOf(project, daily, today, settings);
      const rule = ruleOn(project.ruleVersions, today < project.startDate ? project.startDate : today);
      projectLines.push(
        [
          project.name,
          describeRule(rule as FrequencyRule, project.unit),
          project.startDate,
          project.endDate ?? '',
          statusText[project.status],
          `${total.value}${total.unit === 'times' ? project.unit : '天'}`,
          rate.rate === null ? '' : `${Math.round(rate.rate * 100)}%`,
        ]
          .map(csvCell)
          .join(','),
      );
    }
    const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
    const encode = (lines: string[]) => {
      const body = text.encode(lines.join('\n'));
      const out = new Uint8Array(bom.length + body.length);
      out.set(bom, 0);
      out.set(body, bom.length);
      return out;
    };
    const zip = zipStore([
      { name: '打卡记录.csv', data: encode(checkinLines) },
      { name: '项目.csv', data: encode(projectLines) },
    ]);
    const file = files.writeCache(`Bloom表格_${stamp(clock.now())}.zip`, zip);
    await files.share(file.uri, 'application/zip', '导出表格');
  },
};

export function backupErrorText(error: BackupError): string {
  switch (error) {
    case 'notBackup':
      return '这个文件不是 Bloom 的备份';
    case 'corrupt':
      return '备份文件好像坏了，换一个试试';
    case 'tooNew':
      return '这个备份来自更新的版本，请先升级 Bloom';
    case 'space':
      return '手机空间不够了，清理一下再试';
  }
}
