/**
 * 心情编辑会话：两秒自动保存、切后台、恢复、保存或放弃后清除。
 * 只验证领域会话；KV 与数据库接线由 moodService 测试覆盖。
 */
import { editSession, type MoodContent } from '@/domain/mood';

type Draft = MoodContent;

function makeStorage() {
  const store = new Map<string, Draft>();
  return {
    store,
    read: (key: string) => store.get(key) ?? null,
    write: (key: string, draft: Draft) => store.set(key, draft),
    remove: (key: string) => store.delete(key),
  };
}

describe('心情编辑会话', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('停止输入两秒后写入草稿，恢复时标记接着上次写', () => {
    const storage = makeStorage();
    const session = editSession<Draft>({
      date: '2026-11-22',
      projectId: 'p1',
      original: null,
      ...storage,
    });
    expect(session.restore()).toEqual({ draft: null, resumed: false });

    session.update({ face: 'happy', text: '写到一半', photos: [] });
    jest.advanceTimersByTime(1999);
    expect(storage.store.size).toBe(0);
    jest.advanceTimersByTime(1);
    expect(storage.store.size).toBe(1);

    const reopened = editSession<Draft>({
      date: '2026-11-22',
      projectId: 'p1',
      original: null,
      ...storage,
    });
    expect(reopened.restore()).toEqual({
      draft: { face: 'happy', text: '写到一半', photos: [] },
      resumed: true,
    });
    session.dispose();
    reopened.dispose();
  });

  it('切后台立即保存；保存或放弃后清除草稿并取消计时', () => {
    const storage = makeStorage();
    const session = editSession<Draft>({ date: '2026-11-22', projectId: null, original: null, ...storage });
    session.update({ face: 'calm', text: '', photos: [] });
    session.background();
    expect(storage.store.size).toBe(1);
    expect(storage.store.get([...storage.store.keys()][0])).toEqual({ face: 'calm', text: '', photos: [] });

    session.update({ face: 'happy', text: '', photos: [] });
    session.saved();
    jest.advanceTimersByTime(4000);
    expect(storage.store.size).toBe(0);

    session.update({ face: 'sad', text: '', photos: [] });
    session.background();
    expect(storage.store.size).toBe(1);
    session.discard();
    expect(storage.store.size).toBe(0);
    session.dispose();
  });

  it('空白内容不会写成草稿，日期与项目不同则互不覆盖', () => {
    const storage = makeStorage();
    const monday = editSession<Draft>({ date: '2026-11-22', projectId: 'p1', original: null, ...storage });
    monday.update({ face: null, text: '  \n ', photos: [] });
    monday.background();
    expect(storage.store.size).toBe(0);

    const project = editSession<Draft>({ date: '2026-11-22', projectId: 'p1', original: null, ...storage });
    project.update({ face: 'happy', text: '项目心情', photos: [] });
    project.background();
    const day = editSession<Draft>({ date: '2026-11-22', projectId: null, original: null, ...storage });
    day.update({ face: 'calm', text: '当天心情', photos: [] });
    day.background();
    expect(storage.store.size).toBe(2);
    expect(day.restore().draft?.text).toBe('当天心情');
    monday.dispose();
    project.dispose();
    day.dispose();
  });
});
