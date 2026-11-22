/**
 * 通用文案（附录 C）。界面文字集中在 src/copy，方便统一走查。
 */

export const tabLabels = {
  today: '今日',
  projects: '项目',
  stats: '统计',
  achievements: '成就',
  me: '我的',
} as const;

export const placeholderCopy = {
  /** 第 0 期页签占位（仅开发期出现，第 1 期起替换为正式页面） */
  comingSoon: '这里快要开花了',
} as const;

export const trustCopy = {
  localOnly: '数据只保存在这台手机上',
} as const;

export const bootCopy = {
  upgradeFailedTitle: '数据升级没有成功',
  upgradeFailedMessage: '你的数据没有变化。导出诊断日志发给开发同学，修复后再装新版本就好',
  exportLogs: '导出诊断日志',
} as const;
