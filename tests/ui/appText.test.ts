import { resolveTypeStyle } from '@/ui/tokens/typography';

describe('字体可用性样式', () => {
  it('自定义字体可用时保留 Fredoka 数字字体', () => {
    expect(resolveTypeStyle('numberL', true).fontFamily).toBe('Fredoka_600SemiBold');
  });

  it('自定义字体不可用时数字样式回退系统字体', () => {
    expect(resolveTypeStyle('numberL', false).fontFamily).toBeUndefined();
  });

  it('系统字体样式不创建多余副本', () => {
    expect(resolveTypeStyle('body', false)).toBe(resolveTypeStyle('body', true));
  });
});
