import { createStartupCommitGate } from '@/platform/startupCommit';

describe('启动提交边界', () => {
  it('创建和渲染阶段不产生提交标记或隐藏请求', () => {
    const mark = jest.fn();
    const hide = jest.fn();

    createStartupCommitGate(mark, hide);

    expect(mark).not.toHaveBeenCalled();
    expect(hide).not.toHaveBeenCalled();
  });

  it('根提交重复通知只记录一次', () => {
    const mark = jest.fn();
    const hide = jest.fn();
    const gate = createStartupCommitGate(mark, hide);

    gate.onRootCommit();
    gate.onRootCommit();

    expect(mark.mock.calls).toEqual([['startup.root_layout']]);
    expect(hide).not.toHaveBeenCalled();
  });

  it('首个可渲染 layout 按提交顺序记录并至多隐藏一次', () => {
    const mark = jest.fn();
    const hide = jest.fn();
    const gate = createStartupCommitGate(mark, hide);

    gate.onFirstRenderableLayout();
    gate.onFirstRenderableLayout();
    gate.onRootCommit();

    expect(mark.mock.calls).toEqual([['startup.root_layout'], ['startup.first_renderable']]);
    expect(hide).toHaveBeenCalledTimes(1);
  });
});
