/**
 * 迁移执行器单测（验收 A0-04）：用 Node 自带的 SQLite 真实执行建表语句。
 */
import { DatabaseSync } from 'node:sqlite';

import { MIGRATIONS } from '@/data/db/migrations';
import {
  MigrationError,
  currentVersion,
  runMigrations,
  type MigratableDatabase,
  type Migration,
} from '@/data/db/migrator';

/** 把 Node 的 SQLite 包装成迁移执行器需要的接口 */
function nodeDatabase(): MigratableDatabase & { raw: DatabaseSync } {
  const raw = new DatabaseSync(':memory:');
  raw.exec('PRAGMA foreign_keys = ON');
  return {
    raw,
    execSync: (sql) => raw.exec(sql),
    getFirstSync: <T>(sql: string) => (raw.prepare(sql).get() as T | undefined) ?? null,
    withTransactionSync: (task) => {
      raw.exec('BEGIN');
      try {
        task();
        raw.exec('COMMIT');
      } catch (error) {
        raw.exec('ROLLBACK');
        throw error;
      }
    },
  };
}

const tableNames = (db: DatabaseSync) =>
  (db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name").all() as { name: string }[]).map(
    (r) => r.name,
  );

describe('数据库迁移', () => {
  test('全新数据库迁移到最新版本，建出全部业务表', () => {
    const db = nodeDatabase();
    const backup = jest.fn();
    const result = runMigrations(db, MIGRATIONS, backup);
    expect(result).toMatchObject({ fromVersion: 0, toVersion: 1, applied: [1] });
    expect(backup).not.toHaveBeenCalled();
    expect(tableNames(db.raw)).toEqual([
      'achievement_unlocks',
      'checkins',
      'counters',
      'meta',
      'mood_photos',
      'moods',
      'project_pauses',
      'project_rules',
      'projects',
      'reminders',
    ]);
  });

  test('已是最新版本时不重复执行', () => {
    const db = nodeDatabase();
    runMigrations(db, MIGRATIONS);
    expect(runMigrations(db, MIGRATIONS).applied).toEqual([]);
  });

  test('升级已有数据库前先调用备份', () => {
    const db = nodeDatabase();
    runMigrations(db, MIGRATIONS);
    const backup = jest.fn();
    runMigrations(
      db,
      [...MIGRATIONS, { version: 2, name: '加列', sql: 'ALTER TABLE meta ADD COLUMN note TEXT;' }],
      backup,
    );
    expect(backup).toHaveBeenCalledWith(1);
    expect(currentVersion(db)).toBe(2);
  });

  test('迁移脚本出错时整体回滚，版本号与数据都不变', () => {
    const db = nodeDatabase();
    runMigrations(db, MIGRATIONS);
    db.raw.exec("INSERT INTO meta (key, value) VALUES ('first_use_date', '2026-11-22')");
    const broken: Migration[] = [
      ...MIGRATIONS,
      { version: 2, name: '正常', sql: 'CREATE TABLE extra (id TEXT);' },
      { version: 3, name: '故意出错', sql: 'ALTER TABLE not_exists ADD COLUMN x TEXT;' },
    ];
    expect(() => runMigrations(db, broken)).toThrow(MigrationError);
    expect(currentVersion(db)).toBe(1);
    expect(tableNames(db.raw)).not.toContain('extra');
    expect(db.raw.prepare("SELECT value FROM meta WHERE key = 'first_use_date'").get()).toEqual(
      expect.objectContaining({ value: '2026-11-22' }),
    );
  });

  test('失败信息里带有起始版本与出错版本', () => {
    const db = nodeDatabase();
    runMigrations(db, MIGRATIONS);
    try {
      runMigrations(db, [...MIGRATIONS, { version: 2, name: '出错', sql: 'NOT SQL' }]);
    } catch (error) {
      expect(error).toMatchObject({ fromVersion: 1, failedVersion: 2 });
    }
  });

  test('删除项目会级联删除打卡记录，心情保留并解除关联', () => {
    const db = nodeDatabase();
    runMigrations(db, MIGRATIONS);
    db.raw.exec(`
      INSERT INTO projects (id, name, icon_id, color_id, start_date, sort_order, created_at, updated_at)
        VALUES ('p1', '早睡', 'health/moon', 'blueberry', '2026-11-01', 1, 0, 0);
      INSERT INTO checkins (id, project_id, date, checked_at, created_at) VALUES ('c1', 'p1', '2026-11-20', 0, 0);
      INSERT INTO moods (id, date, project_id, project_name_snapshot, created_at, updated_at)
        VALUES ('m1', '2026-11-20', 'p1', '早睡', 0, 0);
      DELETE FROM projects WHERE id = 'p1';
    `);
    expect(db.raw.prepare('SELECT COUNT(*) AS n FROM checkins').get()).toEqual(expect.objectContaining({ n: 0 }));
    expect(db.raw.prepare("SELECT project_id FROM moods WHERE id = 'm1'").get()).toEqual(
      expect.objectContaining({ project_id: null }),
    );
  });

  test('同一天同一项目只能有一篇心情，当天心情也只能有一篇', () => {
    const db = nodeDatabase();
    runMigrations(db, MIGRATIONS);
    db.raw.exec("INSERT INTO moods (id, date, created_at, updated_at) VALUES ('a', '2026-11-20', 0, 0)");
    expect(() =>
      db.raw.exec("INSERT INTO moods (id, date, created_at, updated_at) VALUES ('b', '2026-11-20', 0, 0)"),
    ).toThrow();
  });
});
