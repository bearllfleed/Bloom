/**
 * 动效参数（设计规范 9.1）。所有动画只从这里取时长、缓动与弹簧参数。
 */

export const duration = {
  /** 按下 */
  instant: 80,
  /** 颜色与状态 */
  fast: 140,
  /** 面板、切换 */
  base: 240,
  /** 进入 */
  slow: 360,
  /** 花苞绽放 */
  bloom: 520,
  /** 减弱动态时的统一淡入淡出 */
  reduced: 160,
} as const;

/** 三次贝塞尔控制点，交给 Reanimated 的 Easing.bezier 使用 */
export const easing = {
  standard: [0.2, 0.8, 0.2, 1],
  enter: [0, 0, 0.2, 1],
  exit: [0.4, 0, 1, 1],
} as const;

export const spring = {
  /** 按压 */
  press: { damping: 18, stiffness: 420, mass: 0.6 },
  /** 弹跳 */
  bouncy: { damping: 11, stiffness: 260, mass: 1 },
  /** 柔和 */
  gentle: { damping: 20, stiffness: 180, mass: 1 },
} as const;

/** 页面进入：淡入上移的距离与子元素间隔 */
export const enter = {
  distance: 8,
  stagger: 40,
  maxItems: 6,
} as const;
