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
import { isPerfDatasetId, perfTrace, type PerfStage } from '@/platform/perfTrace';
import { applyPrefsOnLaunch } from '@/stores/prefsStore';
import { invalidateDataDomains } from '@/stores/dataVersion';

import { achievementService } from './achievementService';
import { backupService } from './backupService';
import { projectService } from './projectService';
import { reminderService } from './reminderService';

const log = createLogger('lifecycle');

export type BootFailureReason =
  | 'preferences'
  | 'database'
  | 'first_use_date'
  | 'achievement_baseline'
  | 'cleanup'
  | 'auto_graduate'
  | 'reminders'
  | 'bootstrap';

export type BootResult = { ok: true } | { ok: false; reason: BootFailureReason; message: string };

let booted: BootResult | null = null;
let lastLogicalDate: string | null = null;

type StartupStageResult<T> = { ok: true; value: T } | { ok: false; failure: Extract<BootResult, { ok: false }> };

function asError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

function bootFailure(reason: BootFailureReason, error: unknown): Extract<BootResult, { ok: false }> {
  const cause = asError(error);
  log.error(`启动阶段失败：${reason}`, cause);
  return { ok: false, reason, message: cause.message };
}

function runStartupStage<T>(stage: PerfStage, reason: BootFailureReason, task: () => T): StartupStageResult<T> {
  const span = perfTrace.begin(stage);
  try {
    return { ok: true, value: task() };
  } catch (error) {
    return { ok: false, failure: bootFailure(reason, error) };
  } finally {
    perfTrace.end(span);
  }
}

function runStartupTask<T>(reason: BootFailureReason, task: () => T): StartupStageResult<T> {
  try {
    return { ok: true, value: task() };
  } catch (error) {
    return { ok: false, failure: bootFailure(reason, error) };
  }
}

function attachPerfDataset(): void {
  try {
    const datasetId = metaRepo.get('perf_fixture_id');
    if (isPerfDatasetId(datasetId)) perfTrace.setContext({ datasetId });
  } catch {
    // 可选诊断标识不能改变启动错误语义
  }
}

/** 只执行一次；所有失败都缓存为可渲染结果，数据库失败保留原有升级错误语义。 */
export function bootstrap(): BootResult {
  if (booted) return booted;
  const total = perfTrace.begin('startup.bootstrap');
  try {
    const preferences = runStartupStage('startup.preferences', 'preferences', applyPrefsOnLaunch);
    if (!preferences.ok) return (booted = preferences.failure);

    const database = runStartupStage('startup.database', 'database', openBloomDatabase);
    if (!database.ok) return (booted = database.failure);
    if (!database.value.ok) return (booted = bootFailure('database', database.value.error));

    const firstUse = runStartupStage('startup.first_use_date', 'first_use_date', () => {
      getDatabase().runSync("INSERT OR IGNORE INTO meta (key, value) VALUES ('first_use_date', ?)", [clock.today()]);
    });
    if (!firstUse.ok) return (booted = firstUse.failure);

    attachPerfDataset();
    // 先于自动毕业启动：首次升级的基线补发在前，启动时毕业的徽章照常弹出
    const achievementBaseline = runStartupStage('startup.achievement_baseline', 'achievement_baseline', () =>
      achievementService.start(),
    );
    if (!achievementBaseline.ok) return (booted = achievementBaseline.failure);

    const cleanup = runStartupStage('startup.cleanup', 'cleanup', () => projectService.purgeDeleted());
    if (!cleanup.ok) return (booted = cleanup.failure);

    const autoGraduate = runStartupStage('startup.auto_graduate', 'auto_graduate', () => projectService.autoGraduate());
    if (!autoGraduate.ok) return (booted = autoGraduate.failure);

    const reminders = runStartupTask('reminders', () => reminderService.start());
    if (!reminders.ok) return (booted = reminders.failure);

    log.info('启动完成');
    lastLogicalDate = clock.today();
    booted = { ok: true };
    return booted;
  } catch (error) {
    booted = bootFailure('bootstrap', error);
    return booted;
  } finally {
    perfTrace.end(total);
  }
}

export function onForeground(): void {
  if (!booted?.ok) return;
  const today = clock.today();
  if (lastLogicalDate !== null && lastLogicalDate !== today) invalidateDataDomains(['clock']);
  lastLogicalDate = today;
  projectService.autoGraduate();
  backupService.maybeWeeklySnapshot();
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
