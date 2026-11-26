/**
 * 根布局：加载字体、启动数据库迁移、挂主题与全局弹层宿主。
 * 负责前后台切换（自动毕业、跨天刷新、彻底删除撤销期内的项目）和升级后的更新说明。
 * 启动失败时展示"数据升级没有成功"，可导出诊断日志。
 */
import { Fredoka_500Medium, Fredoka_600SemiBold, useFonts } from '@expo-google-fonts/fredoka';
import { Stack, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { bootCopy, trustCopy } from '@/copy/common';
import { presentPendingUnlocks } from '@/features/achievement';
import { presentPendingGraduations } from '@/features/graduation/present';
import { openChangelog } from '@/features/settings/ChangelogSheet';
import { isDevToolsEnabled } from '@/platform/appVariant';
import { clock } from '@/platform/clock';
import { shareDiagnostics } from '@/platform/diagnostics';
import { files } from '@/platform/files';
import { notifications } from '@/platform/notifications';
import { backupErrorText, parseBackup, stageBackup } from '@/services/backupService';
import { markChangelogSeen, pendingChangelog } from '@/services/changelogService';
import { events } from '@/services/events';
import { bootstrap, onBackground, onForeground, type BootResult } from '@/services/lifecycleService';
import { achievementService } from '@/services/achievementService';
import { overlay } from '@/stores/overlayQueue';
import { usePrefs } from '@/stores/prefsStore';
import { useTodayStore } from '@/stores/todayStore';
import { AppText } from '@/ui/components/AppText';
import { CandyButton } from '@/ui/components/CandyButton';
import { TimeTravelBanner } from '@/ui/components/TimeTravelBanner';
import { Duoduo } from '@/ui/illustrations/Duoduo';
import { focusGateLayout } from '@/ui/motion/idle';
import { OverlayHost } from '@/ui/overlay/OverlayHost';
import { ThemeProvider, useTheme } from '@/ui/theme/ThemeProvider';
import { space } from '@/ui/tokens';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function BootFailure({ result }: { result: Extract<BootResult, { ok: false }> }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.boot, { backgroundColor: colors.background }]}>
      <Duoduo size={120} mood="puzzled" />
      <AppText variant="title2" align="center">
        {bootCopy.upgradeFailedTitle}
      </AppText>
      <AppText variant="body" tone="secondary" align="center">
        {bootCopy.upgradeFailedMessage}
      </AppText>
      <AppText variant="caption" tone="muted" align="center">
        {result.message}
      </AppText>
      <CandyButton label={bootCopy.exportLogs} onPress={() => void shareDiagnostics()} size="md" />
      <AppText variant="caption" tone="muted">
        {trustCopy.localOnly}
      </AppText>
    </View>
  );
}

/** 前后台切换与零点翻日 */
function useLifecycle() {
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        onForeground();
        useTodayStore.getState().syncWithClock();
      } else if (state === 'background') {
        onBackground();
      }
    });
    let timer: ReturnType<typeof setTimeout> | null = null;
    const scheduleMidnight = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(
        () => {
          onForeground();
          useTodayStore.getState().syncWithClock();
          scheduleMidnight();
        },
        Math.max(1000, clock.nextDayBoundary() - clock.now() + 500),
      );
    };
    scheduleMidnight();
    const unsubscribe = clock.subscribe(scheduleMidnight);
    return () => {
      sub.remove();
      unsubscribe();
      if (timer) clearTimeout(timer);
    };
  }, []);
}

/**
 * 从底部滑入的全屏表单。不用系统 modal：系统弹窗盖在全局弹层之上，
 * 换图标、放弃编辑的确认都会被挡在表单后面。
 */
const formScreenOptions = {
  animation: 'slide_from_bottom' as const,
  gestureDirection: 'vertical' as const,
};

function RootNavigator() {
  const { colors, scheme } = useTheme();
  const router = useRouter();
  const onboarded = usePrefs((s) => s.onboarded);
  const url = Linking.useURL();
  useLifecycle();

  useEffect(() => {
    void notifications.prepare();
    return notifications.onResponse((data) => {
      const projectId = typeof data.projectId === 'string' ? data.projectId : null;
      useTodayStore.getState().focusOn(projectId);
      router.navigate('/');
    });
  }, [router]);

  useEffect(() => {
    if (!onboarded) return;
    presentPendingGraduations();
    presentPendingUnlocks();
    const stop = events.subscribe(() => presentPendingGraduations());
    // 新徽章停手 1.2 秒后才通知；启动时也要补弹上次没看完的
    const stopUnlocks = achievementService.onUnlocked(() => presentPendingUnlocks());
    const entry = pendingChangelog();
    const timer = entry ? setTimeout(() => openChangelog(entry, markChangelogSeen), 600) : null;
    return () => {
      stop();
      stopUnlocks();
      if (timer) clearTimeout(timer);
    };
  }, [onboarded]);

  useEffect(() => {
    if (!url || !decodeURIComponent(url).includes('.bloom')) return;
    try {
      const parsed = parseBackup(files.adopt(url));
      if (!parsed.ok) {
        overlay.toast(backupErrorText(parsed.error));
        return;
      }
      stageBackup(parsed.parsed);
      router.push('/settings/import');
    } catch {
      overlay.toast(backupErrorText('corrupt'));
    }
  }, [router, url]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <TimeTravelBanner />
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}
        screenLayout={focusGateLayout}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="welcome" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="project/new" options={formScreenOptions} />
        <Stack.Screen name="project/[id]/index" />
        <Stack.Screen name="project/[id]/edit" options={formScreenOptions} />
        <Stack.Screen name="history" />
        <Stack.Screen name="mood/index" />
        <Stack.Screen name="mood/[id]" />
        <Stack.Screen name="mood/editor" options={formScreenOptions} />
        <Stack.Screen name="project/[id]/review" />
        <Stack.Screen name="settings/about" />
        <Stack.Screen name="settings/reminders" />
        <Stack.Screen name="settings/backup" />
        <Stack.Screen name="settings/import" />
        <Stack.Screen name="settings/preferences" />
        {isDevToolsEnabled ? <Stack.Screen name="dev" /> : null}
      </Stack>
      <OverlayHost />
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Fredoka_500Medium,
    Fredoka_600SemiBold,
  });
  const [boot, setBoot] = useState<BootResult | null>(null);

  useEffect(() => {
    setBoot(bootstrap());
  }, []);

  useEffect(() => {
    if (fontsLoaded && boot) SplashScreen.hideAsync().catch(() => undefined);
  }, [fontsLoaded, boot]);

  if (!fontsLoaded || !boot) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <ThemeProvider>{boot.ok ? <RootNavigator /> : <BootFailure result={boot} />}</ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  boot: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xxl, gap: space.lg },
});
