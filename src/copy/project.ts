/**
 * 创建/编辑项目、频率与时长面板、图标选择、我的项目、项目详情、确认框（附录 C 第 7、8、12 节）。
 */

export const formCopy = {
  newTitle: '新的小目标',
  editTitle: (name: string) => `编辑「${name}」`,
  namePlaceholder: '想坚持做点什么',
  nameEmpty: '先给它起个名字吧',
  nameMax: 20,
  changeIcon: '换个图标',
  frequency: '打卡频率',
  startDate: '开始日期',
  duration: '坚持多久',
  motto: '给自己的一句话',
  mottoMax: 40,
  shuffle: '换一句',
  note: '打卡时记录成绩',
  create: '种下它',
  save: '保存',
  ruleChangeHint: '从今天起按新频率计算',
  earliestRecord: (dateLabel: string) => `最早的记录在 ${dateLabel}`,
  graduatedLocked: '毕业后不能再改啦',
  close: '关闭',
} as const;

export const frequencyCopy = {
  title: '打卡频率',
  daily: '每天',
  weekly: '每周',
  monthly: '每月',
  fixedWeekdays: '固定几天',
  fixedDates: '固定几号',
  anyDays: '任选几天',
  totalTimes: '累计次数',
  perWeek: '每周',
  perMonth: '每月',
  days: '天',
  timesPerDay: '每天打卡',
  unit: '单位',
  customUnit: '自定义',
  customUnitTitle: '自定义单位',
  customUnitMax: 2,
  needOneDay: '至少选一天',
  monthEnd: '没有这一天的月份，会在当月最后一天打卡',
  done: '好的',
} as const;

export const UNIT_OPTIONS = ['次', '杯', '页', '组', '个', '遍'] as const;

export const scheduleCopy = {
  startTitle: '从哪天开始',
  durationTitle: '坚持多久',
  today: '今天',
  tomorrow: '明天',
  nextMonday: '下周一',
  pickDate: '选日期',
  pickEnd: '选截止日期',
  passed: '已经过去啦',
  tooFar: '最多只能提前 1 年哦',
  done: '好的',
} as const;

export const iconPickerCopy = {
  search: '搜索，如 跑步',
  recent: '最近',
  recentTitle: '最近使用',
  empty: '没找到，换个词试试',
} as const;

export const confirmCopy = {
  discardTitle: '放弃这次编辑吗',
  discardConfirm: '放弃',
  discardCancel: '继续编辑',
  deleteTitle: (name: string) => `删除「${name}」？`,
  deleteMessage: (n: number) => `会同时删除 ${n} 条打卡记录`,
  deleteConfirm: '删除',
  deleteCancel: '再想想',
} as const;

export const projectsCopy = {
  title: '我的项目',
  sort: '排序',
  sortDone: '完成',
  groupActive: '进行中',
  groupPaused: '已暂停',
  groupGraduated: '已毕业',
  emptyActive: '种下第一颗种子',
  emptyActiveAction: '去种花',
  emptyPaused: '没有在休息的项目',
  emptyGraduated: '坚持到截止日期，就能在这里拿到毕业证书',
  monthDone: '本月完成',
  streak: '当前连续',
  bestStreak: '最长连续',
  rate: '完成率',
  total: '累计',
  statusActive: '进行中',
  startedOn: (date: string) => `始于 ${date}`,
  startsIn: (n: number) => `${n} 天后`,
  startsOn: (date: string) => `${date} 开始`,
  pausedFor: (n: number) => `已暂停 ${n} 天`,
  pausedTomorrow: '明天起休息',
  graduatedRibbon: '已毕业',
  journey: (day: number, total: number) => `第 ${day}/${total} 天`,
  edit: '编辑',
  pause: '暂停',
  resume: '继续',
  delete: '删除',
} as const;

export const detailCopy = {
  more: '更多',
  recent: '最近打卡',
  seeAll: '查看全部',
  noRecent: '还没有打卡，今天种下第一朵花吧',
  checkIn: '打卡',
  checkAgain: '再打一次',
  completed: (done: number, target: number) => `已完成 ${done}/${target}`,
  timesOnDay: (n: number, unit: string) => `这天 ${n} ${unit}`,
  notDone: '这天还没打卡',
} as const;

export const historyCopy = {
  title: '打卡记录',
  all: '全部',
  monthTitle: (label: string, n: number) => `${label} · 共 ${n} 次`,
  empty: '还没有打卡记录，去今天种下第一朵花吧',
  emptyAction: '去打卡',
  emptyFiltered: '这个项目还没有记录',
  delete: '删除',
  detailTitle: '这条记录',
  project: '项目',
  belongsTo: '归属日期',
  checkedAt: '打卡时间',
  source: '来源',
  sourceWidget: '桌面小组件',
  sourceNotification: '提醒通知',
  note: '备注',
  notePlaceholder: '写点什么',
  saveNote: '保存备注',
  deleteRecord: '删除这条记录',
} as const;

export const meCopy = {
  companion: (n: number) => `陪伴你的第 ${n} 天`,
  noNickname: '还没有名字',
  edit: '编辑',
  editTitle: '我的资料',
  nicknamePlaceholder: '怎么称呼你呢',
  nicknameMax: 10,
  avatar: '选个头像',
  save: '保存',
  history: '打卡记录',
  about: '关于 Bloom',
  devTools: '开发工具',
} as const;

export const welcomeCopy = {
  title: '你好呀，我是朵朵',
  message: '以后由我陪你，一天开一朵小花',
  placeholder: '怎么称呼你呢',
  start: '开始种花',
} as const;

export const changelogCopy = {
  title: '这次更新了什么',
  ok: '知道啦',
  entry: '更新说明',
} as const;
