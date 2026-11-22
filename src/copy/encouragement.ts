/**
 * 鼓励语、问候语、朵朵气泡（附录 C 第 1–3 节）。
 */

export const encouragements = [
  '慢慢来，比较快',
  '今天的一小步也算数',
  '一切都会慢慢变好',
  '坚持本身就很酷',
  '做完这件，就去奖励自己',
  '不用很完美，做了就好',
  '每一朵花都开得不容易',
  '今天也要好好爱自己',
  '进步是一点点攒出来的',
  '小事做久了就是大事',
  '你比昨天更厉害一点',
  '先完成，再完美',
  '把日子过成喜欢的样子',
  '温柔且坚定',
  '别急，花会开的',
  '一天一点，不慌不忙',
  '今天的你也很棒',
  '好习惯会悄悄改变你',
  '累了就歇一下，明天继续',
  '自律给我自由',
  '星星不问赶路人',
  '做自己的小太阳',
  '和更好的自己见面',
  '每天都是新的一页',
  '生活明朗，万物可爱',
  '种下今天，收获明天',
  '认真生活的人最可爱',
  '你在发光',
  '小小的坚持，大大的改变',
  '再坚持一下下',
  '今天也值得被记住',
  '心里有花，眼里有光',
  '走慢一点也没关系',
  '越努力越幸运',
  '把喜欢的事做到底',
  '今天的汗水是明天的勋章',
  '好好吃饭，好好睡觉',
  '一步一个小脚印',
  '日拱一卒，功不唐捐',
  '你已经在路上了',
] as const;

/** 随机取一句，尽量不与 current 重复 */
export function randomEncouragement(current?: string): string {
  const pool = encouragements.filter((e) => e !== current);
  return pool[Math.floor(Math.random() * pool.length)];
}

export const duoduoBubbles = [
  '今天也来啦',
  '我在给你的花浇水',
  '做完一件就很棒',
  '要不要先喝口水',
  '你今天看起来很有精神',
  '慢慢来，我陪你',
  '小花说它想开了',
  '偷偷告诉你，你很厉害',
  '累了就伸个懒腰',
  '今天的天气适合坚持',
  '我数过了，你一直在进步',
  '记得对自己好一点',
  '花园越来越热闹了',
  '嘿，加油呀',
  '我最喜欢你认真的样子',
] as const;

export const duoduoTickled = '别戳啦，好痒';

export function randomBubble(current?: string): string {
  const pool = duoduoBubbles.filter((b) => b !== current);
  return pool[Math.floor(Math.random() * pool.length)];
}

/** 按时段问候；没有昵称时去掉"，昵称" */
export function greeting(hour: number, nickname: string): string {
  let word = '夜深了';
  if (hour >= 5 && hour < 11) word = '早上好';
  else if (hour >= 11 && hour < 14) word = '中午好';
  else if (hour >= 14 && hour < 18) word = '下午好';
  else if (hour >= 18 && hour < 23) word = '晚上好';
  return nickname ? `${word}，${nickname}` : word;
}
