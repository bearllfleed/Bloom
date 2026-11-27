export const PERF_STAGES = [
  'startup.js',
  'startup.root_layout',
  'startup.bootstrap',
  'startup.database',
  'startup.preferences',
  'startup.first_use_date',
  'startup.achievement_baseline',
  'startup.cleanup',
  'startup.auto_graduate',
  'startup.first_renderable',
  'startup.splash_hide_request',
  'startup.splash_hide_complete',
  'interaction.today',
  'interaction.stats',
  'interaction.achievement',
] as const;

export const PERF_DATASET_IDS = ['standard', 'stress'] as const;

export type PerfStage = (typeof PERF_STAGES)[number];
export type PerfDatasetId = (typeof PERF_DATASET_IDS)[number];
export type PerfClock = () => number;
export interface PerfTraceSink {
  info(message: string, detail?: unknown): void;
}

export interface PerfTraceContext {
  buildId?: string;
  datasetId?: string;
}

export interface PerfMark {
  readonly atMs: number;
}

export interface PerfSpan {
  readonly stage?: PerfStage;
  readonly startedAtMs: number;
  ended: boolean;
}

type BufferedRecord =
  | { type: 'mark'; stage: PerfStage; atMs: number }
  | { type: 'measure'; stage: PerfStage; startedAtMs: number; durationMs: number };

const MAX_RECORDS = 256;
const SAFE_IDENTIFIER = /^[A-Za-z0-9._()+/-]{1,80}$/;
const PERF_STAGE_SET: ReadonlySet<string> = new Set(PERF_STAGES);
const PERF_DATASET_ID_SET: ReadonlySet<string> = new Set(PERF_DATASET_IDS);

export function isPerfStage(value: unknown): value is PerfStage {
  return typeof value === 'string' && PERF_STAGE_SET.has(value);
}

export function isPerfDatasetId(value: unknown): value is PerfDatasetId {
  return typeof value === 'string' && PERF_DATASET_ID_SET.has(value);
}

function monotonic(source: PerfClock): PerfClock {
  let last = 0;
  return () => {
    const next = source();
    if (!Number.isFinite(next)) return last;
    last = Math.max(last, next);
    return last;
  };
}

function defaultClock(): PerfClock {
  if (typeof globalThis.performance?.now === 'function') {
    return () => globalThis.performance.now();
  }
  return () => 0;
}

function safeIdentifier(value: unknown): string | undefined {
  return typeof value === 'string' && SAFE_IDENTIFIER.test(value) ? value : undefined;
}

function sanitizeContext(context: PerfTraceContext): PerfTraceContext {
  const buildId = safeIdentifier(context.buildId);
  const datasetId = isPerfDatasetId(context.datasetId) ? context.datasetId : undefined;
  return {
    ...(buildId ? { buildId } : {}),
    ...(datasetId ? { datasetId } : {}),
  };
}

export function createPerfTrace(clock: PerfClock = defaultClock()) {
  const now = monotonic(clock);
  let records: BufferedRecord[] = [];
  let context: PerfTraceContext = {};

  const push = (record: BufferedRecord) => {
    if (records.length === MAX_RECORDS) records.shift();
    records.push(record);
  };

  return {
    setContext(next: PerfTraceContext): void {
      context = { ...context, ...sanitizeContext(next) };
    },

    mark(stage: PerfStage): PerfMark {
      const atMs = now();
      if (isPerfStage(stage)) push({ type: 'mark', stage, atMs });
      return { atMs };
    },

    measure(stage: PerfStage, start: PerfMark, end?: PerfMark): number {
      const endedAtMs = end?.atMs ?? now();
      const durationMs = Math.max(0, endedAtMs - start.atMs);
      if (isPerfStage(stage)) push({ type: 'measure', stage, startedAtMs: start.atMs, durationMs });
      return durationMs;
    },

    begin(stage: PerfStage): PerfSpan {
      return { ...(isPerfStage(stage) ? { stage } : {}), startedAtMs: now(), ended: false };
    },

    end(span: PerfSpan): number | null {
      if (span.ended) return null;
      span.ended = true;
      const durationMs = Math.max(0, now() - span.startedAtMs);
      if (isPerfStage(span.stage)) {
        push({ type: 'measure', stage: span.stage, startedAtMs: span.startedAtMs, durationMs });
      }
      return durationMs;
    },

    flush(sink: PerfTraceSink, nextContext: PerfTraceContext = {}): boolean {
      if (records.length === 0) return false;
      const batch = records;
      records = [];
      const originMs = Math.min(...batch.map((record) => (record.type === 'mark' ? record.atMs : record.startedAtMs)));
      const detail = {
        context: { ...context, ...sanitizeContext(nextContext) },
        records: batch.map((record) =>
          record.type === 'mark'
            ? { type: record.type, stage: record.stage, offsetMs: record.atMs - originMs }
            : { type: record.type, stage: record.stage, durationMs: record.durationMs },
        ),
      };
      try {
        sink.info('性能追踪', detail);
      } catch {
        // 性能测量不能改变业务流程或错误语义
      }
      return true;
    },
  };
}

export const perfTrace = createPerfTrace();

export function flushPerfTrace(sink: PerfTraceSink, context?: PerfTraceContext): boolean {
  return perfTrace.flush(sink, context);
}
