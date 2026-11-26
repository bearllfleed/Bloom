/**
 * 心情入口的跳转路径（第 3 期 3-7）：今日卡片、标题行、完美日与打卡记录共用，
 * 免得每处各写一遍 typedRoutes 参数。入口只负责跳转，不做任何保存。
 */
import type { LocalDate } from '@/domain/types';

/** 编辑某天某项目的心情；projectId 为 null 表示当天整体心情 */
export function writeMoodPath(date: LocalDate, projectId: string | null) {
  return {
    pathname: '/mood/editor' as const,
    params: projectId === null ? { date } : { date, projectId },
  };
}

/** 打开一篇已有心情的详情 */
export function readMoodPath(id: string) {
  return { pathname: '/mood/[id]' as const, params: { id } };
}
