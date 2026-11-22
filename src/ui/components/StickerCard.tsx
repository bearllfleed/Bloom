/**
 * 贴纸卡片（设计规范第 8 节）：白底、圆角 20、底部 4px 厚边、浮起阴影。
 * 可点击时按下缩小到 0.98；长按时放大到 1.03 并加深阴影（长按菜单的"抬起"）。
 */
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { springs } from '@/ui/motion';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { edge, inset, radius, shadow } from '@/ui/tokens';

export interface StickerCardProps {
  children: ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  /** 卡片底色，默认语义"卡片"色 */
  background?: string;
  /** 厚边颜色，默认语义"卡片厚边"色 */
  edgeColor?: string;
  padding?: number;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function StickerCard({
  children,
  onPress,
  onLongPress,
  background,
  edgeColor,
  padding = inset.card,
  style,
  accessibilityLabel,
}: StickerCardProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const interactive = onPress !== undefined || onLongPress !== undefined;

  const body = (
    <View
      style={[
        styles.card,
        {
          backgroundColor: background ?? colors.card,
          borderBottomColor: edgeColor ?? colors.cardEdge,
          padding,
          shadowColor: colors.shadow,
        },
      ]}
    >
      {children}
    </View>
  );

  if (!interactive) return <View style={style}>{body}</View>;

  return (
    <Animated.View style={[animated, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        onLongPress={
          onLongPress
            ? () => {
                scale.value = withSpring(1.03, springs.gentle);
                onLongPress();
              }
            : undefined
        }
        onPressIn={() => {
          scale.value = withSpring(0.98, springs.press);
        }}
        onPressOut={() => {
          scale.value = withSpring(1, springs.press);
        }}
      >
        {body}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    borderBottomWidth: edge.height,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: shadow.raised.offsetY },
    shadowRadius: shadow.raised.blur / 2,
    shadowOpacity: shadow.raised.opacity,
    elevation: 1,
  },
});
