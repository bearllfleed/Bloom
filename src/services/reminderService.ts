/**
 * 把领域层算出的提醒交给系统，并在数据变化后重排。
 * 触发：启动、回前台、打卡、项目变更、导入。界面通过 planNow 看接下来的提醒。
 */
import { planReminders, type PlanResult, type SchedulableProject } from '@/domain/reminder';
import type { ProjectEntity } from '@/domain/types';
import { checkinRepo } from '@/data/repositories/checkinRepo';
import { projectRepo } from '@/data/repositories/projectRepo';
import { clock } from '@/platform/clock';
import { createLogger } from '@/platform/logger';
import { notifications } from '@/platform/notifications';
import { usePrefs } from '@/stores/prefsStore';

import { events } from './events';

const log = createLogger('reminder');
let timer: ReturnType<typeof setTimeout> | null = null;
let started = false;

function schedulable(project: ProjectEntity): SchedulableProject {
  return {
    snapshot: project,
    name: project.name,
    reminders: project.reminders,
    skipDone: project.remindSkipDone,
    skipPeriodMet: project.remindSkipPeriodMet,
  };
}

export function planNow(): PlanResult {
  const wall = clock.wallClock();
  const prefs = usePrefs.getState();
  return planReminders({
    nowDate: wall.date,
    nowMinutes: wall.minutes,
    logicalToday: clock.today(),
    projects: projectRepo.listEntities().map(schedulable),
    counts: checkinRepo.countsByProject(),
    settings: { weekStart: prefs.weekStart },
    evening: { enabled: prefs.eveningSummary, time: prefs.eveningSummaryTime },
  });
}

async function reschedule(): Promise<void> {
  try {
    const plan = planNow();
    await notifications.replace(
      plan.notices.map((notice) => ({
        id: notice.id,
        title: notice.title,
        body: notice.body,
        fireAt: clock.toSystemTime(clock.timestampAt(notice.date, notice.time)),
        data: { kind: notice.projectId ? 'reminder' : 'evening', projectId: notice.focusId },
      })),
    );
    log.info(`已排 ${plan.notices.length} 条提醒`);
  } catch (error) {
    log.warn('重排提醒失败', error);
  }
}

export const reminderService = {
  /** 启动时调用一次：订阅数据变化，并立刻排一次 */
  start(): void {
    if (started) return;
    started = true;
    events.subscribe(() => reminderService.kick());
    this.kick();
  },

  kick(): void {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      void reschedule();
    }, 300);
  },

  async sendTest(): Promise<void> {
    await notifications.scheduleIn(5, '朵朵来敲门啦', '提醒一切正常');
  },
};
