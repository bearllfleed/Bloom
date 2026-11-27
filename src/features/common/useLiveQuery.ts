/**
 * 随指定数据域修订自动刷新的查询。
 * deps 是调用方入参（如选中日期）；domains 必须显式列出查询真正读取的数据域。
 */
import { useRef } from 'react';

import { useDataVersion, type DataDomain } from '@/stores/dataVersion';

function sameDeps(a: readonly unknown[], b: readonly unknown[]): boolean {
  return a.length === b.length && a.every((value, index) => Object.is(value, b[index]));
}

export function useLiveQuery<T>(query: () => T, deps: readonly unknown[], domains: readonly DataDomain[]): T {
  const revision = useDataVersion((state) => domains.map((domain) => state[domain]).join(':'));
  const cache = useRef<{ revision: string; deps: readonly unknown[]; value: T } | null>(null);
  if (!cache.current || cache.current.revision !== revision || !sameDeps(cache.current.deps, deps)) {
    cache.current = { revision, deps, value: query() };
  }
  return cache.current.value;
}
