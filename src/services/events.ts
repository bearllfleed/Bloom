/**
 * 数据变更事件总线（技术方案 5.2）：服务层写入数据后发出事件，
 * 成就结算、提醒重排、小组件刷新、界面刷新各自订阅，互不直接调用。
 */
import type { LocalDate } from '@/domain/types';

export type DataEvent =
  | { type: 'checkinChanged'; projectId: string; date: LocalDate }
  | { type: 'projectChanged'; projectId: string }
  | { type: 'projectsChanged' }
  | { type: 'moodChanged'; date: LocalDate; projectId: string | null }
  | { type: 'achievementChanged' }
  | { type: 'backupChanged' }
  | { type: 'dataReplaced' };

type Listener = (event: DataEvent) => void;

const listeners = new Set<Listener>();

export const events = {
  emit(event: DataEvent): void {
    listeners.forEach((listener) => listener(event));
  },
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
