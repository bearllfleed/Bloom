/**
 * 花朵三态（设计规范 7.4，签名元素）：小圆点 → 花苞 → 盛开。
 * 用在日历格、热力图完美日、小组件等所有表示"某一天完成情况"的地方。
 */
import Svg, { Circle, G, Path } from 'react-native-svg';

import type { FlowerMark as FlowerMarkKind } from '@/domain/stats';
import { useTheme } from '@/ui/theme/ThemeProvider';

const INK = '#3F2A33';
const LEMON = '#FFD66B';
const MINT = '#7EDCC2';
const BUD = '#FFC7DB';

/** 5 片花瓣的中心点（视图框 24×24，花心在 12,12） */
export const PETAL_CENTERS = [
  [12, 6.4],
  [17.33, 10.27],
  [15.29, 16.53],
  [8.71, 16.53],
  [6.67, 10.27],
] as const;

interface GlyphProps {
  size: number;
  petal: string;
  center?: string;
  /** 是否画可可色墨线（极小尺寸如加载动画里可以不画） */
  outlined?: boolean;
}

/** 盛开的花 */
export function FlowerGlyph({ size, petal, center = LEMON, outlined = false }: GlyphProps) {
  const stroke = outlined ? INK : 'none';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <G stroke={stroke} strokeWidth={1.4}>
        {PETAL_CENTERS.map(([cx, cy]) => (
          <Circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={4.6} fill={petal} />
        ))}
        <Circle cx={12} cy={12} r={3.2} fill={center} />
      </G>
    </Svg>
  );
}

/** 花苞 */
export function BudGlyph({ size, petal = BUD }: { size: number; petal?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <G stroke={INK} strokeWidth={1.4} strokeLinejoin="round" strokeLinecap="round">
        <Path d="M12 16.5V21" fill="none" />
        <Path d="M12 3.5C15.5 7 16.5 12 12 16.5 7.5 12 8.5 7 12 3.5Z" fill={petal} />
        <Path d="M12 16.5C9 17 6.5 15.5 5.5 12.5 8.5 12.5 11 14 12 16.5Z" fill={MINT} />
        <Path d="M12 16.5C15 17 17.5 15.5 18.5 12.5 15.5 12.5 13 14 12 16.5Z" fill={MINT} />
      </G>
    </Svg>
  );
}

export interface FlowerMarkProps {
  mark: FlowerMarkKind;
  size?: number;
  /** 盛开花瓣颜色；默认品牌莓果色，项目详情里传项目颜色 */
  color?: string;
}

export function FlowerMark({ mark, size = 14, color }: FlowerMarkProps) {
  const { colors } = useTheme();
  if (mark === 'none') return <Svg width={size} height={size} />;
  if (mark === 'dot') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Circle cx={12} cy={12} r={4.2} fill={colors.missedDot} />
      </Svg>
    );
  }
  if (mark === 'bud') return <BudGlyph size={size} />;
  return <FlowerGlyph size={size} petal={color ?? colors.accent} outlined />;
}
