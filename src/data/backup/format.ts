import { mediaHashes } from './media';
import { sha256Hex } from './sha256';
import { zipStore, type ZipEntry } from './zipStore';

export const BLOOM_BACKUP_FORMAT_VERSION = 1;

export interface BackupPayload<TPrefs = unknown> {
  formatVersion: typeof BLOOM_BACKUP_FORMAT_VERSION;
  prefs: TPrefs;
  projects: Record<string, unknown>[];
  rules: Record<string, unknown>[];
  pauses: Record<string, unknown>[];
  reminders: Record<string, unknown>[];
  checkins: Record<string, unknown>[];
  moods: Record<string, unknown>[];
  moodPhotos: Record<string, unknown>[];
  achievements: Record<string, unknown>[];
  counters: Record<string, unknown>[];
  meta: Record<string, unknown>[];
}

export interface BackupDescriptor {
  schemaVersion: number;
  appVersion: string;
  exportedAt: string;
  platform: string;
}

export interface BackupManifest extends BackupDescriptor {
  format: 'bloom-backup';
  formatVersion: typeof BLOOM_BACKUP_FORMAT_VERSION;
  counts: {
    projects: number;
    checkins: number;
    moods: number;
    photos: number;
    achievements: number;
  };
  sha256: string;
  mediaSha256: Record<string, string>;
}

const text = new TextEncoder();

/** 生成 App 导出与性能夹具共同使用的合法 .bloom 字节。 */
export function encodeBloomBackup(
  payload: BackupPayload,
  descriptor: BackupDescriptor,
  media: readonly ZipEntry[] = [],
): { bytes: Uint8Array; manifest: BackupManifest } {
  const data = text.encode(JSON.stringify(payload));
  const manifest: BackupManifest = {
    format: 'bloom-backup',
    formatVersion: BLOOM_BACKUP_FORMAT_VERSION,
    ...descriptor,
    counts: {
      projects: payload.projects.filter((row) => row.deleted_at == null).length,
      checkins: payload.checkins.length,
      moods: payload.moods.length,
      photos: payload.moodPhotos.length,
      achievements: payload.achievements.length,
    },
    sha256: sha256Hex(data),
    mediaSha256: mediaHashes(media),
  };
  return {
    bytes: zipStore([
      { name: 'manifest.json', data: text.encode(JSON.stringify(manifest)) },
      { name: 'data.json', data },
      ...media,
    ]),
    manifest,
  };
}
