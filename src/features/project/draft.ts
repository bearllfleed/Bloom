/**
 * 创建/编辑表单的草稿：默认值、模板预填、从已有项目带出、是否有改动。
 * 默认值见第 1 期 1-3：每天 1 次、今天开始、一直坚持、小花图标、草莓色、随机鼓励语、不记成绩、单位"次"。
 */
import { addDays, diffDays } from '@/domain/date';
import { endDateForPreset, isSameRule, type DurationPreset } from '@/domain/project';
import { ruleOn } from '@/domain/rule';
import type { ProjectEntity } from '@/domain/types';
import { randomEncouragement } from '@/copy/encouragement';
import type { ProjectTemplate } from '@/copy/templates';
import type { ProjectDraft, ReminderDraft } from '@/services/projectService';

const REMINDER_DEFAULTS = {
  reminders: [] as ReminderDraft[],
  remindSkipDone: true,
  remindSkipPeriodMet: true,
};

export function defaultDraft(today: string): ProjectDraft {
  return {
    name: '',
    iconId: 'collect/flower',
    colorId: 'strawberry',
    motto: randomEncouragement(),
    unit: '次',
    noteEnabled: false,
    rule: { kind: 'daily', timesPerDay: 1 },
    startDate: today,
    endDate: null,
    durationPreset: 'forever',
    ...REMINDER_DEFAULTS,
  };
}

export function applyTemplate(draft: ProjectDraft, template: ProjectTemplate): ProjectDraft {
  return {
    ...draft,
    name: template.name,
    iconId: template.iconId,
    colorId: template.colorId,
    rule: template.rule,
    unit: template.unit,
    motto: template.motto,
    reminders: template.reminderTimes?.map((time) => ({ time, enabled: true })) ?? draft.reminders,
  };
}

export function draftFromProject(project: ProjectEntity, today: string): ProjectDraft {
  const ruleDate = today < project.startDate ? project.startDate : today;
  return {
    name: project.name,
    iconId: project.iconId,
    colorId: project.colorId,
    motto: project.motto,
    unit: project.unit,
    noteEnabled: project.noteEnabled,
    rule: ruleOn(project.ruleVersions, ruleDate),
    startDate: project.startDate,
    endDate: project.endDate,
    durationPreset: project.durationPreset,
    reminders: project.reminders.map((slot) => ({ time: slot.time, enabled: slot.enabled })),
    remindSkipDone: project.remindSkipDone,
    remindSkipPeriodMet: project.remindSkipPeriodMet,
  };
}

/** 再来一轮：今天开始，时长与原来相同，其余设置照搬 */
export function anotherRoundDraft(project: ProjectEntity, today: string): ProjectDraft {
  const base = draftFromProject(project, today);
  const preset = project.durationPreset as DurationPreset | null;
  let endDate: string | null = null;
  if (project.endDate) {
    if (preset && preset !== 'custom') endDate = endDateForPreset(preset, today);
    else endDate = addDays(today, diffDays(project.startDate, project.endDate));
  }
  return {
    ...base,
    startDate: today,
    endDate,
    durationPreset: preset ?? (endDate ? 'custom' : 'forever'),
    previousProjectId: project.id,
  };
}

function sameReminders(a: readonly ReminderDraft[], b: readonly ReminderDraft[]): boolean {
  return (
    a.length === b.length && a.every((slot, index) => slot.time === b[index].time && slot.enabled === b[index].enabled)
  );
}

export function isDraftDirty(a: ProjectDraft, b: ProjectDraft): boolean {
  return (
    a.name !== b.name ||
    a.iconId !== b.iconId ||
    a.colorId !== b.colorId ||
    a.motto !== b.motto ||
    a.unit !== b.unit ||
    a.noteEnabled !== b.noteEnabled ||
    a.startDate !== b.startDate ||
    a.endDate !== b.endDate ||
    a.remindSkipDone !== b.remindSkipDone ||
    a.remindSkipPeriodMet !== b.remindSkipPeriodMet ||
    !sameReminders(a.reminders, b.reminders) ||
    !isSameRule(a.rule, b.rule)
  );
}
