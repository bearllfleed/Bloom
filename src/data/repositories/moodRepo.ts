/**
 * 心情与照片仓储：完整心情查询、(date, projectId|null) UPSERT、照片顺序与级联删除。
 * 项目删除由外键 SET NULL，project_name_snapshot 不随项目改名或删除而丢失。
 */
import type { LocalDate } from '@/domain/types';
import type { MoodEntity, MoodFace, MoodPhoto } from '@/domain/mood';
import { clock } from '@/platform/clock';
import { newId } from '@/utils/id';

import { getDatabase } from '../db/client';

interface MoodRow {
  id: string;
  date: LocalDate;
  project_id: string | null;
  project_name_snapshot: string | null;
  face: MoodFace | null;
  text: string;
  created_at: number;
  updated_at: number;
}

interface PhotoRow {
  id: string;
  mood_id: string;
  file_name: string;
  width: number;
  height: number;
  sort_order: number;
}

export interface SaveMoodInput {
  date: LocalDate;
  projectId: string | null;
  projectNameSnapshot: string | null;
  face: MoodFace | null;
  text: string;
  photos: readonly MoodPhoto[];
}

function toEntity(row: MoodRow, photos: readonly MoodPhoto[]): MoodEntity {
  return {
    id: row.id,
    date: row.date,
    projectId: row.project_id,
    projectNameSnapshot: row.project_name_snapshot,
    face: row.face,
    text: row.text,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    photos: [...photos],
  };
}

/** 两次查询取齐，避免每篇心情单独查照片 */
function hydrate(rows: readonly MoodRow[]): MoodEntity[] {
  if (rows.length === 0) return [];
  const db = getDatabase();
  const photos = db.getAllSync<PhotoRow>(
    `SELECT * FROM mood_photos WHERE mood_id IN (${rows.map(() => '?').join(', ')}) ORDER BY mood_id, sort_order`,
    rows.map((row) => row.id),
  );
  const grouped = new Map<string, MoodPhoto[]>();
  for (const row of photos) {
    const list = grouped.get(row.mood_id) ?? [];
    list.push({ id: row.id, fileName: row.file_name, width: row.width, height: row.height });
    grouped.set(row.mood_id, list);
  }
  return rows.map((row) => toEntity(row, grouped.get(row.id) ?? []));
}

function byId(id: string): MoodEntity | null {
  const row = getDatabase().getFirstSync<MoodRow>('SELECT * FROM moods WHERE id = ?', [id]);
  return row ? hydrate([row])[0] : null;
}

export const moodRepo = {
  getById(id: string): MoodEntity | null {
    return byId(id);
  },

  getFor(date: LocalDate, projectId: string | null): MoodEntity | null {
    const row = getDatabase().getFirstSync<MoodRow>('SELECT * FROM moods WHERE date = ? AND project_id IS ?', [
      date,
      projectId,
    ]);
    return row ? hydrate([row])[0] : null;
  },

  /** 手账按日期倒序；同一天当天心情在前，其余按更新时间倒序 */
  list(filter: { hasPhotos?: boolean } = {}): MoodEntity[] {
    const where = filter.hasPhotos ? 'WHERE EXISTS (SELECT 1 FROM mood_photos p WHERE p.mood_id = moods.id)' : '';
    return hydrate(
      getDatabase().getAllSync<MoodRow>(
        `SELECT * FROM moods ${where} ORDER BY date DESC, project_id IS NOT NULL, updated_at DESC, id`,
      ),
    );
  },

  count(): number {
    return getDatabase().getFirstSync<{ n: number }>('SELECT COUNT(*) AS n FROM moods')?.n ?? 0;
  },

  listForProject(projectId: string): MoodEntity[] {
    return hydrate(
      getDatabase().getAllSync<MoodRow>(
        'SELECT * FROM moods WHERE project_id = ? ORDER BY date DESC, updated_at DESC',
        [projectId],
      ),
    );
  },

  listForDate(date: LocalDate): MoodEntity[] {
    return hydrate(
      getDatabase().getAllSync<MoodRow>(
        'SELECT * FROM moods WHERE date = ? ORDER BY project_id IS NOT NULL, updated_at DESC, id',
        [date],
      ),
    );
  },

  /** 心情与整组照片一个事务；再次保存同一天同一项目时沿用原 id 与创建时间 */
  save(input: SaveMoodInput): MoodEntity {
    const db = getDatabase();
    const existing = this.getFor(input.date, input.projectId);
    const id = existing?.id ?? newId();
    const now = clock.now();
    db.withTransactionSync(() => {
      if (existing) {
        db.runSync(`UPDATE moods SET project_name_snapshot = ?, face = ?, text = ?, updated_at = ? WHERE id = ?`, [
          input.projectNameSnapshot,
          input.face,
          input.text,
          now,
          id,
        ]);
      } else {
        db.runSync(
          `INSERT INTO moods (id, date, project_id, project_name_snapshot, face, text, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, input.date, input.projectId, input.projectNameSnapshot, input.face, input.text, now, now],
        );
      }
      // 备份或旧实现可能留下重复照片 id；替换整组时不能因主键冲突留下半组数据
      const current = existing?.photos.map((photo) => photo.id) ?? [];
      const obsolete = input.photos.filter((photo) => !current.includes(photo.id));
      for (const photo of obsolete) {
        db.runSync('DELETE FROM mood_photos WHERE id = ? AND mood_id <> ?', [photo.id, id]);
      }
      db.runSync('DELETE FROM mood_photos WHERE mood_id = ?', [id]);
      input.photos.forEach((photo, index) => {
        db.runSync(
          'INSERT INTO mood_photos (id, mood_id, file_name, width, height, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
          [photo.id, id, photo.fileName, photo.width, photo.height, index],
        );
      });
    });
    const saved = byId(id);
    if (!saved) throw new Error('心情保存后读取失败');
    return saved;
  },

  /** 返回完整被删心情，供服务层清理对应媒体文件 */
  delete(id: string): MoodEntity | null {
    const mood = byId(id);
    if (!mood) return null;
    getDatabase().runSync('DELETE FROM moods WHERE id = ?', [id]);
    return mood;
  },
};
