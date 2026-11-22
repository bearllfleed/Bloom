/**
 * 项目卡片 12 种颜色（设计规范 3.5）。
 * 彩色块上的文字一律用可可色 #3F2A33，深浅模式相同。
 */

export const PROJECT_COLOR_IDS = [
  'strawberry',
  'cherry',
  'peach',
  'lemon',
  'matcha',
  'mint',
  'soda',
  'blueberry',
  'grape',
  'taro',
  'milktea',
  'cloud',
] as const;

export type ProjectColorId = (typeof PROJECT_COLOR_IDS)[number];

export interface ProjectColor {
  name: string;
  /** 卡片头部色块、盛开花瓣 */
  base: string;
  /** 厚边、进度、分段环 */
  deep: string;
  /** 完成后的卡片底（浅色模式）；深色模式用 base 的 18% 叠加 */
  tint: string;
}

export const projectColors: Record<ProjectColorId, ProjectColor> = {
  strawberry: { name: '草莓', base: '#FF8FB8', deep: '#E8669A', tint: '#FFE6F0' },
  cherry: { name: '樱桃', base: '#FF8A8A', deep: '#E86464', tint: '#FFE5E3' },
  peach: { name: '蜜桃', base: '#FFB088', deep: '#EE8A5E', tint: '#FFEDE2' },
  lemon: { name: '柠檬', base: '#FFD66B', deep: '#EBB53B', tint: '#FFF6D9' },
  matcha: { name: '抹茶', base: '#A8DB7E', deep: '#7FBF52', tint: '#EEF8E2' },
  mint: { name: '薄荷', base: '#7EDCC2', deep: '#4DBF9F', tint: '#E1F7F0' },
  soda: { name: '汽水', base: '#8FD0FF', deep: '#5DAFEA', tint: '#E3F3FF' },
  blueberry: { name: '蓝莓', base: '#A3ADFF', deep: '#7A86EE', tint: '#E9EBFF' },
  grape: { name: '葡萄', base: '#C6A2FF', deep: '#A27BEA', tint: '#F2EAFF' },
  taro: { name: '芋泥', base: '#E2B8F0', deep: '#C690DA', tint: '#F8EDFC' },
  milktea: { name: '奶茶', base: '#D8B79A', deep: '#B99273', tint: '#F6EDE4' },
  cloud: { name: '云朵', base: '#C9C3D6', deep: '#A49DB4', tint: '#F1EFF5' },
};

/** 彩色块上的文字色 */
export const ON_PROJECT_COLOR = '#3F2A33';
