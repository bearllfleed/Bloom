/**
 * 左滑出现"删除"（需求 5.13：单条记录左滑删除，不确认，给 5 秒撤销）。
 */
import type { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

import { useTheme } from '@/ui/theme/ThemeProvider';

import { AppText } from './AppText';

export function SwipeToDelete({
  children,
  label,
  onDelete,
}: {
  children: ReactNode;
  label: string;
  onDelete: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Swipeable
      friction={1.6}
      rightThreshold={36}
      overshootRight={false}
      renderRightActions={(_progress, _translation, methods) => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={label}
          onPress={() => {
            methods.close();
            onDelete();
          }}
          style={[styles.action, { backgroundColor: colors.danger }]}
        >
          <AppText variant="callout" color="#FFFFFF">
            {label}
          </AppText>
        </Pressable>
      )}
    >
      {children}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  action: { width: 80, alignItems: 'center', justifyContent: 'center' },
});
