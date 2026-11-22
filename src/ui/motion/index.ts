/**
 * 动效辅助：减弱动态判断、预设缓动与弹簧（设计规范第 9 节）。
 * 系统开启"减弱动态效果"或开发版预览开关打开时，组件应改用 160ms 淡入淡出。
 */
import { Easing, useReducedMotion, type WithSpringConfig } from 'react-native-reanimated';

import { usePrefs } from '@/stores/prefsStore';
import { duration, easing, spring } from '@/ui/tokens';

/** 当前是否应减弱动态 */
export function useMotionReduced(): boolean {
  const system = useReducedMotion();
  const preview = usePrefs((s) => s.devReduceMotion);
  return system || preview;
}

export const curves = {
  standard: Easing.bezier(...easing.standard),
  enter: Easing.bezier(...easing.enter),
  exit: Easing.bezier(...easing.exit),
};

export const springs: Record<keyof typeof spring, WithSpringConfig> = spring;

export const timing = {
  fast: { duration: duration.fast, easing: curves.standard },
  base: { duration: duration.base, easing: curves.standard },
  slow: { duration: duration.slow, easing: curves.enter },
  reduced: { duration: duration.reduced, easing: curves.standard },
};
