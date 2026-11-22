/**
 * 面板标题行：左侧标题（标题 3），可带一行副标题。
 */
import { StyleSheet, View } from 'react-native';

import { space } from '@/ui/tokens';

import { AppText } from './AppText';

export function SheetTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.root}>
      <AppText variant="title3" accessibilityRole="header">
        {title}
      </AppText>
      {subtitle ? (
        <AppText variant="callout" tone="secondary">
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: space.xs, marginBottom: space.md },
});
