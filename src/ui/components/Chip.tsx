/**
 * 选择芯片（设计规范第 8 节）：周几、日期、时长、模板等。
 * 未选：卡片底、次要文字；选中：莓果浅底、链接色文字、1.5px 莓果描边，并轻弹一下。
 */
import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { haptics } from '@/platform/haptics';
import { springs } from '@/ui/motion';
import { useTheme } from '@/ui/theme/ThemeProvider';

import { AppText } from './AppText';

export interface ChipProps {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  /** 置灰状态下被点击时（用于提示原因）；不传则置灰时不响应 */
  onDisabledPress?: () => void;
  /** 等宽芯片（如周几、日期网格） */
  square?: boolean;
}

const HEIGHT = 36;

export function Chip({
  label,
  selected = false,
  disabled = false,
  onPress,
  onDisabledPress,
  square = false,
}: ChipProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const wasSelected = useRef(selected);

  useEffect(() => {
    if (selected && !wasSelected.current) {
      scale.value = withSequence(withTiming(1.08, { duration: 90 }), withSpring(1, springs.bouncy));
    }
    wasSelected.current = selected;
  }, [scale, selected]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={style}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected, disabled }}
        disabled={disabled && !onDisabledPress}
        onPress={() => {
          if (disabled) {
            haptics.warning();
            onDisabledPress?.();
            return;
          }
          haptics.selection();
          onPress?.();
        }}
        style={[
          styles.chip,
          square && styles.square,
          {
            backgroundColor: selected ? colors.accentSoft : colors.card,
            borderColor: selected ? colors.accent : colors.hairline,
            opacity: disabled ? 0.45 : 1,
          },
        ]}
      >
        <AppText variant="callout" tone={selected ? 'link' : 'secondary'} style={selected && styles.selected}>
          {label}
        </AppText>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: HEIGHT,
    borderRadius: HEIGHT / 2,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  square: { width: HEIGHT, paddingHorizontal: 0 },
  selected: { fontWeight: '600' },
});
