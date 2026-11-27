const mockAchievementListUnlocks = jest.fn(() => [
  { id: 'A01', unlockedAt: 1, reissue: false, presentation: 'popup', seen: true },
]);
const mockListMoodFacts = jest.fn(() => []);
const mockCounters = jest.fn(() => ({ backupExports: 0, pauseResumes: 0, maxUndosInDay: 0 }));
const mockAchievementProjects = jest.fn(() => []);
const mockAchievementCounts = jest.fn(() => new Map());
const mockAchievementRevisions = {
  projects: 0,
  checkins: 0,
  moods: 0,
  achievements: 0,
  backup: 0,
  clock: 0,
};

jest.mock('@/data/repositories/achievementRepo', () => ({
  achievementRepo: {
    listUnlocks: mockAchievementListUnlocks,
    listMoodFacts: mockListMoodFacts,
    counters: mockCounters,
    insertUnlocks: jest.fn(),
    markSeen: jest.fn(),
  },
}));
jest.mock('@/data/repositories/checkinRepo', () => ({
  checkinRepo: { countsByProject: mockAchievementCounts, listAll: jest.fn(() => []) },
}));
jest.mock('@/data/repositories/projectRepo', () => ({
  projectRepo: { listEntities: mockAchievementProjects },
}));
jest.mock('@/data/repositories/metaRepo', () => ({
  metaRepo: { get: jest.fn(() => 'done'), set: jest.fn() },
}));
jest.mock('@/platform/clock', () => ({
  clock: { today: jest.fn(() => '2026-11-22'), now: jest.fn(() => 1) },
}));
jest.mock('@/platform/logger', () => ({
  createLogger: jest.fn(() => ({ info: jest.fn(), warn: jest.fn() })),
}));
jest.mock('@/stores/prefsStore', () => ({
  usePrefs: { getState: jest.fn(() => ({ weekStart: 1, dayEndHour: 0 })) },
}));
jest.mock('@/stores/dataVersion', () => ({
  getDataRevisions: jest.fn(() => mockAchievementRevisions),
}));
jest.mock('@/services/events', () => ({
  events: { subscribe: jest.fn(() => jest.fn()), emit: jest.fn() },
}));

function loadAchievementService() {
  let service!: typeof import('@/services/achievementService');
  jest.isolateModules(() => {
    service = require('@/services/achievementService') as typeof import('@/services/achievementService');
  });
  return service.achievementService;
}

describe('成就馆共享快照', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.assign(mockAchievementRevisions, {
      projects: 0,
      checkins: 0,
      moods: 0,
      achievements: 0,
      backup: 0,
      clock: 0,
    });
  });

  it('同一相关修订只读取一次 unlocks/owned/progress', () => {
    const service = loadAchievementService();

    const first = service.gallerySnapshot();
    const second = service.gallerySnapshot();

    expect(second).toBe(first);
    expect(first.owned).toEqual(new Set(['A01']));
    expect(mockAchievementListUnlocks).toHaveBeenCalledTimes(1);
    expect(mockAchievementProjects).toHaveBeenCalledTimes(1);
    expect(mockAchievementCounts).toHaveBeenCalledTimes(1);
    expect(mockListMoodFacts).toHaveBeenCalledTimes(1);
    expect(mockCounters).toHaveBeenCalledTimes(1);
  });

  it('相关域修订后重建快照', () => {
    const service = loadAchievementService();

    service.gallerySnapshot();
    mockAchievementRevisions.moods += 1;
    service.gallerySnapshot();

    expect(mockAchievementListUnlocks).toHaveBeenCalledTimes(2);
    expect(mockAchievementProjects).toHaveBeenCalledTimes(2);
    expect(mockAchievementCounts).toHaveBeenCalledTimes(2);
    expect(mockListMoodFacts).toHaveBeenCalledTimes(2);
  });
});
