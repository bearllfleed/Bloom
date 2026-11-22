/**
 * 顶栏（设计规范第 8 节）：高 56；左侧 40pt 圆形返回按钮，中间标题，右侧操作。
 * 内容滚动后显示 1px 分隔线（由 scrolled 控制）。
 */
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type UiIconName } from '@/ui/icons/Icon';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { inset } from '@/ui/tokens';

import { AppText } from './AppText';

export function RoundIconButton({ icon, onPress, label }: { icon: UiIconName; onPress: () => void; label: string }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [
        styles.round,
        { backgroundColor: colors.card, borderBottomColor: colors.cardEdge, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <Icon name={icon} size={22} />
    </Pressable>
  );
}

export interface TopBarProps {
  title?: string;
  onBack?: () => void;
  right?: ReactNode;
  scrolled?: boolean;
}

export function TopBar({ title, onBack, right, scrolled = false }: TopBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[styles.root, { paddingTop: insets.top, borderBottomColor: scrolled ? colors.hairline : 'transparent' }]}
    >
      <View style={styles.bar}>
        <View style={styles.side}>{onBack ? <RoundIconButton icon="back" onPress={onBack} label="返回" /> : null}</View>
        <AppText variant="title2" numberOfLines={1} style={styles.title} accessibilityRole="header">
          {title}
        </AppText>
        <View style={[styles.side, styles.right]}>{right}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { borderBottomWidth: StyleSheet.hairlineWidth },
  bar: { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: inset.page },
  side: { width: 96, flexDirection: 'row', gap: 8 },
  right: { justifyContent: 'flex-end' },
  title: { flex: 1, textAlign: 'center' },
  round: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderBottomWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
