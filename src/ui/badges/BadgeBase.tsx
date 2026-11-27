/**
 * 徽章底座绘制（设计规范 7.3）：外底座 + 主色内芯 + 浅色内圈 + 底部缎带。
 * 未获得时用墨色剪影：底座填墨 100、图案墨 200，不显示缎带高光。
 */
import { Circle, G, Path } from 'react-native-svg';

import type { BadgeBase as BadgeBaseId } from '@/domain/achievement/catalog';

import { BADGE_PALETTE, BADGE_RIBBON_PATHS, badgeBasePaths, type BadgeTierColors } from './visual';

export interface BadgeBaseProps {
  base: BadgeBaseId;
  colors: BadgeTierColors;
  /** 未获得：只保留墨色块，不再叠缎带 */
  silhouette?: boolean;
}

export function BadgeBase({ base, colors, silhouette = false }: BadgeBaseProps) {
  const shape = badgeBasePaths(base);
  return (
    <G>
      <Path d={shape.path} fill={colors.primary} stroke={colors.ink} strokeWidth={3.2} strokeLinejoin="round" />
      <Path d={shape.face} fill={colors.soft} stroke={colors.deep} strokeWidth={1.6} strokeLinejoin="round" />
      {shape.inner ? <Path d={shape.inner} fill="none" stroke={colors.deep} strokeWidth={1.4} opacity={0.7} /> : null}
      {!silhouette && shape.ribbon ? <BadgeRibbon color={colors.deep} ink={colors.ink} /> : null}
    </G>
  );
}

/** 底部缎带：主带与两条飘带，颜色跟随等级深色 */
function BadgeRibbon({ color, ink }: { color: string; ink: string }) {
  return (
    <G stroke={ink} strokeWidth={2} strokeLinejoin="round">
      <Path d={BADGE_RIBBON_PATHS.tailLeft} fill={color} />
      <Path d={BADGE_RIBBON_PATHS.tailRight} fill={color} />
      <Path d={BADGE_RIBBON_PATHS.band} fill={color} />
      <Circle cx={100} cy={143} r={4} fill={BADGE_PALETTE.lemon} stroke={ink} strokeWidth={1.6} />
    </G>
  );
}
