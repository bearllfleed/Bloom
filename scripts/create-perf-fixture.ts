import fs from 'node:fs';
import path from 'node:path';

import { PERF_DATASET_IDS, type PerfDatasetId } from '../src/platform/perfTrace';
import { BLOOM_BACKUP_FORMAT_VERSION, encodeBloomBackup, type BackupPayload } from '../src/data/backup';
import { LATEST_SCHEMA_VERSION } from '../src/data/db/migrations';
import type { CheckinRow, ProjectRow, ProjectRuleRow } from '../src/data/db/rows';
import { eachDay } from '../src/domain/date';
import type { MoodFace } from '../src/domain/mood';
import type { Prefs } from '../src/stores/prefsStore';

export type PerfFixtureKind = PerfDatasetId;

interface PerfFixtureProfile {
  fileName: string;
  projects: number;
  from: string;
  to: string;
  moods: number;
  seed: number;
}

export const PERF_FIXTURE_PROFILES: Record<PerfFixtureKind, PerfFixtureProfile> = {
  standard: {
    fileName: 'Bloom性能标准集.bloom',
    projects: 10,
    from: '2021-01-01',
    to: '2023-12-31',
    moods: 300,
    seed: 20210101,
  },
  stress: {
    fileName: 'Bloom性能压力集.bloom',
    projects: 20,
    from: '2019-01-01',
    to: '2023-12-31',
    moods: 300,
    seed: 20190101,
  },
};

const FACES: readonly MoodFace[] = ['ecstatic', 'happy', 'calm', 'tired', 'sad'];
const EXPORTED_AT = '2024-01-01T00:00:00+00:00';

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0;
    return state / 0x1_0000_0000;
  };
}

function timestamp(date: string, minuteOfDay: number): number {
  return Date.parse(`${date}T00:00:00.000Z`) + minuteOfDay * 60_000;
}

function fixturePrefs(): Prefs {
  return {
    nickname: '',
    avatarId: 'plain',
    onboarded: true,
    calendarMode: 'month',
    appearance: 'system',
    weekStart: 1,
    dayEndHour: 0,
    haptics: false,
    sound: false,
    calendarHome: 'remember',
    eveningSummary: false,
    eveningSummaryTime: '21:30',
    backupEveryDays: 0,
    devReduceMotion: true,
  };
}

function buildPayload(kind: PerfFixtureKind): BackupPayload<Prefs> {
  const profile = PERF_FIXTURE_PROFILES[kind];
  const days = eachDay(profile.from, profile.to);
  const random = seededRandom(profile.seed);
  const projects = Array.from({ length: profile.projects }, (_, index) => {
    const number = String(index + 1).padStart(2, '0');
    return {
      id: `perf-${kind}-project-${number}`,
      name: `性能夹具项目 ${number}`,
      icon_id: 'collect/flower',
      color_id: 'soda',
      motto: '',
      unit: '次',
      start_date: profile.from,
      end_date: null,
      duration_preset: null,
      status: 'active',
      graduated_on: null,
      graduation_seen: 0,
      note_enabled: 0,
      remind_skip_done: 1,
      remind_skip_period_met: 1,
      sort_order: index,
      previous_project_id: null,
      deleted_at: null,
      created_at: timestamp(profile.from, 8 * 60 + index),
      updated_at: timestamp(profile.to, 8 * 60 + index),
    } satisfies ProjectRow;
  });
  const rules = projects.map(
    (project, index) =>
      ({
        id: `perf-${kind}-rule-${String(index + 1).padStart(2, '0')}`,
        project_id: project.id,
        effective_from: profile.from,
        rule_json: JSON.stringify({ kind: 'daily', timesPerDay: 1 }),
        created_at: project.created_at,
      }) satisfies ProjectRuleRow,
  );
  const checkins = days.flatMap((date) =>
    projects.map(
      (project, projectIndex) =>
        ({
          id: `perf-${kind}-checkin-${date}-${String(projectIndex + 1).padStart(2, '0')}`,
          project_id: project.id,
          date,
          // UTC 11:xx 在 UTC、洛杉矶和上海均属同一业务日，且不落入早起或夜间时段。
          checked_at: timestamp(date, 11 * 60 + Math.floor(random() * 60)),
          note: null,
          source: 'app',
          created_at: timestamp(date, 20 * 60),
        }) satisfies CheckinRow,
    ),
  );
  const moods = days.slice(0, profile.moods).map((date, index) => {
    const project = projects[index % projects.length];
    return {
      id: `perf-${kind}-mood-${String(index + 1).padStart(3, '0')}`,
      date,
      project_id: project.id,
      project_name_snapshot: null,
      face: FACES[Math.floor(random() * FACES.length)],
      text: '',
      created_at: timestamp(date, 21 * 60),
      updated_at: timestamp(date, 21 * 60),
    };
  });

  return {
    formatVersion: BLOOM_BACKUP_FORMAT_VERSION,
    prefs: fixturePrefs(),
    projects,
    rules,
    pauses: [],
    reminders: [],
    checkins,
    moods,
    moodPhotos: [],
    achievements: [],
    counters: [],
    meta: [
      { key: 'first_use_date', value: profile.from },
      { key: 'perf_fixture_id', value: kind },
      { key: 'perf_fixture_seed', value: String(profile.seed) },
    ],
  };
}

export function buildPerfFixture(kind: PerfFixtureKind): { fileName: string; bytes: Uint8Array } {
  const profile = PERF_FIXTURE_PROFILES[kind];
  const { bytes } = encodeBloomBackup(buildPayload(kind), {
    schemaVersion: LATEST_SCHEMA_VERSION,
    appVersion: 'perf-fixture',
    exportedAt: EXPORTED_AT,
    platform: 'fixture',
  });
  return { fileName: profile.fileName, bytes };
}

function main(): void {
  const outputDir = path.resolve(process.argv[2] ?? path.join('fixtures', 'performance'));
  fs.mkdirSync(outputDir, { recursive: true });
  for (const kind of PERF_DATASET_IDS) {
    const fixture = buildPerfFixture(kind);
    const target = path.join(outputDir, fixture.fileName);
    fs.writeFileSync(target, fixture.bytes);
    console.log(`已生成 ${target}`);
  }
}

if (require.main === module) main();
