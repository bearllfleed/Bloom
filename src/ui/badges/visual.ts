/**
 * 徽章视觉目录：把 72 枚成就映射到图案、底座、等级、数字和可见性。
 * 这里只有纯数据，不依赖 React 或主题，测试和组件共用同一套判断。
 */
import {
  achievementById,
  ACHIEVEMENTS,
  type BadgeBase,
  type BadgeTier,
  type SeriesId,
} from '@/domain/achievement/catalog';

import { BADGE_DIGIT_PATHS } from './BadgeDigits';
import { BADGE_LOCKED_COLORS, BADGE_TIER_COLORS, type BadgeMode, type BadgeTierColors } from './tokens';

export interface BadgeBaseShape {
  /** 底座外轮廓 */
  path: string;
  /** 主色内芯 */
  face: string;
  /** 浅色装饰内圈；空字符串表示不设内圈 */
  inner: string;
  /** 是否在底部叠放缎带与飘带 */
  ribbon: boolean;
}

export const BADGE_BASE_PATHS: Record<BadgeBase, BadgeBaseShape> = {
  sticker: {
    path: 'M100 16C118 16 126 30 140 32C164 34 178 49 176 72C194 88 194 111 178 127C177 151 160 167 138 166C123 185 100 189 81 174C57 178 38 165 35 142C14 129 12 105 24 85C17 61 30 40 53 35C65 18 82 14 100 16Z',
    face: 'M100 30C114 30 126 40 140 43C157 47 168 58 166 74C178 88 178 106 167 120C165 138 153 150 137 150C124 164 106 167 91 158C73 160 56 149 54 133C41 123 40 106 49 93C44 78 53 64 68 60C77 46 88 32 100 30Z',
    inner:
      'M100 44C112 44 123 53 135 56C148 59 155 67 154 79C162 90 162 103 155 113C153 125 145 133 134 133C123 144 109 146 98 139C84 140 71 132 70 120C61 112 61 99 67 90C64 79 70 69 81 66C88 56 95 46 100 44Z',
    ribbon: true,
  },
  wreath: {
    path: 'M100 22C112 8 131 18 133 35C153 25 170 38 165 57C187 60 192 80 179 94C195 109 187 129 169 132C174 153 155 168 137 158C128 180 105 185 92 168C72 181 52 168 52 148C29 148 19 127 32 111C13 98 19 75 39 70C33 49 50 33 69 40C74 20 91 13 100 22Z',
    face: 'M100 32C109 21 122 27 123 41C139 33 153 41 149 56C166 59 171 74 162 85C174 96 169 111 155 114C159 130 146 141 132 135C125 151 110 156 99 144C84 155 69 146 69 131C52 131 44 116 53 104C39 95 43 79 57 75C53 60 64 48 79 52C83 38 94 31 100 32Z',
    inner: 'M100 52C126 52 147 72 147 98C147 124 126 145 100 145C74 145 53 124 53 98C53 72 74 52 100 52Z',
    ribbon: true,
  },
  calendar: {
    path: 'M43 27H157C173 27 183 38 183 54V147C183 166 170 178 152 178H48C30 178 17 166 17 147V54C17 38 27 27 43 27Z',
    face: 'M43 38H157C167 38 173 45 173 56V143C173 156 166 165 152 165H48C34 165 27 156 27 143V56C27 45 33 38 43 38Z',
    inner: 'M36 70H164V140C164 151 158 156 147 156H53C42 156 36 151 36 140Z',
    ribbon: true,
  },
  star: {
    path: 'M100 13L122 52L165 43L158 86L190 111L157 134L161 176L119 166L96 196L70 165L28 172L37 130L10 102L45 82L45 39L86 49Z',
    face: 'M100 30L118 61L151 54L145 86L169 105L142 122L146 155L115 147L98 172L77 148L45 153L52 122L31 102L57 86L57 55L89 63Z',
    inner: 'M100 55L115 77L141 82L124 103L127 130L101 121L77 132L78 105L59 86L85 79Z',
    ribbon: true,
  },
  ribbon: {
    path: 'M47 24H153L174 45V122L153 145L165 181L127 167L100 187L73 167L35 181L47 145L26 122V45Z',
    face: 'M50 33H150L165 48V120L147 140L157 170L124 158L100 174L76 158L43 170L53 140L35 120V48Z',
    inner: 'M53 38H147L151 43V114L136 130H64L49 114V43Z',
    ribbon: true,
  },
  heart: {
    path: 'M100 181C81 165 25 132 18 86C10 42 60 14 91 43L100 52L109 43C140 14 190 42 182 86C175 132 119 165 100 181Z',
    face: 'M100 166C83 152 35 125 29 85C23 51 61 28 88 52L100 64L112 52C139 28 177 51 171 85C165 125 117 152 100 166Z',
    inner: 'M100 147C82 133 45 110 40 81C36 56 63 41 82 58L100 75L118 58C137 41 164 56 160 81C155 110 118 133 100 147Z',
    ribbon: true,
  },
  clock: {
    path: 'M61 20L48 38C27 50 16 73 16 100C16 146 53 183 100 183C147 183 184 146 184 100C184 73 173 50 152 38L139 20L119 32C107 28 93 28 81 32Z',
    face: 'M63 31L54 45C36 56 27 76 27 100C27 141 59 173 100 173C141 173 173 141 173 100C173 76 164 56 146 45L137 31L117 42C106 38 94 38 83 42Z',
    inner: 'M100 48C129 48 152 71 152 100C152 129 129 152 100 152C71 152 48 129 48 100C48 71 71 48 100 48Z',
    ribbon: true,
  },
  hexWindow: {
    path: 'M65 17H135L178 60V132L132 181H68L22 132V60Z',
    face: 'M67 30H133L166 64V127L127 168H73L34 127V64Z',
    inner: 'M75 45H125L150 71V120L119 152H81L50 120V71Z',
    ribbon: true,
  },
  shield: {
    path: 'M100 15C123 31 146 37 174 38V98C174 140 146 166 100 187C54 166 26 140 26 98V38C54 37 77 31 100 15Z',
    face: 'M100 32C120 45 141 50 162 51V97C162 131 140 154 100 172C60 154 38 131 38 97V51C59 50 80 45 100 32Z',
    inner: 'M100 45C116 55 132 60 149 61V96C149 120 132 139 100 155C68 139 51 120 51 96V61C68 60 84 55 100 45Z',
    ribbon: true,
  },
  memo: {
    path: 'M34 22H145L178 55V176H34C23 176 16 168 16 157V41C16 30 23 22 34 22Z',
    face: 'M38 34H141L166 59V164H38C31 164 27 159 27 152V46C27 39 31 34 38 34Z',
    inner: 'M41 52H133L151 70V148H41Z',
    ribbon: true,
  },
  cloud: {
    path: 'M54 169C29 169 14 153 14 132C14 111 28 96 46 92C43 60 65 29 96 29C121 12 152 28 155 56C177 58 190 77 186 98C199 122 185 147 163 150C155 166 139 173 122 166C102 183 74 181 54 169Z',
    face: 'M55 156C38 156 26 145 26 131C26 115 37 105 53 102C50 75 70 44 98 44C119 29 142 43 145 65C163 66 174 80 171 98C181 116 171 135 155 138C149 150 137 154 125 151C107 164 84 164 63 155Z',
    inner:
      'M63 143C48 144 38 135 39 123C40 111 49 107 65 106C63 82 78 57 101 57C118 45 137 55 139 74C156 74 164 86 161 100C170 114 160 129 147 129C136 142 122 138 115 135C99 148 79 150 63 143Z',
    ribbon: true,
  },
  giftBox: {
    path: 'M31 61H169V170C169 182 160 190 148 190H52C40 190 31 182 31 170ZM23 40H177V76H23ZM100 40C75 40 55 30 58 16C61 4 87 14 100 40ZM100 40C125 40 145 30 142 16C139 4 113 14 100 40Z',
    face: 'M37 73H163V167C163 176 157 182 147 182H53C43 182 37 176 37 167ZM29 46H171V69H29ZM100 46C78 46 62 34 63 22C65 13 86 24 100 46ZM100 46C122 46 138 34 137 22C135 13 114 24 100 46Z',
    inner: 'M54 88H146V160H54Z',
    ribbon: true,
  },
};

/** 每枚成就的图案标识：直接采用领域层的稳定 key，避免第二份清单漂移 */
export const BADGE_MOTIFS: Readonly<Record<string, string>> = Object.fromEntries(
  ACHIEVEMENTS.map(({ id, key }) => [id, key]),
);

export { BADGE_MOTION, BADGE_MOTION_PRESETS, BADGE_PALETTE, badgeMotion } from './tokens';
export type { BadgeMode, BadgeTierColors } from './tokens';

export interface BadgeVisualOptions {
  /** 未获得时使用剪影；默认已获得 */
  locked?: boolean;
  /** 强制隐藏图案；目录内的隐藏徽章传 false 也不会泄露 */
  hidden?: boolean;
}

export interface BadgeVisual {
  id: string;
  key: string;
  base: BadgeBase;
  series: SeriesId;
  tier: BadgeTier;
  motif: string;
  colors: BadgeTierColors;
  locked: boolean;
  hidden: boolean;
  obscured: boolean;
  mode: BadgeMode;
  /** 只有附录 A 明确要求数字的徽章才有路径数字 */
  digits?: string;
}

/** 系列与底座一一对应，徽章图形由底座决定外轮廓 */
const BASE_BY_SERIES: Record<SeriesId, BadgeBase> = {
  S1: 'sticker',
  S2: 'wreath',
  S3: 'calendar',
  S4: 'star',
  S5: 'ribbon',
  S6: 'heart',
  S7: 'clock',
  S8: 'hexWindow',
  S9: 'shield',
  S10: 'memo',
  S11: 'cloud',
  S12: 'giftBox',
};

/** 只有这三枚在设计中写着"数字" */
const DIGITS_BY_ID: Readonly<Record<string, string>> = {
  A12: '10',
  A34: '50',
  A69: '520',
};

/** 把所有成就编号与其稳定 key 都指向同一份定义 */
const BY_ANY_KEY = new Map<string, (typeof ACHIEVEMENTS)[number]>(
  ACHIEVEMENTS.flatMap((badge) => [[badge.id, badge] as const, [badge.key, badge] as const]),
);

function findBadge(idOrKey: string) {
  return BY_ANY_KEY.get(idOrKey) ?? achievementById(idOrKey);
}

/** 将成就编号/稳定 key 解析成底座、配色、图案和可见性 */
export function badgeVisual(
  idOrKey: string,
  mode: BadgeMode = 'static',
  options: BadgeVisualOptions = {},
): BadgeVisual {
  const badge = findBadge(idOrKey);
  if (!badge) throw new Error(`未知徽章：${idOrKey}`);
  const locked = options.locked ?? false;
  // 目录中的隐藏定义优先级最高：显式传 false 也不能泄露
  const hidden = badge.hidden || options.hidden === true;
  // 隐藏徽章在未获得时遮蔽；显式 hidden 时即使已获得也不展示真实图案
  const obscured = hidden && (locked || options.hidden === true);
  return {
    id: badge.id,
    key: badge.key,
    base: BASE_BY_SERIES[badge.series],
    series: badge.series,
    tier: badge.tier,
    motif: obscured ? 'mystery_gift' : badge.key,
    colors: locked ? BADGE_LOCKED_COLORS : BADGE_TIER_COLORS[badge.tier],
    locked,
    hidden,
    obscured,
    mode,
    digits: obscured ? undefined : DIGITS_BY_ID[badge.id],
  };
}

export type BadgeShape = { kind: 'base'; paths: string[] } | { kind: 'digits'; value: string; paths: string[] };

/** 徽章的所有图层路径都可从纯数据读取，供测试和组件共享 */
export function badgeArtwork(idOrKey: string) {
  const badge = findBadge(idOrKey);
  if (!badge) throw new Error(`未知徽章：${idOrKey}`);
  const digits = DIGITS_BY_ID[badge.id];
  const digitPaths = digits ? splitDigits(digits) : [];
  return {
    motif: badge.key,
    base: BASE_BY_SERIES[badge.series],
    signature: `${BASE_BY_SERIES[badge.series]}:${badge.key}:${digits ?? ''}`,
    shapes: [
      ...baseShapes(BASE_BY_SERIES[badge.series]),
      ...(digits && digitPaths.length > 0 ? [{ kind: 'digits' as const, value: digits, paths: digitPaths }] : []),
    ],
  };
}

/** 底座逐层列出，保证每枚在测试里至少能数出外层、内芯、内圈三条路径 */
function baseShapes(base: BadgeBase): BadgeShape[] {
  const paths = [BADGE_BASE_PATHS[base].path, BADGE_BASE_PATHS[base].face, BADGE_BASE_PATHS[base].inner].filter(
    (path) => path.length > 0,
  );
  return paths.map((path) => ({ kind: 'base' as const, paths: [path] }));
}

/** 逐位取字形路径，保证数字徽章不是文字 */
export function splitDigits(value: string): string[] {
  return value
    .split('')
    .filter(Boolean)
    .map((digit) => {
      const path = BADGE_DIGIT_PATHS[digit];
      if (!path) throw new Error(`缺少徽章数字字形：${digit}`);
      return path;
    });
}

/** 未获得的差值文案；隐藏未获得不显示 */
export function badgeRemainingText(visual: BadgeVisual, current: number | null, unit: string): string | null {
  if (!visual.locked || visual.obscured || current === null) return null;
  const threshold = ACHIEVEMENTS.find(({ id }) => id === visual.id)?.threshold ?? 0;
  return current >= threshold ? null : `还差 ${threshold - current} ${unit}`;
}

/** 缎带路径：底座绘制层直接使用，Badge 不重复保存 */
export const BADGE_RIBBON_PATHS = {
  band: 'M38 132H162V152C162 156 158 158 154 156L100 138L46 156C42 158 38 156 38 152Z',
  tailLeft: 'M38 146L20 166L44 164L46 150Z',
  tailRight: 'M162 146L180 166L156 164L154 150Z',
} as const;

/** 底座的外轮廓、内芯与内圈，交给绘制层 */
export function badgeBasePaths(base: BadgeBase): BadgeBaseShape {
  return BADGE_BASE_PATHS[base];
}
