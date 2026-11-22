/**
 * 触感反馈（设计规范 9.4）：全 App 统一从这里调用，受偏好"触感反馈"开关控制。
 */
import * as Haptics from 'expo-haptics';

import { usePrefs } from '@/stores/prefsStore';

function run(task: () => Promise<void>) {
  if (!usePrefs.getState().haptics) return;
  task().catch(() => {
    // 部分安卓机型不支持某些触感类型，忽略即可
  });
}

export const haptics = {
  /** 打卡、补卡 */
  light: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  /** 多次打卡中间一次、选择、切换 */
  selection: () => run(() => Haptics.selectionAsync()),
  /** 完美日、解锁徽章、毕业 */
  success: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  /** 盖章 */
  heavy: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)),
  /** 撤销 */
  soft: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)),
  /** 不可打卡、删除 */
  warning: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
};
