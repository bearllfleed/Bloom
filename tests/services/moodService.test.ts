/**
 * 心情服务：保存前规范化、照片替换后清理孤立文件、删除时一并清理、发 moodChanged。
 */
import { moodService } from '@/services/moodService';

const mockRepo = jest.requireMock('@/data/repositories/moodRepo').moodRepo;
const mockEmit = jest.fn();
const mockRemove = jest.fn();
const mockClearDraft = jest.fn();
const mockReadDraft = jest.fn();
const mockWriteDraft = jest.fn();
const mockProject = jest.fn();

jest.mock('@/data/repositories/moodRepo', () => ({
  moodRepo: {
    getById: jest.fn(),
    getFor: jest.fn(),
    list: jest.fn(),
    count: jest.fn(),
    listForProject: jest.fn(),
    listForDate: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  },
}));
jest.mock('@/data/repositories/projectRepo', () => ({ projectRepo: { getEntity: () => mockProject() } }));
jest.mock('@/platform/media', () => ({ media: { remove: (...args: unknown[]) => mockRemove(...args) } }));
jest.mock('@/platform/kv', () => ({
  kv: {
    getJSON: (...args: unknown[]) => mockReadDraft(...args),
    setJSON: (...args: unknown[]) => mockWriteDraft(...args),
    remove: (...args: unknown[]) => mockClearDraft(...args),
  },
}));
jest.mock('@/platform/clock', () => ({ clock: { now: () => 1000, today: () => '2026-11-22' } }));
jest.mock('@/services/events', () => ({ events: { emit: (...args: unknown[]) => mockEmit(...args) } }));

const saved = {
  id: 'm1',
  date: '2026-11-22',
  projectId: 'p1',
  projectNameSnapshot: '早睡',
  face: 'happy' as const,
  text: '今天很好',
  createdAt: 1,
  updatedAt: 1,
  photos: [{ id: 'a', fileName: 'a.jpg', width: 1200, height: 800 }],
};

describe('心情服务', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockProject.mockReturnValue({ name: '早睡' });
    mockRemove.mockReset();
    mockClearDraft.mockReset();
    mockReadDraft.mockReset();
    mockWriteDraft.mockReset();
  });

  it('空白文字不可保存，也不触碰数据库', () => {
    expect(
      moodService.saveDraft({ date: '2026-11-22', projectId: 'p1', face: null, text: '  \n ', photos: [] }),
    ).toBeNull();
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('保存前截断文字、附上项目名快照，并删除被换掉的照片文件', () => {
    mockRepo.getFor.mockReturnValue({ ...saved, photos: [{ ...saved.photos[0], id: 'old', fileName: 'old.jpg' }] });
    mockRepo.save.mockReturnValue(saved);
    const result = moodService.saveDraft({
      date: '2026-11-22',
      projectId: 'p1',
      face: 'happy',
      text: `${'字'.repeat(499)}xy`,
      photos: saved.photos,
    });
    expect(result).toEqual(saved);
    expect(mockRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ projectNameSnapshot: '早睡', text: `${'字'.repeat(499)}x` }),
    );
    expect(mockRemove).toHaveBeenCalledWith('old.jpg');
    expect(mockEmit).toHaveBeenCalledWith({ type: 'moodChanged', date: '2026-11-22', projectId: 'p1' });
  });

  it('保存成功后清除对应草稿，失败时保留草稿', () => {
    mockRepo.getFor.mockReturnValue(null);
    mockRepo.save.mockReturnValue(saved);
    moodService.saveDraft({ date: '2026-11-22', projectId: 'p1', face: 'happy', text: '', photos: [] });
    expect(mockClearDraft).toHaveBeenCalledWith(expect.stringContaining('2026-11-22'));

    mockClearDraft.mockReset();
    mockRepo.save.mockImplementation(() => {
      throw new Error('写入失败');
    });
    expect(() =>
      moodService.saveDraft({ date: '2026-11-22', projectId: 'p1', face: 'happy', text: '', photos: [] }),
    ).toThrow('写入失败');
    expect(mockClearDraft).not.toHaveBeenCalled();
  });

  it('删除心情时同时删除数据库记录和全部照片文件', () => {
    mockRepo.getById.mockReturnValue(saved);
    expect(moodService.delete('m1')).toBe(true);
    expect(mockRepo.delete).toHaveBeenCalledWith('m1');
    expect(mockRemove).toHaveBeenCalledWith('a.jpg');
    expect(mockEmit).toHaveBeenCalledWith({ type: 'moodChanged', date: '2026-11-22', projectId: 'p1' });
    mockRepo.getById.mockReturnValue(null);
    expect(moodService.delete('missing')).toBe(false);
  });

  it('草稿以日期和项目为键存成 JSON，保存或放弃时清除', () => {
    const draft = { face: 'calm' as const, text: '草稿', photos: [] };
    moodService.saveLocalDraft('2026-11-22', null, draft);
    const key = mockWriteDraft.mock.calls[0][0] as string;
    expect(key).toContain('2026-11-22');
    mockReadDraft.mockReturnValue(draft);
    expect(moodService.readLocalDraft('2026-11-22', null)).toEqual(draft);
    moodService.clearLocalDraft('2026-11-22', null);
    expect(mockClearDraft).toHaveBeenCalledWith(key);
  });
});
