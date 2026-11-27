/**
 * 心情编辑规则：Unicode 字数、内容校验、独立草稿键、未保存变更与草稿调度。
 */
import {
  canSaveMood,
  createMoodDraftScheduler,
  hasMoodChanged,
  MOOD_TEXT_MAX_LENGTH,
  moodDraftKey,
  normalizeMoodText,
  truncateMoodText,
  type MoodFace,
} from '@/domain/mood';

const faces: MoodFace[] = ['ecstatic', 'happy', 'calm', 'tired', 'sad'];

describe('心情编辑', () => {
  it('五种表情按设计顺序导出', () => {
    expect(faces).toEqual(['ecstatic', 'happy', 'calm', 'tired', 'sad']);
  });

  it('用 Unicode 码点而不是 UTF-16 单元截断，且明确返回是否截断', () => {
    expect(truncateMoodText('开心😀')).toEqual({ text: '开心😀', wasTruncated: false });
    expect(truncateMoodText('😀'.repeat(501))).toEqual({ text: '😀'.repeat(500), wasTruncated: true });
    expect(Array.from(truncateMoodText('😀'.repeat(600)).text)).toHaveLength(MOOD_TEXT_MAX_LENGTH);
  });

  it('统一换行并去掉首尾空白，空白内容视为没有文字', () => {
    expect(normalizeMoodText(' \t\r\n第一行\r第二行\n\n ')).toBe('第一行\n第二行');
    expect(normalizeMoodText(' \n\t ')).toBe('');
    expect(canSaveMood({ face: null, text: ' \n\t ', photoCount: 0 })).toBe(false);
  });

  it('表情、非空文字、照片任意一项即可保存，但照片最多五张', () => {
    expect(canSaveMood({ face: 'calm', text: '', photoCount: 0 })).toBe(true);
    expect(canSaveMood({ face: null, text: '记一笔', photoCount: 0 })).toBe(true);
    expect(canSaveMood({ face: null, text: '', photoCount: 1 })).toBe(true);
    expect(canSaveMood({ face: 'happy', text: '记一笔', photoCount: 5 })).toBe(true);
    expect(canSaveMood({ face: 'happy', text: '记一笔', photoCount: 6 })).toBe(false);
  });

  it('同一天同一项目有独立草稿，当天心情不与项目心情冲突', () => {
    expect(moodDraftKey('2026-11-22', 'p1')).toBe(moodDraftKey('2026-11-22', 'p1'));
    expect(moodDraftKey('2026-11-22', 'p1')).not.toBe(moodDraftKey('2026-11-22', 'p2'));
    expect(moodDraftKey('2026-11-22', 'p1')).not.toBe(moodDraftKey('2026-11-23', 'p1'));
    expect(moodDraftKey('2026-11-22', null)).not.toBe(moodDraftKey('2026-11-22', 'p1'));
    expect(moodDraftKey('2026-11-22', null)).toBe(moodDraftKey('2026-11-22', null));
  });

  it('编辑变更比较规范化文字和照片顺序', () => {
    const saved = {
      face: 'happy' as const,
      text: '今天很好',
      photos: [
        { id: 'a', fileName: 'a.jpg', width: 100, height: 100 },
        { id: 'b', fileName: 'b.jpg', width: 100, height: 100 },
      ],
    };
    expect(hasMoodChanged(saved, { face: 'happy', text: ' 今天很好\r\n', photos: saved.photos })).toBe(false);
    expect(hasMoodChanged(saved, { face: 'calm', text: '今天很好', photos: saved.photos })).toBe(true);
    expect(hasMoodChanged(saved, { face: 'happy', text: '改一下', photos: saved.photos })).toBe(true);
    expect(hasMoodChanged(saved, { face: 'happy', text: '今天很好', photos: [saved.photos[1], saved.photos[0]] })).toBe(
      true,
    );
    expect(hasMoodChanged(saved, { face: 'happy', text: '今天很好', photos: [saved.photos[0]] })).toBe(true);
    expect(hasMoodChanged(null, { face: null, text: '  ', photos: [] })).toBe(false);
  });

  it('编辑草稿每两秒与退到后台时保存，保存或明确放弃时清理', () => {
    jest.useFakeTimers();
    const save = jest.fn();
    const clear = jest.fn();
    const scheduler = createMoodDraftScheduler('mood.draft.test', { save, clear });
    scheduler.changed();
    expect(save).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1999);
    expect(save).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    expect(save).toHaveBeenCalledWith('mood.draft.test');

    scheduler.changed();
    scheduler.background();
    expect(save).toHaveBeenCalledTimes(2);
    jest.advanceTimersByTime(2000);
    expect(save).toHaveBeenCalledTimes(2);

    scheduler.changed();
    scheduler.saved();
    expect(clear).toHaveBeenCalledWith('mood.draft.test');
    scheduler.changed();
    scheduler.discarded();
    expect(clear).toHaveBeenCalledTimes(2);
    jest.advanceTimersByTime(4000);
    expect(save).toHaveBeenCalledTimes(2);
    jest.useRealTimers();
  });
});
