import { sha256Hex } from '@/data/backup/sha256';
import { unzipStore } from '@/data/backup/zipStore';
import { PERF_FIXTURE_PROFILES, buildPerfFixture, type PerfFixtureKind } from '../../scripts/create-perf-fixture';

interface FixturePayload {
  formatVersion: number;
  projects: Record<string, unknown>[];
  rules: Record<string, unknown>[];
  pauses: Record<string, unknown>[];
  reminders: Record<string, unknown>[];
  checkins: Record<string, unknown>[];
  moods: Record<string, unknown>[];
  moodPhotos: Record<string, unknown>[];
  achievements: Record<string, unknown>[];
  counters: Record<string, unknown>[];
  meta: { key: string; value: string }[];
}

function decode(kind: PerfFixtureKind) {
  const fixture = buildPerfFixture(kind);
  const entries = unzipStore(fixture.bytes);
  expect(entries).not.toBeNull();
  const manifestBytes = entries?.get('manifest.json');
  const dataBytes = entries?.get('data.json');
  expect(manifestBytes).toBeDefined();
  expect(dataBytes).toBeDefined();
  const decoder = new TextDecoder();
  const manifest = JSON.parse(decoder.decode(manifestBytes)) as Record<string, unknown> & {
    counts: Record<string, number>;
    sha256: string;
    mediaSha256: Record<string, string>;
  };
  const payload = JSON.parse(decoder.decode(dataBytes)) as FixturePayload;
  return { fixture, entries: entries!, manifest, payload, dataBytes: dataBytes! };
}

function zonedDateAndHour(timestamp: number, formatter: Intl.DateTimeFormat) {
  const parts = Object.fromEntries(formatter.formatToParts(timestamp).map((part) => [part.type, part.value]));
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    hour: Number(parts.hour),
  };
}

function timeZoneFormatter(timeZone: string): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat('en', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
  });
}

describe('性能备份夹具', () => {
  it.each([
    ['standard', 10, 10_950, 300, '2021-01-01', '2023-12-31'],
    ['stress', 20, 36_520, 300, '2019-01-01', '2023-12-31'],
  ] as const)('%s 集使用固定日期范围并生成准确计数', (kind, projects, checkins, moods, from, to) => {
    const { entries, manifest, payload, dataBytes } = decode(kind);

    expect(PERF_FIXTURE_PROFILES[kind]).toMatchObject({ projects, from, to });
    expect(payload.projects).toHaveLength(projects);
    expect(payload.rules).toHaveLength(projects);
    expect(payload.checkins).toHaveLength(checkins);
    expect(payload.moods).toHaveLength(moods);
    expect(payload.moodPhotos).toEqual([]);
    expect(manifest).toMatchObject({
      format: 'bloom-backup',
      formatVersion: 1,
      schemaVersion: 1,
      appVersion: 'perf-fixture',
      exportedAt: '2024-01-01T00:00:00+00:00',
      platform: 'fixture',
      counts: { projects, checkins, moods, photos: 0, achievements: 0 },
      mediaSha256: {},
    });
    expect(manifest.sha256).toBe(sha256Hex(dataBytes));
    expect([...entries.keys()].sort()).toEqual(['data.json', 'manifest.json']);
    expect(payload.checkins[0].date).toBe(from);
    expect(payload.checkins.at(-1)?.date).toBe(to);
    expect(payload.meta).toEqual(
      expect.arrayContaining([
        { key: 'first_use_date', value: from },
        { key: 'perf_fixture_id', value: kind },
        { key: 'perf_fixture_seed', value: String(PERF_FIXTURE_PROFILES[kind].seed) },
      ]),
    );
  });

  it('常见设备时区下打卡时刻的本地日期始终等于业务日期', () => {
    const { payload } = decode('standard');
    const checkins = payload.checkins as { date: string; checked_at: number }[];

    for (const timeZone of ['UTC', 'America/Los_Angeles', 'Asia/Shanghai']) {
      const formatter = timeZoneFormatter(timeZone);
      const mismatches = checkins
        .filter((row) => zonedDateAndHour(row.checked_at, formatter).date !== row.date)
        .slice(0, 3);
      expect({ timeZone, mismatches }).toEqual({ timeZone, mismatches: [] });
    }
  });

  it('常见设备时区下打卡时刻不会触发早起或夜间指标', () => {
    const { payload } = decode('standard');
    const checkins = payload.checkins as { id: string; checked_at: number }[];

    for (const timeZone of ['UTC', 'America/Los_Angeles', 'Asia/Shanghai']) {
      const formatter = timeZoneFormatter(timeZone);
      const accidentalPeriodCheckins = checkins
        .filter((row) => {
          const { hour } = zonedDateAndHour(row.checked_at, formatter);
          return (hour >= 5 && hour < 7) || hour >= 23 || hour < 2;
        })
        .slice(0, 3)
        .map((row) => row.id);
      expect({ timeZone, accidentalPeriodCheckins }).toEqual({ timeZone, accidentalPeriodCheckins: [] });
    }
  });

  it('固定种子使相同夹具逐字节确定', () => {
    const first = buildPerfFixture('standard');
    const second = buildPerfFixture('standard');

    expect(first.fileName).toBe('Bloom性能标准集.bloom');
    expect(first.bytes.byteLength).toBe(second.bytes.byteLength);
    expect(sha256Hex(first.bytes)).toBe(sha256Hex(second.bytes));
  });

  it('夹具不包含照片、打卡备注或心情正文', () => {
    const { payload, entries } = decode('stress');

    expect(payload.moodPhotos).toEqual([]);
    expect(payload.checkins.every((row) => row.note === null)).toBe(true);
    expect(payload.moods.every((row) => row.text === '' && row.project_name_snapshot === null)).toBe(true);
    expect([...entries.keys()].some((name) => name.startsWith('media/'))).toBe(false);
    expect(JSON.stringify(payload)).not.toContain('.jpg');
  });
});
