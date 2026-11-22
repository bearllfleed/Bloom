/**
 * 轻量键值存储：偏好设置、开发工具状态、草稿等小数据。
 * 底层使用 expo-sqlite 自带的同步键值存储，不额外引入原生依赖。
 * 不负责：业务数据（项目、记录等一律进主数据库）。
 */
import Storage from 'expo-sqlite/kv-store';

const PREFIX = 'bloom.';

export const kv = {
  getString(key: string): string | null {
    return Storage.getItemSync(PREFIX + key);
  },
  setString(key: string, value: string): void {
    Storage.setItemSync(PREFIX + key, value);
  },
  getJSON<T>(key: string): T | null {
    const raw = Storage.getItemSync(PREFIX + key);
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  setJSON(key: string, value: unknown): void {
    Storage.setItemSync(PREFIX + key, JSON.stringify(value));
  },
  remove(key: string): void {
    Storage.removeItemSync(PREFIX + key);
  },
};
