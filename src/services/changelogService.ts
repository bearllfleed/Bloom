/**
 * 更新说明（第 1 期 1-9）：升级后首次打开展示一次，关于页可再次查看。
 * 新安装的用户在完成欢迎页时直接记为已看过，不弹。
 */
import { changelog, type ChangelogEntry } from '@/copy/changelog';
import { appVersion } from '@/platform/appInfo';
import { kv } from '@/platform/kv';

const SEEN_KEY = 'changelog.seenVersion';

export function latestChangelog(): ChangelogEntry | null {
  return changelog.find((e) => e.version === appVersion) ?? changelog[0] ?? null;
}

/** 需要弹出的更新说明；已看过或没有对应条目时为 null */
export function pendingChangelog(): ChangelogEntry | null {
  if (kv.getString(SEEN_KEY) === appVersion) return null;
  return latestChangelog();
}

export function markChangelogSeen(): void {
  kv.setString(SEEN_KEY, appVersion);
}
