/**
 * 备份文件的读写、选择和分享。界面层不直接碰文件系统。
 */
import * as DocumentPicker from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { clock } from './clock';

export interface StoredFile {
  name: string;
  uri: string;
  size: number;
}

function backups(): Directory {
  const dir = new Directory(Paths.document, 'backups');
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return dir;
}

export const files = {
  directory(): Directory {
    return backups();
  },

  write(name: string, bytes: Uint8Array): StoredFile {
    const file = new File(backups(), name);
    if (file.exists) file.delete();
    file.create();
    file.writeSync(bytes);
    return { name, uri: file.uri, size: file.info().size ?? bytes.length };
  },

  writeCache(name: string, bytes: Uint8Array): StoredFile {
    const file = new File(Paths.cache, name);
    if (file.exists) file.delete();
    file.create();
    file.writeSync(bytes);
    return { name, uri: file.uri, size: file.info().size ?? bytes.length };
  },

  read(uri: string): Uint8Array {
    return new File(uri).bytesSync();
  },

  list(): StoredFile[] {
    return backups()
      .list()
      .filter((entry): entry is File => entry instanceof File)
      .map((file) => ({
        name: file.uri.split('/').pop() ?? 'backup.bloom',
        uri: file.uri,
        size: file.info().size ?? 0,
      }))
      .sort((a, b) => b.name.localeCompare(a.name));
  },

  remove(uri: string): void {
    const file = new File(uri);
    if (file.exists) file.delete();
  },

  async pick(): Promise<string | null> {
    const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true, type: '*/*' });
    if (result.canceled || result.assets.length === 0) return null;
    return result.assets[0].uri;
  },

  async share(uri: string, mimeType: string, dialogTitle: string): Promise<void> {
    await Sharing.shareAsync(uri, { mimeType, dialogTitle, UTI: 'com.bloom.habit.backup' });
  },

  /** 读取 media/mood 中的单张照片；文件名由备份模块预先校验 */
  readMoodPhoto(fileName: string): Uint8Array | null {
    const file = new File(Paths.document, 'media', 'mood', fileName);
    return file.exists ? file.bytesSync() : null;
  },

  /** 恢复前把照片写进同文件系统的新目录，调用方成功后再整体替换 */
  writeMoodPhotoStaging(restoreId: string, fileName: string, bytes: Uint8Array): void {
    const file = new File(Paths.document, 'media', `.restore-${restoreId}`, fileName);
    if (!file.parentDirectory.exists) file.parentDirectory.create({ intermediates: true, idempotent: true });
    if (file.exists) file.delete();
    file.create();
    file.writeSync(bytes);
  },

  /** 数据库恢复成功后切换媒体目录；旧目录先改名，避免半途丢照片 */
  commitMoodPhotoStaging(restoreId: string): void {
    const media = new Directory(Paths.document, 'media');
    if (!media.exists) media.create({ intermediates: true, idempotent: true });
    const current = new Directory(media, 'mood');
    const staged = new Directory(media, `.restore-${restoreId}`);
    const previous = new Directory(media, `.previous-${restoreId}`);
    if (previous.exists) previous.delete();
    if (current.exists) current.moveSync(previous);
    try {
      staged.moveSync(current);
      if (previous.exists) previous.delete();
    } catch (error) {
      if (!current.exists && previous.exists) previous.moveSync(current);
      throw error;
    }
  },

  /** 导入失败时只清掉临时目录，不碰现有照片 */
  removeMoodPhotoStaging(restoreId: string): void {
    const staged = new Directory(Paths.document, 'media', `.restore-${restoreId}`);
    if (staged.exists) staged.delete();
  },

  /** 从微信或文件 App 丢进来的地址，复制进缓存后再读 */
  adopt(uri: string): string {
    const name = `incoming-${clock.systemNow()}.bloom`;
    const dest = new File(Paths.cache, name);
    if (dest.exists) dest.delete();
    new File(uri).copySync(dest);
    return dest.uri;
  },
};
