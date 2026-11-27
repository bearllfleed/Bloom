import { createPerfTrace, type PerfStage, type PerfTraceContext, type PerfTraceSink } from '@/platform/perfTrace';

function sequenceClock(...ticks: number[]): () => number {
  let index = 0;
  return () => {
    const tick = ticks[index];
    index += 1;
    if (tick === undefined) throw new Error('测试时钟没有更多读数');
    return tick;
  };
}

describe('性能追踪', () => {
  it('只在 flush 时把内存中的 mark 和 measure 批量写入一次', () => {
    const trace = createPerfTrace(sequenceClock(10, 15, 18, 30));
    const sink: PerfTraceSink = { info: jest.fn() };

    const js = trace.mark('startup.js');
    const root = trace.mark('startup.root_layout');
    trace.measure('startup.bootstrap', js, root);
    const interaction = trace.begin('interaction.today');
    trace.end(interaction);

    expect(sink.info).not.toHaveBeenCalled();
    expect(trace.flush(sink, { buildId: '0.2.0(1)', datasetId: 'standard' })).toBe(true);
    expect(sink.info).toHaveBeenCalledTimes(1);
    expect(sink.info).toHaveBeenCalledWith('性能追踪', {
      context: { buildId: '0.2.0(1)', datasetId: 'standard' },
      records: [
        { type: 'mark', stage: 'startup.js', offsetMs: 0 },
        { type: 'mark', stage: 'startup.root_layout', offsetMs: 5 },
        { type: 'measure', stage: 'startup.bootstrap', durationMs: 5 },
        { type: 'measure', stage: 'interaction.today', durationMs: 12 },
      ],
    });

    expect(trace.flush(sink)).toBe(false);
    expect(sink.info).toHaveBeenCalledTimes(1);
  });

  it('合并上下文时只保留构建和数据集标识，不接受用户内容字段', () => {
    const trace = createPerfTrace(sequenceClock(1));
    const sink: PerfTraceSink = { info: jest.fn() };
    const unsafeContext = {
      datasetId: 'stress',
      projectName: '绝密项目名',
      moodText: '今天的私人心情',
    } as PerfTraceContext & { projectName: string; moodText: string };

    trace.setContext(unsafeContext);
    trace.mark('startup.js');
    trace.flush(sink, {
      buildId: 'preview-42',
      projectName: '另一个项目名',
    } as PerfTraceContext & { projectName: string });

    const serialized = JSON.stringify((sink.info as jest.Mock).mock.calls[0]);
    expect(serialized).toContain('preview-42');
    expect(serialized).toContain('stress');
    expect(serialized).not.toContain('绝密项目名');
    expect(serialized).not.toContain('今天的私人心情');
    expect(serialized).not.toContain('另一个项目名');
    expect(serialized).not.toContain('projectName');
    expect(serialized).not.toContain('moodText');
  });

  it('只允许固定性能夹具标识进入上下文', () => {
    const trace = createPerfTrace(sequenceClock(1));
    const sink: PerfTraceSink = { info: jest.fn() };

    trace.setContext({ datasetId: 'therapy-project' });
    trace.mark('startup.js');

    expect(trace.flush(sink)).toBe(true);
    const serialized = JSON.stringify((sink.info as jest.Mock).mock.calls[0]);
    expect(serialized).not.toContain('therapy-project');
    expect(sink.info).toHaveBeenCalledWith('性能追踪', {
      context: {},
      records: [{ type: 'mark', stage: 'startup.js', offsetMs: 0 }],
    });
  });

  it('非法阶段传入 mark、measure、begin/end 时不会进入缓冲区', () => {
    const trace = createPerfTrace(sequenceClock(1, 2, 3));
    const sink: PerfTraceSink = { info: jest.fn() };
    const invalidStage = 'startup.therapy-project' as PerfStage;

    const start = trace.mark(invalidStage);
    trace.measure(invalidStage, start, { atMs: 5 });
    const span = trace.begin(invalidStage);
    trace.end(span);

    expect(trace.flush(sink)).toBe(false);
    expect(sink.info).not.toHaveBeenCalled();
  });

  it('end 会重新校验被外部篡改的 span.stage', () => {
    const trace = createPerfTrace(sequenceClock(1, 2));
    const sink: PerfTraceSink = { info: jest.fn() };
    const span = trace.begin('interaction.today');
    (span as unknown as { stage: string }).stage = 'interaction.therapy-project';

    trace.end(span);

    expect(trace.flush(sink)).toBe(false);
    expect(sink.info).not.toHaveBeenCalled();
  });
});
