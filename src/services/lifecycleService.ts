/**
 * 启动与前后台切换（技术方案 5.3）。
 * - 启动：打开数据库并迁移、应用偏好、记录首次使用日期、清理上次没删完的项目、自动毕业；
 * - 回到前台：自动毕业、刷新"今天"；
 * - 进入后台：彻底删除撤销期内的项目。
 */
import { diffDays } from '@/domain/date';
import { getDatabase, openBloomDatabase } from '@/data/db/client';
import { metaRepo } from '@/data/repositories/metaRepo';
import { clock } from '@/platform/clock';
import { createLogger } from '@/platform/logger';
import { applyPrefsOnLaunch } from '@/stores/prefsStore';

import { events } from './events';
import { projectService } from './projectService';

const log = createLogger('lifecycle');

export type BootResult = { ok: true } | { ok: false; reason: 'database'; message: string };

let booted: BootResult | null = null;

/** 只执行一次；失败时返回原因，由界面展示"数据升级没有成功" */
export function bootstrap(): BootResult {
  if (booted) return booted;
  applyPrefsOnLaunch();
  const opened = openBloomDatabase();
  if (!opened.ok) {
    booted = { ok: false, reason: 'database', message: opened.error.message };
    return booted;
  }
  getDatabase().runSync("INSERT OR IGNORE INTO meta (key, value) VALUES ('first_use_date', ?)", [clock.today()]);
  projectService.purgeDeleted();
  projectService.autoGraduate();
  log.info('启动完成');
  booted = { ok: true };
  return booted;
}

export function onForeground(): void {
  if (!booted?.ok) return;
  projectService.autoGraduate();
  events.emit({ type: 'dataReplaced' });
}

export function onBackground(): void {
  if (!booted?.ok) return;
  projectService.purgeDeleted();
}

/** 首次使用日期，用于"陪伴你的第 N 天" */
export function firstUseDate(): string {
  return metaRepo.get('first_use_date') ?? clock.today();
}

export function companionDays(): number {
  return diffDays(firstUseDate(), clock.today()) + 1;
}
