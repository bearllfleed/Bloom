import { DATA_DOMAINS, domainsForDataEvent } from '@/stores/dataVersion';

jest.mock('@/platform/clock', () => ({ clock: { subscribe: jest.fn(() => jest.fn()) } }));
jest.mock('@/services/events', () => ({ events: { subscribe: jest.fn(() => jest.fn()) } }));

describe('数据版本域映射', () => {
  it.each([
    [{ type: 'checkinChanged', projectId: 'p1', date: '2026-11-22' }, ['checkins', 'achievements']],
    [{ type: 'projectChanged', projectId: 'p1' }, ['projects', 'achievements']],
    [{ type: 'projectsChanged' }, ['projects', 'achievements']],
    [{ type: 'moodChanged', date: '2026-11-22', projectId: 'p1' }, ['moods', 'achievements']],
    [{ type: 'achievementChanged' }, ['achievements']],
    [{ type: 'backupChanged' }, ['backup']],
  ] as const)('$type 只更新相关域', (event, expected) => {
    expect(domainsForDataEvent(event)).toEqual(expected);
  });

  it('dataReplaced 才更新全部域', () => {
    expect(domainsForDataEvent({ type: 'dataReplaced' })).toEqual(DATA_DOMAINS);
  });
});
