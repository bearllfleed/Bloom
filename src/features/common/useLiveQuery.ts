/**
 * 随数据版本自动刷新的查询：打卡、编辑、时间旅行、跨天后重新计算。
 * deps 为调用方的入参（如选中日期），与数据版本一起决定是否重新查询。
 */
import { useRef } from 'react';

import { useDataVersion } from '@/stores/dataVersion';

function sameDeps(a: readonly unknown[], b: readonly unknown[]): boolean {
  return a.length === b.length && a.every((v, i) => Object.is(v, b[i]));
}

export function useLiveQuery<T>(query: () => T, deps: readonly unknown[]): T {
  const version = useDataVersion((s) => s.version);
  const cache = useRef<{ version: number; deps: readonly unknown[]; value: T } | null>(null);
  if (!cache.current || cache.current.version !== version || !sameDeps(cache.current.deps, deps)) {
    cache.current = { version, deps, value: query() };
  }
  return cache.current.value;
}
