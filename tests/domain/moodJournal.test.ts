/**
 * 心情手账、详情与图片查看的纯规则：按月分组、照片网格列数、照片重排、索引夹取与记录标记键。
 */
import { clampPhotoIndex, journalMonths, moodMarkerKey, movePhoto, photoColumns } from '@/domain/mood';

describe('心情手账规则', () => {
  it('按月分组，保持输入顺序（仓储已按日期倒序）', () => {
    const moods = [
      { id: 'a', date: '2026-11-22' },
      { id: 'b', date: '2026-11-02' },
      { id: 'c', date: '2026-10-30' },
      { id: 'd', date: '2026-09-01' },
    ];
    const groups = journalMonths(moods);
    expect(groups.map((group) => group.month)).toEqual(['2026-11', '2026-10', '2026-09']);
    expect(groups[0].moods.map((mood) => mood.id)).toEqual(['a', 'b']);
    expect(groups[1].moods.map((mood) => mood.id)).toEqual(['c']);
    expect(groups[2].moods.map((mood) => mood.id)).toEqual(['d']);
    expect(journalMonths([])).toEqual([]);
  });

  it('照片网格按张数取列：1 张通栏、2 张两列、3–5 张三列', () => {
    expect(photoColumns(0)).toBe(1);
    expect(photoColumns(1)).toBe(1);
    expect(photoColumns(2)).toBe(2);
    expect(photoColumns(3)).toBe(3);
    expect(photoColumns(5)).toBe(3);
  });

  it('拖动重排返回新数组，非法位置保持原顺序', () => {
    const photos = ['a', 'b', 'c'];
    expect(movePhoto(photos, 0, 2)).toEqual(['b', 'c', 'a']);
    expect(movePhoto(photos, 2, 0)).toEqual(['c', 'a', 'b']);
    expect(movePhoto(photos, 1, 1)).toEqual(['a', 'b', 'c']);
    expect(movePhoto(photos, -1, 2)).toEqual(['a', 'b', 'c']);
    expect(movePhoto(photos, 0, 3)).toEqual(['a', 'b', 'c']);
    expect(photos).toEqual(['a', 'b', 'c']);
  });

  it('图片查看的索引夹在有效范围内，空列表为 0', () => {
    expect(clampPhotoIndex(-1, 5)).toBe(0);
    expect(clampPhotoIndex(2, 5)).toBe(2);
    expect(clampPhotoIndex(8, 5)).toBe(4);
    expect(clampPhotoIndex(0, 0)).toBe(0);
  });

  it('打卡记录的心情标记按日期与项目唯一，当天整体心情用空串占位', () => {
    expect(moodMarkerKey('2026-11-22', 'p1')).toBe('2026-11-22|p1');
    expect(moodMarkerKey('2026-11-22', null)).toBe('2026-11-22|');
  });
});
