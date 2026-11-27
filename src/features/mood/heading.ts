/**
 * 心情手账与详情用的标题规则（第 3 期 3-8、3-9）。
 * 编辑页标题"11月22日 · 早睡"、当天整体心情"11月22日 · 这一天"；
 * 项目被删除后名称快照仍在，界面附加"（已删除的项目）"。
 */
import { formatMonthDay } from '@/domain/date';
import type { LocalDate } from '@/domain/types';

import { moodCopy } from '@/copy/phase3';

/** 编辑页与详情的标题：有项目名写项目名，否则写"这一天" */
export function moodHeading(date: LocalDate, projectName: string | null): string {
  return `${formatMonthDay(date)} · ${projectName ?? moodCopy.dayTitle}`;
}

/** 项目名展示：项目还在用快照名，已删除时附加提示；当天整体心情没有项目名 */
export function moodProjectLabel(snapshot: string | null, projectExists: boolean): string | null {
  if (snapshot === null) return null;
  return projectExists ? snapshot : `${snapshot}${moodCopy.deletedProject}`;
}

/** 手账月份吸顶标题：2026年11月 · 8 篇 */
export function journalMonthTitle(label: string, count: number): string {
  return `${label} · ${count} 篇`;
}
