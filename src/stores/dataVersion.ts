/**
 * 数据版本号：任何数据变更、时间旅行、跨天都会让版本号 +1。
 * 页面的查询都以它为依赖重新计算，保证打卡后今日页、项目页、详情页同步刷新。
 */
import { create } from 'zustand';

import { clock } from '@/platform/clock';
import { events } from '@/services/events';

export const useDataVersion = create<{ version: number }>(() => ({ version: 0 }));

export function bumpDataVersion() {
  useDataVersion.setState((s) => ({ version: s.version + 1 }));
}

events.subscribe(bumpDataVersion);
clock.subscribe(bumpDataVersion);
