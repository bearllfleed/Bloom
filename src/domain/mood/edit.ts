/**
 * 心情编辑的纯领域规则（第 3 期 3-8）。
 * 负责：内容上限、可保存条件、变更检测、草稿身份与保存调度。
 * 不负责：数据库、文件、KV 与 AppState（分别由仓储、服务和界面接入）。
 */
import type { LocalDate } from '@/domain/types';

import { MAX_MOOD_PHOTOS } from './photo';

export const MOOD_TEXT_MAX_LENGTH = 500;
export const MOOD_DRAFT_DEBOUNCE_MS = 2000;

export const MOOD_FACES = ['ecstatic', 'happy', 'calm', 'tired', 'sad'] as const;
export type MoodFace = (typeof MOOD_FACES)[number];

export interface MoodPhoto {
  id: string;
  fileName: string;
  width: number;
  height: number;
}

/** 编辑页使用的内容形态；照片顺序就是展示顺序 */
export interface MoodContent {
  face: MoodFace | null;
  text: string;
  photos: readonly MoodPhoto[];
}

/** 完整持久化心情；已删除项目的“已删除”后缀由界面附加 */
export interface MoodEntity extends MoodContent {
  id: string;
  date: LocalDate;
  projectId: string | null;
  projectNameSnapshot: string | null;
  createdAt: number;
  updatedAt: number;
}

export function isMoodFace(value: unknown): value is MoodFace {
  return typeof value === 'string' && (MOOD_FACES as readonly string[]).includes(value);
}

/** 换行统一为 LF，去掉首尾空白；正文内部的空行保留 */
export function normalizeMoodText(text: string): string {
  return text.replace(/\r\n?/g, '\n').trim();
}

/** 按 Unicode 码点计数，避免把常见表情截成半个代理对 */
export function truncateMoodText(
  text: string,
  maxLength = MOOD_TEXT_MAX_LENGTH,
): { text: string; wasTruncated: boolean } {
  const characters = Array.from(text);
  return {
    text: characters.length > maxLength ? characters.slice(0, maxLength).join('') : text,
    wasTruncated: characters.length > maxLength,
  };
}

export function canSaveMood(content: { face: MoodFace | null; text: string; photoCount: number }): boolean {
  if (content.photoCount < 0 || content.photoCount > MAX_MOOD_PHOTOS) return false;
  return content.face !== null || normalizeMoodText(content.text) !== '' || content.photoCount > 0;
}

/** 项目 id 放进 JSON，避免日期、项目 id 与“当天”标识拼接后产生歧义 */
export function moodDraftKey(date: LocalDate, projectId: string | null): string {
  return `mood.draft.${JSON.stringify([date, projectId])}`;
}

function samePhotos(a: readonly MoodPhoto[], b: readonly MoodPhoto[]): boolean {
  return (
    a.length === b.length &&
    a.every((photo, index) => {
      const other = b[index];
      return photo.id === other.id && photo.fileName === other.fileName;
    })
  );
}

/** 只比较用户可编辑的内容；项目名、时间戳等存储元数据不算未保存变更 */
export function hasMoodChanged(saved: MoodContent | null, editing: MoodContent): boolean {
  if (saved === null) return canSaveMood({ ...editing, photoCount: editing.photos.length });
  return (
    saved.face !== editing.face ||
    normalizeMoodText(saved.text) !== normalizeMoodText(editing.text) ||
    !samePhotos(saved.photos, editing.photos)
  );
}

export interface MoodDraftScheduler {
  changed(): void;
  background(): void;
  saved(): void;
  discarded(): void;
  /** 只取消待写的计时，不动已有草稿（页面卸载时用） */
  dispose(): void;
}

/** 编辑器每次修改重新计时；退到后台立即落草稿，保存或明确放弃时取消待写并清除 */
export function createMoodDraftScheduler(
  key: string,
  callbacks: { save(key: string): void; clear(key: string): void },
): MoodDraftScheduler {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const cancel = () => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
  };
  const clear = () => {
    cancel();
    callbacks.clear(key);
  };
  return {
    changed() {
      cancel();
      timer = setTimeout(() => {
        timer = null;
        callbacks.save(key);
      }, MOOD_DRAFT_DEBOUNCE_MS);
    },
    background() {
      cancel();
      callbacks.save(key);
    },
    saved: clear,
    discarded: clear,
    dispose: cancel,
  };
}

export interface MoodDraftStorage {
  read(key: string): MoodContent | null;
  write(key: string, draft: MoodContent): void;
  remove(key: string): void;
}

export interface MoodEditSessionOptions extends MoodDraftStorage {
  date: LocalDate;
  projectId: string | null;
  /** 已保存的完整内容；用于判断草稿是否真与原文不同 */
  original: MoodEntity | null;
}

/**
 * 编辑页的草稿会话：内容留给调用方，本会话只负责“何时写、何时清”。
 * UI 把最新内容通过 onSave 回调交给 KV；恢复时由 UI 自行读 KV 并显示“接着上次写”。
 */
export function editSession(options: MoodEditSessionOptions) {
  const key = moodDraftKey(options.date, options.projectId);
  let latest: MoodContent | null = null;
  const scheduler = createMoodDraftScheduler(key, {
    save: (draftKey) => {
      const draft = latest;
      if (draft !== null && hasMoodChanged(options.original, draft)) options.write(draftKey, draft);
      else options.remove(draftKey);
    },
    clear: (draftKey) => options.remove(draftKey),
  });
  return {
    restore(): { draft: MoodContent | null; resumed: boolean } {
      const stored = options.read(key);
      if (stored !== null) latest = stored;
      return { draft: stored, resumed: stored !== null };
    },
    update(draft: MoodContent): void {
      latest = draft;
      scheduler.changed();
    },
    background(): void {
      scheduler.background();
    },
    saved(): void {
      latest = null;
      scheduler.saved();
    },
    discard(): void {
      latest = null;
      scheduler.discarded();
    },
    dispose(): void {
      latest = null;
      scheduler.dispose();
    },
  };
}
