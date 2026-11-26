/**
 * 心情照片：从相册选或拍一张、压缩、生成缩略图、存进 App 文档目录 media/mood/。界面层不直接碰选图和文件系统。
 * 尺寸、数量、质量和文件名规则见 domain/mood。
 */
import { Directory, File, Paths } from 'expo-file-system';
import { ImageManipulator, SaveFormat, type ImageRef } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

import {
  fitLongEdge,
  nextPhotoQuality,
  PHOTO_LONG_EDGE,
  PHOTO_MAX_BYTES,
  PHOTO_QUALITY,
  photoFileName,
  THUMB_LONG_EDGE,
  thumbFileName,
} from '@/domain/mood';
import { newId } from '@/utils/id';

export type PickResult = { kind: 'picked'; uris: string[] } | { kind: 'canceled' } | { kind: 'denied' };

export interface StoredPhoto {
  id: string;
  fileName: string;
  width: number;
  height: number;
}

function moodDir(): Directory {
  const dir = new Directory(Paths.document, 'media', 'mood');
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return dir;
}

function toResult(result: ImagePicker.ImagePickerResult): PickResult {
  if (result.canceled || result.assets.length === 0) return { kind: 'canceled' };
  return { kind: 'picked', uris: result.assets.map((asset) => asset.uri) };
}

/** 把缓存里的文件移进 media/mood/，同名先删 */
function adopt(cacheUri: string, name: string): void {
  const dest = new File(moodDir(), name);
  if (dest.exists) dest.delete();
  new File(cacheUri).moveSync(dest);
}

async function resized(source: ImageRef, longEdge: number): Promise<ImageRef> {
  const size = fitLongEdge(source, longEdge);
  return ImageManipulator.manipulate(source).resize(size).renderAsync();
}

/** 从 0.8 开始存，超过 1MB 就降一档再存，到下限为止 */
async function saveUnderLimit(image: ImageRef): Promise<string> {
  let quality: number | null = PHOTO_QUALITY;
  let uri = '';
  while (quality !== null) {
    const saved = await image.saveAsync({ compress: quality, format: SaveFormat.JPEG });
    if (uri) new File(uri).delete();
    uri = saved.uri;
    if ((new File(uri).size ?? 0) <= PHOTO_MAX_BYTES) break;
    quality = nextPhotoQuality(quality);
  }
  return uri;
}

export const media = {
  /** 相册多选，上限为剩余张数 */
  async pickFromLibrary(limit: number): Promise<PickResult> {
    if (limit <= 0) return { kind: 'canceled' };
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: limit > 1,
      selectionLimit: limit,
      orderedSelection: true,
      quality: 1,
    });
    return toResult(result);
  },

  /** 拍一张；相机权限在第一次拍照时申请 */
  async takePhoto(): Promise<PickResult> {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return { kind: 'denied' };
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 1 });
    return toResult(result);
  },

  /** 压缩原图（长边 1920、≤ 1MB）并生成缩略图，两张都存进 media/mood/ */
  async process(sourceUri: string): Promise<StoredPhoto> {
    const id = newId();
    const fileName = photoFileName(id);
    const refs: ImageRef[] = [];
    try {
      // 先渲染一次拿到摆正后的真实宽高，不受 EXIF 方向影响
      const original = await ImageManipulator.manipulate(sourceUri).renderAsync();
      refs.push(original);
      const full = await resized(original, PHOTO_LONG_EDGE);
      refs.push(full);
      const thumb = await resized(full, THUMB_LONG_EDGE);
      refs.push(thumb);

      const fullUri = await saveUnderLimit(full);
      const thumbSaved = await thumb.saveAsync({ compress: PHOTO_QUALITY, format: SaveFormat.JPEG });
      adopt(fullUri, fileName);
      adopt(thumbSaved.uri, thumbFileName(fileName));
      return { id, fileName, width: full.width, height: full.height };
    } catch (error) {
      media.remove(fileName);
      throw error;
    } finally {
      refs.forEach((ref) => ref.release());
    }
  },

  uri(fileName: string): string {
    return new File(moodDir(), fileName).uri;
  },

  thumbUri(fileName: string): string {
    return new File(moodDir(), thumbFileName(fileName)).uri;
  },

  /** 原图文件是否还在；草稿恢复前用它剔除已被清理的照片 */
  exists(fileName: string): boolean {
    return new File(moodDir(), fileName).exists;
  },

  /** 删掉原图和缩略图；文件不在时不报错 */
  remove(fileName: string): void {
    for (const name of [fileName, thumbFileName(fileName)]) {
      const file = new File(moodDir(), name);
      if (file.exists) file.delete();
    }
  },
};
