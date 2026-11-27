/**
 * 分段控件（设计规范第 8 节）：弱底胶囊，选中滑块为白色带厚边，在选项间用弹簧滑动。
 */
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { haptics } from '@/platform/haptics';
import { springs, useMotionReduced } from '@/ui/motion';
import { useTheme } from '@/ui/theme/ThemeProvider';

import { AppText } from './AppText';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

const HEIGHT = 36;
const PAD = 3;

export function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  const { colors } = useTheme();
  const reduced = useMotionReduced();
  const [width, setWidth] = useState(0);
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  const segment = width > 0 ? (width - PAD * 2) / options.length : 0;
  const translateX = useSharedValue(0);

  useEffect(() => {
    const target = index * segment;
    cancelAnimation(translateX);
    translateX.value = reduced ? target : withSpring(target, springs.gentle);
  }, [index, reduced, segment, translateX]);

  const thumb = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View
      accessibilityRole="tablist"
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      style={[styles.root, { backgroundColor: colors.weak }]}
    >
      {width > 0 ? (
        <Animated.View
          style={[
            styles.thumb,
            { width: segment, backgroundColor: colors.card, borderBottomColor: colors.cardEdge },
            thumb,
          ]}
        />
      ) : null}
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={styles.item}
            onPress={() => {
              if (!selected) {
                haptics.selection();
                onChange(option.value);
              }
            }}
          >
            <AppText
              variant="callout"
              tone={selected ? 'primary' : 'secondary'}
              style={selected && styles.selectedLabel}
            >
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { height: HEIGHT, borderRadius: HEIGHT / 2, flexDirection: 'row', padding: PAD },
  thumb: {
    position: 'absolute',
    top: PAD,
    left: PAD,
    height: HEIGHT - PAD * 2,
    borderRadius: (HEIGHT - PAD * 2) / 2,
    borderBottomWidth: 2,
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  selectedLabel: { fontWeight: '600' },
});
