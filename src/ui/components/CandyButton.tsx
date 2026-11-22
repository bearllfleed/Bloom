/**
 * 糖果按钮（设计规范 5.4、第 8 节、动效 M01）。
 * 结构：底部一层"厚边"+ 上面一层"按钮面"；按下时按钮面下沉 3px，露出的厚边从 4px 变为 1px。
 */
import { useEffect, type ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { springs } from '@/ui/motion';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { edge, type TypeVariant } from '@/ui/tokens';

import { AppText } from './AppText';
import { FlowerGlyph } from './FlowerMark';

export type CandyButtonVariant = 'primary' | 'secondary' | 'text' | 'danger';
export type CandyButtonSize = 'lg' | 'md' | 'sm';

const HEIGHTS: Record<CandyButtonSize, number> = { lg: 52, md: 44, sm: 36 };
const LABEL_VARIANT: Record<CandyButtonSize, TypeVariant> = { lg: 'title3', md: 'title3', sm: 'callout' };

export interface CandyButtonProps {
  label: string;
  onPress?: () => void;
  variant?: CandyButtonVariant;
  size?: CandyButtonSize;
  disabled?: boolean;
  loading?: boolean;
  /** 左侧图标 */
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
}

function LoadingFlowers({ color }: { color: string }) {
  return (
    <View style={styles.loadingRow}>
      {[0, 1, 2].map((i) => (
        <BouncingFlower key={i} index={i} color={color} />
      ))}
    </View>
  );
}

function BouncingFlower({ index, color }: { index: number; color: string }) {
  const y = useSharedValue(0);
  useEffect(() => {
    y.value = withDelay(
      index * 120,
      withRepeat(withSequence(withTiming(-4, { duration: 220 }), withTiming(0, { duration: 220 })), -1, false),
    );
  }, [index, y]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return (
    <Animated.View style={style}>
      <FlowerGlyph size={12} petal={color} center={color} />
    </Animated.View>
  );
}

export function CandyButton({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  disabled = false,
  loading = false,
  icon,
  style,
  accessibilityHint,
}: CandyButtonProps) {
  const { colors } = useTheme();
  const height = HEIGHTS[size];
  const radius = height / 2;
  const pressed = useSharedValue(0);
  const inactive = disabled || loading;
  const hasEdge = variant !== 'text' && !disabled;

  const faceStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pressed.value * edge.pressDepth }],
  }));

  const palette = {
    primary: { face: colors.primary, edge: colors.primaryEdge, text: colors.onPrimary },
    secondary: { face: colors.card, edge: colors.secondaryEdge, text: colors.text },
    danger: { face: colors.card, edge: colors.secondaryEdge, text: colors.dangerText },
    text: { face: 'transparent', edge: 'transparent', text: colors.link },
  }[variant];
  const face = disabled && variant !== 'text' ? colors.weak : palette.face;
  const textColor = disabled ? colors.textMuted : palette.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      onPressIn={() => {
        pressed.value = withSpring(1, springs.press);
      }}
      onPressOut={() => {
        pressed.value = withSpring(0, springs.press);
      }}
      hitSlop={height < 44 ? (44 - height) / 2 : 0}
      style={[{ height: height + (hasEdge ? edge.height : 0), minWidth: height }, style]}
    >
      {hasEdge ? (
        <View
          style={[styles.layer, { top: edge.height, height, borderRadius: radius, backgroundColor: palette.edge }]}
        />
      ) : null}
      <Animated.View
        style={[styles.face, { height, borderRadius: radius, backgroundColor: face }, hasEdge && faceStyle]}
      >
        {loading ? (
          <LoadingFlowers color={textColor} />
        ) : (
          <>
            {icon}
            <AppText variant={LABEL_VARIANT[size]} color={textColor} numberOfLines={1}>
              {label}
            </AppText>
          </>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  layer: { position: 'absolute', left: 0, right: 0, top: 0 },
  face: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 20 },
  loadingRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
});
