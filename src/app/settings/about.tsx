/**
 * 关于页：版本号、更新说明、导出诊断日志、本地存储承诺。
 */
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { trustCopy } from '@/copy/common';
import { changelogCopy } from '@/copy/project';
import { openChangelog } from '@/features/settings/ChangelogSheet';
import { appBuild, appVersion } from '@/platform/appInfo';
import { appVariant } from '@/platform/appVariant';
import { shareDiagnostics } from '@/platform/diagnostics';
import { latestChangelog } from '@/services/changelogService';
import { AppText } from '@/ui/components/AppText';
import { DotPaper } from '@/ui/components/DotPaper';
import { FlowerGlyph } from '@/ui/components/FlowerMark';
import { ListRow } from '@/ui/components/ListRow';
import { StickerCard } from '@/ui/components/StickerCard';
import { TopBar } from '@/ui/components/TopBar';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { inset, radius, space } from '@/ui/tokens';

export default function AboutScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const variantLabel = appVariant === 'production' ? '' : appVariant === 'preview' ? '内测' : '开发';
  const entry = latestChangelog();

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingBottom: insets.bottom }]}>
      <TopBar title="关于 Bloom" onBack={() => router.back()} />
      <DotPaper>
        <View style={styles.hero}>
          <View style={[styles.icon, { backgroundColor: colors.accentSoft }]}>
            <FlowerGlyph size={44} petal={colors.accent} outlined />
          </View>
          <AppText variant="title1">Bloom</AppText>
          <AppText variant="callout" tone="secondary">
            版本 {appVersion}（{appBuild}）{variantLabel ? ` · ${variantLabel}` : ''}
          </AppText>
        </View>
        <View style={styles.list}>
          <StickerCard padding={0}>
            {entry ? <ListRow icon="note" label={changelogCopy.entry} onPress={() => openChangelog(entry)} /> : null}
            <ListRow icon="export" label="导出诊断日志" onPress={() => void shareDiagnostics()} showDivider={!!entry} />
          </StickerCard>
        </View>
        <AppText variant="caption" tone="muted" align="center" style={styles.trust}>
          {trustCopy.localOnly}
        </AppText>
      </DotPaper>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: { alignItems: 'center', paddingTop: space.xxxl, gap: space.sm },
  icon: {
    width: 72,
    height: 72,
    borderRadius: radius.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.sm,
  },
  list: { paddingHorizontal: inset.page, marginTop: space.xxxl },
  trust: { marginTop: space.xxxl, paddingHorizontal: inset.page },
});
