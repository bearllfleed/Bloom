/**
 * 徽章数字字形：0–9 的圆头矢量路径（设计规范 7.3）。
 * 单个字形画板为 16×24，起点在左上方，拼接时由 BadgeDigits 统一缩放，不依赖字体或 SVG 文本。
 */
import { G, Path } from 'react-native-svg';

export const BADGE_DIGIT_PATHS: Readonly<Record<string, string>> = {
  '0': 'M8 2C3 2 2 7 2 12C2 18 4 22 8 22C12 22 14 18 14 12C14 6 13 2 8 2ZM8 6C10 6 10 9 10 12C10 16 10 18 8 18C6 18 6 16 6 12C6 8 6 6 8 6Z',
  '1': 'M3 7L9 2V22M3 22H14',
  '2': 'M2 7C2 1 14 0 14 7C14 11 9 13 3 20H14',
  '3': 'M2 4C8 0 14 2 14 7C14 10 11 12 7 12C12 12 15 14 14 18C13 23 6 24 2 20',
  '4': 'M11 22V2L2 16H15M6 16L11 8',
  '5': 'M14 3H4L3 11C7 8 14 10 14 16C14 23 6 24 2 20',
  '6': 'M13 3C6 1 2 8 2 15C2 24 14 25 14 16C14 9 5 8 2 14',
  '7': 'M2 3H15L5 22M8 12H13',
  '8': 'M8 11C0 9 1 1 8 2C15 1 16 9 8 11ZM8 11C0 13 0 23 8 22C16 23 16 13 8 11Z',
  '9': 'M3 21C10 23 14 16 14 9C14 0 2 0 2 8C2 15 11 16 14 10',
};

/**
 * 路径数字：把 0–9 的 16×24 字形按顺序排成一行，居中放在 200×200 画板的指定区域。
 * 只用 Path，不依赖字体；字色随等级墨线，未获得时与剪影同色。
 */
export interface BadgeDigitsProps {
  value: string;
  color: string;
  /** 数字行的中心与字号 */
  cx?: number;
  cy?: number;
  size?: number;
  gap?: number;
}

const GLYPH_W = 16;
const GLYPH_H = 24;

/** 逐位等比缩放并水平居中；超出画板的部分由底座自然遮住 */
export function BadgeDigits({ value, color, cx = 100, cy = 104, size = 22, gap = 2 }: BadgeDigitsProps) {
  const glyphs = value.split('').filter(Boolean);
  if (glyphs.length === 0) return null;
  const scale = size / GLYPH_H;
  const advance = GLYPH_W * scale + gap;
  const totalWidth = advance * glyphs.length - gap;
  const startX = cx - totalWidth / 2;
  return (
    <G fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      {glyphs.map((digit, i) => {
        const d = BADGE_DIGIT_PATHS[digit];
        if (!d) return null;
        const x = startX + i * advance;
        const y = cy - (GLYPH_H * scale) / 2;
        return <Path key={`${digit}-${i}`} d={d} transform={`translate(${x} ${y}) scale(${scale})`} />;
      })}
    </G>
  );
}
