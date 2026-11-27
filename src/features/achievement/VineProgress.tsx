/**
 * 花藤进度（设计规范 7.1）：一条细藤、随收集进度长出的叶子和终点花苞。
 * 纯静态 SVG；只在进度变化时重绘，不参与循环动画。
 */
import Svg, { G, Path } from 'react-native-svg';

import { BADGE_PALETTE } from '@/ui/badges';

export interface VineProgressProps {
  ratio: number;
  width: number;
  height?: number;
}

const LEAVES = 12;
const STEM = 'M4 20 C 40 4, 80 30, 120 14 S 200 26, 236 12';
/** 叶子沿茎的近似位置（百分比） */
const LEAF_T = [0.08, 0.16, 0.25, 0.34, 0.42, 0.51, 0.6, 0.69, 0.78, 0.87, 0.94];

export function VineProgress({ ratio, width, height = 28 }: VineProgressProps) {
  const clamped = Math.max(0, Math.min(1, ratio));
  const grown = Math.round(clamped * LEAVES);
  const budOpen = clamped >= 0.999;
  return (
    <Svg width={width} height={height} viewBox={`0 0 240 ${height}`} accessibilityElementsHidden>
      <G>
        <Path d={STEM} fill="none" stroke={BADGE_PALETTE.mint} strokeWidth={2.4} strokeLinecap="round" />
        {Array.from({ length: grown }, (_, i) => {
          const t = LEAF_T[Math.min(i, LEAF_T.length - 1)];
          const x = 4 + t * 232;
          // 叶片左右交替，沿茎的近似高度
          const y = 17 - Math.sin(t * Math.PI * 2.2) * 5;
          const dir = i % 2 === 0 ? -1 : 1;
          return (
            <Path
              key={i}
              d={`M${x} ${y} C ${x + dir * 6} ${y - 7}, ${x + dir * 12} ${y - 2}, ${x + dir * 4} ${y + 2} Z`}
              fill={i < grown - 1 ? BADGE_PALETTE.mint : BADGE_PALETTE.success}
            />
          );
        })}
        <Path
          d={
            budOpen
              ? 'M232 12 C 226 2, 240 0, 238 10 C 242 4, 250 10, 242 16 Z'
              : 'M236 18 C 230 12, 234 4, 240 8 C 242 12, 240 16, 236 18 Z'
          }
          fill={budOpen ? BADGE_PALETTE.berry : BADGE_PALETTE.ink200}
          stroke={BADGE_PALETTE.ink}
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  );
}
