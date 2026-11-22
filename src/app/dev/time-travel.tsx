/**
 * 时间旅行面板（第 0 期 2.3）：仅开发版。设定模拟"现在"后全 App 的今天都走模拟时间。
 */
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { parseLocalDate } from '@/domain/date';
import { clock } from '@/platform/clock';
import { AppText } from '@/ui/components/AppText';
import { CandyButton } from '@/ui/components/CandyButton';
import { TopBar } from '@/ui/components/TopBar';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { inset, space } from '@/ui/tokens';

function describeNow(): string {
  const { year, month, day } = parseLocalDate(clock.today());
  const d = new Date(clock.now());
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const flag = clock.isSimulated() ? '已开启' : '真实时间';
  return `${year}年${month}月${day}日 ${hh}:${mm}（${flag}）`;
}

export default function TimeTravelScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [label, setLabel] = useState(describeNow);

  useEffect(() => clock.subscribe(() => setLabel(describeNow())), []);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <TopBar title="时间旅行" onBack={() => router.back()} />
      <View style={styles.body}>
        <AppText variant="title3">当前模拟</AppText>
        <AppText variant="body" tone="secondary">
          {label}
        </AppText>
        <View style={styles.row}>
          <CandyButton
            label="-1 天"
            onPress={() => clock.shiftDays(-1)}
            variant="secondary"
            size="sm"
            style={styles.flex}
          />
          <CandyButton
            label="+1 天"
            onPress={() => clock.shiftDays(1)}
            variant="secondary"
            size="sm"
            style={styles.flex}
          />
        </View>
        <View style={styles.row}>
          <CandyButton
            label="+7 天"
            onPress={() => clock.shiftDays(7)}
            variant="secondary"
            size="sm"
            style={styles.flex}
          />
          <CandyButton
            label="+30 天"
            onPress={() => clock.shiftDays(30)}
            variant="secondary"
            size="sm"
            style={styles.flex}
          />
        </View>
        <CandyButton
          label="跳到今晚 21:30"
          onPress={() => {
            const base = new Date(clock.now());
            base.setHours(21, 30, 0, 0);
            clock.setSimulatedNow(base.getTime());
          }}
          variant="secondary"
          size="md"
        />
        <CandyButton label="恢复真实时间" onPress={() => clock.setSimulatedNow(null)} size="md" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { padding: inset.page, gap: space.md },
  row: { flexDirection: 'row', gap: space.sm },
  flex: { flex: 1 },
});
