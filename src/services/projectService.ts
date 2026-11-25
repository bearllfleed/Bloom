/**
 * 项目用例：创建、编辑、暂停、继续、删除与撤销、排序、自动毕业（需求 5.3、5.6、5.7、5.8、5.13）。
 * 一次用户操作 = 一个方法；写库后发出 projectChanged 事件，各页面据此刷新。
 */
import { addDays } from '@/domain/date';
import {
  canPause,
  isSameRule,
  needsAutoGraduation,
  openPauseOf,
  pausePlanOnGraduation,
  pauseStartDate,
  resumePlan,
} from '@/domain/project';
import { ruleOn } from '@/domain/rule';
import type { FrequencyRule, LocalDate, ProjectEntity } from '@/domain/types';
import { getDatabase } from '@/data/db/client';
import { achievementRepo } from '@/data/repositories/achievementRepo';
import { checkinRepo } from '@/data/repositories/checkinRepo';
import { projectRepo } from '@/data/repositories/projectRepo';
import { clock } from '@/platform/clock';
import { createLogger } from '@/platform/logger';

import { events } from './events';

const log = createLogger('project');

/** 表单提交的内容 */
export interface ReminderDraft {
  time: string;
  enabled: boolean;
}

export interface ProjectDraft {
  name: string;
  iconId: string;
  colorId: string;
  motto: string;
  unit: string;
  noteEnabled: boolean;
  rule: FrequencyRule;
  startDate: LocalDate;
  endDate: LocalDate | null;
  durationPreset: string | null;
  reminders: ReminderDraft[];
  remindSkipDone: boolean;
  remindSkipPeriodMet: boolean;
  /** 再来一轮时指向原来的项目 */
  previousProjectId?: string | null;
}

export type SaveError = 'nameEmpty' | 'startAfterRecords' | 'endBeforeToday' | 'endBeforeStart' | 'notFound';

const PURGE_DELAY_MS = 5000;
let purgeTimer: ReturnType<typeof setTimeout> | null = null;

function validateSchedule(draft: ProjectDraft, today: LocalDate, earliestRecord: LocalDate | null): SaveError | null {
  if (draft.name.trim() === '') return 'nameEmpty';
  if (earliestRecord !== null && draft.startDate > earliestRecord) return 'startAfterRecords';
  if (draft.endDate !== null && draft.endDate < draft.startDate) return 'endBeforeStart';
  if (draft.endDate !== null && draft.endDate < today) return 'endBeforeToday';
  return null;
}

export const projectService = {
  create(draft: ProjectDraft): { ok: true; id: string } | { ok: false; error: SaveError } {
    const error = validateSchedule(draft, clock.today(), null);
    if (error) return { ok: false, error };
    const id = projectRepo.create({
      ...draft,
      name: draft.name.trim(),
      motto: draft.motto.trim(),
      reminders: draft.reminders,
      remindSkipDone: draft.remindSkipDone,
      remindSkipPeriodMet: draft.remindSkipPeriodMet,
      previousProjectId: draft.previousProjectId ?? null,
    });
    log.info('新建项目');
    events.emit({ type: 'projectChanged', projectId: id });
    return { ok: true, id };
  },

  /** 编辑：已毕业项目只改外观；频率改动从今天起生效（未开始的项目整个替换） */
  update(projectId: string, draft: ProjectDraft): { ok: true } | { ok: false; error: SaveError } {
    const project = projectRepo.getEntity(projectId);
    if (!project) return { ok: false, error: 'notFound' };
    if (draft.name.trim() === '') return { ok: false, error: 'nameEmpty' };
    const today = clock.today();
    const db = getDatabase();
    const info = {
      name: draft.name.trim(),
      iconId: draft.iconId,
      colorId: draft.colorId,
      motto: draft.motto.trim(),
      unit: draft.unit,
      noteEnabled: draft.noteEnabled,
    };

    const saveReminders = () => {
      projectRepo.updateRemindFlags(projectId, draft.remindSkipDone, draft.remindSkipPeriodMet);
      projectRepo.replaceReminders(projectId, draft.reminders);
    };
    if (project.status === 'graduated') {
      db.withTransactionSync(() => {
        projectRepo.updateInfo(projectId, info);
        saveReminders();
      });
    } else {
      const error = validateSchedule(draft, today, checkinRepo.earliestDate(projectId));
      if (error) return { ok: false, error };
      const ruleChanged = !isSameRule(ruleOn(project.ruleVersions, today), draft.rule);
      db.withTransactionSync(() => {
        projectRepo.updateInfo(projectId, info);
        projectRepo.updateSchedule(projectId, draft.startDate, draft.endDate, draft.durationPreset);
        if (today < draft.startDate) {
          if (ruleChanged || draft.startDate !== project.startDate) {
            projectRepo.replaceRules(projectId, draft.startDate, draft.rule);
          }
        } else if (ruleChanged) {
          projectRepo.upsertRule(projectId, today, draft.rule);
        }
        saveReminders();
      });
    }
    events.emit({ type: 'projectChanged', projectId });
    return { ok: true };
  },

  /** 暂停：今天已打过卡则从明天开始 */
  pause(projectId: string): boolean {
    const project = projectRepo.getSnapshot(projectId);
    const today = clock.today();
    if (!project || !canPause(project, today)) return false;
    const checkedInToday = (checkinRepo.dailyCounts(projectId, today, today).get(today) ?? 0) > 0;
    getDatabase().withTransactionSync(() => {
      projectRepo.deleteOpenPause(projectId);
      projectRepo.insertPause(projectId, pauseStartDate(today, checkedInToday));
      projectRepo.setStatus(projectId, 'paused');
    });
    events.emit({ type: 'projectChanged', projectId });
    return true;
  },

  /** 继续：从今天恢复；暂停还没真正开始的整段丢弃 */
  resume(projectId: string): boolean {
    const project = projectRepo.getSnapshot(projectId);
    if (!project || project.status !== 'paused') return false;
    const open = openPauseOf(project);
    getDatabase().withTransactionSync(() => {
      if (open) {
        const plan = resumePlan(open, clock.today());
        if (plan.kind === 'discard') projectRepo.deleteOpenPause(projectId);
        else projectRepo.closeOpenPause(projectId, plan.endDate);
      }
      projectRepo.setStatus(projectId, 'active');
      // "休息好啦"：和状态一起写，发事件时成就结算能读到
      achievementRepo.recordPauseResume(clock.now());
    });
    events.emit({ type: 'projectChanged', projectId });
    return true;
  },

  recordCount(projectId: string): number {
    return checkinRepo.countForProject(projectId);
  },

  earliestRecordDate(projectId: string): LocalDate | null {
    return checkinRepo.earliestDate(projectId);
  },

  /** 删除：先打标记，5 秒内可撤销；超时或进入后台时彻底删除 */
  softDelete(projectId: string): void {
    projectRepo.softDelete(projectId);
    events.emit({ type: 'projectChanged', projectId });
    if (purgeTimer) clearTimeout(purgeTimer);
    purgeTimer = setTimeout(() => projectService.purgeDeleted(), PURGE_DELAY_MS);
  },

  undoDelete(projectId: string): void {
    projectRepo.restore(projectId);
    events.emit({ type: 'projectChanged', projectId });
  },

  purgeDeleted(): void {
    if (purgeTimer) {
      clearTimeout(purgeTimer);
      purgeTimer = null;
    }
    const removed = projectRepo.purgeDeleted();
    if (removed > 0) log.info(`彻底删除了 ${removed} 个项目`);
  },

  reorder(projectIds: readonly string[]): void {
    projectRepo.setOrder(projectIds);
    events.emit({ type: 'dataReplaced' });
  },

  /** 提前毕业：从今天起不再出现，记录保留，并等待毕业典礼 */
  graduateNow(projectId: string): boolean {
    const project = projectRepo.getEntity(projectId);
    if (!project || project.status === 'graduated') return false;
    const today = clock.today();
    getDatabase().withTransactionSync(() => {
      const open = openPauseOf(project);
      if (open) {
        const plan = pausePlanOnGraduation(open, today);
        if (plan.kind === 'discard') projectRepo.deleteOpenPause(projectId);
        else projectRepo.closeOpenPause(projectId, plan.endDate);
      }
      projectRepo.setStatus(projectId, 'graduated', today);
    });
    events.emit({ type: 'projectChanged', projectId });
    return true;
  },

  markGraduationSeen(projectId: string): void {
    projectRepo.markGraduationSeen(projectId);
    events.emit({ type: 'projectChanged', projectId });
  },

  unseenGraduations(): ProjectEntity[] {
    return projectRepo.listEntities().filter((project) => project.status === 'graduated' && !project.graduationSeen);
  },

  /** 截止日期过完的项目自动毕业，返回本次毕业的项目 */
  autoGraduate(): ProjectEntity[] {
    const today = clock.today();
    const graduated = projectRepo.listEntities().filter((p) => needsAutoGraduation(p, today));
    if (graduated.length === 0) return [];
    getDatabase().withTransactionSync(() => {
      for (const project of graduated) {
        const graduatedOn = project.endDate ?? addDays(today, -1);
        const open = openPauseOf(project);
        if (open) {
          const plan = pausePlanOnGraduation(open, graduatedOn);
          if (plan.kind === 'discard') projectRepo.deleteOpenPause(project.id);
          else projectRepo.closeOpenPause(project.id, plan.endDate);
        }
        projectRepo.setStatus(project.id, 'graduated', graduatedOn);
      }
    });
    log.info(`自动毕业 ${graduated.length} 个项目`);
    events.emit({ type: 'dataReplaced' });
    return graduated;
  },
};
