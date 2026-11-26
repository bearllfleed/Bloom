/**
 * 徽章引擎出口：底座、图案、配色、数字、分层与动效预设（第 3 期 3-2）。
 * 外部只需要 Badge 组件与纯数据目录；其余分层组件供开发陈列与测试复用。
 */
export { Badge, type BadgeProps } from './Badge';
export { BadgeBase, type BadgeBaseProps } from './BadgeBase';
export { BadgeDigits, BADGE_DIGIT_PATHS, type BadgeDigitsProps } from './BadgeDigits';
export { BadgeMotif, BADGE_MOTIF_COMPONENTS, type BadgeMotifLayerProps, type BadgeMotifProps } from './motifs';
export {
  BADGE_LOCKED_COLORS,
  BADGE_MOTION,
  BADGE_MOTION_PRESETS,
  BADGE_PALETTE,
  BADGE_TIER_COLORS,
  badgeMotion,
  type BadgeMode,
  type BadgeTierColors,
} from './tokens';
export {
  BADGE_BASE_PATHS,
  BADGE_MOTIFS,
  badgeArtwork,
  badgeBasePaths,
  badgeRemainingText,
  badgeVisual,
  splitDigits,
  type BadgeShape,
  type BadgeVisual,
  type BadgeVisualOptions,
} from './visual';
