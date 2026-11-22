/**
 * 第 0 期页签占位：朵朵期待表情 + "这里快要开花了"。第 1 期起替换为正式页面。
 */
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { placeholderCopy } from '@/copy/common';
import { DotPaper } from '@/ui/components/DotPaper';
import { EmptyState } from '@/ui/components/EmptyState';
import { useTheme } from '@/ui/theme/ThemeProvider';

export function PlaceholderScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <DotPaper style={StyleSheet.absoluteFill} />
      <EmptyState message={placeholderCopy.comingSoon} mood="expectant" pose="seed" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'center' },
});
