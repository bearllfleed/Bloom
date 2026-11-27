/**
 * 心情用例：保存、删除、草稿与查询（需求 5.11、3-8；验收 A3-12、A3-15）。
 * 照片压缩交给界面在保存前调用 platform/media.process；这里负责入库、清理孤立文件与发事件。
 * 撤销打卡不经过本服务，因此不会删除心情。
 */
import {
  canSaveMood,
  MAX_MOOD_PHOTOS,
  moodDraftKey,
  normalizeMoodText,
  truncateMoodText,
  type MoodContent,
  type MoodEntity,
  type MoodFace,
  type MoodPhoto,
} from '@/domain/mood';
import type { LocalDate } from '@/domain/types';
import { moodRepo } from '@/data/repositories/moodRepo';
import { projectRepo } from '@/data/repositories/projectRepo';
import { kv } from '@/platform/kv';
import { media } from '@/platform/media';

import { events } from './events';

export interface MoodInput {
  date: LocalDate;
  /** null 表示当天的整体心情 */
  projectId: string | null;
  face: MoodFace | null;
  text: string;
  /** 已由 media.process 压缩并落盘的照片，顺序即展示顺序 */
  photos: readonly MoodPhoto[];
}

export type MoodDraft = MoodContent;

export const moodService = {
  /**
   * 保存（同一天同一项目为编辑）。返回 null 表示内容不满足保存条件。
   * 保存成功后删除被替换掉的照片文件，并清除该日期与项目的草稿。
   */
  saveDraft(input: MoodInput): MoodEntity | null {
    const text = normalizeMoodText(truncateMoodText(input.text).text);
    const photos = input.photos.slice(0, MAX_MOOD_PHOTOS);
    if (!canSaveMood({ face: input.face, text, photoCount: photos.length })) return null;

    const previous = moodRepo.getFor(input.date, input.projectId);
    const projectNameSnapshot =
      input.projectId === null
        ? null
        : (projectRepo.getEntity(input.projectId)?.name ?? previous?.projectNameSnapshot ?? null);

    const saved = moodRepo.save({
      date: input.date,
      projectId: input.projectId,
      projectNameSnapshot,
      face: input.face,
      text,
      photos,
    });

    // 数据库已经指向新照片后再清理旧文件；即使删除失败，也不会出现记录指向不存在的文件
    const kept = new Set(photos.map((photo) => photo.id));
    for (const photo of previous?.photos ?? []) {
      if (!kept.has(photo.id)) media.remove(photo.fileName);
    }
    moodService.clearLocalDraft(input.date, input.projectId);
    events.emit({ type: 'moodChanged', date: input.date, projectId: input.projectId });
    return saved;
  },

  /** 删除心情与全部照片文件；不存在时返回 false */
  delete(id: string): boolean {
    const mood = moodRepo.getById(id);
    if (!mood) return false;
    moodRepo.delete(id);
    for (const photo of mood.photos) media.remove(photo.fileName);
    events.emit({ type: 'moodChanged', date: mood.date, projectId: mood.projectId });
    return true;
  },

  getById(id: string): MoodEntity | null {
    return moodRepo.getById(id);
  },

  /** 某天某项目（或当天心情）的已保存内容；编辑页进入时读取 */
  getFor(date: LocalDate, projectId: string | null): MoodEntity | null {
    return moodRepo.getFor(date, projectId);
  },

  list(filter: { hasPhotos?: boolean } = {}): MoodEntity[] {
    return moodRepo.list(filter);
  },

  listForProject(projectId: string): MoodEntity[] {
    return moodRepo.listForProject(projectId);
  },

  listForDate(date: LocalDate): MoodEntity[] {
    return moodRepo.listForDate(date);
  },

  count(): number {
    return moodRepo.count();
  },

  /** 草稿只存在 kv 里，不写数据库；键由日期和项目共同决定 */
  saveLocalDraft(date: LocalDate, projectId: string | null, draft: MoodDraft): void {
    kv.setJSON(moodDraftKey(date, projectId), draft);
  },

  readLocalDraft(date: LocalDate, projectId: string | null): MoodDraft | null {
    return kv.getJSON<MoodDraft>(moodDraftKey(date, projectId));
  },

  /** 保存成功或用户明确放弃时调用 */
  clearLocalDraft(date: LocalDate, projectId: string | null): void {
    kv.remove(moodDraftKey(date, projectId));
  },
};
