/**
 * 开关（设计规范第 8 节、动效 M26）：52×32。
 * 关：弱色轨道 + 白色圆钮，圆钮里是花苞；开：莓果色轨道，圆钮滑动并旋转 90°，花苞变为盛开。
 */
import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { haptics } from '@/platform/haptics';
import { springs } from '@/ui/motion';
import { useTheme } from '@/ui/theme/ThemeProvider';

import { BudGlyph, FlowerGlyph } from './FlowerMark';

const W = 52;
const H = 32;
const KNOB = 26;
const PAD = (H - KNOB) / 2;

export interface CandySwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  accessibilityLabel: string;
}

export function CandySwitch({ value, onValueChange, disabled = false, accessibilityLabel }: CandySwitchProps) {
  const { colors } = useTheme();
  const on = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    on.value = withSpring(value ? 1 : 0, springs.gentle);
  }, [on, value]);

  const track = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(on.value, [0, 1], [colors.hairline, colors.accent]),
  }));
  const knob = useAnimatedStyle(() => ({
    transform: [{ translateX: on.value * (W - KNOB - PAD * 2) }, { rotate: `${on.value * 90}deg` }],
  }));
  const budStyle = useAnimatedStyle(() => ({ opacity: withTiming(on.value < 0.5 ? 1 : 0, { duration: 120 }) }));
  const bloomStyle = useAnimatedStyle(() => ({ opacity: withTiming(on.value >= 0.5 ? 1 : 0, { duration: 120 }) }));

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      hitSlop={6}
      onPress={() => {
        haptics.selection();
        onValueChange(!value);
      }}
      style={{ opacity: disabled ? 0.4 : 1 }}
    >
      <Animated.View style={[styles.track, track]}>
        <Animated.View style={[styles.knob, knob]}>
          <Animated.View style={[styles.glyph, budStyle]}>
            <BudGlyph size={18} />
          </Animated.View>
          <Animated.View style={[styles.glyph, bloomStyle]}>
            <FlowerGlyph size={18} petal={colors.accent} />
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: { width: W, height: H, borderRadius: H / 2, padding: PAD },
  knob: {
    width: KNOB,
    height: KNOB,
    borderRadius: KNOB / 2,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  glyph: { position: 'absolute', left: (KNOB - 18) / 2, top: (KNOB - 18) / 2 },
});
