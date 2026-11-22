/**
 * 花苞按钮（第 0 期文档第 3 节、设计规范动效 M02/M03/M04/M27）。
 * - 待打卡：闭合的花苞；多次打卡时外圈分段，每打一次亮一段（M03）；
 * - 完成：花苞膨胀，花萼张开，5 片花瓣依次展开，花心弹出，8 片小花瓣向外飞散（M02，约 520ms）；
 * - 撤销：倒放收拢（M04）；不可打卡时点击左右轻摇（M27）。
 * 动画由 completed / done 的变化触发，首次渲染直接显示最终状态，列表刷新不会重播。
 */
import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle, G, Path } from 'react-native-svg';

import { haptics } from '@/platform/haptics';
import { curves, springs, useMotionReduced } from '@/ui/motion';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { duration } from '@/ui/tokens';

const SIZE = 52;
const HIT = 56;
const C = SIZE / 2;
const INK = '#3F2A33';
const LEMON = '#FFD66B';
const MINT = '#7EDCC2';
const BUD = '#FFC7DB';
const RING_RADIUS = 24.5;
const MAX_SEGMENTS = 8;
const BURST_COUNT = 8;

/** 5 片花瓣在 52×52 画布中的中心与半径 */
const PETALS = [-90, -18, 54, 126, 198].map((deg) => {
  const rad = (deg * Math.PI) / 180;
  return { cx: C + 10.5 * Math.cos(rad), cy: C + 10.5 * Math.sin(rad) };
});
const PETAL_R = 8.4;

const AnimatedPath = Animated.createAnimatedComponent(Path);

export interface BloomButtonProps {
  /** 当天是否已完成（决定花苞/盛开） */
  completed: boolean;
  /** 多次打卡的分段进度；单次项目不传 */
  segments?: { done: number; total: number };
  /** 盛开花瓣颜色（项目底色） */
  color: string;
  /** 分段环颜色（项目深色） */
  deepColor: string;
  /** 周期已达标：盛开并带小勾 */
  met?: boolean;
  /** 不可打卡（未来日期等）：半透明，点击轻摇 */
  disabled?: boolean;
  onPress?: () => void;
  /** 点击不可打卡状态时回调，用于提示原因 */
  onDisabledPress?: () => void;
  accessibilityLabel: string;
}

function arcPath(index: number, total: number): { d: string; length: number } {
  const gapDeg = total > 1 ? 10 : 0;
  const span = 360 / total - gapDeg;
  const start = -90 + index * (360 / total) + gapDeg / 2;
  const end = start + span;
  const toXY = (deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return [C + RING_RADIUS * Math.cos(rad), C + RING_RADIUS * Math.sin(rad)];
  };
  const [x1, y1] = toXY(start);
  const [x2, y2] = toXY(end);
  if (total === 1) {
    return {
      d: `M ${C} ${C - RING_RADIUS} A ${RING_RADIUS} ${RING_RADIUS} 0 1 1 ${C - 0.01} ${C - RING_RADIUS}`,
      length: 2 * Math.PI * RING_RADIUS,
    };
  }
  return {
    d: `M ${x1} ${y1} A ${RING_RADIUS} ${RING_RADIUS} 0 ${span > 180 ? 1 : 0} 1 ${x2} ${y2}`,
    length: (span / 360) * 2 * Math.PI * RING_RADIUS,
  };
}

/** 单段分段环；filled 从 0 到 1 表示这一段被"画满" */
function RingSegment({
  index,
  total,
  filled,
  color,
  track,
}: {
  index: number;
  total: number;
  filled: SharedValue<number>;
  color: string;
  track: string;
}) {
  const { d, length } = arcPath(index, total);
  const props = useAnimatedProps(() => ({ strokeDashoffset: length * (1 - filled.value) }));
  return (
    <G>
      <Path d={d} stroke={track} strokeWidth={3} strokeLinecap="round" fill="none" />
      <AnimatedPath
        d={d}
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={`${length} ${length}`}
        animatedProps={props}
      />
    </G>
  );
}

function Petal({ index, progress, color }: { index: number; progress: SharedValue<number>; color: string }) {
  const { cx, cy } = PETALS[index];
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.15], [0, 1], 'clamp'),
    transform: [{ rotate: `${(1 - progress.value) * -30}deg` }, { scale: 0.3 + 0.7 * progress.value }],
  }));
  return (
    <Animated.View style={[styles.layer, style]} pointerEvents="none">
      <Svg width={SIZE} height={SIZE}>
        <Circle cx={cx} cy={cy} r={PETAL_R} fill={color} stroke={INK} strokeWidth={1.8} />
      </Svg>
    </Animated.View>
  );
}

function BurstPetal({ index, burst, color }: { index: number; burst: SharedValue<number>; color: string }) {
  const angle = ((index * 360) / BURST_COUNT + 22.5) * (Math.PI / 180);
  const distance = 24 + (index % 2) * 16;
  const style = useAnimatedStyle(() => ({
    opacity: burst.value === 0 ? 0 : 1 - burst.value,
    transform: [
      { translateX: Math.cos(angle) * distance * burst.value },
      { translateY: Math.sin(angle) * distance * burst.value },
      { rotate: `${burst.value * 120}deg` },
      { scale: 1 - 0.4 * burst.value },
    ],
  }));
  return <Animated.View pointerEvents="none" style={[styles.burst, { backgroundColor: color }, style]} />;
}

export function BloomButton({
  completed,
  segments,
  color,
  deepColor,
  met = false,
  disabled = false,
  onPress,
  onDisabledPress,
  accessibilityLabel,
}: BloomButtonProps) {
  const { colors } = useTheme();
  const reduced = useMotionReduced();
  const press = useSharedValue(1);
  const bud = useSharedValue(1); // 花苞缩放
  const budOpacity = useSharedValue(completed ? 0 : 1);
  const sepal = useSharedValue(completed ? 1 : 0); // 花萼张开程度
  const initPetal = completed ? 1 : 0;
  const petals = [
    useSharedValue(initPetal),
    useSharedValue(initPetal),
    useSharedValue(initPetal),
    useSharedValue(initPetal),
    useSharedValue(initPetal),
  ];
  const center = useSharedValue(completed ? 1 : 0);
  const burst = useSharedValue(0);
  const shake = useSharedValue(0);

  const total = segments?.total ?? 1;
  const showSegments = total > 1;
  const segmentCount = showSegments ? Math.min(total, MAX_SEGMENTS) : 0;
  // 超过 8 次时用一整圈连续环表示进度
  const continuous = total > MAX_SEGMENTS;
  const initialDone = segments?.done ?? 0;
  const initFill = (i: number) => (continuous ? (i === 0 ? initialDone / total : 0) : i < initialDone ? 1 : 0);
  const segmentFill = [
    useSharedValue(initFill(0)),
    useSharedValue(initFill(1)),
    useSharedValue(initFill(2)),
    useSharedValue(initFill(3)),
    useSharedValue(initFill(4)),
    useSharedValue(initFill(5)),
    useSharedValue(initFill(6)),
    useSharedValue(initFill(7)),
  ];

  const prev = useRef({ completed, done: segments?.done ?? 0 });

  useEffect(() => {
    const before = prev.current;
    prev.current = { completed, done: segments?.done ?? 0 };
    const done = segments?.done ?? 0;

    // 分段环：新增的一段画满（M03），撤销时收回
    if (showSegments) {
      if (continuous) {
        segmentFill[0].value = withTiming(done / total, { duration: reduced ? duration.reduced : 200 });
      } else {
        segmentFill.forEach((v, i) => {
          const target = i < Math.min(done, segmentCount) ? 1 : 0;
          if (v.value !== target)
            v.value = withTiming(target, { duration: reduced ? duration.reduced : 200, easing: curves.enter });
        });
      }
    }

    if (!before.completed && completed) {
      haptics.light();
      if (reduced) {
        petals.forEach((p) => (p.value = withTiming(1, { duration: duration.reduced })));
        center.value = withTiming(1, { duration: duration.reduced });
        budOpacity.value = withTiming(0, { duration: duration.reduced });
        sepal.value = withTiming(1, { duration: duration.reduced });
        return;
      }
      // M02 花苞绽放
      bud.value = withSequence(
        withTiming(1.12, { duration: 180, easing: curves.enter }),
        withTiming(1, { duration: 160 }),
      );
      sepal.value = withDelay(80, withTiming(1, { duration: 180, easing: curves.enter }));
      budOpacity.value = withDelay(220, withTiming(0, { duration: 140 }));
      petals.forEach((p, i) => {
        p.value = withDelay(160 + i * 30, withSpring(1, { damping: 12, stiffness: 220 }));
      });
      center.value = withDelay(300, withSpring(1, springs.bouncy));
      burst.value = 0;
      burst.value = withDelay(
        200,
        withTiming(1, { duration: 320, easing: curves.enter }, () => {
          burst.value = 0;
        }),
      );
    } else if (before.completed && !completed) {
      haptics.soft();
      const d = reduced ? duration.reduced : 200;
      // M04 撤销收拢：花瓣倒序收起
      petals.forEach((p, i) => {
        p.value = withDelay(reduced ? 0 : (4 - i) * 20, withTiming(0, { duration: d, easing: curves.exit }));
      });
      center.value = withTiming(0, { duration: d });
      budOpacity.value = withDelay(reduced ? 0 : 80, withTiming(1, { duration: d }));
      sepal.value = withTiming(0, { duration: d });
      bud.value = 1;
    } else if (!completed && done > before.done) {
      haptics.selection();
      if (!reduced) bud.value = withSequence(withTiming(1.08, { duration: 100 }), withSpring(1, springs.bouncy));
    } else if (!completed && done < before.done) {
      haptics.soft();
    }
    // 共享值对象引用稳定，只需要在业务状态变化时运行
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completed, segments?.done, segments?.total, reduced]);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }, { scale: press.value }],
    opacity: disabled ? 0.4 : 1,
  }));
  const budStyle = useAnimatedStyle(() => ({ opacity: budOpacity.value, transform: [{ scale: bud.value }] }));
  const leftSepalStyle = useAnimatedStyle(() => ({
    opacity: budOpacity.value,
    transform: [{ rotate: `${-35 * sepal.value}deg` }],
  }));
  const rightSepalStyle = useAnimatedStyle(() => ({
    opacity: budOpacity.value,
    transform: [{ rotate: `${35 * sepal.value}deg` }],
  }));
  const centerStyle = useAnimatedStyle(() => ({
    opacity: center.value > 0 ? 1 : 0,
    transform: [{ scale: center.value }],
  }));

  const handlePress = () => {
    if (disabled) {
      haptics.warning();
      shake.value = reduced
        ? 0
        : withSequence(
            withTiming(-4, { duration: 50 }),
            withTiming(4, { duration: 50 }),
            withTiming(-4, { duration: 50 }),
            withTiming(4, { duration: 50 }),
            withTiming(-4, { duration: 50 }),
            withTiming(0, { duration: 50 }),
          );
      onDisabledPress?.();
      return;
    }
    onPress?.();
  };

  const outline = colors.text === INK ? INK : colors.textSecondary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled, checked: completed }}
      hitSlop={(HIT - SIZE) / 2}
      onPress={handlePress}
      onPressIn={() => {
        press.value = withSpring(0.88, springs.press);
      }}
      onPressOut={() => {
        press.value = withSpring(1, springs.press);
      }}
      style={styles.root}
    >
      <Animated.View style={[styles.box, pressStyle]}>
        {/* 底圈 */}
        <Svg width={SIZE} height={SIZE} style={StyleSheet.absoluteFill}>
          <Circle cx={C} cy={C} r={21} fill={colors.sunken} stroke={outline} strokeWidth={2} />
        </Svg>

        {/* 分段环 */}
        {showSegments ? (
          <Svg width={SIZE} height={SIZE} style={StyleSheet.absoluteFill}>
            {Array.from({ length: continuous ? 1 : segmentCount }, (_, i) => (
              <RingSegment
                key={i}
                index={i}
                total={continuous ? 1 : segmentCount}
                filled={segmentFill[i]}
                color={deepColor}
                track={colors.hairline}
              />
            ))}
          </Svg>
        ) : null}

        {/* 花萼：绕花苞底部张开 */}
        <Animated.View style={[styles.layer, styles.sepalOrigin, leftSepalStyle]} pointerEvents="none">
          <Svg width={SIZE} height={SIZE}>
            <Path
              d="M26 36C22.5 36.6 19.6 34.8 18.4 31.3 21.9 31.3 24.8 33 26 36Z"
              fill={MINT}
              stroke={INK}
              strokeWidth={1.6}
              strokeLinejoin="round"
            />
          </Svg>
        </Animated.View>
        <Animated.View style={[styles.layer, styles.sepalOrigin, rightSepalStyle]} pointerEvents="none">
          <Svg width={SIZE} height={SIZE}>
            <Path
              d="M26 36C29.5 36.6 32.4 34.8 33.6 31.3 30.1 31.3 27.2 33 26 36Z"
              fill={MINT}
              stroke={INK}
              strokeWidth={1.6}
              strokeLinejoin="round"
            />
          </Svg>
        </Animated.View>

        {/* 花苞 */}
        <Animated.View style={[styles.layer, styles.sepalOrigin, budStyle]} pointerEvents="none">
          <Svg width={SIZE} height={SIZE}>
            <Path
              d="M26 15.5C30.2 19.6 31.4 25.6 26 36 20.6 25.6 21.8 19.6 26 15.5Z"
              fill={BUD}
              stroke={INK}
              strokeWidth={1.8}
              strokeLinejoin="round"
            />
            <Path
              d="M24.2 21.5c-.5 1.6-.5 3.4 0 5"
              stroke="#FFFFFF"
              strokeWidth={1.6}
              strokeLinecap="round"
              opacity={0.8}
            />
          </Svg>
        </Animated.View>

        {/* 花瓣与花心 */}
        {petals.map((p, i) => (
          <Petal key={i} index={i} progress={p} color={color} />
        ))}
        <Animated.View style={[styles.layer, centerStyle]} pointerEvents="none">
          <Svg width={SIZE} height={SIZE}>
            <Circle cx={C} cy={C} r={6.6} fill={LEMON} stroke={INK} strokeWidth={1.8} />
            {/* 花心上的小笑脸 */}
            <Circle cx={C - 2.2} cy={C - 0.8} r={0.9} fill={INK} />
            <Circle cx={C + 2.2} cy={C - 0.8} r={0.9} fill={INK} />
            <Path
              d={`M${C - 1.8} ${C + 1.4}q1.8 1.4 3.6 0`}
              stroke={INK}
              strokeWidth={1.1}
              strokeLinecap="round"
              fill="none"
            />
          </Svg>
        </Animated.View>

        {/* 已达标的小勾 */}
        {met && completed ? (
          <View style={[styles.metBadge, { backgroundColor: colors.success, borderColor: colors.card }]}>
            <Svg width={10} height={10} viewBox="0 0 24 24">
              <Path
                d="M5 12.5l4.5 4.5L19 7.5"
                stroke="#FFFFFF"
                strokeWidth={3.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </Svg>
          </View>
        ) : null}

        {/* 飞散的小花瓣 */}
        <View style={styles.burstOrigin} pointerEvents="none">
          {Array.from({ length: BURST_COUNT }, (_, i) => (
            <BurstPetal key={i} index={i} burst={burst} color={i % 3 === 0 ? LEMON : color} />
          ))}
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { width: SIZE, height: SIZE },
  box: { width: SIZE, height: SIZE },
  layer: { position: 'absolute', left: 0, top: 0, width: SIZE, height: SIZE },
  // 花苞与花萼绕花苞底部（26, 36）变换
  sepalOrigin: { transformOrigin: [C, 36, 0] },
  burstOrigin: { position: 'absolute', left: C - 3, top: C - 3, width: 6, height: 6 },
  burst: { position: 'absolute', width: 6, height: 6, borderTopLeftRadius: 6, borderBottomRightRadius: 6 },
  metBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
