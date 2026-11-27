/**
 * 徽章开发陈列（第 3 期 A3-01）：72 枚徽章 × static / idle / celebrate 三模式，
 * 以及未获得、隐藏未获得两种状态，供设计和真机检查逐个比对。
 * 仅开发版可进入（根布局按构建类型注册 /dev）。
 */
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ACHIEVEMENTS } from '@/domain/achievement/catalog';
import { achievementCopy } from '@/copy/phase3';
import { Badge, type BadgeMode } from '@/ui/badges';
import { AppText } from '@/ui/components/AppText';
import { DotPaper } from '@/ui/components/DotPaper';
import { SegmentedControl } from '@/ui/components/SegmentedControl';
import { TopBar } from '@/ui/components/TopBar';
import { useRouter } from 'expo-router';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { inset, space } from '@/ui/tokens';

const MODES: readonly { value: BadgeMode; label: string }[] = [
  { value: 'static', label: '网格' },
  { value: 'idle', label: '详情' },
  { value: 'celebrate', label: '弹窗' },
];

export default function DevBadgesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [mode, setMode] = useState<BadgeMode>('static');

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <TopBar title="徽章陈列" onBack={() => router.back()} />
      <DotPaper style={styles.body}>
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space.giant }]}>
          <SegmentedControl options={MODES} value={mode} onChange={setMode} />
          <Section title="全部徽章（已获得）">
            {ACHIEVEMENTS.map((def) => (
              <View key={def.id} style={styles.cell}>
                <Badge id={def.id} size={84} mode={mode} />
                <AppText variant="caption" align="center" numberOfLines={1}>
                  {def.name}
                </AppText>
                <AppText variant="micro" tone="muted" align="center">
                  {def.id} · {def.tier}
                </AppText>
              </View>
            ))}
          </Section>
          <Section title="未获得剪影">
            {ACHIEVEMENTS.filter((def) => !def.hidden).map((def) => (
              <View key={def.id} style={styles.cell}>
                <Badge id={def.id} size={84} mode="static" locked rays={false} />
                <AppText variant="caption" align="center" numberOfLines={1}>
                  {def.name}
                </AppText>
              </View>
            ))}
          </Section>
          <Section title="隐藏未获得（礼盒问号）">
            {ACHIEVEMENTS.filter((def) => def.hidden).map((def) => (
              <View key={def.id} style={styles.cell}>
                <Badge id={def.id} size={84} mode="static" locked rays={false} />
                <AppText variant="caption" align="center">
                  {achievementCopy.mystery}
                </AppText>
                <AppText variant="micro" tone="muted" align="center">
                  {def.id}
                </AppText>
              </View>
            ))}
          </Section>
          <Section title="数字与彩虹">
            {['A12', 'A34', 'A69', 'A17', 'A56'].map((id) => (
              <View key={id} style={styles.cell}>
                <Badge id={id} size={84} mode={mode} />
                <AppText variant="caption" align="center">
                  {id}
                </AppText>
              </View>
            ))}
          </Section>
        </ScrollView>
      </DotPaper>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <AppText variant="title3">{title}</AppText>
      <View style={styles.grid}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { flex: 1 },
  content: { padding: inset.page, gap: space.xl },
  section: { gap: space.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: space.md },
  cell: { width: 96, alignItems: 'center', gap: 2 },
});
