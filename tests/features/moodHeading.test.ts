/**
 * 心情标题与项目名展示：编辑页/详情的"11月22日 · 早睡"、已删除项目后缀、手账月份标题。
 */
import { journalMonthTitle, moodHeading, moodProjectLabel } from '@/features/mood/heading';

describe('心情标题', () => {
  it('项目心情写项目名，当天整体心情写"这一天"', () => {
    expect(moodHeading('2026-11-22', '早睡')).toBe('11月22日 · 早睡');
    expect(moodHeading('2026-11-22', null)).toBe('11月22日 · 这一天');
  });

  it('项目还在时用快照名，已删除时附加提示；当天整体心情没有项目名', () => {
    expect(moodProjectLabel('早睡', true)).toBe('早睡');
    expect(moodProjectLabel('早睡', false)).toBe('早睡（已删除的项目）');
    expect(moodProjectLabel(null, true)).toBeNull();
    expect(moodProjectLabel(null, false)).toBeNull();
  });

  it('手账月份标题带篇数', () => {
    expect(journalMonthTitle('2026年11月', 8)).toBe('2026年11月 · 8 篇');
  });
});
