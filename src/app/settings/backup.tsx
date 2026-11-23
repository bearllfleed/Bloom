/**
 * 备份与恢复：导出 .bloom、从文件恢复、表格、自动快照、备份提醒。
 */
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { backupCopy } from '@/copy/phase2';
import { useLiveQuery } from '@/features/common/useLiveQuery';
import { files } from '@/platform/files';
import { backupErrorText, backupService, parseBackup, stageBackup } from '@/services/backupService';
import { overlay } from '@/stores/overlayQueue';
import { usePrefs, type BackupEvery } from '@/stores/prefsStore';
import { AppText } from '@/ui/components/AppText';
import { CandyButton } from '@/ui/components/CandyButton';
import { DotPaper } from '@/ui/components/DotPaper';
import { ListRow } from '@/ui/components/ListRow';
import { StickerCard } from '@/ui/components/StickerCard';
import { TopBar } from '@/ui/components/TopBar';
import { Duoduo } from '@/ui/illustrations/Duoduo';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { inset, space } from '@/ui/tokens';

const INTERVALS: { value: BackupEvery; label: string }[] = [
  { value: 7, label: backupCopy.every7 },
  { value: 14, label: backupCopy.every14 },
  { value: 30, label: backupCopy.every30 },
  { value: 0, label: backupCopy.neverRemind },
];

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function cycleInterval(current: BackupEvery, update: (patch: { backupEveryDays: BackupEvery }) => void) {
  const order: BackupEvery[] = [7, 14, 30, 0];
  const next = order[(order.indexOf(current) + 1) % order.length];
  update({ backupEveryDays: next });
}

export default function BackupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const every = usePrefs((s) => s.backupEveryDays);
  const update = usePrefs((s) => s.update);
  const status = useLiveQuery(() => backupService.status(), [every]);
  const snapshots = useLiveQuery(() => backupService.snapshots(), []);
  const [showSnapshots, setShowSnapshots] = useState(false);
  const [packed, setPacked] = useState<{
    name: string;
    uri: string;
    size: number;
    projects: number;
    checkins: number;
  } | null>(null);
  const [busy, setBusy] = useState(false);

  const exportFile = () => {
    setBusy(true);
    try {
      setPacked(backupService.exportFile());
    } catch {
      overlay.toast(backupErrorText('space'));
    } finally {
      setBusy(false);
    }
  };

  const finish = async () => {
    if (!packed) return;
    try {
      await files.share(packed.uri, 'application/zip', backupCopy.share);
      backupService.markExported();
      setPacked(null);
      overlay.toast(backupCopy.saved);
    } catch {
      overlay.toast(backupErrorText('space'));
    }
  };

  const openParsed = (uri: string) => {
    const parsed = parseBackup(uri);
    if (!parsed.ok) {
      overlay.toast(backupErrorText(parsed.error));
      return;
    }
    stageBackup(parsed.parsed);
    router.push('/settings/import');
  };

  const intervalLabel = INTERVALS.find((item) => item.value === every)?.label ?? backupCopy.every30;

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingBottom: insets.bottom }]}>
      <TopBar title={backupCopy.title} onBack={() => router.back()} />
      <DotPaper>
        <ScrollView contentContainerStyle={styles.content}>
          <StickerCard>
            <View style={styles.hero}>
              <Duoduo size={96} mood="happy" pose="seed" />
              <AppText variant="title3" align="center">
                {backupCopy.headline}
              </AppText>
              <AppText variant="callout" tone="secondary" align="center">
                {backupCopy.detail}
              </AppText>
              <AppText variant="caption" tone={status.due ? 'warning' : 'secondary'} align="center">
                {status.daysAgo === null ? backupCopy.never : backupCopy.last(status.label)}
              </AppText>
            </View>
          </StickerCard>

          {packed ? (
            <StickerCard>
              <AppText variant="title3">{packed.name}</AppText>
              <AppText variant="caption" tone="secondary">
                {formatSize(packed.size)} · {backupCopy.counts(packed.projects, packed.checkins)}
              </AppText>
              <CandyButton label={backupCopy.save} onPress={() => void finish()} />
              <CandyButton label={backupCopy.share} variant="secondary" onPress={() => void finish()} />
            </StickerCard>
          ) : (
            <>
              <CandyButton label={busy ? backupCopy.packing : backupCopy.export} onPress={exportFile} loading={busy} />
              <CandyButton
                label={backupCopy.restore}
                variant="secondary"
                onPress={() => void files.pick().then((uri) => uri && openParsed(uri))}
              />
            </>
          )}

          <StickerCard padding={0}>
            <ListRow icon="export" label={backupCopy.csv} onPress={() => void backupService.exportCsv()} />
            <ListRow
              icon="file"
              label={backupCopy.snapshots}
              value={`${snapshots.length} 份`}
              onPress={() => setShowSnapshots((value) => !value)}
              showDivider
            />
            <ListRow
              icon="bell"
              label={backupCopy.reminder}
              value={intervalLabel}
              onPress={() => cycleInterval(every, update)}
              showDivider
            />
          </StickerCard>
          {showSnapshots ? (
            snapshots.length === 0 ? (
              <AppText variant="caption" tone="muted">
                {backupCopy.snapshotEmpty}
              </AppText>
            ) : (
              snapshots.map((item) => (
                <Pressable key={item.file.uri} onPress={() => openParsed(item.file.uri)} style={styles.snapshot}>
                  <AppText variant="callout" numberOfLines={1}>
                    {item.file.name.replace('.bloom', '')}
                  </AppText>
                  <AppText variant="caption" tone="secondary">
                    {item.kind === 'preimport' ? backupCopy.preimport : backupCopy.weekly} ·{' '}
                    {formatSize(item.file.size)}
                  </AppText>
                </Pressable>
              ))
            )
          ) : null}
        </ScrollView>
      </DotPaper>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: inset.page, gap: space.md, paddingBottom: space.giant },
  hero: { alignItems: 'center', gap: space.sm },
  snapshot: { paddingVertical: 8, gap: 2 },
});
