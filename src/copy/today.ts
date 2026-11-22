/**
 * 今日页、提示与撤销条、不可打卡原因（附录 C 第 4–6 节）。
 */
import type { CheckInBlockReason } from '@/domain/rule';

export const todayCopy = {
  backToToday: '回到今天',
  allDone: '今天的花全开啦',
  allDoneOther: '这天的花全开啦',
  perfectBanner: '今天的花全开啦',
  emptyNoProjects: '种下第一颗种子',
  emptyNoProjectsAction: '去种花',
  emptyRestDay: '今天没有安排，好好休息一下',
  emptyRestDayOther: '这天没有安排，好好休息一下',
  emptyRestDayAction: '看看全部项目',
  emptyBeforeAll: '那时候还没有种下小花',
  menuUndo: '撤销一次',
  menuNote: '写成绩',
  menuDetail: '查看详情',
  history: '打卡记录',
  newProject: '新建项目',
  monthView: '切换到周视图',
  weekView: '切换到月视图',
} as const;

/** 列表标题行 */
export function listTitle(opts: {
  date: string;
  today: string;
  yesterday: string;
  dateLabel: string;
  completed: number;
  planned: number;
  visibleCount: number;
  perfect: boolean;
}): string {
  const { date, today, yesterday, dateLabel, completed, planned, visibleCount, perfect } = opts;
  if (date > today) return `${dateLabel} · 有 ${visibleCount} 个计划`;
  if (perfect) return date === today ? todayCopy.allDone : todayCopy.allDoneOther;
  const prefix = date === today ? '今天' : date === yesterday ? '昨天' : dateLabel;
  return `${prefix} · 完成 ${completed}/${planned}`;
}

export const toastCopy = {
  undo: '撤销',
  checkedIn: (name: string) => `${name} · 打好卡啦`,
  multiCheckedIn: (name: string, n: number, total: number, unit: string) => `${name} · ${n}/${total} ${unit}`,
  timesCheckedIn: (name: string, n: number, unit: string) => `${name} · 本次第 ${n} ${unit}`,
  paused: (name: string) => `「${name}」先休息一下`,
  resumed: (name: string) => `「${name}」回来啦`,
  deletedProject: (name: string) => `已删除「${name}」`,
  deletedRecord: '删掉了一条记录',
  noteSaved: '记下啦',
  saved: '改好啦',
  futureStart: (name: string, dateLabel: string) => `「${name}」会在 ${dateLabel} 开始`,
  writeFailed: '没打上，再试一次',
  tooLong: (n: number) => `最多 ${n} 字哦`,
} as const;

export const blockReasonCopy: Record<CheckInBlockReason, string> = {
  future: '还没到这一天哦',
  beforeStart: '这天还没开始',
  afterEnd: '这天已经毕业啦',
  afterGraduation: '这天已经毕业啦',
  paused: '这天在暂停中',
  notPlanDay: '这天不在计划里',
  dailyFull: '今天已经打满啦',
};

export const noteCopy = {
  title: (name: string) => `今天的成绩 · ${name}`,
  titleOn: (dateLabel: string, name: string) => `${dateLabel}的成绩 · ${name}`,
  placeholder: '记下今天的数据或感受',
  skip: '跳过',
  save: '记下来',
  maxLength: 200,
} as const;
