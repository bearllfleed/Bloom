/**
 * 本地通知（技术方案第 10 节）。界面层不要直接引用 expo-notifications。
 * 负责：权限、精确闹钟、排期替换、测试提醒、点击回调。
 */
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

import { usePrefs } from '@/stores/prefsStore';

import { clock } from './clock';

export type PermissionState = 'granted' | 'denied' | 'undetermined';
export type ExactAlarmState = 'granted' | 'denied' | 'unsupported';

export interface ScheduledNotice {
  id: string;
  title: string;
  body: string;
  /** 系统时钟上的触发时间 */
  fireAt: number;
  data: Record<string, unknown>;
}

const CHANNEL = 'reminders';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: usePrefs.getState().sound,
    shouldSetBadge: false,
  }),
});

let prepared = false;

export const notifications = {
  async prepare(): Promise<void> {
    if (prepared) return;
    prepared = true;
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL, {
        name: '打卡提醒',
        importance: AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 180, 80, 180],
      });
    }
  },

  async permission(): Promise<PermissionState> {
    const status = await Notifications.getPermissionsAsync();
    if (status.granted) return 'granted';
    return status.canAskAgain ? 'undetermined' : 'denied';
  },

  async request(): Promise<boolean> {
    const status = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: false, allowSound: true },
    });
    return status.granted;
  },

  async exactAlarm(): Promise<ExactAlarmState> {
    if (Platform.OS !== 'android' || Number(Platform.Version) < 31) return 'unsupported';
    const status = await Notifications.getExactAlarmPermissionsAsync();
    return status.granted ? 'granted' : 'denied';
  },

  async openExactAlarmSettings(): Promise<void> {
    await Notifications.requestExactAlarmPermissionsAsync();
  },

  async openSettings(): Promise<void> {
    const Linking = await import('expo-linking');
    await Linking.openSettings();
  },

  /** 用计划替换已排期的提醒；测试提醒（test: 开头）留着 */
  async replace(items: readonly ScheduledNotice[]): Promise<void> {
    await this.prepare();
    const exact = (await this.exactAlarm()) !== 'denied';
    const existing = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
      existing
        .filter((item) => !item.identifier.startsWith('test:'))
        .map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier)),
    );
    const sound = usePrefs.getState().sound ? 'default' : undefined;
    for (const item of items) {
      if (item.fireAt <= clock.systemNow()) continue;
      await Notifications.scheduleNotificationAsync({
        identifier: item.id,
        content: { title: item.title, body: item.body, data: item.data, sound },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: item.fireAt,
          channelId: CHANNEL,
          delivery: exact ? 'alarmClock' : 'bestEffort',
        },
      });
    }
  },

  async scheduleIn(seconds: number, title: string, body: string): Promise<void> {
    await this.prepare();
    await Notifications.scheduleNotificationAsync({
      identifier: `test:${clock.systemNow()}`,
      content: { title, body, data: { kind: 'test' } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds, channelId: CHANNEL },
    });
  },

  onResponse(listener: (data: Record<string, unknown>) => void): () => void {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      listener((data ?? {}) as Record<string, unknown>);
    });
    return () => sub.remove();
  },
};
