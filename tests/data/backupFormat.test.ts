/**
 * 备份容器：校验值与 zip 往返。
 */
import { sha256Hex } from '@/data/backup/sha256';
import { unzipStore, zipStore } from '@/data/backup/zipStore';

const text = new TextEncoder();

describe('备份格式', () => {
  it('空串与 abc 的 SHA-256 与标准向量一致', () => {
    expect(sha256Hex(new Uint8Array())).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    expect(sha256Hex(text.encode('abc'))).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });

  it('zip 往返保留中文文件名和内容', () => {
    const packed = zipStore([
      { name: 'manifest.json', data: text.encode('{"format":"bloom-backup"}') },
      { name: 'data.json', data: text.encode('{"项目":"喝水"}') },
    ]);
    const files = unzipStore(packed);
    expect(files).not.toBeNull();
    expect(new TextDecoder().decode(files?.get('data.json'))).toBe('{"项目":"喝水"}');
    expect(unzipStore(new Uint8Array([1, 2, 3]))).toBeNull();
  });
});
