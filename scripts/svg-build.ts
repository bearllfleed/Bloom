/**
 * SVG 资产生成（技术方案第 13 节）：assets/svg → src/ui/icons/generated。
 * - 界面图标：描边跟随 color 参数；class="accent" 的形状只在 active 时显示；
 * - 项目图标：支持贴纸外描边（outline）与灰度（mono），并生成带中文名和关键词的注册表。
 * 运行前会先执行 svg-lint，不合规直接退出。
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { optimize } from 'svgo';
import { parseSync, type INode } from 'svgson';

import { ROOT, loadAssets, loadProjectManifest, toGray, type SvgAsset } from './svgShared';

const OUT_DIR = path.join(ROOT, 'src/ui/icons/generated');
const HEADER = '/**\n * 此文件由 scripts/svg-build.ts 根据 assets/svg 生成，请勿手改。\n */\n';

const TAGS: Record<string, string> = {
  path: 'Path',
  circle: 'Circle',
  rect: 'Rect',
  ellipse: 'Ellipse',
  line: 'Line',
  polyline: 'Polyline',
  polygon: 'Polygon',
  g: 'G',
  defs: 'Defs',
  clipPath: 'ClipPath',
  linearGradient: 'LinearGradient',
  radialGradient: 'RadialGradient',
  stop: 'Stop',
};

const OUTLINE_EXTRA_WIDTH = 6;

function camel(attr: string): string {
  return attr.replace(/[-:]([a-z])/g, (_, c: string) => c.toUpperCase());
}

function pascal(id: string): string {
  return id
    .split(/[/-]/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
}

function optimizeSvg(source: string): INode {
  const { data } = optimize(source, {
    multipass: true,
    plugins: [
      'removeComments',
      'removeMetadata',
      'removeEditorsNSData',
      'cleanupNumericValues',
      'convertPathData',
      'removeEmptyContainers',
    ],
  });
  return parseSync(data);
}

type AttrMap = Record<string, string>;

/** 把属性表写成 JSX 属性；值为 { } 包裹的表达式时原样输出 */
function jsxAttrs(attrs: AttrMap): string {
  return Object.entries(attrs)
    .map(([key, value]) => (value.startsWith('{') ? `${key}=${value}` : `${key}=${JSON.stringify(value)}`))
    .join(' ');
}

function convertAttrs(node: INode, map: (key: string, value: string) => string | null): AttrMap {
  const result: AttrMap = {};
  for (const [key, value] of Object.entries(node.attributes)) {
    if (key === 'class' || key === 'xmlns') continue;
    const mapped = map(key, value);
    if (mapped !== null) result[camel(key)] = mapped;
  }
  return result;
}

function emitNode(node: INode, render: (node: INode, children: string) => string | null): string {
  const children = node.children.map((child) => emitNode(child, render)).join('');
  return render(node, children) ?? '';
}

function element(tag: string, attrs: AttrMap, children: string): string {
  const name = TAGS[tag];
  if (!name) throw new Error(`不支持的元素 <${tag}>`);
  return children ? `<${name} ${jsxAttrs(attrs)}>${children}</${name}>` : `<${name} ${jsxAttrs(attrs)} />`;
}

/** 界面图标 */
function buildUiIcon(asset: SvgAsset): { name: string; code: string } {
  const tree = optimizeSvg(asset.source);
  const rootAttrs = convertAttrs(tree, (key, value) => {
    if (key === 'viewBox') return null;
    return value === 'currentColor' ? '{color}' : value;
  });
  const body = tree.children
    .map((child) =>
      emitNode(child, (node, children) => {
        const isAccent = node.attributes.class === 'accent';
        const attrs = convertAttrs(node, (key, value) => {
          if (value === 'currentColor') return '{color}';
          if (isAccent && key === 'fill') return `{accent ?? ${JSON.stringify(value)}}`;
          return value;
        });
        const el = element(node.name, attrs, children);
        return isAccent ? `{active ? ${el} : null}` : el;
      }),
    )
    .join('\n      ');
  const name = pascal(asset.id);
  const code = `function ${name}({ size = 24, color, accent, active = false }: UiIconProps) {
  return (
    <Svg width={size} height={size} viewBox="${tree.attributes.viewBox}" ${jsxAttrs(rootAttrs)}>
      ${body}
    </Svg>
  );
}`;
  return { name, code };
}

/** 项目贴纸图标：正常层 + 可选的外描边层 */
function buildProjectIcon(asset: SvgAsset): { name: string; code: string } {
  const tree = optimizeSvg(asset.source);
  const rootStrokeWidth = Number(tree.attributes['stroke-width'] ?? 2.5);
  const rootAttrs = convertAttrs(tree, (key, value) => {
    if (key === 'viewBox') return null;
    if (key === 'fill' || key === 'stroke')
      return value === 'none' ? value : `{mono ? '${toGray(value)}' : '${value}'}`;
    return value;
  });

  const normal = tree.children
    .map((child) =>
      emitNode(child, (node, children) => {
        const attrs = convertAttrs(node, (key, value) => {
          if ((key === 'fill' || key === 'stroke' || key === 'stop-color') && value.startsWith('#')) {
            return `{mono ? '${toGray(value)}' : '${value}'}`;
          }
          return value;
        });
        return element(node.name, attrs, children);
      }),
    )
    .join('');

  // 外描边层：把每个形状描成更粗的奶油色/白色轮廓，叠在正常层下面形成"贴纸白边"
  const outline = tree.children
    .map((child) =>
      emitNode(child, (node, children) => {
        if (node.name === 'g') return children ? `<G>${children}</G>` : null;
        if (!TAGS[node.name] || node.attributes.stroke === 'none') return null;
        const hasFill = node.attributes.fill !== undefined && node.attributes.fill !== 'none';
        const width = Number(node.attributes['stroke-width'] ?? rootStrokeWidth) + OUTLINE_EXTRA_WIDTH;
        const attrs = convertAttrs(node, (key, value) => {
          if (['fill', 'stroke', 'opacity', 'stroke-width', 'stroke-opacity', 'fill-opacity'].includes(key))
            return null;
          return value;
        });
        attrs.fill = hasFill ? '{outline}' : 'none';
        attrs.stroke = '{outline}';
        attrs.strokeWidth = String(width);
        return element(node.name, attrs, '');
      }),
    )
    .join('');

  const name = pascal(asset.id);
  const code = `function ${name}({ size = 64, outline, mono = false }: ProjectIconProps) {
  return (
    <Svg width={size} height={size} viewBox="${tree.attributes.viewBox}">
      {outline ? (
        <G strokeLinecap="round" strokeLinejoin="round">${outline}</G>
      ) : null}
      <G ${jsxAttrs(rootAttrs)}>${normal}</G>
    </Svg>
  );
}`;
  return { name, code };
}

function svgImportLine(code: string): string {
  const used = Object.values(TAGS).filter((tag) => new RegExp(`<${tag}[\\s>/]`).test(code));
  return used.length > 0
    ? `import Svg, { ${[...new Set(used)].join(', ')} } from 'react-native-svg';`
    : `import Svg from 'react-native-svg';`;
}

function writeUiIcons(assets: SvgAsset[]) {
  const built = assets.map(buildUiIcon);
  const body = built.map((b) => b.code).join('\n\n');
  const names = assets.map((a, i) => `  ${JSON.stringify(a.id)}: ${built[i].name},`).join('\n');
  const file = `${HEADER}${svgImportLine(body)}

export interface UiIconProps {
  size?: number;
  /** 描边颜色，通常取当前文字色 */
  color: string;
  /** 选中态填充色，默认使用图标自带的糖果色 */
  accent?: string;
  /** 是否显示选中态填充块 */
  active?: boolean;
}

${body}

export const uiIcons = {
${names}
} as const;

export type UiIconName = keyof typeof uiIcons;
`;
  fs.writeFileSync(path.join(OUT_DIR, 'uiIcons.tsx'), file);
}

function writeProjectIcons(assets: SvgAsset[]) {
  const manifest = loadProjectManifest();
  const built = assets.map(buildProjectIcon);
  const body = built.map((b) => b.code).join('\n\n');
  const map = assets.map((a, i) => `  ${JSON.stringify(a.id)}: ${built[i].name},`).join('\n');
  const registry = assets
    .map((a) => {
      const meta = manifest.icons[a.id];
      return `  { id: ${JSON.stringify(a.id)}, category: ${JSON.stringify(a.id.split('/')[0])}, name: ${JSON.stringify(meta.name)}, keywords: ${JSON.stringify(meta.keywords)} },`;
    })
    .join('\n');
  const file = `${HEADER}${svgImportLine(body)}

export interface ProjectIconProps {
  size?: number;
  /** 贴纸外描边颜色；不传则不画外描边 */
  outline?: string;
  /** 灰度显示（暂停、禁用） */
  mono?: boolean;
}

${body}

export const projectIcons = {
${map}
} as const;

export type ProjectIconId = keyof typeof projectIcons;

export const projectIconCategories = ${JSON.stringify(manifest.categories, null, 2)} as const;

export const projectIconRegistry: readonly { id: ProjectIconId; category: string; name: string; keywords: readonly string[] }[] = [
${registry}
];
`;
  fs.writeFileSync(path.join(OUT_DIR, 'projectIcons.tsx'), file);
}

execFileSync(process.execPath, [require.resolve('tsx/cli'), path.join(__dirname, 'svg-lint.ts')], { stdio: 'inherit' });
fs.mkdirSync(OUT_DIR, { recursive: true });
const ui = loadAssets('ui');
const project = loadAssets('project');
writeUiIcons(ui);
writeProjectIcons(project);
execFileSync(
  process.execPath,
  [require.resolve('prettier/bin/prettier.cjs'), '--write', '--ignore-path', '/dev/null', OUT_DIR],
  {
    stdio: 'ignore',
  },
);
console.log(`已生成：界面图标 ${ui.length} 个、项目图标 ${project.length} 个 → src/ui/icons/generated`);
