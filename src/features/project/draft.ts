/**
 * 创建/编辑表单的草稿：默认值、模板预填、从已有项目带出、是否有改动。
 * 默认值见第 1 期 1-3：每天 1 次、今天开始、一直坚持、小花图标、草莓色、随机鼓励语、不记成绩、单位"次"。
 */
import { isSameRule } from '@/domain/project';
import { ruleOn } from '@/domain/rule';
import type { ProjectEntity } from '@/domain/types';
import { randomEncouragement } from '@/copy/encouragement';
import type { ProjectTemplate } from '@/copy/templates';
import type { ProjectDraft } from '@/services/projectService';

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
  };
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
    !isSameRule(a.rule, b.rule)
  );
}
