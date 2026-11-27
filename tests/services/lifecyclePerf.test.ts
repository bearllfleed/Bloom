const mockBegin = jest.fn((stage: string) => ({ stage, startedAtMs: 0, ended: false }));
const mockEnd = jest.fn();
const mockSetContext = jest.fn();
const mockApplyPrefsOnLaunch = jest.fn();
const mockRunSync = jest.fn();
const mockAchievementStart = jest.fn();
const mockPurgeDeleted = jest.fn();
const mockAutoGraduate = jest.fn();
const mockReminderStart = jest.fn();
const mockLogInfo = jest.fn();
const mockLogError = jest.fn();
const mockEventEmit = jest.fn();
const mockMaybeWeeklySnapshot = jest.fn();
const mockMetaGet = jest.fn((key: string) => (key === 'perf_fixture_id' ? 'stress' : null));
let mockOpenResult: { ok: true } | { ok: false; error: Error } = { ok: true };
const mockOpenBloomDatabase = jest.fn(() => mockOpenResult);

jest.mock('@/platform/perfTrace', () => ({
  ...jest.requireActual('@/platform/perfTrace'),
  perfTrace: { begin: mockBegin, end: mockEnd, setContext: mockSetContext },
}));
jest.mock('@/data/db/client', () => ({
  openBloomDatabase: mockOpenBloomDatabase,
  getDatabase: jest.fn(() => ({ runSync: mockRunSync })),
}));
jest.mock('@/data/repositories/metaRepo', () => ({ metaRepo: { get: mockMetaGet } }));
jest.mock('@/platform/clock', () => ({ clock: { today: jest.fn(() => '2024-01-01') } }));
jest.mock('@/platform/logger', () => ({
  createLogger: jest.fn(() => ({ info: mockLogInfo, warn: jest.fn(), error: mockLogError })),
}));
jest.mock('@/stores/prefsStore', () => ({ applyPrefsOnLaunch: mockApplyPrefsOnLaunch }));
jest.mock('@/stores/dataVersion', () => ({ invalidateDataDomains: jest.fn() }));
jest.mock('@/services/achievementService', () => ({ achievementService: { start: mockAchievementStart } }));
jest.mock('@/services/backupService', () => ({
  backupService: { maybeWeeklySnapshot: mockMaybeWeeklySnapshot },
}));
jest.mock('@/services/events', () => ({ events: { emit: mockEventEmit } }));
jest.mock('@/services/projectService', () => ({
  projectService: { purgeDeleted: mockPurgeDeleted, autoGraduate: mockAutoGraduate },
}));
jest.mock('@/services/reminderService', () => ({ reminderService: { start: mockReminderStart } }));

function loadLifecycle() {
  let lifecycle!: typeof import('@/services/lifecycleService');
  jest.isolateModules(() => {
    lifecycle = require('@/services/lifecycleService') as typeof import('@/services/lifecycleService');
  });
  return lifecycle;
}

const startupPerfStages = [
  'startup.preferences',
  'startup.database',
  'startup.first_use_date',
  'startup.achievement_baseline',
  'startup.cleanup',
  'startup.auto_graduate',
] as const;

describe('启动性能阶段接线', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOpenResult = { ok: true };
    mockMetaGet.mockImplementation((key: string) => (key === 'perf_fixture_id' ? 'stress' : null));
  });

  it('测量全部同步启动阶段并保持原有业务顺序', () => {
    const { bootstrap } = loadLifecycle();

    expect(bootstrap()).toEqual({ ok: true });
    expect(mockBegin.mock.calls.map(([stage]) => stage)).toEqual(['startup.bootstrap', ...startupPerfStages]);
    expect(mockEnd.mock.calls.map(([span]) => span.stage)).toEqual([...startupPerfStages, 'startup.bootstrap']);
    expect(mockSetContext).toHaveBeenCalledWith({ datasetId: 'stress' });

    const businessOrder = [
      mockApplyPrefsOnLaunch,
      mockOpenBloomDatabase,
      mockRunSync,
      mockAchievementStart,
      mockPurgeDeleted,
      mockAutoGraduate,
      mockReminderStart,
    ].map((mock) => mock.mock.invocationCallOrder[0]);
    expect(businessOrder).toEqual([...businessOrder].sort((a, b) => a - b));
  });

  it('用户内容伪装成性能数据集标识时不会传给追踪器', () => {
    mockMetaGet.mockImplementation((key: string) => (key === 'perf_fixture_id' ? 'therapy-project' : null));
    const { bootstrap } = loadLifecycle();

    expect(bootstrap()).toEqual({ ok: true });
    expect(mockSetContext).not.toHaveBeenCalled();
  });

  it('性能数据集标识读取失败不改变启动结果', () => {
    mockMetaGet.mockImplementation(() => {
      throw new Error('诊断标识不可用');
    });
    const { bootstrap } = loadLifecycle();

    expect(bootstrap()).toEqual({ ok: true });
    expect(mockAchievementStart).toHaveBeenCalledTimes(1);
    expect(mockSetContext).not.toHaveBeenCalled();
  });

  it('数据库迁移失败时保留“数据升级没有成功”所依赖的原结果', () => {
    mockOpenResult = { ok: false, error: new Error('迁移失败') };
    const { bootstrap } = loadLifecycle();

    expect(bootstrap()).toEqual({ ok: false, reason: 'database', message: '迁移失败' });
    expect(mockBegin.mock.calls.map(([stage]) => stage)).toEqual([
      'startup.bootstrap',
      'startup.preferences',
      'startup.database',
    ]);
    expect(mockEnd.mock.calls.map(([span]) => span.stage)).toEqual([
      'startup.preferences',
      'startup.database',
      'startup.bootstrap',
    ]);
    expect(mockAchievementStart).not.toHaveBeenCalled();
    expect(mockSetContext).not.toHaveBeenCalled();
  });

  it('数据库打开抛异常时也返回数据库失败状态', () => {
    const failure = new Error('数据库模块异常');
    mockOpenBloomDatabase.mockImplementationOnce(() => {
      throw failure;
    });
    const { bootstrap } = loadLifecycle();

    expect(bootstrap()).toEqual({ ok: false, reason: 'database', message: failure.message });
    expect(mockEnd.mock.calls.map(([span]) => span.stage)).toEqual([
      'startup.preferences',
      'startup.database',
      'startup.bootstrap',
    ]);
  });

  it.each([
    {
      label: '偏好应用',
      reason: 'preferences',
      perfStage: 'startup.preferences',
      fail: () =>
        mockApplyPrefsOnLaunch.mockImplementationOnce(
          () =>
            void (() => {
              throw new Error('偏好损坏');
            })(),
        ),
      message: '偏好损坏',
      nextStage: 'startup.database',
    },
    {
      label: '首次使用日期',
      reason: 'first_use_date',
      perfStage: 'startup.first_use_date',
      fail: () =>
        mockRunSync.mockImplementationOnce(
          () =>
            void (() => {
              throw new Error('首次日期写入失败');
            })(),
        ),
      message: '首次日期写入失败',
      nextStage: 'startup.achievement_baseline',
    },
    {
      label: '成就基线',
      reason: 'achievement_baseline',
      perfStage: 'startup.achievement_baseline',
      fail: () =>
        mockAchievementStart.mockImplementationOnce(
          () =>
            void (() => {
              throw new Error('基线失败');
            })(),
        ),
      message: '基线失败',
      nextStage: 'startup.cleanup',
    },
    {
      label: '清理',
      reason: 'cleanup',
      perfStage: 'startup.cleanup',
      fail: () =>
        mockPurgeDeleted.mockImplementationOnce(
          () =>
            void (() => {
              throw new Error('清理失败');
            })(),
        ),
      message: '清理失败',
      nextStage: 'startup.auto_graduate',
    },
    {
      label: '自动毕业',
      reason: 'auto_graduate',
      perfStage: 'startup.auto_graduate',
      fail: () =>
        mockAutoGraduate.mockImplementationOnce(
          () =>
            void (() => {
              throw new Error('自动毕业失败');
            })(),
        ),
      message: '自动毕业失败',
      nextStage: null,
    },
  ])('$label 异常变成可缓存的结构化失败，并结束失败 span', ({ reason, perfStage, fail, message, nextStage }) => {
    fail();
    const { bootstrap } = loadLifecycle();

    const result = bootstrap();
    expect(result).toEqual({ ok: false, reason, message });
    expect(bootstrap()).toBe(result);
    expect(mockEnd.mock.calls.map(([span]) => span.stage)).toContain(perfStage);
    expect(mockEnd.mock.calls.map(([span]) => span.stage)).toContain('startup.bootstrap');
    if (nextStage) expect(mockBegin.mock.calls.map(([stage]) => stage)).not.toContain(nextStage);
    expect(mockLogInfo).not.toHaveBeenCalledWith('启动完成');
    expect(mockLogError).toHaveBeenCalledWith(`启动阶段失败：${reason}`, expect.any(Error));
  });

  it('同一天普通回前台不再发全量数据失效事件', () => {
    const { bootstrap, onForeground } = loadLifecycle();
    expect(bootstrap()).toEqual({ ok: true });
    mockEventEmit.mockClear();

    onForeground();

    expect(mockAutoGraduate).toHaveBeenCalledTimes(2);
    expect(mockMaybeWeeklySnapshot).toHaveBeenCalledTimes(1);
    expect(mockEventEmit).not.toHaveBeenCalled();
  });

  it('提醒启动异常也不会逃逸或留下空启动状态', () => {
    const failure = new Error('提醒初始化失败');
    mockReminderStart.mockImplementationOnce(() => {
      throw failure;
    });
    const { bootstrap } = loadLifecycle();

    const result = bootstrap();
    expect(result).toEqual({ ok: false, reason: 'reminders', message: failure.message });
    expect(bootstrap()).toBe(result);
    expect(mockEnd.mock.calls.map(([span]) => span.stage)).toEqual([...startupPerfStages, 'startup.bootstrap']);
    expect(mockLogInfo).not.toHaveBeenCalledWith('启动完成');
  });
});
