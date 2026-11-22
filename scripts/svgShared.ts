/**
 * SVG 管线的公共部分：读取资产、解析为语法树、允许的颜色表与各类资产的规格。
 * 被 svg-lint.ts 与 svg-build.ts 共用。
 */
import fs from 'node:fs';
import path from 'node:path';
import { parseSync, type INode } from 'svgson';

import { accent, berry, ink, night, paper, semantic } from '../src/ui/tokens/palette';
import { projectColors } from '../src/ui/tokens/projectColors';

export const ROOT = path.resolve(__dirname, '..');
export const SVG_ROOT = path.join(ROOT, 'assets/svg');

/** 每类资产的画板尺寸与体积上限（技术方案第 13 节） */
export const ASSET_SPECS = {
  ui: { viewBox: '0 0 24 24', maxBytes: 2048 },
  project: { viewBox: '0 0 64 64', maxBytes: 6144 },
} as const;
export type AssetKind = keyof typeof ASSET_SPECS;

export const FORBIDDEN_TAGS = new Set([
  'text',
  'tspan',
  'image',
  'foreignObject',
  'filter',
  'style',
  'script',
  'mask',
  'animate',
  'animateTransform',
  'animateMotion',
  'set',
]);

export const COLOR_ATTRS = ['fill', 'stroke', 'stop-color'] as const;

/** 允许出现在 SVG 里的颜色：色板 + 项目色 + 白色 */
export const ALLOWED_COLORS: ReadonlySet<string> = new Set(
  [
    ...Object.values(ink),
    ...Object.values(paper),
    ...Object.values(berry),
    ...Object.values(accent),
    ...Object.values(semantic).flatMap((s) => [s.graphic, s.text]),
    ...Object.values(night),
    ...Object.values(projectColors).flatMap((c) => [c.base, c.deep, c.tint]),
    '#FFFFFF',
  ].map((c) => c.toUpperCase()),
);

export interface SvgAsset {
  kind: AssetKind;
  /** 相对资产目录的 id，如 health/water-cup 或 tab-today */
  id: string;
  file: string;
  source: string;
  tree: INode;
}

function listSvg(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listSvg(full);
    return entry.name.endsWith('.svg') ? [full] : [];
  });
}

export function loadAssets(kind: AssetKind): SvgAsset[] {
  const dir = path.join(SVG_ROOT, kind);
  return listSvg(dir)
    .sort()
    .map((file) => {
      const source = fs.readFileSync(file, 'utf8');
      const id = path
        .relative(dir, file)
        .replace(/\\/g, '/')
        .replace(/\.svg$/, '');
      return { kind, id, file, source, tree: parseSync(source) };
    });
}

export function walk(node: INode, visit: (n: INode) => void): void {
  visit(node);
  node.children.forEach((child) => walk(child, visit));
}

export interface ProjectManifest {
  categories: { id: string; name: string; color: string }[];
  icons: Record<string, { name: string; keywords: string[] }>;
}

export function loadProjectManifest(): ProjectManifest {
  return JSON.parse(fs.readFileSync(path.join(SVG_ROOT, 'project/manifest.json'), 'utf8'));
}

/** 颜色转灰度（暂停/禁用态的图标用） */
export function toGray(hex: string): string {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  // 灰度向暖色略偏，避免冷灰与奶油底格格不入
  const l = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  const lifted = Math.round(l * 0.85 + 255 * 0.15);
  const hexPart = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0');
  return `#${hexPart(lifted + 4)}${hexPart(lifted)}${hexPart(lifted + 2)}`.toUpperCase();
}
