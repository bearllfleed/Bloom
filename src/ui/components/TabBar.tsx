/**
 * 自绘标签栏（第 0 期文档 2.1）：高 64 + 安全区，白底 96%，顶部分隔线；
 * 选中图标双色填充并弹跳，文字莓果色；再次点当前页签由 resetOnFocus 处理。
 */
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { TabTriggerSlotProps } from 'expo-router/ui';

import { tabLabels } from '@/copy/common';
import { haptics } from '@/platform/haptics';
import { AppText } from '@/ui/components/AppText';
import { Icon, type UiIconName } from '@/ui/icons/Icon';
import { springs } from '@/ui/motion';
import { useTheme } from '@/ui/theme/ThemeProvider';

export const TAB_BAR_HEIGHT = 64;

export type TabKey = keyof typeof tabLabels;

const TAB_ICONS: Record<TabKey, UiIconName> = {
  today: 'tab-today',
  projects: 'tab-projects',
  stats: 'tab-stats',
  achievements: 'tab-achievements',
  me: 'tab-me',
};

export type TabButtonProps = { tab: TabKey } & TabTriggerSlotProps;

export function TabButton({ tab, isFocused, onPressIn, ...props }: TabButtonProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const bounce = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      {...(props as object)}
      onPressIn={(e) => {
        onPressIn?.(e);
        if (!isFocused) {
          scale.value = withSequence(
            withSpring(0.88, springs.press),
            withSpring(1.08, springs.bouncy),
            withSpring(1, springs.gentle),
          );
          haptics.selection();
        }
      }}
      accessibilityRole="tab"
      accessibilityState={{ selected: !!isFocused }}
      accessibilityLabel={tabLabels[tab]}
      style={styles.item}
    >
      <Animated.View style={bounce}>
        <Icon
          name={TAB_ICONS[tab]}
          size={28}
          active={!!isFocused}
          accent={colors.accent}
          color={isFocused ? colors.link : colors.textMuted}
        />
      </Animated.View>
      <AppText
        variant="micro"
        color={isFocused ? colors.link : colors.textMuted}
        style={isFocused ? styles.focusedLabel : undefined}
      >
        {tabLabels[tab]}
      </AppText>
    </Pressable>
  );
}

export function TabBarShell({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.bar,
        {
          height: TAB_BAR_HEIGHT + insets.bottom,
          paddingBottom: insets.bottom,
          backgroundColor: colors.card,
          borderTopColor: colors.hairline,
        },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 6,
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  focusedLabel: { fontWeight: '700' },
});
