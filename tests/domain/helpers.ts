/**
 * 领域单测的造数工具：快速构造项目快照与每日打卡次数。
 * 约定：测试里的"今天"默认是 2026-11-22（周日），本周一为 2026-11-16。
 */
import type {
  DailyCounts,
  FrequencyRule,
  LocalDate,
  PauseInterval,
  ProjectSnapshot,
  RuleSettings,
} from '@/domain/types';

export const TODAY = '2026-11-22';
export const MONDAY_START: RuleSettings = { weekStart: 1 };
export const SUNDAY_START: RuleSettings = { weekStart: 7 };

export const DAILY: FrequencyRule = { kind: 'daily', timesPerDay: 1 };

interface ProjectInput {
  startDate?: LocalDate;
  endDate?: LocalDate | null;
  status?: ProjectSnapshot['status'];
  graduatedOn?: LocalDate | null;
  rule?: FrequencyRule;
  versions?: ProjectSnapshot['ruleVersions'];
  pauses?: PauseInterval[];
}

export function makeProject(input: ProjectInput = {}): ProjectSnapshot {
  const startDate = input.startDate ?? '2026-11-01';
  return {
    id: 'p1',
    startDate,
    endDate: input.endDate ?? null,
    status: input.status ?? 'active',
    graduatedOn: input.graduatedOn ?? null,
    ruleVersions: input.versions ?? [{ effectiveFrom: startDate, rule: input.rule ?? DAILY }],
    pauses: input.pauses ?? [],
  };
}

/** 传日期数组表示每天 1 次；传对象可指定次数 */
export function makeCounts(input: LocalDate[] | Record<LocalDate, number> = []): DailyCounts {
  if (Array.isArray(input)) return new Map(input.map((d) => [d, 1]));
  return new Map(Object.entries(input));
}

/** 生成 from 到 to（含）每天 1 次 */
export function everyDay(from: LocalDate, to: LocalDate): LocalDate[] {
  const result: LocalDate[] = [];
  const d = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  while (d <= end) {
    result.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return result;
}
