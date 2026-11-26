/**
 * 心情照片在 .bloom 中的路径和完整性校验。
 * 只负责纯数据；真正读写文档目录见 platform/files 和 services/backupService。
 */
import { thumbFileName } from '@/domain/mood';

import { sha256Hex } from './sha256';
import type { ZipEntry } from './zipStore';

export interface BackupPhotoRow {
  file_name?: unknown;
}

/** 只允许文档目录 media/mood 下的单个 jpg 文件名，防止备份写出沙盒 */
export function isSafeMoodFileName(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^[A-Za-z0-9_-]+\.jpg$/.test(value) &&
    !value.includes('..') &&
    !value.includes('/') &&
    !value.includes('\\')
  );
}

function names(fileName: string): string[] {
  return [fileName, thumbFileName(fileName)];
}

/** 把数据库照片行映射为 ZIP 条目；缺任一原图或缩略图就中止 */
export function moodMediaEntries(
  photos: readonly BackupPhotoRow[],
  read: (fileName: string) => Uint8Array | null,
): ZipEntry[] {
  const entries: ZipEntry[] = [];
  const seen = new Set<string>();
  for (const photo of photos) {
    if (!isSafeMoodFileName(photo.file_name)) throw new Error('照片文件名不安全');
    if (seen.has(photo.file_name)) continue;
    seen.add(photo.file_name);
    for (const name of names(photo.file_name)) {
      const data = read(name);
      if (data === null) throw new Error(`照片文件缺失：${name}`);
      entries.push({ name: `media/mood/${name}`, data });
    }
  }
  return entries;
}

/** 清单里记录文件哈希，而不是只信 ZIP 的 CRC */
export function mediaHashes(entries: readonly ZipEntry[]): Record<string, string> {
  return Object.fromEntries(
    entries.filter((entry) => entry.name.startsWith('media/mood/')).map((entry) => [entry.name, sha256Hex(entry.data)]),
  );
}

/** 返回可展示的错误；null 表示所有照片完整且内容一致 */
export function verifyMoodMedia(
  photos: readonly BackupPhotoRow[],
  entries: readonly ZipEntry[],
  expectedHashes: Record<string, string>,
): string | null {
  let expected: ZipEntry[];
  try {
    expected = moodMediaEntries(photos, (fileName) => {
      const data = entries.find((entry) => entry.name === `media/mood/${fileName}`)?.data;
      return data ?? null;
    });
  } catch (error) {
    return error instanceof Error ? error.message : '照片不完整';
  }
  if (expected.length !== entries.filter((entry) => entry.name.startsWith('media/mood/')).length)
    return '照片数量不一致';
  for (const entry of entries) {
    if (!entry.name.startsWith('media/mood/')) continue;
    const name = entry.name.slice('media/mood/'.length);
    // 缩略图由原图推导，两种名字都要落在白名单里
    const original = name.endsWith('.thumb.jpg') ? `${name.slice(0, -'.thumb.jpg'.length)}.jpg` : name;
    if (!isSafeMoodFileName(original)) return '照片文件名不安全';
    const expectedHash = expectedHashes[entry.name];
    if (!expectedHash || sha256Hex(entry.data) !== expectedHash) return `照片校验不一致：${entry.name}`;
  }
  if (Object.keys(expectedHashes).some((key) => !entries.some((entry) => entry.name === key))) return '照片清单不完整';
  return null;
}
