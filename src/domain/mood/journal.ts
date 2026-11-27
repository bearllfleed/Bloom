/**
 * 心情手账与详情展示的纯规则（第 3 期 3-9）。
 * 负责：按月分组、照片网格列数、照片拖动重排、图片查看索引夹取、打卡记录上的心情标记键。
 * 不负责：读写数据库和文件（见 moodRepo、platform/media）。
 */
import type { LocalDate } from '../types';

/** 一篇心情在手账/图片查看里只需要的最小字段 */
export interface MoodDated {
  date: LocalDate;
}

export interface JournalMonth<T extends MoodDated> {
  /** 2026-11 */
  month: string;
  moods: T[];
}

/** 按日期前 7 位分组；输入已按日期倒序时，月份与篇内顺序都保持不变 */
export function journalMonths<T extends MoodDated>(moods: readonly T[]): JournalMonth<T>[] {
  const groups: JournalMonth<T>[] = [];
  for (const mood of moods) {
    const month = mood.date.slice(0, 7);
    const last = groups.at(-1);
    if (last?.month === month) last.moods.push(mood);
    else groups.push({ month, moods: [mood] });
  }
  return groups;
}

/** 详情页照片网格列数：1 张通栏，2 张两列，3–5 张三列 */
export function photoColumns(count: number): number {
  if (count <= 1) return 1;
  if (count === 2) return 2;
  return 3;
}

/** 把第 from 张移动到第 to 张；越界或原地不动时返回与输入等值的新数组 */
export function movePhoto<T>(photos: readonly T[], from: number, to: number): T[] {
  const next = [...photos];
  if (from === to || from < 0 || to < 0 || from >= next.length || to >= next.length) return next;
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

/** 图片查看的当前索引，夹在 0..count-1；空列表为 0 */
export function clampPhotoIndex(index: number, count: number): number {
  if (count <= 0) return 0;
  return Math.max(0, Math.min(count - 1, index));
}

/**
 * 打卡记录行上的心情标记键：同一天的当天整体心情用空串占位，
 * 与项目心情互不覆盖。
 */
export function moodMarkerKey(date: LocalDate, projectId: string | null): string {
  return `${date}|${projectId ?? ''}`;
}

/** 能定位到某天某个项目的心情 */
export interface MoodAttributed extends MoodDated {
  projectId: string | null;
}

/** 打卡记录列表用的标记索引：一行一次查表，不逐行查库 */
export function moodMarkerMap<T extends MoodAttributed>(moods: readonly T[]): Map<string, T> {
  const map = new Map<string, T>();
  for (const mood of moods) map.set(moodMarkerKey(mood.date, mood.projectId), mood);
  return map;
}

/** 毕业回顾的“心情片段”最多放几张缩略图 */
export const REVIEW_PHOTO_LIMIT = 3;

/**
 * 回顾页的心情照片：按时间先后取，超过 3 张时均匀取首、中、尾，
 * 让片段既能看到开始，也能看到最近。
 */
export function reviewPhotoPicks<TMood extends MoodDated & { photos: readonly unknown[] }>(
  moods: readonly TMood[],
): { mood: TMood; photo: TMood['photos'][number] }[] {
  const ordered = [...moods].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  const all = ordered.flatMap((mood) =>
    mood.photos.map((photo) => ({ mood, photo }) as { mood: TMood; photo: TMood['photos'][number] }),
  );
  if (all.length <= REVIEW_PHOTO_LIMIT) return all;
  const middle = Math.floor((all.length - 1) / 2);
  return [all[0], all[middle], all[all.length - 1]];
}
