const mockListEntities = jest.fn(() => []);
const mockCountsByProject = jest.fn(() => new Map());
const mockListInstants = jest.fn(() => []);
const mockListUnlocks = jest.fn(() => []);
const mockRevisions = {
  projects: 0,
  checkins: 0,
  moods: 0,
  achievements: 0,
  backup: 0,
  clock: 0,
};

jest.mock('@/data/repositories/projectRepo', () => ({
  projectRepo: { listEntities: mockListEntities },
}));
jest.mock('@/data/repositories/checkinRepo', () => ({
  checkinRepo: {
    countsByProject: mockCountsByProject,
    listInstants: mockListInstants,
    listUnlocks: mockListUnlocks,
    listNotes: jest.fn(() => []),
    noteCount: jest.fn(() => 0),
  },
}));
jest.mock('@/data/repositories/achievementRepo', () => ({
  achievementRepo: { listUnlocks: mockListUnlocks },
}));
jest.mock('@/platform/clock', () => ({
  clock: { today: jest.fn(() => '2026-11-22') },
}));
jest.mock('@/stores/prefsStore', () => ({
  usePrefs: { getState: jest.fn(() => ({ weekStart: 1 })) },
}));
jest.mock('@/stores/dataVersion', () => ({
  getDataRevisions: jest.fn(() => mockRevisions),
}));

function loadStatsQuery() {
  let stats!: typeof import('@/services/statsQuery');
  jest.isolateModules(() => {
    stats = require('@/services/statsQuery') as typeof import('@/services/statsQuery');
  });
  return stats;
}

describe('统计共享快照缓存', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.assign(mockRevisions, {
      projects: 0,
      checkins: 0,
      moods: 0,
      achievements: 0,
      backup: 0,
      clock: 0,
    });
  });

  it('同一修订周期的三个页面只加载一次 projects 和 counts，并按需加载 instants/unlocks', () => {
    const { getStatsMonth, getStatsOverview, getStatsYear } = loadStatsQuery();

    getStatsOverview();
    expect(mockListEntities).toHaveBeenCalledTimes(1);
    expect(mockCountsByProject).toHaveBeenCalledTimes(1);
    expect(mockListInstants).toHaveBeenCalledTimes(1);
    expect(mockListUnlocks).not.toHaveBeenCalled();

    getStatsMonth('2026-11-01');
    expect(mockListEntities).toHaveBeenCalledTimes(1);
    expect(mockCountsByProject).toHaveBeenCalledTimes(1);
    expect(mockListInstants).toHaveBeenCalledTimes(1);
    expect(mockListUnlocks).not.toHaveBeenCalled();

    getStatsYear(2026);
    getStatsYear(2026);
    expect(mockListEntities).toHaveBeenCalledTimes(1);
    expect(mockCountsByProject).toHaveBeenCalledTimes(1);
    expect(mockListUnlocks).toHaveBeenCalledTimes(1);
  });

  it('checkins 修订重载基础快照，achievements 修订只重载 unlocks', () => {
    const { getStatsMonth, getStatsOverview, getStatsYear } = loadStatsQuery();

    getStatsMonth('2026-11-01');
    mockRevisions.checkins += 1;
    getStatsMonth('2026-11-01');
    expect(mockListEntities).toHaveBeenCalledTimes(2);
    expect(mockCountsByProject).toHaveBeenCalledTimes(2);
    expect(mockListInstants).not.toHaveBeenCalled();

    getStatsOverview();
    expect(mockListInstants).toHaveBeenCalledTimes(1);

    getStatsYear(2026);
    expect(mockListUnlocks).toHaveBeenCalledTimes(1);
    mockRevisions.achievements += 1;
    getStatsYear(2026);
    expect(mockListEntities).toHaveBeenCalledTimes(2);
    expect(mockCountsByProject).toHaveBeenCalledTimes(2);
    expect(mockListUnlocks).toHaveBeenCalledTimes(2);
  });
});
