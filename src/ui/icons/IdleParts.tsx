/**
 * 项目图标的待机动画（设计规范 9.2 第 3 条）。
 * IdleClockProvider 为一个图标跑一条共用时钟；生成的图标在正常层和外描边层各渲染一次 IdlePart，
 * 两层同名部件读同一个值，贴纸白边跟着部件一起动。
 * 不能播时（useIdleMotion 为假）幅度收到 0、回到静止姿势，再停掉时钟。
 */
import { createContext, use, useEffect, useMemo, type ReactNode } from 'react';
import {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { timing } from '@/ui/motion';
import { useIdleMotion } from '@/ui/motion/idle';
import { partMatrix } from '@/ui/motion/matrix';
import { AnimatedG } from '@/ui/motion/svg';

import type { IconPartProps } from './generated/projectIcons';
import { idlePose, IDLE_LOOP_MS, partMotion, type PartMotion } from './partMotion';

interface IdleClock {
  clock: SharedValue<number>;
  amp: SharedValue<number>;
  motions: Record<string, PartMotion | undefined>;
}

const IdleClockContext = createContext<IdleClock | null>(null);

function useIdleClock(): IdleClock {
  const ctx = use(IdleClockContext);
  if (!ctx) throw new Error('IdlePart 必须放在 IdleClockProvider 里');
  return ctx;
}

export function IdleClockProvider({ parts, children }: { parts: readonly string[]; children: ReactNode }) {
  const active = useIdleMotion();
  const clock = useSharedValue(0);
  const amp = useSharedValue(0);

  useEffect(() => {
    if (active) {
      clock.value = 0;
      clock.value = withRepeat(withTiming(1, { duration: IDLE_LOOP_MS, easing: Easing.linear }), -1, false);
      amp.value = withTiming(1, timing.slow);
    } else {
      amp.value = withTiming(0, timing.base, (finished) => {
        if (finished) cancelAnimation(clock);
      });
    }
  }, [active, amp, clock]);

  useEffect(
    () => () => {
      cancelAnimation(clock);
      cancelAnimation(amp);
    },
    [amp, clock],
  );

  const value = useMemo<IdleClock>(
    () => ({ clock, amp, motions: Object.fromEntries(parts.map((name, i) => [name, partMotion(name, i)])) }),
    [amp, clock, parts],
  );
  return <IdleClockContext value={value}>{children}</IdleClockContext>;
}

/** 交给生成图标的 part 参数 */
export function IdlePart({ name, originX, originY, children }: IconPartProps) {
  const { clock, amp, motions } = useIdleClock();
  const motion = motions[name] ?? partMotion(name, 0);
  const animatedProps = useAnimatedProps(() => {
    const pose = idlePose(motion, clock.value, amp.value);
    return { matrix: partMatrix(originX, originY, pose), opacity: pose.opacity };
  });
  return <AnimatedG animatedProps={animatedProps}>{children}</AnimatedG>;
}
