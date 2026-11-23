/**
 * 提醒检查：权限、精确闹钟、厂商后台、晚间汇总、测试提醒、接下来的 10 条。
 */
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { AppState, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { addDays, formatMonthDay } from '@/domain/date';
import { reminderCopy } from '@/copy/phase2';
import { clock } from '@/platform/clock';
import { notifications, type ExactAlarmState, type PermissionState } from '@/platform/notifications';
import { oemGuide, openAppSettings } from '@/platform/oem';
import { planNow, reminderService } from '@/services/reminderService';
import { overlay } from '@/stores/overlayQueue';
import { usePrefs } from '@/stores/prefsStore';
import { AppText } from '@/ui/components/AppText';
import { CandyButton } from '@/ui/components/CandyButton';
import { CandySwitch } from '@/ui/components/CandySwitch';
import { DotPaper } from '@/ui/components/DotPaper';
import { ListRow } from '@/ui/components/ListRow';
import { StickerCard } from '@/ui/components/StickerCard';
import { TopBar } from '@/ui/components/TopBar';
import { Duoduo } from '@/ui/illustrations/Duoduo';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { inset, space } from '@/ui/tokens';

function whenLabel(date: string, time: string): string {
  const today = clock.today();
  if (date === today) return `${reminderCopy.today} ${time}`;
  if (date === addDays(today, 1)) return `${reminderCopy.tomorrow} ${time}`;
  return `${formatMonthDay(date)} ${time}`;
}

export default function ReminderCheckScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const evening = usePrefs((s) => s.eveningSummary);
  const eveningTime = usePrefs((s) => s.eveningSummaryTime);
  const update = usePrefs((s) => s.update);
  const [permission, setPermission] = useState<PermissionState>('undetermined');
  const [exact, setExact] = useState<ExactAlarmState>('unsupported');
  const [expanded, setExpanded] = useState(false);
  const [plan, setPlan] = useState(() => planNow());
  const guide = oemGuide();

  const refresh = () => {
    void notifications.permission().then(setPermission);
    void notifications.exactAlarm().then(setExact);
    setPlan(planNow());
  };

  useEffect(() => {
    refresh();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => sub.remove();
  }, []);

  const problems =
    (permission !== 'granted' ? 1 : 0) + (exact === 'denied' ? 1 : 0) + (guide && permission === 'granted' ? 0 : 0);
  const upcoming = plan.notices.slice(0, 10);

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingBottom: insets.bottom }]}>
      <TopBar title={reminderCopy.checkTitle} onBack={() => router.back()} />
      <DotPaper>
        <ScrollView contentContainerStyle={styles.content}>
          <StickerCard>
            <View style={styles.hero}>
              <Duoduo size={72} mood={problems === 0 ? 'happy' : 'expectant'} pose="wave" />
              <View style={styles.heroText}>
                <AppText variant="title3">
                  {problems === 0 ? reminderCopy.ready : reminderCopy.problem(problems)}
                </AppText>
                <AppText variant="caption" tone="secondary">
                  {problems === 0 ? reminderCopy.readyDetail : reminderCopy.permissionOff}
                </AppText>
              </View>
            </View>
          </StickerCard>

          <StickerCard padding={0}>
            <ListRow
              icon={permission === 'granted' ? 'check' : 'alert'}
              label={reminderCopy.permission}
              value={permission === 'granted' ? reminderCopy.permissionOn : reminderCopy.permissionGo}
              valueTone={permission === 'granted' ? 'success' : 'warning'}
              onPress={
                permission === 'granted'
                  ? undefined
                  : () => {
                      const task = permission === 'denied' ? notifications.openSettings() : notifications.request();
                      void task.finally(refresh);
                    }
              }
            />
            {Platform.OS === 'android' && exact !== 'unsupported' ? (
              <ListRow
                icon={exact === 'granted' ? 'check' : 'alert'}
                label={reminderCopy.exact}
                value={exact === 'granted' ? reminderCopy.exactOn : reminderCopy.permissionGo}
                valueTone={exact === 'granted' ? 'success' : 'warning'}
                onPress={
                  exact === 'granted' ? undefined : () => void notifications.openExactAlarmSettings().finally(refresh)
                }
                showDivider
              />
            ) : null}
            {guide ? (
              <ListRow
                icon="battery"
                label={reminderCopy.background(guide.brand)}
                value="去设置"
                onPress={() => {
                  setExpanded((value) => !value);
                  void openAppSettings();
                }}
                showDivider
              />
            ) : null}
          </StickerCard>
          {expanded && guide
            ? guide.steps.map((step, index) => (
                <AppText key={step} variant="caption" tone="secondary">
                  {index + 1}. {step}
                </AppText>
              ))
            : null}
          {Platform.OS === 'ios' ? (
            <AppText variant="caption" tone="muted">
              {reminderCopy.focusNote}
            </AppText>
          ) : null}

          <StickerCard>
            <View style={styles.flag}>
              <View style={styles.flex}>
                <AppText variant="body">{reminderCopy.evening}</AppText>
                <AppText variant="caption" tone="secondary">
                  {eveningTime}
                </AppText>
              </View>
              <CandySwitch
                value={evening}
                accessibilityLabel={reminderCopy.evening}
                onValueChange={(value) => {
                  update({ eveningSummary: value });
                  reminderService.kick();
                }}
              />
            </View>
          </StickerCard>

          <CandyButton
            label={reminderCopy.test}
            variant="secondary"
            onPress={() => {
              void reminderService.sendTest();
              overlay.toast(reminderCopy.testToast);
            }}
          />

          <AppText variant="title3">{reminderCopy.upcoming}</AppText>
          <StickerCard padding={0}>
            {upcoming.length === 0 ? (
              <AppText variant="callout" tone="muted" style={styles.empty}>
                {reminderCopy.noneUpcoming}
              </AppText>
            ) : (
              upcoming.map((notice) => (
                <Pressable key={notice.id} style={styles.notice}>
                  <AppText variant="callout" tone="secondary" style={styles.when}>
                    {whenLabel(notice.date, notice.time)}
                  </AppText>
                  <AppText variant="callout" numberOfLines={1} style={styles.flex}>
                    {notice.title}
                  </AppText>
                </Pressable>
              ))
            )}
          </StickerCard>
          {plan.coverageShort ? (
            <AppText variant="caption" tone="warning">
              {reminderCopy.crowded}
            </AppText>
          ) : null}
        </ScrollView>
      </DotPaper>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: inset.page, gap: space.md, paddingBottom: space.giant },
  hero: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  heroText: { flex: 1, gap: 2 },
  flag: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  flex: { flex: 1 },
  empty: { padding: inset.card },
  notice: { flexDirection: 'row', gap: space.md, paddingHorizontal: inset.card, paddingVertical: 12 },
  when: { width: 108 },
});
