import { useCallback, useEffect, useRef } from 'react';

import { perfTrace, type PerfSpan, type PerfStage } from '@/platform/perfTrace';

/** 在交互处理器开始计时，并在对应状态提交后的 effect 边界结束。 */
export function useCommitPerfTrace(stage: PerfStage, commitKey: unknown): () => void {
  const pending = useRef<PerfSpan | null>(null);

  useEffect(() => {
    if (!pending.current) return;
    perfTrace.end(pending.current);
    pending.current = null;
  }, [commitKey]);

  useEffect(
    () => () => {
      if (pending.current) perfTrace.end(pending.current);
    },
    [],
  );

  return useCallback(() => {
    if (pending.current) perfTrace.end(pending.current);
    pending.current = perfTrace.begin(stage);
  }, [stage]);
}
