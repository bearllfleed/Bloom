/**
 * 徽章视觉引擎的目录、组合与状态契约（第 3 期 3-2）。
 * 这些测试只依赖纯数据与 React 组件，不需要原生环境。
 * Reanimated 的原生 worklets 在 Jest 中不存在，用最小 mock 顶替，仅验证组件能导入与数据契约。
 */
import { ACHIEVEMENTS, SERIES } from '@/domain/achievement/catalog';
import {
  Badge,
  BADGE_DIGIT_PATHS,
  BADGE_MOTIF_COMPONENTS,
  BADGE_MOTIFS,
  BADGE_BASE_PATHS,
  BADGE_MOTION_PRESETS,
  BADGE_PALETTE,
  BADGE_TIER_COLORS,
  badgeArtwork,
  badgeMotion,
  badgeVisual,
} from '@/ui/badges';

/* eslint-disable @typescript-eslint/no-require-imports -- Jest mock 工厂必须在模块求值前登记 */
jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  const noop = () => {};
  return {
    __esModule: true,
    default: { View, createAnimatedComponent: (component: unknown) => component },
    Easing: {
      linear: (t: number) => t,
      out: (fn: (t: number) => number) => fn,
      in: (fn: (t: number) => number) => fn,
      inOut: (fn: (t: number) => number) => fn,
      quad: (t: number) => t * t,
      bezier: () => (t: number) => t,
    },
    useSharedValue: (value = 0) => ({ value }),
    useAnimatedProps: () => ({}),
    useAnimatedStyle: () => ({}),
    withTiming: (value: number) => value,
    withSpring: (value: number) => value,
    withDelay: (_delay: number, value: number) => value,
    withRepeat: (value: number) => value,
    withSequence: (...values: number[]) => values[values.length - 1] ?? 0,
    cancelAnimation: noop,
    useReducedMotion: () => false,
  };
});
jest.mock('react-native-worklets', () => ({}));
// useMotionReduced 读取偏好；这里给一个稳定的假 store，避免测试依赖 SQLite
jest.mock('@/stores/prefsStore', () => ({
  usePrefs: (selector: (state: { devReduceMotion: boolean }) => unknown) => selector({ devReduceMotion: false }),
}));
/* eslint-enable @typescript-eslint/no-require-imports */

const MODES = ['static', 'idle', 'celebrate'] as const;

describe('72 枚徽章的视觉目录', () => {
  it('每枚徽章都有稳定、非空且唯一的图案', () => {
    expect(Object.keys(BADGE_MOTIFS)).toHaveLength(72);
    expect(new Set(Object.values(BADGE_MOTIFS)).size).toBe(72);
    ACHIEVEMENTS.forEach(({ id, key }) => {
      expect(BADGE_MOTIFS[id]).toBe(key);
      expect(BADGE_MOTIFS[id]).toMatch(/^[a-z][a-z0-9_]*$/);
      expect(badgeArtwork(id).shapes.length).toBeGreaterThanOrEqual(3);
    });
    expect(new Set(ACHIEVEMENTS.map(({ id }) => badgeArtwork(id).signature)).size).toBe(72);
    ACHIEVEMENTS.filter(({ id }) => id !== 'A02').forEach(({ id }) => {
      expect(badgeArtwork(id).signature).not.toBe(badgeArtwork('A02').signature);
    });
  });

  it.each(MODES)('%s 模式下，72 枚徽章都能映射到底座和等级', (mode) => {
    expect(MODES.map(() => ACHIEVEMENTS.map((badge) => badgeVisual(badge.id, mode)))).toHaveLength(3);
    ACHIEVEMENTS.forEach((badge) => {
      const visual = badgeVisual(badge.id, mode);
      expect(visual.motif).toBe(BADGE_MOTIFS[badge.id]);
      expect(visual.base).toBe(SERIES.find(({ id }) => id === badge.series)?.base);
      expect(visual.tier).toBe(badge.tier);
      expect(visual.colors).toEqual(BADGE_TIER_COLORS[badge.tier]);
      expect(visual.locked).toBe(false);
    });
  });

  it('未知编号不会悄悄变成第一朵花', () => {
    expect(() => badgeVisual('A00', 'static')).toThrow('未知徽章');
    expect(() => badgeVisual('A73', 'static')).toThrow('未知徽章');
  });

  it('编号和技术方案里的稳定键名都可使用', () => {
    expect(badgeVisual('streak_7').motif).toBe('streak_7');
    expect(badgeVisual('first_project').base).toBe('sticker');
    expect(badgeVisual('streak_7').tier).toBe('floret');
  });
});

describe('底座、等级与路径数字', () => {
  it('12 个系列各自映射到 12 种不同底座', () => {
    expect(SERIES).toHaveLength(12);
    expect(new Set(ACHIEVEMENTS.map(({ id }) => badgeVisual(id, 'static').base)).size).toBe(12);
    expect(Object.keys(BADGE_BASE_PATHS).sort()).toEqual(SERIES.map(({ base }) => base).sort());
    SERIES.forEach(({ base }) => {
      expect(BADGE_BASE_PATHS[base].path).toMatch(/^M.+Z$/);
      expect(BADGE_BASE_PATHS[base].ribbon).toBe(true);
    });
  });

  it('四档等级都有主色、深色、浅色和固定墨线', () => {
    expect(Object.keys(BADGE_TIER_COLORS)).toEqual(['bud', 'floret', 'bloom', 'rainbow']);
    Object.values(BADGE_TIER_COLORS).forEach((tier) => {
      expect(tier.primary).toMatch(/^#[\dA-F]{6}$/);
      expect(tier.deep).toMatch(/^#[\dA-F]{6}$/);
      expect(tier.soft).toMatch(/^#[\dA-F]{6}$/);
      expect(tier.ink).toBe(BADGE_PALETTE.ink);
    });
    expect(BADGE_PALETTE.lockedBase).toBe(BADGE_PALETTE.ink100);
    expect(BADGE_PALETTE.lockedMotif).toBe(BADGE_PALETTE.ink200);
    expect(Object.keys(BADGE_PALETTE)).not.toContain('bud');
    expect(Object.keys(BADGE_PALETTE)).not.toContain('floret');
    expect(Object.keys(BADGE_PALETTE)).not.toContain('bloom');
    expect(Object.keys(BADGE_PALETTE)).not.toContain('rainbow');
  });

  it('0–9 都由路径绘制，不能退回文本字形', () => {
    expect(Object.keys(BADGE_DIGIT_PATHS).sort()).toEqual(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);
    Object.values(BADGE_DIGIT_PATHS).forEach((path) => {
      expect(path.length).toBeGreaterThan(10);
      expect(path).toMatch(/^M/);
    });
  });

  it('数字徽章带有与条件对应的 SVG 路径', () => {
    expect(badgeVisual('A12', 'static').digits).toBe('10');
    expect(badgeVisual('A34', 'static').digits).toBe('50');
    expect(badgeVisual('A69', 'static').digits).toBe('520');
    expect(badgeVisual('A02', 'static').digits).toBeUndefined();
    expect(badgeArtwork('A12').shapes.some((shape) => shape.kind === 'digits' && shape.value === '10')).toBe(true);
    expect(badgeArtwork('A34').shapes.some((shape) => shape.kind === 'digits' && shape.value === '50')).toBe(true);
    expect(badgeArtwork('A69').shapes.some((shape) => shape.kind === 'digits' && shape.value === '520')).toBe(true);
  });

  it('七种分层动效都有纯数据预设', () => {
    expect(Object.keys(BADGE_MOTION_PRESETS).sort()).toEqual([
      'outlineDraw',
      'petalBloom',
      'popIn',
      'rainbowRing',
      'raysRotate',
      'shineSweep',
      'starsTwinkle',
    ]);
    expect(badgeMotion('static')).toEqual({ enter: 'none', idle: false, celebrate: false, reducedFade: false });
    expect(badgeMotion('idle')).toMatchObject({ enter: 'none', idle: true });
    expect(badgeMotion('celebrate')).toMatchObject({ enter: 'popIn', idle: true, celebrate: true });
  });
});

describe('未获得和隐藏状态', () => {
  it('普通未获得仍使用真实图案的墨色剪影', () => {
    const visual = badgeVisual('A02', 'static', { locked: true });
    expect(visual.locked).toBe(true);
    expect(visual.motif).toBe('first_checkin');
    expect(visual.obscured).toBe(false);
    expect(visual.colors).toEqual(BADGE_PALETTE.locked);
  });

  it('隐藏未获得固定使用礼盒问号，已获得后恢复真实图案', () => {
    const locked = badgeVisual('A68', 'static', { locked: true });
    expect(locked.hidden).toBe(true);
    expect(locked.obscured).toBe(true);
    expect(locked.motif).toBe('mystery_gift');
    expect(badgeVisual('A68', 'idle').motif).toBe('new_year');
  });

  it('显式 hidden 也遮蔽图案；显式 false 不覆盖目录中的隐藏定义', () => {
    expect(badgeVisual('A02', 'static', { locked: true, hidden: true }).motif).toBe('mystery_gift');
    expect(badgeVisual('A02', 'static', { hidden: true }).motif).toBe('mystery_gift');
    expect(badgeVisual('A68', 'static', { locked: true, hidden: false }).motif).toBe('mystery_gift');
  });

  it('隐藏未获得在 idle 和 celebrate 下也不泄露真实图案', () => {
    ACHIEVEMENTS.filter(({ hidden }) => hidden).forEach(({ id }) => {
      MODES.forEach((mode) => {
        expect(badgeVisual(id, mode, { locked: true }).motif).toBe('mystery_gift');
      });
    });
  });
});

describe('Badge 组件', () => {
  it('对外提供主题无关的 Badge 组件', () => {
    expect(Badge).toEqual(expect.any(Function));
    expect(Badge.length).toBeLessThanOrEqual(1);
  });

  it('72 枚图案组件齐全，且每枚的渲染结构不同', () => {
    const keys = ACHIEVEMENTS.map(({ key }) => key);
    expect(Object.keys(BADGE_MOTIF_COMPONENTS).sort()).toEqual([...keys, 'mystery_gift'].sort());
    const palette = { color: '#FFB088', deep: '#EE8A5E', ink: '#3F2A33', soft: '#FFEDE2' };
    const fingerprints = new Set<string>();
    keys.forEach((key) => {
      const Component = BADGE_MOTIF_COMPONENTS[key];
      expect(typeof Component).toBe('function');
      const tree = Component(palette);
      // 图案组件是纯函数，直接调用即可拿到元素树；不同图案的坐标/元素组合必须不同
      const fingerprint = JSON.stringify(tree);
      expect(fingerprint.length).toBeGreaterThan(80);
      fingerprints.add(fingerprint);
    });
    expect(fingerprints.size).toBe(72);
  });

  it('未知图案不存在，未获得不显示真实图案时用礼盒问号', () => {
    expect(BADGE_MOTIF_COMPONENTS.not_a_badge).toBeUndefined();
    expect(badgeVisual('A68', 'static', { locked: true }).motif).toBe('mystery_gift');
    expect(BADGE_MOTIF_COMPONENTS.mystery_gift).toEqual(expect.any(Function));
  });

  it('三种模式的动效开关正确：静态无待机，idle 不庆祝，celebrate 有弹入', () => {
    expect(badgeMotion('static')).toEqual({ enter: 'none', idle: false, celebrate: false, reducedFade: false });
    expect(badgeMotion('idle').idle).toBe(true);
    expect(badgeMotion('idle').celebrate).toBe(false);
    expect(badgeMotion('celebrate').enter).toBe('popIn');
    expect(badgeMotion('celebrate').celebrate).toBe(true);
  });
});
