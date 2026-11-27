/**
 * 按数据域维护修订号。查询只订阅自己真正读取的域，避免无关写入让整页同步重算。
 */
import { create } from 'zustand';

import { clock } from '@/platform/clock';
import { events, type DataEvent } from '@/services/events';

export const DATA_DOMAINS = ['projects', 'checkins', 'moods', 'achievements', 'backup', 'clock'] as const;

export type DataDomain = (typeof DATA_DOMAINS)[number];
export type DataRevisions = Record<DataDomain, number>;

const INITIAL_REVISIONS: DataRevisions = {
  projects: 0,
  checkins: 0,
  moods: 0,
  achievements: 0,
  backup: 0,
  clock: 0,
};

export const useDataVersion = create<DataRevisions>(() => ({ ...INITIAL_REVISIONS }));

export function domainsForDataEvent(event: DataEvent): readonly DataDomain[] {
  switch (event.type) {
    case 'checkinChanged':
      return ['checkins', 'achievements'];
    case 'projectChanged':
    case 'projectsChanged':
      return ['projects', 'achievements'];
    case 'moodChanged':
      return ['moods', 'achievements'];
    case 'achievementChanged':
      return ['achievements'];
    case 'backupChanged':
      return ['backup'];
    case 'dataReplaced':
      return DATA_DOMAINS;
  }
}

export function invalidateDataDomains(domains: readonly DataDomain[]): void {
  if (domains.length === 0) return;
  useDataVersion.setState((state) => {
    const next = { ...state };
    for (const domain of new Set(domains)) next[domain] += 1;
    return next;
  });
}

export function getDataRevisions(): Readonly<DataRevisions> {
  return useDataVersion.getState();
}

export function dataRevisionKey(domains: readonly DataDomain[]): string {
  const revisions = getDataRevisions();
  return domains.map((domain) => revisions[domain]).join(':');
}

events.subscribe((event) => invalidateDataDomains(domainsForDataEvent(event)));
clock.subscribe(() => invalidateDataDomains(['clock']));
