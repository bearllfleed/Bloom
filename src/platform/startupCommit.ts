import type { PerfStage } from './perfTrace';

type StartupMark = (stage: Extract<PerfStage, 'startup.root_layout' | 'startup.first_renderable'>) => void;

/**
 * 把启动性能标记绑定到 React 提交后的边界，而不是 render。
 * React StrictMode 重放 effect 或重复触发 onLayout 时仍保持幂等。
 */
export function createStartupCommitGate(mark: StartupMark, hideSplash: () => void) {
  let rootCommitted = false;
  let firstRenderableLaidOut = false;

  const onRootCommit = (): void => {
    if (rootCommitted) return;
    rootCommitted = true;
    mark('startup.root_layout');
  };

  return {
    onRootCommit,
    onFirstRenderableLayout(): void {
      if (firstRenderableLaidOut) return;
      firstRenderableLaidOut = true;
      onRootCommit();
      mark('startup.first_renderable');
      hideSplash();
    },
  };
}
