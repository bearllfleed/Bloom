/**
 * 72 枚徽章的定义表（附录 A）。
 * 负责：编号、标识、名称、系列、等级、条件文案、图案说明，以及判定用的指标和阈值。
 * 不负责：指标怎么算（见 metrics.ts）、画成什么样（见 ui/badges）。
 */
import type { MetricKey } from './metrics';

/** 花苞（蜜桃铜）、小花（薄荷银）、繁花（柠檬金）、彩虹花（多彩） */
export type BadgeTier = 'bud' | 'floret' | 'bloom' | 'rainbow';

export const TIER_LABEL: Record<BadgeTier, string> = {
  bud: '花苞',
  floret: '小花',
  bloom: '繁花',
  rainbow: '彩虹花',
};

export type SeriesId = 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6' | 'S7' | 'S8' | 'S9' | 'S10' | 'S11' | 'S12';

/** 每个系列一种底座 */
export type BadgeBase =
  | 'sticker'
  | 'wreath'
  | 'calendar'
  | 'star'
  | 'ribbon'
  | 'heart'
  | 'clock'
  | 'hexWindow'
  | 'shield'
  | 'memo'
  | 'cloud'
  | 'giftBox';

export interface SeriesDef {
  id: SeriesId;
  name: string;
  base: BadgeBase;
}

export const SERIES: readonly SeriesDef[] = [
  { id: 'S1', name: '初遇', base: 'sticker' },
  { id: 'S2', name: '连续绽放', base: 'wreath' },
  { id: 'S3', name: '周期达人', base: 'calendar' },
  { id: 'S4', name: '积少成多', base: 'star' },
  { id: 'S5', name: '花开日记', base: 'ribbon' },
  { id: 'S6', name: '完美一天', base: 'heart' },
  { id: 'S7', name: '时光魔法', base: 'clock' },
  { id: 'S8', name: '多面少女', base: 'hexWindow' },
  { id: 'S9', name: '毕业典礼', base: 'shield' },
  { id: 'S10', name: '心情手账', base: 'memo' },
  { id: 'S11', name: '不服输', base: 'cloud' },
  { id: 'S12', name: '彩蛋', base: 'giftBox' },
];

export interface AchievementDef {
  /** A01–A72 */
  id: string;
  /** 稳定标识，如 first_project */
  key: string;
  name: string;
  series: SeriesId;
  tier: BadgeTier;
  /** 条件文案；隐藏徽章未获得时不显示 */
  condition: string;
  /** 图案说明，给设计和徽章引擎对照 */
  motif: string;
  /** 未获得时显示为"神秘徽章" */
  hidden: boolean;
  metric: MetricKey;
  /** 指标 ≥ 阈值即解锁 */
  threshold: number;
}

type Row = [
  id: string,
  key: string,
  name: string,
  tier: BadgeTier,
  metric: MetricKey,
  threshold: number,
  condition: string,
  motif: string,
];

const ROWS: Record<SeriesId, Row[]> = {
  S1: [
    ['A01', 'first_project', '种下种子', 'bud', 'projectsCreated', 1, '创建第一个项目', '种子落在小土堆上'],
    ['A02', 'first_checkin', '第一朵花', 'bud', 'totalCheckins', 1, '完成第一次打卡', '刚开的一朵小花'],
    ['A03', 'first_note', '认真记录', 'bud', 'notesWritten', 1, '第一次写下成绩', '铅笔和便签'],
    ['A04', 'first_reminder', '准时小闹钟', 'bud', 'remindersSet', 1, '第一次设置提醒', '带蝴蝶结的闹钟'],
    ['A05', 'first_mood', '写给自己', 'bud', 'moodCount', 1, '第一次记录心情', '带爱心的信封'],
    ['A06', 'first_photo', '留住此刻', 'bud', 'moodPhotos', 1, '第一次在心情里放照片', '拍立得相片'],
    ['A07', 'first_backup', '有备无患', 'bud', 'backupExports', 1, '第一次导出备份', '系丝带的小箱子'],
    ['A08', 'first_widget', '桌面花园', 'bud', 'widgetCheckins', 1, '第一次在桌面小组件上打卡', '窗台上的盆栽'],
  ],
  S2: [
    ['A09', 'streak_3', '三日之约', 'bud', 'bestDayStreak', 3, '任一项目连续 3 天完成', '三朵小花排成一排'],
    ['A10', 'streak_5', '五瓣小花', 'bud', 'bestDayStreak', 5, '任一项目连续 5 天完成', '五瓣花'],
    ['A11', 'streak_7', '一周花开', 'floret', 'bestDayStreak', 7, '任一项目连续 7 天完成', '七片花瓣'],
    ['A12', 'streak_10', '十全十美', 'floret', 'bestDayStreak', 10, '任一项目连续 10 天完成', '数字 10 缠着花藤'],
    ['A13', 'streak_14', '双周花环', 'floret', 'bestDayStreak', 14, '任一项目连续 14 天完成', '双层花环'],
    ['A14', 'streak_21', '习惯成自然', 'bloom', 'bestDayStreak', 21, '任一项目连续 21 天完成', '开满花的小树'],
    ['A15', 'streak_30', '满月花冠', 'bloom', 'bestDayStreak', 30, '任一项目连续 30 天完成', '满月下的花冠'],
    ['A16', 'streak_60', '六十朵玫瑰', 'bloom', 'bestDayStreak', 60, '任一项目连续 60 天完成', '一束玫瑰'],
    ['A17', 'streak_90', '一整个季节', 'rainbow', 'bestDayStreak', 90, '任一项目连续 90 天完成', '四季花轮'],
  ],
  S3: [
    ['A18', 'week_2', '两周不掉线', 'bud', 'bestWeekStreak', 2, '任一项目连续 2 周达标', '两页日历'],
    ['A19', 'week_4', '一个月稳稳的', 'floret', 'bestWeekStreak', 4, '任一项目连续 4 周达标', '四格日历画满小勾'],
    ['A20', 'week_8', '八周花期', 'bloom', 'bestWeekStreak', 8, '任一项目连续 8 周达标', '日历本上开花'],
    ['A21', 'week_12', '十二周的春天', 'rainbow', 'bestWeekStreak', 12, '任一项目连续 12 周达标', '日历本开出彩虹'],
    ['A22', 'month_1', '月度达人', 'floret', 'bestMonthStreak', 1, '任一项目整月达标', '印着月亮的日历页'],
    ['A23', 'month_3', '季度之星', 'bloom', 'bestMonthStreak', 3, '任一项目连续 3 个月达标', '挂着三颗星的月历'],
  ],
  S4: [
    ['A24', 'total_10', '十朵小花', 'bud', 'totalCheckins', 10, '累计打卡 10 次', '一小捧花'],
    ['A25', 'total_30', '一束花', 'bud', 'totalCheckins', 30, '累计打卡 30 次', '包装好的花束'],
    ['A26', 'total_100', '百花齐放', 'floret', 'totalCheckins', 100, '累计打卡 100 次', '花篮'],
    ['A27', 'total_200', '花海初现', 'floret', 'totalCheckins', 200, '累计打卡 200 次', '一片花田'],
    ['A28', 'total_300', '三百朵晴天', 'bloom', 'totalCheckins', 300, '累计打卡 300 次', '太阳下的花田'],
    ['A29', 'total_520', '好好爱自己', 'rainbow', 'totalCheckins', 520, '累计打卡 520 次', '爱心形花束'],
  ],
  S5: [
    ['A30', 'days_3', '三天打鱼不晒网', 'bud', 'recordDays', 3, '记录 3 天', '小鱼叼着小花'],
    ['A31', 'days_7', '七日花历', 'bud', 'recordDays', 7, '记录 7 天', '一周日历'],
    ['A32', 'days_15', '半月之约', 'floret', 'recordDays', 15, '记录 15 天', '半个月亮'],
    ['A33', 'days_30', '三十页手账', 'floret', 'recordDays', 30, '记录 30 天', '厚厚的手账本'],
    ['A34', 'days_50', '五十个好日子', 'bloom', 'recordDays', 50, '记录 50 天', '数字 50 书签'],
    ['A35', 'days_100', '百日花开', 'rainbow', 'recordDays', 100, '记录 100 天', '百花书签'],
  ],
  S6: [
    ['A36', 'perfect_1', '小小圆满', 'bud', 'perfectDays', 1, '第 1 个完美日', '爱心里的小花'],
    ['A37', 'perfect_7', '七次圆满', 'floret', 'perfectDays', 7, '累计 7 个完美日', '七颗小爱心'],
    ['A38', 'perfect_30', '圆满三十', 'bloom', 'perfectDays', 30, '累计 30 个完美日', '爱心花环'],
    ['A39', 'perfect_streak_3', '连连圆满', 'floret', 'bestPerfectStreak', 3, '连续 3 个完美日', '三颗相连的爱心'],
    ['A40', 'perfect_streak_7', '圆满一周', 'bloom', 'bestPerfectStreak', 7, '连续 7 个完美日', '爱心彩虹桥'],
    [
      'A41',
      'perfect_month',
      '整月圆满',
      'rainbow',
      'perfectMonths',
      1,
      '一个自然月里每个有计划的日子都是完美日',
      '爱心满月',
    ],
  ],
  S7: [
    ['A42', 'early_1', '早起的鸟儿', 'bud', 'earlyCheckins', 1, '5:00–7:00 打卡 1 次', '站在太阳上的小鸟'],
    ['A43', 'early_20', '晨光收集者', 'bloom', 'earlyCheckins', 20, '5:00–7:00 累计打卡 20 次', '装满晨光的玻璃瓶'],
    ['A44', 'night_1', '月亮守夜人', 'bud', 'nightCheckins', 1, '23:00–次日 2:00 打卡 1 次', '戴睡帽的月亮'],
    [
      'A45',
      'ontime_10',
      '准时赴约',
      'floret',
      'onTimeCheckins',
      10,
      '提醒响起后 15 分钟内完成打卡，累计 10 次',
      '闹钟抱着爱心',
    ],
    ['A46', 'monday_4', '周一元气弹', 'floret', 'bestMondayStreak', 4, '连续 4 个周一都是完美日', '举着小哑铃的太阳'],
    [
      'A47',
      'weekend_4',
      '周末也闪亮',
      'bloom',
      'bestWeekendStreak',
      4,
      '连续 4 个周末，周六周日都是完美日',
      '戴墨镜的星星',
    ],
  ],
  S8: [
    ['A48', 'projects_3', '三朵花一起开', 'bud', 'maxActiveProjects', 3, '同时有 3 个进行中的项目', '三朵不同颜色的花'],
    ['A49', 'day_3', '一日三花', 'bud', 'maxProjectsDoneInDay', 3, '同一天完成 3 个不同项目', '三层花束'],
    ['A50', 'day_5', '五彩斑斓', 'floret', 'maxProjectsDoneInDay', 5, '同一天完成 5 个不同项目', '五色花'],
    [
      'A51',
      'categories_3',
      '兴趣广泛',
      'floret',
      'maxActiveCategories',
      3,
      '进行中的项目覆盖 3 个不同的图标分类',
      '调色盘',
    ],
    [
      'A52',
      'multi_full_7',
      '勤劳小蜜蜂',
      'bloom',
      'bestMultiFullStreak',
      7,
      '一个"每天多次"的项目连续 7 天每天都打满',
      '小蜜蜂和蜂巢',
    ],
  ],
  S9: [
    ['A53', 'grad_1', '第一张证书', 'floret', 'graduations', 1, '第一个项目毕业', '卷起的证书'],
    [
      'A54',
      'grad_30_80',
      '满月优等生',
      'bloom',
      'graduations30At80',
      1,
      '时长 ≥ 30 天且完成率 ≥ 80% 毕业',
      '戴学士帽的月亮',
    ],
    [
      'A55',
      'grad_perfect',
      '全勤毕业',
      'bloom',
      'perfectGraduations',
      1,
      '时长 ≥ 7 天且完成率 100% 毕业',
      '金色学士帽',
    ],
    ['A56', 'grad_90', '季度毕业生', 'rainbow', 'graduations90', 1, '时长 ≥ 90 天毕业', '学士帽配彩虹缎带'],
    ['A57', 'grad_again', '再出发', 'bud', 'reruns', 1, '毕业后"再来一轮"', '系好鞋带的小跑鞋'],
  ],
  S10: [
    ['A58', 'mood_7', '心情七色', 'floret', 'moodCount', 7, '累计 7 篇心情', '七色便签'],
    ['A59', 'mood_30', '三十篇小日记', 'bloom', 'moodCount', 30, '累计 30 篇心情', '一摞日记本'],
    ['A60', 'mood_streak_7', '天天都想说', 'bloom', 'bestMoodStreak', 7, '连续 7 天记录心情', '一串对话气泡'],
    ['A61', 'mood_long', '长长的信', 'floret', 'longestMoodText', 500, '一篇心情写满 500 字', '长长的信纸'],
    ['A62', 'mood_photos_20', '相册里的我', 'floret', 'moodPhotos', 20, '心情照片累计 20 张', '小相册'],
    ['A63', 'mood_palette', '情绪调色盘', 'floret', 'moodFacesUsed', 5, '5 种心情表情都用过', '五色调色盘'],
  ],
  S11: [
    [
      'A64',
      'comeback',
      '久别重逢',
      'bud',
      'longestBreak',
      7,
      '连续 7 天以上没有任何打卡后，重新打卡',
      '两朵花轻轻碰在一起',
    ],
    [
      'A65',
      'any_30',
      '风雨无阻',
      'bloom',
      'bestAnyDayStreak',
      30,
      '连续 30 天每天至少打卡 1 次（任意项目）',
      '雨伞下的花',
    ],
    ['A66', 'pause_resume', '休息好啦', 'bud', 'pauseResumes', 1, '暂停后重新继续一个项目', '伸懒腰的小花'],
    ['A67', 'makeup', '亡羊补牢', 'bud', 'makeupCheckins', 1, '第一次为过去的日子补上打卡', '打着补丁的小羊'],
  ],
  S12: [
    ['A68', 'new_year', '新年第一朵花', 'bloom', 'newYearCheckins', 1, '1月1日 完成打卡', '烟花里的花'],
    [
      'A69',
      'date_520',
      '今天也爱自己',
      'bloom',
      'date520Checkins',
      1,
      '5月20日 完成打卡',
      '用徽章数字拼出的 520 和爱心',
    ],
    ['A70', 'undo_5', '犹豫的小花', 'bud', 'maxUndosInDay', 5, '一天内撤销 5 次', '歪着头的花'],
    ['A71', 'tap_10', '停不下来', 'floret', 'maxTapsInDay', 10, '一个项目一天打卡 10 次', '一串连击小花'],
    ['A72', 'triple_unlock', '双倍快乐', 'floret', 'unlocksInDay', 3, '同一天获得 3 枚徽章（不含补发）', '三层小蛋糕'],
  ],
};

/** 隐藏徽章：亡羊补牢和整个彩蛋系列 */
const HIDDEN = new Set(['A67', 'A68', 'A69', 'A70', 'A71', 'A72']);

/** 按编号排列，也是同时解锁时的弹出顺序 */
export const ACHIEVEMENTS: readonly AchievementDef[] = SERIES.flatMap(({ id: series }) =>
  ROWS[series].map(([id, key, name, tier, metric, threshold, condition, motif]) => ({
    id,
    key,
    name,
    series,
    tier,
    condition,
    motif,
    hidden: HIDDEN.has(id),
    metric,
    threshold,
  })),
);

const BY_ID = new Map(ACHIEVEMENTS.map((def) => [def.id, def]));

export function achievementById(id: string): AchievementDef | null {
  return BY_ID.get(id) ?? null;
}
