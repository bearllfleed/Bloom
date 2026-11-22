/**
 * 数据库迁移执行器（需求 S21、验收 A0-04）。
 * - 版本号记在 SQLite 的 user_version 里；
 * - 所有待执行的迁移放在同一个事务中，任一失败整体回滚，数据库保持原版本；
 * - 执行前调用 backup 回调（由调用方做文件级备份），用于"迁移成功但数据有误"时人工恢复。
 * 只依赖最小的数据库接口，便于在单测中用 Node 的 SQLite 实现替代。
 */

export interface Migration {
  version: number;
  name: string;
  sql: string;
}

/** 迁移执行器需要的最小数据库能力 */
export interface MigratableDatabase {
  execSync(sql: string): void;
  getFirstSync<T>(sql: string): T | null;
  withTransactionSync(task: () => void): void;
}

export class MigrationError extends Error {
  constructor(
    readonly fromVersion: number,
    readonly failedVersion: number,
    override readonly cause: unknown,
  ) {
    super(`数据库从 v${fromVersion} 升级到 v${failedVersion} 失败`);
    this.name = 'MigrationError';
  }
}

export interface MigrationResult {
  fromVersion: number;
  toVersion: number;
  applied: number[];
}

export function currentVersion(db: MigratableDatabase): number {
  return db.getFirstSync<{ user_version: number }>('PRAGMA user_version')?.user_version ?? 0;
}

/**
 * 执行所有未执行的迁移。
 * @param backup 有待执行迁移且不是全新数据库时调用，参数为当前版本号
 */
export function runMigrations(
  db: MigratableDatabase,
  migrations: readonly Migration[],
  backup?: (fromVersion: number) => void,
): MigrationResult {
  const fromVersion = currentVersion(db);
  const pending = [...migrations].sort((a, b) => a.version - b.version).filter((m) => m.version > fromVersion);
  if (pending.length === 0) return { fromVersion, toVersion: fromVersion, applied: [] };

  if (fromVersion > 0) backup?.(fromVersion);

  let running = pending[0].version;
  try {
    db.withTransactionSync(() => {
      for (const migration of pending) {
        running = migration.version;
        db.execSync(migration.sql);
        db.execSync(`PRAGMA user_version = ${migration.version}`);
      }
    });
  } catch (error) {
    throw new MigrationError(fromVersion, running, error);
  }
  const toVersion = pending[pending.length - 1].version;
  return { fromVersion, toVersion, applied: pending.map((m) => m.version) };
}
