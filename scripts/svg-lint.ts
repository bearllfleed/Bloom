/**
 * SVG 规范校验（技术方案第 13 节）。任一文件不合规即以非零状态退出，阻止构建。
 * 检查：画板尺寸、禁用元素与属性、色板外颜色、界面图标颜色跟随文字色、体积上限、项目图标清单是否齐全。
 */
import fs from 'node:fs';

import {
  ALLOWED_COLORS,
  ASSET_SPECS,
  COLOR_ATTRS,
  FORBIDDEN_TAGS,
  PART_NAME,
  loadAssets,
  loadProjectManifest,
  readPart,
  walk,
  type AssetKind,
  type SvgAsset,
} from './svgShared';

const problems: string[] = [];
const report = (asset: SvgAsset, message: string) => problems.push(`${asset.kind}/${asset.id}.svg：${message}`);

function checkColor(asset: SvgAsset, attr: string, value: string) {
  const v = value.trim();
  if (v === 'none' || v === 'currentColor') return;
  if (!/^#[0-9a-fA-F]{6}$/.test(v)) return report(asset, `${attr}="${v}" 必须写成 6 位十六进制色值`);
  if (!ALLOWED_COLORS.has(v.toUpperCase())) report(asset, `${attr}="${v}" 不在色板内`);
}

function lintAsset(asset: SvgAsset) {
  const spec = ASSET_SPECS[asset.kind];
  const root = asset.tree;
  if (root.name !== 'svg') report(asset, '根元素必须是 <svg>');
  if (root.attributes.viewBox !== spec.viewBox) report(asset, `viewBox 必须为 "${spec.viewBox}"`);
  const bytes = fs.statSync(asset.file).size;
  if (bytes > spec.maxBytes) report(asset, `体积 ${bytes}B 超过上限 ${spec.maxBytes}B`);
  if (asset.kind === 'ui' && root.attributes.stroke !== 'currentColor') {
    report(asset, '界面图标的描边必须写成 stroke="currentColor"，以支持深色模式');
  }

  const partNames = new Set<string>();
  const [, , width, height] = spec.viewBox.split(' ').map(Number);
  walk(root, (node) => {
    const part = readPart(node);
    if (part) {
      if (asset.kind !== 'project') report(asset, '只有项目图标可以用 data-part 分层');
      if (node.name !== 'g') report(asset, `data-part 只能写在 <g> 上（发现 <${node.name}>）`);
      if (!PART_NAME.test(part.name)) report(asset, `data-part="${part.name}" 只能用小写字母、数字和短横线`);
      if (partNames.has(part.name)) report(asset, `data-part="${part.name}" 重名`);
      partNames.add(part.name);
      const { originX: x, originY: y } = part;
      if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || y < 0 || x > width || y > height) {
        report(asset, `data-part="${part.name}" 需要画板内的 data-origin="x y"`);
      }
    } else if (node.attributes['data-origin'] !== undefined) {
      report(asset, 'data-origin 必须和 data-part 一起用');
    }
    if (FORBIDDEN_TAGS.has(node.name)) report(asset, `禁止使用 <${node.name}>`);
    if (node.attributes.style) report(asset, '禁止使用 style 属性，请改用独立属性');
    const href = node.attributes.href ?? node.attributes['xlink:href'];
    if (href && !href.startsWith('#')) report(asset, '禁止引用外部或内嵌资源');
    for (const attr of COLOR_ATTRS) {
      const value = node.attributes[attr];
      if (value !== undefined) checkColor(asset, attr, value);
    }
    const isAccent = node.attributes.class === 'accent';
    if (asset.kind === 'ui' && node !== root && !isAccent) {
      for (const attr of ['fill', 'stroke'] as const) {
        const value = node.attributes[attr];
        if (value && value !== 'none' && value !== 'currentColor') {
          report(asset, `界面图标中只有 class="accent" 的形状可以有自定义颜色（发现 ${attr}="${value}"）`);
        }
      }
    }
  });
}

function lintManifest(assets: SvgAsset[]) {
  const manifest = loadProjectManifest();
  const categoryIds = new Set(manifest.categories.map((c) => c.id));
  const ids = new Set(assets.map((a) => a.id));
  for (const asset of assets) {
    if (!manifest.icons[asset.id]) problems.push(`project/manifest.json：缺少 ${asset.id} 的中文名与关键词`);
    if (!categoryIds.has(asset.id.split('/')[0])) problems.push(`project/${asset.id}.svg：所在分类不在清单里`);
  }
  for (const id of Object.keys(manifest.icons)) {
    if (!ids.has(id)) problems.push(`project/manifest.json：${id} 没有对应的 SVG 文件`);
  }
}

const kinds: AssetKind[] = ['ui', 'project'];
const all = kinds.flatMap(loadAssets);
all.forEach(lintAsset);
lintManifest(all.filter((a) => a.kind === 'project'));

if (problems.length > 0) {
  console.error(`SVG 校验未通过，共 ${problems.length} 个问题：\n${problems.map((p) => `  - ${p}`).join('\n')}`);
  process.exit(1);
}
console.log(
  `SVG 校验通过：界面图标 ${all.filter((a) => a.kind === 'ui').length} 个，项目图标 ${all.filter((a) => a.kind === 'project').length} 个`,
);
