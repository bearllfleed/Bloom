/**
 * 领域类型定义：项目、打卡频率、暂停区间、打卡记录等业务对象的纯数据形态。
 * 负责：给领域层、数据层、界面层提供统一的类型约定。
 * 不负责：任何读写与计算逻辑。
 */

/** 本地日期，格式固定为 YYYY-MM-DD（如 2026-11-22），与时区无关 */
export type LocalDate = string;

/** 星期，按 ISO 习惯：1 = 周一 … 7 = 周日 */
export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** 每周从哪天开始：1 = 周一，7 = 周日（口径见需求 S13） */
export type WeekStart = 1 | 7;

/**
 * 打卡频率规则，与需求文档 5.1 的 7 种频率一一对应。
 * 规则一经保存不再修改；改频率会新增一个版本，见 ProjectRuleVersion。
 */
export type FrequencyRule =
  | { kind: 'daily'; timesPerDay: number } // 每天，每天 N 次
  | { kind: 'weekdays'; weekdays: Weekday[]; timesPerDay: number } // 每周固定几天
  | { kind: 'weeklyDays'; days: number; timesPerDay: number } // 每周任选 X 天
  | { kind: 'weeklyTimes'; times: number } // 每周累计 X 次
  | { kind: 'monthDates'; dates: number[]; timesPerDay: number } // 每月固定几号
  | { kind: 'monthlyDays'; days: number; timesPerDay: number } // 每月任选 X 天
  | { kind: 'monthlyTimes'; times: number }; // 每月累计 X 次

export type FrequencyKind = FrequencyRule['kind'];

/** 频率版本：effectiveFrom 当天及之后使用该规则，直到下一个版本生效 */
export interface ProjectRuleVersion {
  effectiveFrom: LocalDate;
  rule: FrequencyRule;
}

/**
 * 暂停区间：startDate 到 endDate（含两端）都处于暂停。
 * endDate 为空表示仍在暂停中。
 */
export interface PauseInterval {
  startDate: LocalDate;
  endDate: LocalDate | null;
}

/** 项目的持久化状态；"未开始"由开始日期派生，不单独存储 */
export type ProjectStatus = 'active' | 'paused' | 'graduated';

/** 规则引擎需要的项目快照 */
export interface ProjectSnapshot {
  id: string;
  startDate: LocalDate;
  /** 截止日期（含当天）；空表示一直坚持 */
  endDate: LocalDate | null;
  status: ProjectStatus;
  /** 毕业日期（含当天）；自动毕业时等于截止日期，提前毕业时等于操作当天 */
  graduatedOn: LocalDate | null;
  /** 按生效日期升序排列，至少一条 */
  ruleVersions: ProjectRuleVersion[];
  pauses: PauseInterval[];
}

/** 某个项目在各日期的打卡次数，键为归属日期 */
export type DailyCounts = ReadonlyMap<LocalDate, number>;

/** 规则引擎的全局设置 */
export interface RuleSettings {
  weekStart: WeekStart;
}

/** 一个提醒时间点 */
export interface ReminderSlot {
  id: string;
  /** HH:mm */
  time: string;
  enabled: boolean;
}

/** 项目的完整信息：规则引擎快照 + 界面需要的外观与设置 */
export interface ProjectEntity extends ProjectSnapshot {
  name: string;
  iconId: string;
  colorId: string;
  motto: string;
  unit: string;
  noteEnabled: boolean;
  durationPreset: string | null;
  sortOrder: number;
  createdAt: number;
  reminders: ReminderSlot[];
  /** 当天完成后不再提醒 */
  remindSkipDone: boolean;
  /** 本周/本月达标后不再提醒 */
  remindSkipPeriodMet: boolean;
  /** 毕业典礼是否已经看过 */
  graduationSeen: boolean;
  previousProjectId: string | null;
}

export type CheckinSource = 'app' | 'widget' | 'notification';

/** 一条打卡记录：date 为归属日期，checkedAt 为实际打卡时刻 */
export interface CheckinRecord {
  id: string;
  projectId: string;
  date: LocalDate;
  checkedAt: number;
  note: string | null;
  source: CheckinSource;
  createdAt: number;
}
