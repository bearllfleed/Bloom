/**
 * 徽章组件（设计规范 7.3、第 3 期 3-2/3-3/3-6）。
 * - 画板固定 200×200，按 size 缩放；颜色全部来自徽章语义色板，深浅色外观下不变；
 * - mode="static"：静态渲染，成就馆网格使用，不启动任何循环；
 * - mode="idle"：光芒慢转 + 星星闪烁；用 useIdleMotion() 判断，减弱动态或页面不在前台时自动停下；
 * - mode="celebrate"：徽章从 0 弹到 1.15 再回到 1，光芒与星星随之淡入；减弱动态时只有 160ms 淡入；
 * - locked：未获得用墨色剪影；隐藏未获得固定为礼盒问号，已获得后恢复真实图案。
 * 徽章在深色模式下保持原色，无需读取主题；对比度由奶油色内芯保证。
 */
import { useEffect } from 'react';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { G, Path } from 'react-native-svg';

import { timing, useMotionReduced } from '@/ui/motion';
import { useIdleMotion } from '@/ui/motion/idle';
import { partMatrix } from '@/ui/motion/matrix';
import { AnimatedG } from '@/ui/motion/svg';

import { BadgeBase } from './BadgeBase';
import { BadgeDigits } from './BadgeDigits';
import { BadgeMotif } from './motifs';
import { BADGE_MOTION, BADGE_PALETTE, badgeVisual, type BadgeMode } from './visual';

/** 12 道光芒：内圈 66、外圈 92，围绕 100,100 */
const BADGE_RAY_PATHS = Array.from({ length: 12 }, (_, i) => {
  const angle = (Math.PI * 2 * i) / 12;
  const inner = 66;
  const outer = i % 2 === 0 ? 92 : 84;
  const x1 = 100 + Math.cos(angle - 0.12) * inner;
  const y1 = 100 + Math.sin(angle - 0.12) * inner;
  const x2 = 100 + Math.cos(angle) * outer;
  const y2 = 100 + Math.sin(angle) * outer;
  const x3 = 100 + Math.cos(angle + 0.12) * inner;
  const y3 = 100 + Math.sin(angle + 0.12) * inner;
  return `M${x1.toFixed(2)} ${y1.toFixed(2)}L${x2.toFixed(2)} ${y2.toFixed(2)}L${x3.toFixed(2)} ${y3.toFixed(2)}Z`;
});

/** 三颗点缀星星的位置；idle 时错开相位闪烁 */
const BADGE_STARS = [
  { id: 'star-a', cx: 52, cy: 56, r: 7 },
  { id: 'star-b', cx: 150, cy: 62, r: 5 },
  { id: 'star-c', cx: 142, cy: 146, r: 4 },
] as const;

function starPath(cx: number, cy: number, r: number) {
  const points = Array.from({ length: 8 }, (_, i) => {
    const angle = (Math.PI * 2 * i) / 8 - Math.PI / 2;
    const radius = i % 2 === 0 ? r : r * 0.36;
    return `${(cx + Math.cos(angle) * radius).toFixed(2)} ${(cy + Math.sin(angle) * radius).toFixed(2)}`;
  });
  return `M${points.join('L')}Z`;
}

interface BadgeRaysProps {
  color: string;
  opacity?: number;
}

/** 光芒层：慢转由外层 AnimatedG 负责 */
function BadgeRays({ color, opacity = 0.55 }: BadgeRaysProps) {
  return (
    <G opacity={opacity}>
      {BADGE_RAY_PATHS.map((d, i) => (
        <Path key={d} d={d} fill={i % 2 === 0 ? color : BADGE_PALETTE.lemon} />
      ))}
    </G>
  );
}

function BadgeStar({ cx, cy, r, color }: { cx: number; cy: number; r: number; color: string }) {
  return (
    <Path d={starPath(cx, cy, r)} fill={color} stroke={BADGE_PALETTE.ink} strokeWidth={1.4} strokeLinejoin="round" />
  );
}

export type BadgeProps = {
  /** 成就编号（A01–A72）或稳定 key（first_project 等） */
  id: string;
  /** 渲染尺寸，默认 88（成就馆网格） */
  size?: number;
  /** static / idle / celebrate，默认 static */
  mode?: BadgeMode;
  /** 未获得 */
  locked?: boolean;
  /** 强制隐藏图案；不能覆盖目录中的隐藏定义 */
  hidden?: boolean;
  /** 是否绘制光芒层；默认只在 idle / celebrate 绘制，静态网格不画 */
  rays?: boolean;
  /** 读屏描述，例如徽章名与获得状态 */
  accessibilityLabel?: string;
};

const VIEW = 200;
const CENTER = 100;
/** 待机光芒与星星的静止透明度：停止待机时回到这里，不闪、不转 */
const RAY_REST = 0.32;
const STAR_REST = 0.75;

export function Badge({
  id,
  size = 88,
  mode = 'static',
  locked = false,
  hidden,
  rays,
  accessibilityLabel,
}: BadgeProps) {
  const visual = badgeVisual(id, mode, { locked, hidden });
  const idleAllowed = useIdleMotion();
  const reduced = useMotionReduced();
  const idle = mode !== 'static' && idleAllowed && !reduced;
  const celebrate = mode === 'celebrate';
  // 静态网格不画光芒；细节面板和弹窗默认画
  const showRays = rays ?? mode !== 'static';

  const rayClock = useSharedValue(0);
  const starClock = useSharedValue(0);
  const pop = useSharedValue(celebrate ? 0 : 1);
  const reveal = useSharedValue(celebrate ? 0 : 1);

  useEffect(() => {
    if (idle) {
      rayClock.value = withRepeat(
        withTiming(1, { duration: BADGE_MOTION.rayTurnMs, easing: Easing.linear }),
        -1,
        false,
      );
      starClock.value = withRepeat(
        withTiming(1, { duration: BADGE_MOTION.starTwinkleMs, easing: Easing.linear }),
        -1,
        false,
      );
      return;
    }
    cancelAnimation(rayClock);
    cancelAnimation(starClock);
    rayClock.value = withTiming(0, timing.base);
    starClock.value = withTiming(0, timing.base);
  }, [idle, rayClock, starClock]);

  useEffect(() => {
    if (!celebrate) return;
    if (reduced) {
      reveal.value = withTiming(1, timing.reduced);
      pop.value = 1;
      return;
    }
    reveal.value = withDelay(BADGE_MOTION.celebrateDelayMs, withTiming(1, timing.base));
    pop.value = withDelay(
      BADGE_MOTION.celebrateDelayMs,
      withSequence(
        withTiming(1.15, { duration: BADGE_MOTION.celebratePopMs / 2, easing: Easing.out(Easing.quad) }),
        withTiming(0.97, { duration: BADGE_MOTION.celebratePopMs / 3, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: BADGE_MOTION.celebratePopMs / 3, easing: Easing.inOut(Easing.quad) }),
      ),
    );
  }, [celebrate, pop, reduced, reveal]);

  const popProps = useAnimatedProps(() => ({
    matrix: partMatrix(CENTER, CENTER, { scale: 0.85 + 0.15 * pop.value }),
    // 与现有 IdlePart 一致：同时返回 opacity，react-native-svg 才能匹配 G 的动画属性类型
    opacity: 1,
  }));

  const rayProps = useAnimatedProps(() => ({
    matrix: partMatrix(CENTER, CENTER, { rotate: 360 * rayClock.value }),
    opacity: RAY_REST * reveal.value + (idle ? 0.23 : 0),
  }));

  const starProps = useAnimatedProps(() => {
    const twinkle = idle ? 0.4 + 0.6 * ((Math.sin(2 * Math.PI * starClock.value) + 1) / 2) : STAR_REST;
    return { opacity: twinkle * reveal.value };
  });

  const fadeStyle = useAnimatedStyle(() => ({ opacity: reveal.value }));

  return (
    <Animated.View style={[{ width: size, height: size }, celebrate ? fadeStyle : null]}>
      <Svg
        width={size}
        height={size}
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        accessibilityRole="image"
        accessibilityLabel={accessibilityLabel}
      >
        {showRays ? (
          <AnimatedG animatedProps={rayProps}>
            <BadgeRays color={visual.colors.primary} opacity={1} />
          </AnimatedG>
        ) : null}
        {showRays
          ? BADGE_STARS.map((star) => (
              <AnimatedG key={star.id} animatedProps={starProps}>
                <BadgeStar cx={star.cx} cy={star.cy} r={star.r} color={BADGE_PALETTE.lemon} />
              </AnimatedG>
            ))
          : null}
        <AnimatedG animatedProps={popProps}>
          <BadgeBase base={visual.base} colors={visual.colors} silhouette={visual.locked} />
          {visual.digits ? (
            <BadgeDigits value={visual.digits} color={visual.locked ? visual.colors.primary : visual.colors.ink} />
          ) : (
            <BadgeMotif motif={visual.motif} colors={visual.colors} silhouette={visual.locked} />
          )}
        </AnimatedG>
      </Svg>
    </Animated.View>
  );
}
