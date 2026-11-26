/**
 * 心情仓储：用 Node SQLite 真库验证 UPSERT、照片顺序、筛选、事务与外键行为。
 */
import { DatabaseSync } from 'node:sqlite';

import { migration0001 } from '@/data/db/migrations/0001_initial';
import { moodRepo } from '@/data/repositories/moodRepo';

jest.mock('@/data/db/client', () => ({ getDatabase: () => mockDatabase }));
jest.mock('@/platform/clock', () => ({ clock: { now: () => 1_000 } }));
jest.mock('@/utils/id', () => ({ newId: jest.fn() }));

interface FakeDatabase {
  execSync(sql: string): void;
  runSync(sql: string, params?: unknown[]): { changes: number };
  getFirstSync<T>(sql: string, params?: unknown[]): T | null;
  getAllSync<T>(sql: string, params?: unknown[]): T[];
  withTransactionSync(task: () => void): void;
}

let raw: DatabaseSync;
let mockDatabase: FakeDatabase;

beforeEach(() => {
  let generated = 0;
  jest
    .requireMock('@/utils/id')
    .newId.mockImplementation(() => (generated++ === 0 ? 'mood-generated' : `mood-generated-${generated}`));
  raw = new DatabaseSync(':memory:');
  raw.exec('PRAGMA foreign_keys = ON');
  raw.exec(migration0001.sql);
  mockDatabase = {
    execSync: (sql) => raw.exec(sql),
    runSync: (sql, params = []) => {
      const result = raw.prepare(sql).run(...(params as never[]));
      return { changes: Number(result.changes) };
    },
    getFirstSync: (sql, params = []) => (raw.prepare(sql).get(...(params as never[])) as never) ?? null,
    getAllSync: (sql, params = []) => raw.prepare(sql).all(...(params as never[])) as never,
    withTransactionSync: (task) => {
      raw.exec('BEGIN');
      try {
        task();
        raw.exec('COMMIT');
      } catch (error) {
        raw.exec('ROLLBACK');
        throw error;
      }
    },
  };
  raw
    .prepare(
      "INSERT INTO projects (id, name, icon_id, color_id, start_date, sort_order, created_at, updated_at) VALUES ('p1', '早睡', 'moon', 'blue', '2026-11-01', 1, 0, 0)",
    )
    .run();
});

afterEach(() => raw.close());

const photo = (id: string) => ({ id, fileName: `${id}.jpg`, width: 1200, height: 800 });

describe('心情仓储', () => {
  it('按日期与可空项目 UPSERT，完整保存照片并保留创建时间', () => {
    const created = moodRepo.save({
      date: '2026-11-22',
      projectId: 'p1',
      projectNameSnapshot: '早睡',
      face: 'happy',
      text: '今天很好',
      photos: [photo('b'), photo('a')],
    });
    expect(created).toMatchObject({
      id: 'mood-generated',
      date: '2026-11-22',
      projectId: 'p1',
      projectNameSnapshot: '早睡',
      face: 'happy',
      text: '今天很好',
      createdAt: 1000,
      updatedAt: 1000,
    });
    expect(created.photos.map((p) => p.id)).toEqual(['b', 'a']);

    raw.prepare('UPDATE moods SET created_at = 100 WHERE id = ?').run(created.id);
    const updated = moodRepo.save({
      date: '2026-11-22',
      projectId: 'p1',
      projectNameSnapshot: '新名字',
      face: 'calm',
      text: '',
      photos: [photo('c')],
    });
    expect(updated.id).toBe(created.id);
    expect(updated.createdAt).toBe(100);
    expect(updated.photos.map((p) => p.id)).toEqual(['c']);
    expect(moodRepo.count()).toBe(1);

    moodRepo.save({
      date: '2026-11-22',
      projectId: null,
      projectNameSnapshot: null,
      face: 'sad',
      text: '',
      photos: [],
    });
    moodRepo.save({
      date: '2026-11-22',
      projectId: null,
      projectNameSnapshot: null,
      face: 'tired',
      text: '',
      photos: [],
    });
    expect(moodRepo.count()).toBe(2);
    expect(moodRepo.getFor('2026-11-22', null)?.face).toBe('tired');
    expect(moodRepo.getFor('2026-11-22', 'p1')?.id).toBe(created.id);
    expect(moodRepo.getById(created.id)?.projectNameSnapshot).toBe('新名字');
    expect(moodRepo.getById('missing')).toBeNull();
    expect(moodRepo.getFor('2026-11-23', 'p1')).toBeNull();
  });

  it('支持全部、有照片筛选、按项目和按日期查询，照片保持排序', () => {
    jest
      .requireMock('@/utils/id')
      .newId.mockReturnValueOnce('with-photo')
      .mockReturnValueOnce('project-text')
      .mockReturnValueOnce('day-text');
    const withPhoto = moodRepo.save({
      date: '2026-11-22',
      projectId: 'p1',
      projectNameSnapshot: '早睡',
      face: null,
      text: '',
      photos: [photo('x'), photo('y')],
    });
    moodRepo.save({
      date: '2026-11-21',
      projectId: 'p1',
      projectNameSnapshot: '早睡',
      face: 'happy',
      text: '',
      photos: [],
    });
    moodRepo.save({
      date: '2026-11-22',
      projectId: null,
      projectNameSnapshot: null,
      face: 'calm',
      text: '当天',
      photos: [],
    });
    expect(moodRepo.list().map((m) => m.id)).toHaveLength(3);
    expect(moodRepo.list({ hasPhotos: true }).map((m) => m.id)).toEqual([withPhoto.id]);
    expect(moodRepo.listForProject('p1')).toHaveLength(2);
    expect(moodRepo.listForDate('2026-11-22')).toHaveLength(2);
    expect(moodRepo.listForProject('missing')).toEqual([]);
    expect(moodRepo.listForDate('2026-11-23')).toEqual([]);
    expect(moodRepo.getById(withPhoto.id)?.photos.map((p) => p.id)).toEqual(['x', 'y']);
  });

  it('删除心情时级联删除照片', () => {
    const mood = moodRepo.save({
      date: '2026-11-22',
      projectId: 'p1',
      projectNameSnapshot: '早睡',
      face: null,
      text: '',
      photos: [photo('a')],
    });
    expect(moodRepo.delete(mood.id)).toEqual(mood);
    expect(moodRepo.getById(mood.id)).toBeNull();
    expect(raw.prepare('SELECT COUNT(*) AS n FROM mood_photos').get()).toMatchObject({ n: 0 });
    expect(moodRepo.delete('missing')).toBeNull();
  });

  it('照片写入失败时整次保存回滚，不留半篇心情', () => {
    expect(() =>
      moodRepo.save({
        date: '2026-11-22',
        projectId: 'p1',
        projectNameSnapshot: '早睡',
        face: 'happy',
        text: '',
        photos: [{ id: 'a', fileName: 'a.jpg', width: 1200, height: 800 }, photo('a')],
      }),
    ).toThrow();
    expect(moodRepo.count()).toBe(0);
  });

  it('删除项目只解除关联，项目名快照与心情照片都保留', () => {
    const mood = moodRepo.save({
      date: '2026-11-22',
      projectId: 'p1',
      projectNameSnapshot: '早睡',
      face: 'calm',
      text: '保留',
      photos: [photo('a')],
    });
    raw.prepare("DELETE FROM projects WHERE id = 'p1'").run();
    expect(moodRepo.getById(mood.id)).toMatchObject({ projectId: null, projectNameSnapshot: '早睡', text: '保留' });
    expect(moodRepo.getById(mood.id)?.photos).toHaveLength(1);
  });
});
