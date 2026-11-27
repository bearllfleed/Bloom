const mockMark = jest.fn();
const mockFlushPerfTrace = jest.fn();
const mockPerfLogger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
const mockHideAsync = jest.fn(() => Promise.resolve());
const mockPreventAutoHideAsync = jest.fn(() => Promise.resolve());
const mockBootstrap = jest.fn<{ ok: true } | { ok: false; reason: string; message: string }, []>(() => ({ ok: true }));
const mockEffects: (() => void | (() => void))[] = [];
let mockRefs: { current: unknown }[] = [];
let mockStateValues: unknown[] = [];
let mockStateSetters: ((value: unknown) => void)[] = [];
let mockHookCursor = 0;
let mockFontsLoaded = true;
let mockFontError: Error | null = null;

jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return {
    ...actual,
    useEffect: (effect: () => void | (() => void)) => {
      mockEffects.push(effect);
    },
    useRef: <T,>(value: T) => {
      const index = mockHookCursor++;
      mockRefs[index] ??= { current: value };
      return mockRefs[index] as { current: T };
    },
    useState: <T,>(initial: T) => {
      const index = mockHookCursor++;
      if (!(index in mockStateValues)) mockStateValues[index] = initial;
      mockStateSetters[index] ??= (next: unknown) => {
        mockStateValues[index] =
          typeof next === 'function' ? (next as (mockPrevious: unknown) => unknown)(mockStateValues[index]) : next;
      };
      return [mockStateValues[index] as T, mockStateSetters[index]];
    },
  };
});
jest.mock('@expo-google-fonts/fredoka', () => ({
  Fredoka_500Medium: {},
  Fredoka_600SemiBold: {},
  useFonts: () => [mockFontsLoaded, mockFontError],
}));
jest.mock('expo-router', () => {
  const Stack = () => null;
  const Screen = () => null;
  Screen.displayName = 'MockStackScreen';
  Stack.Screen = Screen;
  return { Stack, useRouter: () => ({ navigate: jest.fn(), push: jest.fn() }) };
});
jest.mock('expo-linking', () => ({ useURL: () => null }));
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: mockPreventAutoHideAsync,
  hideAsync: mockHideAsync,
}));
jest.mock('expo-status-bar', () => ({ StatusBar: () => null }));
jest.mock('react-native-gesture-handler', () => ({ GestureHandlerRootView: () => null }));
jest.mock('@/features/achievement', () => ({ presentPendingUnlocks: jest.fn() }));
jest.mock('@/features/graduation/present', () => ({ presentPendingGraduations: jest.fn() }));
jest.mock('@/features/settings/ChangelogSheet', () => ({ openChangelog: jest.fn() }));
jest.mock('@/platform/appInfo', () => ({ appVersion: '0.2.0', appBuild: '42' }));
jest.mock('@/platform/appVariant', () => ({ appVariant: 'preview', isDevToolsEnabled: false }));
jest.mock('@/platform/clock', () => ({
  clock: {
    nextDayBoundary: jest.fn(),
    now: jest.fn(),
    subscribe: jest.fn(() => jest.fn()),
  },
}));
jest.mock('@/platform/diagnostics', () => ({ shareDiagnostics: jest.fn() }));
jest.mock('@/platform/files', () => ({ files: {} }));
jest.mock('@/platform/logger', () => ({ createLogger: jest.fn(() => mockPerfLogger) }));
jest.mock('@/platform/notifications', () => ({ notifications: { prepare: jest.fn(), onResponse: jest.fn() } }));
jest.mock('@/platform/perfTrace', () => ({
  perfTrace: { mark: (stage: string) => mockMark(stage) },
  flushPerfTrace: (...args: unknown[]) => mockFlushPerfTrace(...args),
}));
jest.mock('@/services/backupService', () => ({
  backupErrorText: jest.fn(),
  parseBackup: jest.fn(),
  stageBackup: jest.fn(),
}));
jest.mock('@/services/changelogService', () => ({ markChangelogSeen: jest.fn(), pendingChangelog: jest.fn() }));
jest.mock('@/services/events', () => ({ events: { subscribe: jest.fn(() => jest.fn()) } }));
jest.mock('@/services/lifecycleService', () => ({
  bootstrap: () => mockBootstrap(),
  onBackground: jest.fn(),
  onForeground: jest.fn(),
}));
jest.mock('@/services/achievementService', () => ({
  achievementService: { onUnlocked: jest.fn(() => jest.fn()) },
}));
jest.mock('@/stores/overlayQueue', () => ({ overlay: { toast: jest.fn() } }));
jest.mock('@/stores/prefsStore', () => ({ usePrefs: jest.fn() }));
jest.mock('@/stores/todayStore', () => ({ useTodayStore: { getState: jest.fn() } }));
jest.mock('@/ui/components/AppText', () => ({
  AppText: () => null,
  FontAvailabilityProvider: () => null,
}));
jest.mock('@/ui/components/CandyButton', () => ({ CandyButton: () => null }));
jest.mock('@/ui/components/TimeTravelBanner', () => ({ TimeTravelBanner: () => null }));
jest.mock('@/ui/illustrations/Duoduo', () => ({ Duoduo: () => null }));
jest.mock('@/ui/motion/idle', () => ({ focusGateLayout: jest.fn() }));
jest.mock('@/ui/overlay/OverlayHost', () => ({ OverlayHost: () => null }));
jest.mock('@/ui/theme/ThemeProvider', () => ({
  ThemeProvider: () => null,
  useTheme: () => ({ colors: { background: '#fff' }, scheme: 'light' }),
}));

function loadRootLayout(): typeof import('@/app/_layout').default {
  let rootLayout!: typeof import('@/app/_layout').default;
  jest.isolateModules(() => {
    rootLayout = (require('@/app/_layout') as typeof import('@/app/_layout')).default;
  });
  return rootLayout;
}

type RootElement = { props: { onLayout?: () => void; children?: { props?: Record<string, unknown> } } };

function renderRootLayout(rootLayout: typeof import('@/app/_layout').default) {
  mockHookCursor = 0;
  mockEffects.length = 0;
  const element = rootLayout() as RootElement | null;
  return { effects: [...mockEffects], element };
}

function runEffects(effects: (() => void | (() => void))[]): void {
  effects.forEach((effect) => effect());
}

async function flushAsyncWork(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

function fontAvailability(element: RootElement): boolean | undefined {
  const provider = element.props.children;
  return provider?.props?.available as boolean | undefined;
}

describe('根布局启动门控与性能标记', () => {
  beforeEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
    mockHideAsync.mockReset().mockResolvedValue(undefined);
    mockPreventAutoHideAsync.mockReset().mockResolvedValue(undefined);
    mockBootstrap.mockReset().mockReturnValue({ ok: true });
    mockEffects.length = 0;
    mockRefs = [];
    mockStateValues = [];
    mockStateSetters = [];
    mockHookCursor = 0;
    mockFontsLoaded = true;
    mockFontError = null;
  });

  it('在全局作用域阻止 splash 自动隐藏', () => {
    loadRootLayout();
    expect(mockPreventAutoHideAsync).toHaveBeenCalledTimes(1);
  });

  it('成功分支提交可渲染布局后才隐藏 splash', async () => {
    const RootLayout = loadRootLayout();
    expect(mockMark).toHaveBeenCalledWith('startup.js');

    const initial = renderRootLayout(RootLayout);
    expect(initial.element).toBeNull();
    expect(mockMark.mock.calls.map(([stage]) => stage)).toEqual(['startup.js']);
    runEffects(initial.effects);
    expect(mockMark).toHaveBeenCalledWith('startup.root_layout');

    const ready = renderRootLayout(RootLayout);
    expect(ready.element).not.toBeNull();
    expect(mockMark).not.toHaveBeenCalledWith('startup.first_renderable');
    expect(mockHideAsync).not.toHaveBeenCalled();
    ready.element?.props.onLayout?.();
    await flushAsyncWork();

    expect(mockMark.mock.calls.map(([stage]) => stage)).toEqual([
      'startup.js',
      'startup.root_layout',
      'startup.first_renderable',
      'startup.splash_hide_request',
      'startup.splash_hide_complete',
    ]);
    expect(mockHideAsync).toHaveBeenCalledTimes(1);
    expect(mockFlushPerfTrace).toHaveBeenCalledWith(mockPerfLogger, {
      buildId: '0.2.0(42)/preview',
    });
  });

  it('失败分支也在错误页布局后才隐藏 splash', async () => {
    mockBootstrap.mockReturnValue({ ok: false, reason: 'cleanup', message: '清理失败' });
    const RootLayout = loadRootLayout();

    const initial = renderRootLayout(RootLayout);
    runEffects(initial.effects);
    const failure = renderRootLayout(RootLayout);

    expect(failure.element).not.toBeNull();
    expect(mockHideAsync).not.toHaveBeenCalled();
    failure.element?.props.onLayout?.();
    await flushAsyncWork();

    expect(mockHideAsync).toHaveBeenCalledTimes(1);
    expect(mockMark).toHaveBeenCalledWith('startup.first_renderable');
    expect(mockMark).toHaveBeenCalledWith('startup.splash_hide_complete');
  });

  it('字体加载错误时记录诊断并用系统字体继续启动', async () => {
    const fontFailure = new Error('字体文件损坏');
    mockFontsLoaded = false;
    mockFontError = fontFailure;
    const RootLayout = loadRootLayout();

    const initial = renderRootLayout(RootLayout);
    runEffects(initial.effects);
    const ready = renderRootLayout(RootLayout);

    expect(ready.element).not.toBeNull();
    expect(fontAvailability(ready.element!)).toBe(false);
    expect(mockPerfLogger.warn).toHaveBeenCalledWith('字体加载失败，改用系统字体', fontFailure);
    ready.element?.props.onLayout?.();
    await flushAsyncWork();
    expect(mockHideAsync).toHaveBeenCalledTimes(1);
  });

  it('字体既未成功也未报错时最多等待 2.5 秒，然后用系统字体继续', async () => {
    jest.useFakeTimers();
    mockFontsLoaded = false;
    mockFontError = null;
    const RootLayout = loadRootLayout();

    const initial = renderRootLayout(RootLayout);
    runEffects(initial.effects);
    jest.advanceTimersByTime(2499);
    expect(renderRootLayout(RootLayout).element).toBeNull();

    jest.advanceTimersByTime(1);
    const ready = renderRootLayout(RootLayout);
    expect(ready.element).not.toBeNull();
    expect(fontAvailability(ready.element!)).toBe(false);
    expect(mockPerfLogger.warn).toHaveBeenCalledWith('字体加载超时，改用系统字体');
    ready.element?.props.onLayout?.();
    await flushAsyncWork();
    expect(mockHideAsync).toHaveBeenCalledTimes(1);
  });

  it('bootstrap 意外抛错时转为可渲染失败状态', async () => {
    const failure = new Error('未知启动错误');
    mockBootstrap.mockImplementationOnce(() => {
      throw failure;
    });
    const RootLayout = loadRootLayout();

    const initial = renderRootLayout(RootLayout);
    expect(() => runEffects(initial.effects)).not.toThrow();
    const ready = renderRootLayout(RootLayout);

    expect(ready.element).not.toBeNull();
    expect(mockPerfLogger.error).toHaveBeenCalledWith('启动流程异常', failure);
    ready.element?.props.onLayout?.();
    await flushAsyncWork();
    expect(mockHideAsync).toHaveBeenCalledTimes(1);
  });

  it('StrictMode effect 重放、重复 layout 和普通重渲染至多隐藏一次', async () => {
    const RootLayout = loadRootLayout();
    const initial = renderRootLayout(RootLayout);
    runEffects(initial.effects);
    runEffects(initial.effects);

    const ready = renderRootLayout(RootLayout);
    ready.element?.props.onLayout?.();
    ready.element?.props.onLayout?.();
    renderRootLayout(RootLayout).element?.props.onLayout?.();
    await flushAsyncWork();

    expect(mockHideAsync).toHaveBeenCalledTimes(1);
    expect(mockMark.mock.calls.filter(([stage]) => stage === 'startup.splash_hide_request')).toHaveLength(1);
    expect(mockMark.mock.calls.filter(([stage]) => stage === 'startup.splash_hide_complete')).toHaveLength(1);
    expect(mockFlushPerfTrace).toHaveBeenCalledTimes(1);
  });

  it('hideAsync 拒绝时不误报 complete 或 flush，也不在重渲染后重复请求', async () => {
    const failure = new Error('native splash unavailable');
    mockHideAsync.mockRejectedValueOnce(failure);
    const RootLayout = loadRootLayout();
    const initial = renderRootLayout(RootLayout);
    runEffects(initial.effects);

    const ready = renderRootLayout(RootLayout);
    ready.element?.props.onLayout?.();
    ready.element?.props.onLayout?.();
    await flushAsyncWork();
    renderRootLayout(RootLayout).element?.props.onLayout?.();

    expect(mockHideAsync).toHaveBeenCalledTimes(1);
    expect(mockMark).toHaveBeenCalledWith('startup.splash_hide_request');
    expect(mockMark).not.toHaveBeenCalledWith('startup.splash_hide_complete');
    expect(mockFlushPerfTrace).not.toHaveBeenCalled();
    expect(mockPerfLogger.warn).toHaveBeenCalledWith('启动画面隐藏失败', failure);
  });
});
