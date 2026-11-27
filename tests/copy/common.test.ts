import { bootFailureCopyFor } from '@/copy/common';
import type { BootFailureReason } from '@/services/lifecycleService';

describe('启动失败文案', () => {
  it('只有数据库失败使用数据升级语义', () => {
    expect(bootFailureCopyFor('database')).toEqual({
      title: '数据升级没有成功',
      message: '你的数据没有变化。导出诊断日志发给开发同学，修复后再装新版本就好',
    });
  });

  it.each<BootFailureReason>([
    'preferences',
    'first_use_date',
    'achievement_baseline',
    'cleanup',
    'auto_graduate',
    'reminders',
    'bootstrap',
  ])('%s 使用通用启动失败文案且不承诺数据未变化', (reason) => {
    const copy = bootFailureCopyFor(reason);
    expect(copy.title).toBe('Bloom 没有成功启动');
    expect(copy.message).toBe('启动过程中遇到了问题。请导出诊断日志发给开发同学，修复后再重新打开');
    expect(`${copy.title}${copy.message}`).not.toContain('数据没有变化');
  });
});
