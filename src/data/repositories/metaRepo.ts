/**
 * 杂项键值（meta 表）：首次使用日期、已庆祝过的完美日等需要跟随数据库一起备份的小状态。
 * 偏好设置这类"换手机可以不带走"的放在 platform/kv。
 */
import { getDatabase } from '../db/client';

export const metaRepo = {
  get(key: string): string | null {
    return getDatabase().getFirstSync<{ value: string }>('SELECT value FROM meta WHERE key = ?', [key])?.value ?? null;
  },

  set(key: string, value: string): void {
    getDatabase().runSync(
      'INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value',
      [key, value],
    );
  },

  /** 只在不存在时写入，返回是否写入成功（用于"只做一次"的判断） */
  setOnce(key: string, value: string): boolean {
    return getDatabase().runSync('INSERT OR IGNORE INTO meta (key, value) VALUES (?, ?)', [key, value]).changes > 0;
  },
};
