#!/usr/bin/env tsx
/**
 * 从 assets/brand 中的可编辑 SVG 生成透明 splash PNG。
 * light/dark 共用几何，只替换外轮廓色，确保尺寸与 alpha 轮廓一致。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const sourcePath = path.join(root, 'assets/brand/splash.svg');
const outputDirIndex = process.argv.indexOf('--output-dir');
if (outputDirIndex >= 0 && !process.argv[outputDirIndex + 1]) {
  throw new Error('--output-dir 需要目录路径');
}
const outputDir =
  outputDirIndex >= 0 ? path.resolve(process.argv[outputDirIndex + 1]) : path.join(root, 'assets/images');
const cream = '#FFF8F3';
const white = '#FFFFFF';
const maxOutputDimension = 1024;
const contentScale = 1.2;

function darkSource(source: string): string {
  return source.replaceAll(white, cream);
}

async function render(source: string, outputPath: string): Promise<void> {
  const trimmed = await sharp(Buffer.from(source), { density: 192 })
    .trim()
    .resize({
      width: Math.floor(maxOutputDimension / contentScale),
      height: Math.floor(maxOutputDimension / contentScale),
      fit: 'inside',
      withoutEnlargement: true,
    })
    .png()
    .toBuffer();
  const { width, height } = await sharp(trimmed).metadata();
  if (!width || !height) throw new Error('splash SVG 没有可见内容');
  const horizontalPadding = Math.round(width * 0.1);
  const verticalPadding = Math.round(height * 0.1);
  await sharp(trimmed)
    .extend({
      top: verticalPadding,
      bottom: verticalPadding,
      left: horizontalPadding,
      right: horizontalPadding,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(outputPath);
}

async function main(): Promise<void> {
  const source = fs.readFileSync(sourcePath, 'utf8');
  fs.mkdirSync(outputDir, { recursive: true });
  await Promise.all([
    render(source, path.join(outputDir, 'splash-icon.png')),
    render(darkSource(source), path.join(outputDir, 'splash-icon-dark.png')),
  ]);
  console.log('已从 assets/brand/splash.svg 生成 light/dark splash PNG');
}

void main();
