/**
 * 我的（第 1 期 1-8 基础版）：头像昵称、陪伴天数、打卡记录与关于入口；开发版附带开发工具。
 * 第 2、3 期在列表中追加心情手账、提醒检查、备份与恢复、偏好设置。
 */
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { trustCopy } from '@/copy/common';
import { backupCopy, mePhaseCopy } from '@/copy/phase2';
import { meCopy } from '@/copy/project';
import { useLiveQuery } from '@/features/common/useLiveQuery';
import { openProfileSheet } from '@/features/settings/ProfileSheet';
import { isDevToolsEnabled } from '@/platform/appVariant';
import { notifications } from '@/platform/notifications';
import { backupService } from '@/services/backupService';
import { companionDays } from '@/services/lifecycleService';
import { usePrefs } from '@/stores/prefsStore';
import { AppText } from '@/ui/components/AppText';
import { DotPaper } from '@/ui/components/DotPaper';
import { ListRow } from '@/ui/components/ListRow';
import { StickerCard } from '@/ui/components/StickerCard';
import { DuoduoAvatar } from '@/ui/illustrations/DuoduoAvatar';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { inset, space } from '@/ui/tokens';

export default function MeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const nickname = usePrefs((s) => s.nickname);
  const avatarId = usePrefs((s) => s.avatarId);
  const days = useLiveQuery(companionDays, []);
  const backup = useLiveQuery(() => backupService.status(), []);
  const [reminderProblem, setReminderProblem] = useState(false);
  useEffect(() => {
    void notifications.permission().then((state) => setReminderProblem(state !== 'granted'));
  }, []);

  return (
    <DotPaper style={{ paddingTop: insets.top }}>
      <ScrollView contentContainerStyle={styles.content}>
        <StickerCard>
          <View style={styles.profile}>
            <DuoduoAvatar avatarId={avatarId} size={56} />
            <View style={styles.profileText}>
              <AppText variant="title2" numberOfLines={1} tone={nickname ? 'primary' : 'muted'}>
                {nickname || meCopy.noNickname}
              </AppText>
              <AppText variant="caption" tone="secondary">
                {meCopy.companion(days)}
              </AppText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={meCopy.edit}
              hitSlop={8}
              onPress={openProfileSheet}
              style={[styles.editButton, { backgroundColor: colors.accentSofter }]}
            >
              <AppText variant="callout" tone="link">
                {meCopy.edit}
              </AppText>
            </Pressable>
          </View>
        </StickerCard>

        <StickerCard padding={0}>
          <ListRow icon="history" label={meCopy.history} onPress={() => router.push('/history')} />
          <ListRow icon="note" label={mePhaseCopy.moods} onPress={() => router.push('/mood')} showDivider />
          <ListRow
            icon="bell"
            label={mePhaseCopy.reminders}
            value={reminderProblem ? '●' : undefined}
            valueTone="warning"
            onPress={() => router.push('/settings/reminders')}
            showDivider
          />
          <ListRow
            icon="cloud"
            label={mePhaseCopy.backup}
            value={backup.due ? backupCopy.due : backup.label}
            valueTone={backup.due ? 'warning' : 'secondary'}
            onPress={() => router.push('/settings/backup')}
            showDivider
          />
          <ListRow
            icon="settings"
            label={mePhaseCopy.preferences}
            onPress={() => router.push('/settings/preferences')}
            showDivider
          />
          <ListRow icon="star" label={meCopy.about} onPress={() => router.push('/settings/about')} showDivider />
        </StickerCard>

        {isDevToolsEnabled ? (
          <>
            <AppText variant="caption" tone="muted" style={styles.sectionLabel}>
              {meCopy.devTools}
            </AppText>
            <StickerCard padding={0}>
              <ListRow icon="settings" label="组件陈列" onPress={() => router.push('/dev/gallery')} />
              <ListRow icon="photo" label="图标陈列" onPress={() => router.push('/dev/icons')} showDivider />
              <ListRow icon="hourglass" label="时间旅行" onPress={() => router.push('/dev/time-travel')} showDivider />
            </StickerCard>
          </>
        ) : null}

        <AppText variant="caption" tone="muted" align="center" style={styles.trust}>
          {trustCopy.localOnly}
        </AppText>
      </ScrollView>
    </DotPaper>
  );
}

const styles = StyleSheet.create({
  content: { padding: inset.page, gap: space.lg, paddingBottom: space.giant },
  profile: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  profileText: { flex: 1, gap: 2 },
  editButton: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16 },
  sectionLabel: { marginLeft: 4, marginBottom: -8 },
  trust: { marginTop: space.lg },
});
