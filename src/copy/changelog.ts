/**
 * 更新说明：每发一个版本在最前面加一条。版本号与 app.config.ts 的 version 一致。
 */

export interface ChangelogEntry {
  version: string;
  date: string;
  items: string[];
}

export const changelog: readonly ChangelogEntry[] = [
  {
    version: '0.2.0',
    date: '2026-11-22',
    items: [
      '到点会提醒：每个项目最多 5 个时间，完成后或达标后可以不再响',
      '统计页可以看到总览、某个月和一整年',
      '坚持到期会有毕业典礼，也可以提前毕业、再来一轮',
      '数据可以导出成备份文件，换手机时再导回来',
    ],
  },
  {
    version: '0.1.0',
    date: '2026-11-22',
    items: [
      '可以建项目啦：7 种打卡频率、开始日期和坚持多久都能设',
      '今日页日历，每天开一朵小花，过去的日子也能补卡',
      '多次打卡、撤销、完美日庆祝',
      '我的项目：暂停、继续、排序、删除',
      '项目详情和全部打卡记录',
    ],
  },
];
