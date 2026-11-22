/**
 * 生成 UUID v7：前 48 位为毫秒时间戳，按时间有序，便于排序与备份合并（技术方案第 6 节）。
 */
import { getRandomValues } from 'expo-crypto';

import { clock } from '@/platform/clock';

const hex = (bytes: Uint8Array) => Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');

export function newId(): string {
  const bytes = new Uint8Array(16);
  getRandomValues(bytes);
  let ms = clock.now();
  for (let i = 5; i >= 0; i--) {
    bytes[i] = ms % 256;
    ms = Math.floor(ms / 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x70; // 版本 7
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // RFC 4122 变体
  const h = hex(bytes);
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
