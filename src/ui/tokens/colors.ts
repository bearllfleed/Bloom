/**
 * 语义颜色：每个变量都有浅色、深色两个取值（设计规范 3.7、3.8）。
 * 组件只能用这里的语义名，不能直接写色值。
 */
import { berry, ink, night, paper, semantic } from './palette';

export type ColorScheme = 'light' | 'dark';

export interface SemanticColors {
  /** 全局背景（纸） */
  background: string;
  /** 背景点阵 */
  dot: string;
  card: string;
  sunken: string;
  /** 卡片底部厚边 */
  cardEdge: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  hairline: string;
  /** 弱底：未完成热力格、禁用底、分段控件底 */
  weak: string;
  /** 链接与强调文字 */
  link: string;
  /** 主按钮 */
  primary: string;
  primaryEdge: string;
  /** 主按钮上的文字：深浅模式都用可可色 */
  onPrimary: string;
  /** 次按钮厚边 */
  secondaryEdge: string;
  /** 选中日期、开关轨道等强调底色 */
  accent: string;
  accentSoft: string;
  accentSofter: string;
  focusRing: string;
  /** 撤销条 */
  toast: string;
  onToast: string;
  toastAction: string;
  /** 弹层遮罩 */
  scrim: string;
  success: string;
  successText: string;
  warning: string;
  warningText: string;
  danger: string;
  dangerText: string;
  /** 小圆点（有计划但没完成的过去日期） */
  missedDot: string;
  /** 卡片阴影色 */
  shadow: string;
}

const light: SemanticColors = {
  background: paper.base,
  dot: 'rgba(63,42,51,0.04)',
  card: paper.card,
  sunken: paper.sunken,
  cardEdge: '#EFE4E8',
  text: ink[900],
  textSecondary: ink[600],
  textMuted: ink[400],
  hairline: ink[200],
  weak: ink[100],
  link: berry[700],
  primary: berry[500],
  primaryEdge: '#E0578C',
  onPrimary: ink[900],
  secondaryEdge: '#EADDE2',
  accent: berry[500],
  accentSoft: berry[100],
  accentSofter: berry[50],
  focusRing: berry[300],
  toast: 'rgba(63,42,51,0.92)',
  onToast: '#FFFFFF',
  toastAction: '#FFD66B',
  scrim: 'rgba(63,42,51,0.30)',
  success: semantic.success.graphic,
  successText: semantic.success.text,
  warning: semantic.warning.graphic,
  warningText: semantic.warning.text,
  danger: semantic.danger.graphic,
  dangerText: semantic.danger.text,
  missedDot: ink[200],
  shadow: '#3F2A33',
};

const dark: SemanticColors = {
  background: night.base,
  dot: 'rgba(255,255,255,0.06)',
  card: night.card,
  sunken: night.sunken,
  cardEdge: night.edge,
  text: night.text,
  textSecondary: night.textSecondary,
  textMuted: night.textMuted,
  hairline: night.hairline,
  weak: night.weak,
  link: berry[300],
  primary: berry[500],
  primaryEdge: '#E0578C',
  onPrimary: ink[900],
  secondaryEdge: night.edge,
  accent: berry[500],
  accentSoft: '#5A3445',
  accentSofter: '#3A2A31',
  focusRing: berry[300],
  toast: night.text,
  onToast: ink[900],
  toastAction: berry[700],
  scrim: 'rgba(0,0,0,0.60)',
  success: semantic.success.graphic,
  successText: '#7EDCC2',
  warning: semantic.warning.graphic,
  warningText: '#FFD66B',
  danger: semantic.danger.graphic,
  dangerText: '#FF9A9D',
  missedDot: night.hairline,
  shadow: '#000000',
};

export const colorSchemes: Record<ColorScheme, SemanticColors> = { light, dark };

/** 热力 0–4 级（设计规范 3.6、3.8） */
export const heatColors: Record<ColorScheme, readonly [string, string, string, string, string]> = {
  light: ['#F5EEF1', '#FFD9E7', '#FFB3CF', '#FF8DB6', '#F0588F'],
  dark: ['#33292E', '#5A3445', '#8A3F5F', '#C24F7E', '#FF7BA9'],
};
