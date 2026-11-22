/**
 * 间距、圆角、阴影、厚边（设计规范第 5 节）。所有尺寸都在 4px 网格上。
 */

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  giant: 48,
} as const;

/** 常用场景的间距 */
export const inset = {
  page: 16,
  card: 16,
  cardGap: 12,
  section: 24,
  iconText: 8,
  titleToContent: 12,
} as const;

export const radius = {
  card: 20,
  small: 12,
  input: 14,
  sheet: 28,
  badgeCell: 20,
  menu: 16,
  /** 胶囊：高度的一半，调用处按高度计算 */
  pill: (height: number) => height / 2,
} as const;

/** 内圆角 = 外圆角 − 内边距，最小 4 */
export function nestedRadius(outer: number, padding: number): number {
  return Math.max(4, outer - padding);
}

export const shadow = {
  raised: { offsetY: 2, blur: 8, opacity: 0.06 },
  lifted: { offsetY: 8, blur: 20, opacity: 0.1 },
  overlay: { offsetY: 16, blur: 40, opacity: 0.16 },
} as const;

/** 糖果按键厚边 */
export const edge = {
  height: 4,
  pressedHeight: 1,
  /** 按下时整体下沉的距离 */
  pressDepth: 3,
} as const;

export const hitTarget = 44;
