/**
 * 步进器（设计规范第 8 节）：[-] 数字 [+]。
 * 长按加速连续增减；到达上下限时数字左右轻摇一次。数字变化时纵向滚动。
 */
import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { haptics } from '@/platform/haptics';
import { useTheme } from '@/ui/theme/ThemeProvider';

import { Icon } from '../icons/Icon';
import { RollingNumber } from './RollingNumber';

export interface StepperProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  /** 读屏用的单位，如"次""天" */
  unit?: string;
  accessibilityLabel: string;
}

const BUTTON = 36;

export function Stepper({ value, min, max, onChange, unit = '', accessibilityLabel }: StepperProps) {
  const { colors } = useTheme();
  const shake = useSharedValue(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(value);
  latest.current = value;

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const bump = () => {
    haptics.warning();
    shake.value = withSequence(
      withTiming(-4, { duration: 50 }),
      withTiming(4, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
  };

  const step = (delta: number): boolean => {
    const next = latest.current + delta;
    if (next < min || next > max) {
      bump();
      return false;
    }
    haptics.selection();
    latest.current = next;
    onChange(next);
    return true;
  };

  /** 长按：先等 400ms，之后间隔逐渐缩短到 60ms */
  const startRepeat = (delta: number, interval = 260) => {
    timer.current = setTimeout(() => {
      if (step(delta)) startRepeat(delta, Math.max(60, interval * 0.8));
    }, interval);
  };
  const stopRepeat = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  const renderButton = (delta: number) => {
    const disabled = delta < 0 ? value <= min : value >= max;
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={delta < 0 ? '减少' : '增加'}
        hitSlop={4}
        onPress={() => step(delta)}
        onLongPress={() => startRepeat(delta)}
        delayLongPress={400}
        onPressOut={stopRepeat}
        style={[
          styles.button,
          { backgroundColor: colors.card, borderBottomColor: colors.cardEdge, opacity: disabled ? 0.45 : 1 },
        ]}
      >
        <Icon name={delta < 0 ? 'minus' : 'plus'} size={18} color={colors.text} />
      </Pressable>
    );
  };

  return (
    <View
      style={styles.root}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ text: `${value}${unit}` }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => step(e.nativeEvent.actionName === 'increment' ? 1 : -1)}
    >
      {renderButton(-1)}
      <Animated.View style={[styles.value, shakeStyle]}>
        <RollingNumber value={value} variant="numberM" />
      </Animated.View>
      {renderButton(1)}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  button: {
    width: BUTTON,
    height: BUTTON,
    borderRadius: BUTTON / 2,
    borderBottomWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: { minWidth: 40, alignItems: 'center' },
});
