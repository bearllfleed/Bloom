/**
 * 迁移清单：按版本号顺序登记，新增迁移时在这里追加。
 */
import type { Migration } from '../migrator';
import { migration0001 } from './0001_initial';

export const MIGRATIONS: readonly Migration[] = [migration0001];

export const LATEST_SCHEMA_VERSION = MIGRATIONS[MIGRATIONS.length - 1].version;
