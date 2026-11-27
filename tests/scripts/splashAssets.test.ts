import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import type { ConfigContext } from 'expo/config';

import makeConfig from '../../app.config';

const { PNG } = require('pngjs') as typeof import('pngjs');
const ROOT = path.resolve(__dirname, '../..');
const GENERATED_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'bloom-splash-'));

afterAll(() => fs.rmSync(GENERATED_DIR, { recursive: true, force: true }));

interface PngInspection {
  width: number;
  height: number;
  margins: readonly [number, number, number, number];
  alpha: Buffer;
  transparentPixels: number;
  creamPixels: number;
  outlinePixels: number;
}

function inspectPng(relativePath: string): PngInspection {
  const png = PNG.sync.read(fs.readFileSync(path.join(ROOT, relativePath)));
  let minX = png.width;
  let minY = png.height;
  let maxX = -1;
  let maxY = -1;
  let transparentPixels = 0;
  let creamPixels = 0;
  let outlinePixels = 0;
  const alpha = Buffer.alloc(png.width * png.height);

  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const pixel = y * png.width + x;
      const offset = pixel * 4;
      const [red, green, blue, opacity] = png.data.subarray(offset, offset + 4);
      alpha[pixel] = opacity;
      if (opacity === 0) {
        transparentPixels += 1;
        continue;
      }
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      if (red === 255 && green === 248 && blue === 243) creamPixels += 1;
      if (red === 63 && green === 42 && blue === 51) outlinePixels += 1;
    }
  }

  if (maxX < 0 || maxY < 0) throw new Error(`${relativePath} 没有可见像素`);
  return {
    width: png.width,
    height: png.height,
    margins: [minX, minY, png.width - 1 - maxX, png.height - 1 - maxY],
    alpha,
    transparentPixels,
    creamPixels,
    outlinePixels,
  };
}

function expectSafeMargins(image: PngInspection): void {
  const [left, top, right, bottom] = image.margins;
  for (const [margin, dimension] of [
    [left, image.width],
    [right, image.width],
    [top, image.height],
    [bottom, image.height],
  ] as const) {
    expect(margin / dimension).toBeGreaterThanOrEqual(0.08);
    expect(margin / dimension).toBeLessThanOrEqual(0.1);
  }
}

describe('splash 视觉资源', () => {
  it('生成脚本可在空目录重现已提交的 light/dark PNG', () => {
    execFileSync(
      process.execPath,
      [require.resolve('tsx/cli'), path.join(ROOT, 'scripts/generate-splash-assets.ts'), '--output-dir', GENERATED_DIR],
      { cwd: ROOT, stdio: 'pipe' },
    );

    for (const name of ['splash-icon.png', 'splash-icon-dark.png']) {
      expect(fs.readFileSync(path.join(GENERATED_DIR, name))).toEqual(
        fs.readFileSync(path.join(ROOT, 'assets/images', name)),
      );
    }
  });

  it('light PNG 有真实透明通道、紧裁切安全边距和合理像素尺寸', () => {
    const light = inspectPng('assets/images/splash-icon.png');
    expect(light.transparentPixels).toBeGreaterThan(0);
    expect(Math.max(light.width, light.height)).toBeLessThanOrEqual(1024);
    expectSafeMargins(light);
  });

  it('dark PNG 与 light 尺寸及图案轮廓一致，并有奶油色对比描边', () => {
    const light = inspectPng('assets/images/splash-icon.png');
    const dark = inspectPng('assets/images/splash-icon-dark.png');

    expect([dark.width, dark.height]).toEqual([light.width, light.height]);
    expect(dark.alpha.equals(light.alpha)).toBe(true);
    expect(dark.creamPixels).toBeGreaterThan(1000);
    expect(dark.outlinePixels).toBeGreaterThan(1000);
    expectSafeMargins(dark);
  });

  it('app config 为 dark splash 指向独立图片并保留现有宽度与背景色', () => {
    const config = makeConfig({ config: {} } as ConfigContext);
    const splash = config.plugins?.find(
      (plugin): plugin is [string, Record<string, unknown>] =>
        Array.isArray(plugin) && plugin[0] === 'expo-splash-screen',
    );

    expect(splash?.[1]).toMatchObject({
      image: './assets/images/splash-icon.png',
      imageWidth: 160,
      backgroundColor: '#FFF8F3',
      dark: {
        image: './assets/images/splash-icon-dark.png',
        backgroundColor: '#211A1E',
      },
    });
  });
});
