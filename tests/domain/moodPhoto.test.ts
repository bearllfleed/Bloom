/**
 * 心情照片规则：等比缩放、剩余张数、降质量步进、文件名。
 */
import {
  fitLongEdge,
  MAX_MOOD_PHOTOS,
  nextPhotoQuality,
  PHOTO_LONG_EDGE,
  PHOTO_MIN_QUALITY,
  PHOTO_QUALITY,
  photoFileName,
  remainingPhotoSlots,
  thumbFileName,
} from '@/domain/mood';

describe('心情照片', () => {
  it('横图和竖图都按长边等比缩到 1920', () => {
    expect(fitLongEdge({ width: 4032, height: 3024 }, PHOTO_LONG_EDGE)).toEqual({ width: 1920, height: 1440 });
    expect(fitLongEdge({ width: 3024, height: 4032 }, PHOTO_LONG_EDGE)).toEqual({ width: 1440, height: 1920 });
  });

  it('本来就不超过上限的图不放大', () => {
    expect(fitLongEdge({ width: 800, height: 600 }, PHOTO_LONG_EDGE)).toEqual({ width: 800, height: 600 });
    expect(fitLongEdge({ width: 1920, height: 1080 }, PHOTO_LONG_EDGE)).toEqual({ width: 1920, height: 1080 });
  });

  it('极窄的长条图短边至少 1 像素', () => {
    expect(fitLongEdge({ width: 20000, height: 5 }, PHOTO_LONG_EDGE)).toEqual({ width: 1920, height: 1 });
  });

  it('剩余张数不小于 0', () => {
    expect(remainingPhotoSlots(0)).toBe(MAX_MOOD_PHOTOS);
    expect(remainingPhotoSlots(3)).toBe(2);
    expect(remainingPhotoSlots(5)).toBe(0);
    expect(remainingPhotoSlots(7)).toBe(0);
  });

  it('质量从 0.8 每次降 0.1，到 0.4 后不再降', () => {
    const steps: number[] = [];
    let q: number | null = PHOTO_QUALITY;
    while (q !== null) {
      steps.push(q);
      q = nextPhotoQuality(q);
    }
    expect(steps).toEqual([0.8, 0.7, 0.6, 0.5, 0.4]);
    expect(nextPhotoQuality(PHOTO_MIN_QUALITY)).toBeNull();
  });

  it('缩略图文件名由原图推出', () => {
    const name = photoFileName('0193a1b2-0000-7000-8000-000000000001');
    expect(name).toBe('0193a1b2-0000-7000-8000-000000000001.jpg');
    expect(thumbFileName(name)).toBe('0193a1b2-0000-7000-8000-000000000001.thumb.jpg');
    expect(thumbFileName('noext')).toBe('noext.thumb.jpg');
  });
});
