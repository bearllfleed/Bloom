/**
 * 数字滚动（动效 M16）：每位数字独立纵向滚动到新值。
 * 用于数据块、步进器、计数等所有会变化的数字。
 */
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { curves, useMotionReduced } from '@/ui/motion';
import { type, type TypeVariant } from '@/ui/tokens';

import { AppText, type TextTone } from './AppText';

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

export interface RollingNumberProps {
  value: number;
  variant?: Extract<TypeVariant, 'numberXL' | 'numberL' | 'numberM' | 'numberS'>;
  tone?: TextTone;
  color?: string;
  /** 数字滚动时长，默认 600ms */
  durationMs?: number;
}

function Digit({
  digit,
  lineHeight,
  variant,
  tone,
  color,
  durationMs,
}: { digit: number; lineHeight: number } & Required<Pick<RollingNumberProps, 'variant' | 'durationMs'>> &
  Pick<RollingNumberProps, 'tone' | 'color'>) {
  const reduced = useMotionReduced();
  const offset = useSharedValue(-digit * lineHeight);
  useEffect(() => {
    offset.value = reduced
      ? -digit * lineHeight
      : withTiming(-digit * lineHeight, { duration: durationMs, easing: curves.standard });
  }, [digit, durationMs, lineHeight, offset, reduced]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: offset.value }] }));
  return (
    <View style={{ height: lineHeight, overflow: 'hidden' }}>
      <Animated.View style={style}>
        {DIGITS.map((d) => (
          <AppText key={d} variant={variant} tone={tone} color={color} style={{ height: lineHeight }}>
            {d}
          </AppText>
        ))}
      </Animated.View>
    </View>
  );
}

export function RollingNumber({ value, variant = 'numberL', tone, color, durationMs = 600 }: RollingNumberProps) {
  const lineHeight = type[variant].lineHeight;
  const chars = String(Math.max(0, Math.round(value))).split('');
  return (
    <View style={styles.row} accessible accessibilityLabel={String(value)}>
      {chars.map((c, i) => (
        <Digit
          key={`${chars.length - i}`}
          digit={Number(c)}
          lineHeight={lineHeight}
          variant={variant}
          tone={tone}
          color={color}
          durationMs={durationMs}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
});
