/**
 * 图标陈列：全部界面 SVG + 项目贴纸（含灰度），点击显示 id。
 */
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { overlay } from '@/stores/overlayQueue';
import { AppText } from '@/ui/components/AppText';
import { TopBar } from '@/ui/components/TopBar';
import { Icon, type UiIconName } from '@/ui/icons/Icon';
import { ProjectIcon, type ProjectIconId } from '@/ui/icons/ProjectIcon';
import { projectIcons } from '@/ui/icons/generated/projectIcons';
import { uiIcons } from '@/ui/icons/generated/uiIcons';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { inset, radius, space } from '@/ui/tokens';

const UI_NAMES = Object.keys(uiIcons) as UiIconName[];
const PROJECT_IDS = Object.keys(projectIcons) as ProjectIconId[];

export default function IconsGalleryScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [mono, setMono] = useState(false);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <TopBar title="图标陈列" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        <AppText variant="title3">界面图标（{UI_NAMES.length}）</AppText>
        <View style={styles.grid}>
          {UI_NAMES.map((name) => (
            <Pressable
              key={name}
              onPress={() => overlay.toast(name)}
              style={[styles.cell, { backgroundColor: colors.card }]}
              accessibilityLabel={name}
            >
              <Icon name={name} size={28} />
              <AppText variant="micro" tone="muted" numberOfLines={1}>
                {name}
              </AppText>
            </Pressable>
          ))}
        </View>

        <View style={styles.sectionHead}>
          <AppText variant="title3">项目贴纸（{PROJECT_IDS.length}）</AppText>
          <Pressable onPress={() => setMono((v) => !v)}>
            <AppText variant="callout" tone="link">
              {mono ? '彩色' : '灰度'}
            </AppText>
          </Pressable>
        </View>
        <View style={styles.grid}>
          {PROJECT_IDS.map((id) => (
            <Pressable
              key={id}
              onPress={() => overlay.toast(id)}
              style={[styles.cell, { backgroundColor: colors.accentSoft }]}
              accessibilityLabel={id}
            >
              <ProjectIcon id={id} size={44} sticker mono={mono} />
              <AppText variant="micro" tone="muted" numberOfLines={1}>
                {id}
              </AppText>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: inset.page, gap: space.lg, paddingBottom: space.giant },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  cell: {
    width: '22%',
    minWidth: 72,
    aspectRatio: 1,
    borderRadius: radius.small,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.xs,
    gap: 4,
  },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
