/**
 * 打开主数据库并迁移到最新版本。
 * 负责：WAL 与外键设置、迁移前把整个数据库备份到 bloom-before-v{n}.db（保留最近 2 份）。
 * 迁移失败时数据库保持原版本，调用方展示"升级失败"页面，App 不会崩溃。
 */
import { backupDatabaseSync, deleteDatabaseSync, openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite';

import { createLogger } from '@/platform/logger';

import { MIGRATIONS } from './migrations';
import { MigrationError, runMigrations } from './migrator';

const DB_NAME = 'bloom.db';
const BACKUP_PREFIX = 'bloom-before-v';
const KEEP_BACKUPS = 2;
const log = createLogger('db');

let database: SQLiteDatabase | null = null;

function backupBeforeMigration(db: SQLiteDatabase, fromVersion: number) {
  const name = `${BACKUP_PREFIX}${fromVersion}.db`;
  const dest = openDatabaseSync(name, { useNewConnection: true });
  try {
    backupDatabaseSync({
      sourceDatabase: db,
      sourceDatabaseName: 'main',
      destDatabase: dest,
      destDatabaseName: 'main',
    });
    log.info(`迁移前已备份到 ${name}`);
  } finally {
    dest.closeSync();
  }
  // 只保留最近 KEEP_BACKUPS 份
  for (let v = fromVersion - KEEP_BACKUPS; v > 0; v--) {
    try {
      deleteDatabaseSync(`${BACKUP_PREFIX}${v}.db`);
    } catch {
      break;
    }
  }
}

export type OpenResult = { ok: true; db: SQLiteDatabase } | { ok: false; error: MigrationError | Error };

/** 启动时调用一次；之后通过 getDatabase() 取连接 */
export function openBloomDatabase(): OpenResult {
  try {
    const db = openDatabaseSync(DB_NAME, { enableChangeListener: true });
    db.execSync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
    const result = runMigrations(db, MIGRATIONS, (from) => backupBeforeMigration(db, from));
    if (result.applied.length > 0) log.info(`数据库已从 v${result.fromVersion} 升级到 v${result.toVersion}`);
    database = db;
    return { ok: true, db };
  } catch (error) {
    log.error('打开数据库失败', error);
    return { ok: false, error: error instanceof Error ? error : new Error(String(error)) };
  }
}

export function getDatabase(): SQLiteDatabase {
  if (!database) throw new Error('数据库尚未打开');
  return database;
}
