/**
 * 确认框（设计规范第 8 节）：居中卡片，朵朵小表情 + 标题 + 一句说明 + 两个按钮。
 * 危险操作的确认按钮用危险色文字；点遮罩等同"取消"。
 */
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';

import { overlay, type DialogSpec } from '@/stores/overlayQueue';
import { AppText } from '@/ui/components/AppText';
import { CandyButton } from '@/ui/components/CandyButton';
import { Duoduo } from '@/ui/illustrations/Duoduo';
import { useMotionReduced } from '@/ui/motion';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { radius, space } from '@/ui/tokens';

export function DialogView({ dialog }: { dialog: DialogSpec }) {
  const { colors } = useTheme();
  const reduced = useMotionReduced();
  return (
    <Animated.View
      entering={FadeIn.duration(160)}
      exiting={FadeOut.duration(160)}
      style={[StyleSheet.absoluteFill, styles.center]}
    >
      <Pressable
        accessibilityLabel="关闭"
        style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim }]}
        onPress={() => overlay.closeDialog(false)}
      />
      <Animated.View
        entering={reduced ? FadeIn.duration(160) : ZoomIn.springify().damping(18).stiffness(260)}
        accessibilityViewIsModal
        style={[styles.card, { backgroundColor: colors.card }]}
      >
        <Duoduo size={72} mood={dialog.destructive ? 'puzzled' : 'expectant'} />
        <AppText variant="title3" align="center">
          {dialog.title}
        </AppText>
        {dialog.message ? (
          <AppText variant="callout" tone="secondary" align="center">
            {dialog.message}
          </AppText>
        ) : null}
        <View style={styles.actions}>
          <CandyButton
            label={dialog.cancelLabel}
            variant="secondary"
            size="md"
            style={styles.flex}
            onPress={() => overlay.closeDialog(false)}
          />
          <CandyButton
            label={dialog.confirmLabel}
            variant={dialog.destructive ? 'danger' : 'primary'}
            size="md"
            style={styles.flex}
            onPress={() => overlay.closeDialog(true)}
          />
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', padding: space.xxxl },
  card: {
    width: '100%',
    maxWidth: 320,
    borderRadius: radius.card + 4,
    padding: space.xxl,
    alignItems: 'center',
    gap: space.md,
  },
  actions: { flexDirection: 'row', gap: space.md, marginTop: space.sm, alignSelf: 'stretch' },
  flex: { flex: 1 },
});
