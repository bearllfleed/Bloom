/**
 * 项目图标部件的待机动作（设计规范 9.2 第 3 条）。
 * 按 data-part 的名字选动作：叶子摆动、闪光闪烁、水波漂移、气泡浮动，其余部件轻摆。
 * 所有部件共用一条 0→1 的时钟（一圈 IDLE_LOOP_MS），每种动作在一圈里走整数个周期，首尾无缝；
 * 相位按部件在图标里的顺序错开，同一张图里的部件不同步。
 */
import type { PartTransform } from '@/ui/motion/matrix';

export const IDLE_LOOP_MS = 4800;

export type PartMotionKind = 'sway' | 'twinkle' | 'drift' | 'float' | 'wobble';

/** 每种动作在一圈时钟里走几个周期；单次循环 = IDLE_LOOP_MS / 周期数，规范要求 ≥ 1.6 秒 */
export const MOTION_CYCLES: Record<PartMotionKind, number> = {
  sway: 2,
  twinkle: 3,
  drift: 2,
  float: 1,
  wobble: 1,
};

const KIND_BY_PREFIX: readonly [string, PartMotionKind][] = [
  ['leaf', 'sway'],
  ['wing', 'sway'],
  ['sparkle', 'twinkle'],
  ['flame', 'twinkle'],
  ['cursor', 'twinkle'],
  ['wave', 'drift'],
  ['cloud', 'drift'],
  ['speed', 'drift'],
  ['fish', 'drift'],
  ['bubble', 'float'],
  ['drop', 'float'],
  ['note', 'float'],
  ['steam', 'float'],
  ['coin', 'float'],
];

export interface PartMotion {
  kind: PartMotionKind;
  /** 相位，以该动作自身的周期为单位，0–1 */
  phase: number;
}

export interface IdlePose extends PartTransform {
  opacity: number;
}

/** index 是部件在图标里的顺序（projectIconParts），用黄金分割错开相位 */
export function partMotion(name: string, index: number): PartMotion {
  const kind = KIND_BY_PREFIX.find(([prefix]) => name.startsWith(prefix))?.[1] ?? 'wobble';
  return { kind, phase: (index * 0.382) % 1 };
}

/** t 是时钟进度 0–1，amp 是整体幅度 0–1（停播时收到 0，回到静止姿势） */
export function idlePose(motion: PartMotion, t: number, amp: number): IdlePose {
  'worklet';
  const s = Math.sin(2 * Math.PI * (MOTION_CYCLES[motion.kind] * t + motion.phase));
  switch (motion.kind) {
    case 'sway':
      return { rotate: 6 * amp * s, opacity: 1 };
    case 'twinkle':
      return { scale: 1 + 0.04 * amp * s, opacity: 1 - (0.45 * amp * (1 - s)) / 2 };
    case 'drift':
      return { translateX: 1.5 * amp * s, opacity: 1 };
    case 'float':
      return { translateY: 1.5 * amp * s, opacity: 1 - (0.3 * amp * (1 - s)) / 2 };
    default:
      return { rotate: 3 * amp * s, opacity: 1 };
  }
}
