/**
 * 第三期备份照片的路径、压缩包条目和哈希校验。
 */
import { isSafeMoodFileName, mediaHashes, moodMediaEntries, verifyMoodMedia } from '@/data/backup/media';
import { thumbFileName } from '@/domain/mood';

const bytes = (value: string) => new TextEncoder().encode(value);

describe('心情照片备份', () => {
  it('只接受单独的 jpg 文件名，拒绝路径穿越和绝对路径', () => {
    expect(isSafeMoodFileName('01ABC_photo.jpg')).toBe(true);
    expect(isSafeMoodFileName('../secret.jpg')).toBe(false);
    expect(isSafeMoodFileName('/tmp/secret.jpg')).toBe(false);
    expect(isSafeMoodFileName('nested/photo.jpg')).toBe(false);
    expect(isSafeMoodFileName('photo.png')).toBe(false);
  });

  it('每张照片打包原图和缩略图，字节保持不变', () => {
    const entries = moodMediaEntries([{ file_name: 'a.jpg' }], (name) => bytes(`content:${name}`));
    expect(entries.map((entry) => entry.name)).toEqual(['media/mood/a.jpg', 'media/mood/a.thumb.jpg']);
    expect(new TextDecoder().decode(entries[0].data)).toBe('content:a.jpg');
    expect(new TextDecoder().decode(entries[1].data)).toBe(`content:${thumbFileName('a.jpg')}`);
  });

  it('路径非法或文件缺失时不生成不完整备份', () => {
    expect(() => moodMediaEntries([{ file_name: '../a.jpg' }], () => bytes('x'))).toThrow('照片文件名');
    expect(() => moodMediaEntries([{ file_name: 'a.jpg' }], () => null)).toThrow('照片文件');
  });

  it('导入前核对照片数和每个文件的 SHA-256', () => {
    const entries = moodMediaEntries([{ file_name: 'a.jpg' }], (name) => bytes(name));
    const hashes = mediaHashes(entries);
    expect(verifyMoodMedia([{ file_name: 'a.jpg' }], entries, hashes)).toBeNull();
    expect(verifyMoodMedia([{ file_name: 'a.jpg' }], entries.slice(1), hashes)).toMatch('缺失');
    const changed = entries.map((entry) => ({ ...entry, data: bytes('changed') }));
    expect(verifyMoodMedia([{ file_name: 'a.jpg' }], changed, hashes)).toMatch('校验');
  });
});
