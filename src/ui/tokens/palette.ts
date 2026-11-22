/**
 * 原始色板（设计规范第 3 节）。
 * 只在 tokens 内部使用；组件一律通过 colors.ts 的语义变量取色，以支持深色模式。
 */

export const ink = {
  900: '#3F2A33',
  600: '#7A6470',
  400: '#B3A2AA',
  200: '#E9DFE3',
  100: '#F5EEF1',
} as const;

export const paper = {
  base: '#FFF8F3',
  card: '#FFFFFF',
  sunken: '#FBF3EE',
} as const;

export const berry = {
  50: '#FFF2F7',
  100: '#FFE3EE',
  200: '#FFC7DB',
  300: '#FFA3C3',
  500: '#FF7BA9',
  600: '#F0588F',
  700: '#C93D72',
} as const;

export const accent = {
  lemon: '#FFD66B',
  mint: '#7EDCC2',
  soda: '#8FD0FF',
  grape: '#C6A2FF',
} as const;

export const semantic = {
  success: { graphic: '#2FB38E', text: '#1F8A6C' },
  warning: { graphic: '#F5A623', text: '#B8740A' },
  danger: { graphic: '#F2555A', text: '#C8333A' },
} as const;

/** 深色模式"夜晚花园"的原始色（设计规范 3.8） */
export const night = {
  base: '#211A1E',
  card: '#2C2328',
  sunken: '#261F23',
  text: '#F7EEF2',
  textSecondary: '#C9B8C0',
  textMuted: '#8C7A83',
  hairline: '#3D3238',
  weak: '#33292E',
  edge: '#1A1417',
} as const;
