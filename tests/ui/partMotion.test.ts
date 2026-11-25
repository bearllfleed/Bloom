import { IDLE_LOOP_MS, idlePose, MOTION_CYCLES, partMotion } from '@/ui/icons/partMotion';

const samples = Array.from({ length: 97 }, (_, i) => i / 96);
const names = [
  'leaf-left',
  'leaf-right',
  'sparkle-a',
  'sparkle-b',
  'wave',
  'bubbles',
  'lemon',
  'star',
  'flame',
  'cloud-left',
];

describe('partMotion', () => {
  it('按名字前缀选动作，其余部件轻摆', () => {
    expect(partMotion('leaf-left', 0).kind).toBe('sway');
    expect(partMotion('sparkle-b', 2).kind).toBe('twinkle');
    expect(partMotion('wave', 0).kind).toBe('drift');
    expect(partMotion('bubbles', 0).kind).toBe('float');
    expect(partMotion('lemon', 0).kind).toBe('wobble');
    expect(partMotion('flame', 0).kind).toBe('twinkle');
    expect(partMotion('cloud-left', 0).kind).toBe('drift');
    expect(partMotion('drop', 0).kind).toBe('float');
    expect(partMotion('note-a', 0).kind).toBe('float');
    expect(partMotion('speed', 0).kind).toBe('drift');
    expect(partMotion('cursor', 0).kind).toBe('twinkle');
    expect(partMotion('steam', 0).kind).toBe('float');
    expect(partMotion('coin', 0).kind).toBe('float');
    expect(partMotion('wing-left', 0).kind).toBe('sway');
    expect(partMotion('fish', 0).kind).toBe('drift');
  });

  it('同一张图里的部件错开相位', () => {
    const phases = [0, 1, 2, 3, 4].map((i) => partMotion('leaf', i).phase.toFixed(3));
    expect(new Set(phases).size).toBe(phases.length);
  });
});

describe('idlePose', () => {
  it('幅度不超过设计规范 9.2 的上限', () => {
    names.forEach((name, i) => {
      const motion = partMotion(name, i);
      for (const t of samples) {
        const pose = idlePose(motion, t, 1);
        expect(Math.abs(pose.rotate ?? 0)).toBeLessThanOrEqual(8);
        expect(Math.hypot(pose.translateX ?? 0, pose.translateY ?? 0)).toBeLessThanOrEqual(2);
        expect(Math.abs((pose.scale ?? 1) - 1)).toBeLessThanOrEqual(0.04 + 1e-9);
        expect(pose.opacity).toBeGreaterThan(0.5);
        expect(pose.opacity).toBeLessThanOrEqual(1);
      }
    });
  });

  it('单次循环不短于 1.6 秒', () => {
    Object.values(MOTION_CYCLES).forEach((cycles) => expect(IDLE_LOOP_MS / cycles).toBeGreaterThanOrEqual(1600));
  });

  it('幅度为 0 时回到静止姿势', () => {
    names.forEach((name, i) => {
      const pose = idlePose(partMotion(name, i), 0.37, 0);
      expect(pose.rotate ?? 0).toBeCloseTo(0, 9);
      expect(pose.translateX ?? 0).toBeCloseTo(0, 9);
      expect(pose.translateY ?? 0).toBeCloseTo(0, 9);
      expect(pose.scale ?? 1).toBeCloseTo(1, 9);
      expect(pose.opacity).toBeCloseTo(1, 9);
    });
  });

  it('一圈首尾无缝', () => {
    names.forEach((name, i) => {
      const motion = partMotion(name, i);
      const start = idlePose(motion, 0, 1);
      const end = idlePose(motion, 1, 1);
      (['rotate', 'translateX', 'translateY', 'scale', 'opacity'] as const).forEach((key) =>
        expect(end[key] ?? 0).toBeCloseTo(start[key] ?? 0, 6),
      );
    });
  });
});
