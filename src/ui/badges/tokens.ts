/**
 * 徽章的语义色板、等级配色与动效预设（设计规范 3、7.3、9）。
 * 徽章和贴纸在深浅色外观下保持原色，因此这里集中引用原始 palette，组件不散落色值。
 * 本文件是纯数据，不依赖 React、主题或原生模块，测试可直接引用。
 */
import type { BadgeTier } from '@/domain/achievement/catalog';
import { accent, berry, ink, paper, semantic } from '@/ui/tokens/palette';
import { projectColors } from '@/ui/tokens/projectColors';

export type BadgeMode = 'static' | 'idle' | 'celebrate';

export interface BadgeTierColors {
  /** 底座与图案的主色 */
  primary: string;
  /** 厚边与图案深色 */
  deep: string;
  /** 底座的浅色内芯 */
  soft: string;
  /** 固定的可可色墨线 */
  ink: string;
}

/** 蜜桃铜、薄荷银、柠檬金与多彩四个等级（设计规范 7.3） */
export const BADGE_TIER_COLORS: Record<BadgeTier, BadgeTierColors> = {
  bud: {
    primary: projectColors.peach.base,
    deep: projectColors.peach.deep,
    soft: projectColors.peach.tint,
    ink: ink[900],
  },
  floret: {
    primary: projectColors.mint.base,
    deep: projectColors.mint.deep,
    soft: projectColors.mint.tint,
    ink: ink[900],
  },
  bloom: {
    primary: projectColors.lemon.base,
    deep: projectColors.lemon.deep,
    soft: projectColors.lemon.tint,
    ink: ink[900],
  },
  rainbow: {
    primary: berry[500],
    deep: berry[600],
    soft: berry[100],
    ink: ink[900],
  },
};

/** 未获得：底座填墨 100、图案墨 200（设计规范 3-5） */
export const BADGE_LOCKED_COLORS: BadgeTierColors = {
  primary: ink[100],
  deep: ink[200],
  soft: ink[100],
  ink: ink[200],
};

/** 徽章共用语义色；只在本目录内引用 */
export const BADGE_PALETTE = {
  ink: ink[900],
  ink600: ink[600],
  ink200: ink[200],
  ink100: ink[100],
  paper: paper.base,
  white: paper.card,
  berry: berry[500],
  berryDeep: berry[600],
  berrySoft: berry[100],
  lemon: accent.lemon,
  mint: accent.mint,
  soda: accent.soda,
  grape: accent.grape,
  milktea: projectColors.milktea.base,
  success: semantic.success.graphic,
  lockedBase: ink[100],
  lockedMotif: ink[200],
  locked: BADGE_LOCKED_COLORS,
} as const;

/** 七种分层动效的纯数据预设（徽章弹窗 M19、详情 M21） */
export const BADGE_MOTION_PRESETS = {
  /** 徽章从 0 弹到 1.15 再回到 1，同时转正 */
  popIn: {
    scale: [0, 1.15, 1],
    rotate: [-15, 0],
    duration: 520,
    easing: 'bouncy',
  },
  /** 光芒淡入后慢转，12 秒一圈 */
  raysRotate: {
    fadeDuration: 240,
    loopDuration: 12_000,
    direction: 'clockwise',
  },
  /** 星星依次闪烁 */
  starsTwinkle: {
    loopDuration: 12_000,
    cycles: 3,
    delay: 100,
    opacity: [0.35, 1],
  },
  /** 高光从左上到右下扫过一次 */
  shineSweep: {
    duration: 600,
    from: [-0.2, -0.2],
    to: [1.2, 1.2],
  },
  /** 花瓣彩纸从徽章中心喷出 */
  petalBloom: {
    count: 40,
    duration: 1400,
    radius: 120,
  },
  /** 彩虹花额外画出外圈彩虹环 */
  rainbowRing: {
    duration: 600,
    strokeWidth: 3,
  },
  /** 缎带轮廓画出（补发卡与详情使用） */
  outlineDraw: {
    duration: 700,
    easing: 'enter',
  },
} as const;

/** 每种模式启用的动效预设；静态模式不启动任何循环 */
export function badgeMotion(mode: BadgeMode) {
  if (mode === 'static') {
    return { enter: 'none' as const, idle: false, celebrate: false, reducedFade: false };
  }
  if (mode === 'idle') {
    return { enter: 'none' as const, idle: true, celebrate: false, reducedFade: false };
  }
  return { enter: 'popIn' as const, idle: true, celebrate: true, reducedFade: true };
}

/** 全部待机与庆祝节奏，避免组件内散落魔法时长 */
export const BADGE_MOTION = {
  rayTurnMs: BADGE_MOTION_PRESETS.raysRotate.loopDuration,
  starTwinkleMs: 2_400,
  rayFadeMs: BADGE_MOTION_PRESETS.raysRotate.fadeDuration,
  starDelayMs: BADGE_MOTION_PRESETS.starsTwinkle.delay,
  celebrateDelayMs: 250,
  celebratePopMs: BADGE_MOTION_PRESETS.popIn.duration,
} as const;
