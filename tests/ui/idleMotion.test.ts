import { idleMotionAllowed } from '@/ui/motion/idleState';

describe('待机动画状态', () => {
  it('只在未减弱动态、App 前台且页面聚焦时允许循环', () => {
    expect(idleMotionAllowed(false, true, true)).toBe(true);
    expect(idleMotionAllowed(true, true, true)).toBe(false);
    expect(idleMotionAllowed(false, false, true)).toBe(false);
    expect(idleMotionAllowed(false, true, false)).toBe(false);
  });
});
