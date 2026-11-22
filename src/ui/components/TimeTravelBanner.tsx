/**
 * 时间旅行提示条：开发版开启模拟时间后，全局顶部显示柠檬色细条，防止忘记关闭。
 */
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { parseLocalDate } from '@/domain/date';
import { isDevToolsEnabled } from '@/platform/appVariant';
import { clock } from '@/platform/clock';
import { AppText } from '@/ui/components/AppText';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { projectColors } from '@/ui/tokens/projectColors';

function formatSimulated(): string {
  const today = clock.today();
  const { year, month, day } = parseLocalDate(today);
  const d = new Date(clock.now());
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${year}年${month}月${day}日 ${hh}:${mm}`;
}

export function TimeTravelBanner() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [simulated, setSimulated] = useState(() => isDevToolsEnabled && clock.isSimulated());
  const [label, setLabel] = useState(formatSimulated);

  useEffect(() => {
    if (!isDevToolsEnabled) return;
    return clock.subscribe(() => {
      setSimulated(clock.isSimulated());
      setLabel(formatSimulated());
    });
  }, []);

  if (!isDevToolsEnabled || !simulated) return null;

  return (
    <Pressable
      onPress={() => router.push('/dev/time-travel')}
      style={[
        styles.bar,
        { paddingTop: insets.top, backgroundColor: projectColors.lemon.tint, borderBottomColor: colors.hairline },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`时间旅行中，当前模拟 ${label}，点击打开面板`}
    >
      <View style={styles.inner}>
        <AppText variant="caption" color="#3F2A33">
          模拟：{label}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: { borderBottomWidth: StyleSheet.hairlineWidth },
  inner: { height: 28, alignItems: 'center', justifyContent: 'center' },
});
