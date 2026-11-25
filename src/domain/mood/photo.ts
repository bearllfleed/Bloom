/**
 * 心情照片的尺寸、数量与文件名规则（需求 3-9、A3-13）。
 * 负责：按长边等比缩放的尺寸、还能再加几张、超过 1MB 时的降质量步进、原图与缩略图的文件名。
 * 不负责：选图、压缩和读写文件（见 platform/media）。
 */

/** 每篇心情最多几张照片 */
export const MAX_MOOD_PHOTOS = 5;
/** 原图长边上限 */
export const PHOTO_LONG_EDGE = 1920;
/** 缩略图长边 */
export const THUMB_LONG_EDGE = 480;
/** 第一次压缩用的质量 */
export const PHOTO_QUALITY = 0.8;
/** 压缩后单张大小上限 */
export const PHOTO_MAX_BYTES = 1024 * 1024;
/** 降质量的下限，到这里就不再往下降 */
export const PHOTO_MIN_QUALITY = 0.4;

const QUALITY_STEP = 0.1;

export interface PhotoSize {
  width: number;
  height: number;
}

/** 按长边等比缩小；本来就不超过上限时原样返回，不放大 */
export function fitLongEdge(size: PhotoSize, longEdge: number): PhotoSize {
  const long = Math.max(size.width, size.height);
  if (long <= longEdge) return { width: size.width, height: size.height };
  const scale = longEdge / long;
  return {
    width: Math.max(1, Math.round(size.width * scale)),
    height: Math.max(1, Math.round(size.height * scale)),
  };
}

/** 还能再加几张（相册多选上限） */
export function remainingPhotoSlots(current: number): number {
  return Math.max(0, MAX_MOOD_PHOTOS - current);
}

/** 超过 1MB 时下一次尝试的质量；已经到下限时返回 null */
export function nextPhotoQuality(quality: number): number | null {
  const next = Math.round((quality - QUALITY_STEP) * 100) / 100;
  return next < PHOTO_MIN_QUALITY ? null : next;
}

/** 原图文件名：照片 id 加 .jpg */
export function photoFileName(photoId: string): string {
  return `${photoId}.jpg`;
}

/** 缩略图文件名由原图推出，数据库只存原图的 file_name */
export function thumbFileName(fileName: string): string {
  const dot = fileName.lastIndexOf('.');
  const stem = dot > 0 ? fileName.slice(0, dot) : fileName;
  return `${stem}.thumb.jpg`;
}
