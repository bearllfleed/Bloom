/**
 * 热门模板（需求 S08）：点一下填好名称、图标、颜色、频率、单位、鼓励语。
 */
import type { FrequencyRule } from '@/domain/types';

export interface ProjectTemplate {
  id: string;
  name: string;
  iconId: string;
  colorId: string;
  rule: FrequencyRule;
  unit: string;
  motto: string;
  /** 模板自带的提醒时间，如早睡 22:30 */
  reminderTimes?: readonly string[];
}

export const templates: readonly ProjectTemplate[] = [
  {
    id: 'sleep',
    name: '早睡',
    iconId: 'health/moon',
    colorId: 'blueberry',
    rule: { kind: 'daily', timesPerDay: 1 },
    unit: '次',
    motto: '好好吃饭，好好睡觉',
    reminderTimes: ['22:30'],
  },
  {
    id: 'water',
    name: '喝水',
    iconId: 'health/water-cup',
    colorId: 'soda',
    rule: { kind: 'daily', timesPerDay: 8 },
    unit: '杯',
    motto: '一天一点，不慌不忙',
  },
  {
    id: 'words',
    name: '背单词',
    iconId: 'study/word-card',
    colorId: 'lemon',
    rule: { kind: 'daily', timesPerDay: 1 },
    unit: '次',
    motto: '日拱一卒，功不唐捐',
  },
  {
    id: 'sport',
    name: '运动',
    iconId: 'sport/dumbbell',
    colorId: 'peach',
    rule: { kind: 'weeklyDays', days: 3, timesPerDay: 1 },
    unit: '次',
    motto: '今天的汗水是明天的勋章',
  },
  {
    id: 'reading',
    name: '读书',
    iconId: 'study/book',
    colorId: 'lemon',
    rule: { kind: 'daily', timesPerDay: 1 },
    unit: '次',
    motto: '每天都是新的一页',
  },
  {
    id: 'early',
    name: '早起',
    iconId: 'health/alarm',
    colorId: 'soda',
    rule: { kind: 'daily', timesPerDay: 1 },
    unit: '次',
    motto: '和更好的自己见面',
  },
  {
    id: 'meditate',
    name: '冥想',
    iconId: 'mind/lotus',
    colorId: 'mint',
    rule: { kind: 'daily', timesPerDay: 1 },
    unit: '次',
    motto: '慢慢来，比较快',
  },
  {
    id: 'phone',
    name: '少玩手机',
    iconId: 'habit/phone-off',
    colorId: 'blueberry',
    rule: { kind: 'daily', timesPerDay: 1 },
    unit: '次',
    motto: '自律给我自由',
  },
  {
    id: 'run',
    name: '跑步',
    iconId: 'sport/sneaker',
    colorId: 'peach',
    rule: { kind: 'weekdays', weekdays: [1, 3, 5], timesPerDay: 1 },
    unit: '次',
    motto: '一步一个小脚印',
  },
];

/** 今日页空状态展示的 4 个 */
export const EMPTY_STATE_TEMPLATE_IDS = ['water', 'sleep', 'reading', 'sport'] as const;

export function templateById(id: string | undefined): ProjectTemplate | undefined {
  return templates.find((t) => t.id === id);
}
