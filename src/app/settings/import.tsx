/**
 * 导入预览：确认后替换本机数据。失败时现有数据不变，可以导出诊断日志。
 */
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { backupCopy } from '@/copy/phase2';
import { shareDiagnostics } from '@/platform/diagnostics';
import { backupErrorText, backupService, stagedBackup } from '@/services/backupService';
import { AppText } from '@/ui/components/AppText';
import { CandyButton } from '@/ui/components/CandyButton';
import { DotPaper } from '@/ui/components/DotPaper';
import { StickerCard } from '@/ui/components/StickerCard';
import { TopBar } from '@/ui/components/TopBar';
import { Duoduo } from '@/ui/illustrations/Duoduo';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { inset, space } from '@/ui/tokens';

type Phase = 'preview' | 'restoring' | 'done' | 'failed';

export default function ImportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [parsed] = useState(() => stagedBackup());
  const [phase, setPhase] = useState<Phase>(parsed ? 'preview' : 'failed');
  const [message, setMessage] = useState(parsed ? '' : backupErrorText('corrupt'));

  const restore = () => {
    if (!parsed) return;
    setPhase('restoring');
    const result = backupService.restore(parsed.payload, parsed.media);
    if (result.ok) setPhase('done');
    else {
      setMessage(backupErrorText(result.error));
      setPhase('failed');
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingBottom: insets.bottom }]}>
      <TopBar title={backupCopy.importTitle} onBack={phase === 'restoring' ? undefined : () => router.back()} />
      <DotPaper>
        <View style={styles.content}>
          {phase === 'preview' && parsed ? (
            <>
              <StickerCard>
                <AppText variant="title3">{parsed.preview.exportedAt || '备份文件'}</AppText>
                <AppText variant="callout" tone="secondary">
                  {backupCopy.from(parsed.preview.platform)}
                </AppText>
                <AppText variant="body">{backupCopy.counts(parsed.preview.projects, parsed.preview.checkins)}</AppText>
                <AppText variant="caption" tone="secondary">
                  {backupCopy.moods(parsed.preview.moods, parsed.preview.photos)}
                </AppText>
                <AppText variant="caption" tone="secondary">
                  {`徽章 ${parsed.preview.achievements} 枚`}
                </AppText>
              </StickerCard>
              <AppText variant="callout" tone="secondary" align="center">
                {backupCopy.replaceHint}
              </AppText>
              <AppText variant="caption" tone="muted" align="center">
                {backupCopy.autoHint}
              </AppText>
              <CandyButton label={backupCopy.replace} onPress={restore} />
              <CandyButton label={backupCopy.cancel} variant="text" onPress={() => router.back()} />
            </>
          ) : null}
          {phase === 'restoring' ? (
            <View style={styles.center}>
              <Duoduo size={120} mood="expectant" pose="seed" />
              <AppText variant="title3">{backupCopy.restoring}</AppText>
            </View>
          ) : null}
          {phase === 'done' ? (
            <View style={styles.center}>
              <Duoduo size={140} mood="cheer" pose="wave" />
              <AppText variant="title3" align="center">
                {backupCopy.welcome}
              </AppText>
              <CandyButton label={backupCopy.goSee} onPress={() => router.replace('/')} />
            </View>
          ) : null}
          {phase === 'failed' ? (
            <View style={styles.center}>
              <Duoduo size={120} mood="puzzled" />
              <AppText variant="title3" align="center">
                {backupCopy.failed}
              </AppText>
              <AppText variant="caption" tone="muted" align="center">
                {message}
              </AppText>
              <CandyButton label={backupCopy.logs} variant="secondary" onPress={() => void shareDiagnostics()} />
              <CandyButton label={backupCopy.ok} variant="text" onPress={() => router.back()} />
            </View>
          ) : null}
        </View>
      </DotPaper>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: inset.page, gap: space.md, paddingTop: space.lg },
  center: { alignItems: 'center', gap: space.md, paddingTop: space.xxl },
});
