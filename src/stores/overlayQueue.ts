/**
 * 全局弹层状态（需求 S20、第 2 期文档 2-12）。
 * - 撤销条：同时只有一条，新的替换旧的；
 * - 确认框、底部面板、长按菜单：用户主动打开，优先级最高，不会被打断；
 * - 排队弹层（毕业典礼、完美日、徽章、补发、更新说明）：按优先级一次只显示一个，
 *   有确认框或面板打开时先等待，关闭后间隔 300ms 再显示下一个。
 */
import type { ReactNode } from 'react';
import { create } from 'zustand';

import type { UiIconName } from '@/ui/icons/Icon';

export interface ToastSpec {
  id: number;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  /** 默认 3 秒，删除类 5 秒 */
  durationMs: number;
}

export interface DialogSpec {
  id: number;
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive?: boolean;
  resolve: (confirmed: boolean) => void;
}

export interface SheetSpec {
  id: number;
  render: (close: () => void) => ReactNode;
  /** 有未保存内容时返回 false 阻止下滑关闭，由面板自己询问 */
  canDismiss?: () => boolean;
}

export interface MenuItem {
  label: string;
  icon?: UiIconName;
  destructive?: boolean;
  onPress: () => void;
}

export interface MenuSpec {
  id: number;
  items: MenuItem[];
  /** 菜单展开位置（屏幕坐标） */
  anchorY: number;
  onClose?: () => void;
}

/** 排队弹层的类型与优先级，数字越小越先显示 */
export const QUEUE_PRIORITY = {
  graduation: 2,
  perfectDay: 3,
  achievement: 4,
  reissue: 5,
  changelog: 6,
} as const;
export type QueueKind = keyof typeof QUEUE_PRIORITY;

export interface QueuedOverlay {
  id: number;
  kind: QueueKind;
  render: (close: () => void) => ReactNode;
}

interface OverlayState {
  toast: ToastSpec | null;
  dialog: DialogSpec | null;
  sheets: SheetSpec[];
  menu: MenuSpec | null;
  queue: QueuedOverlay[];
  active: QueuedOverlay | null;
}

export const useOverlayStore = create<OverlayState>(() => ({
  toast: null,
  dialog: null,
  sheets: [],
  menu: null,
  queue: [],
  active: null,
}));

let nextId = 1;
const QUEUE_GAP_MS = 300;
let gapTimer: ReturnType<typeof setTimeout> | null = null;

/** 用户主动的弹层都关闭后，从队列取下一个 */
function pump() {
  const state = useOverlayStore.getState();
  if (state.active || state.dialog || state.sheets.length > 0 || state.menu || state.queue.length === 0 || gapTimer)
    return;
  const [next, ...rest] = [...state.queue].sort(
    (a, b) => QUEUE_PRIORITY[a.kind] - QUEUE_PRIORITY[b.kind] || a.id - b.id,
  );
  useOverlayStore.setState({ active: next, queue: rest });
}

function schedulePump() {
  if (gapTimer) return;
  gapTimer = setTimeout(() => {
    gapTimer = null;
    pump();
  }, QUEUE_GAP_MS);
}

export const overlay = {
  toast(message: string, options: { actionLabel?: string; onAction?: () => void; durationMs?: number } = {}) {
    useOverlayStore.setState({ toast: { id: nextId++, message, durationMs: 3000, ...options } });
  },

  hideToast(id: number) {
    if (useOverlayStore.getState().toast?.id === id) useOverlayStore.setState({ toast: null });
  },

  /** 确认框；返回用户是否点了确认 */
  confirm(spec: Omit<DialogSpec, 'id' | 'resolve'>): Promise<boolean> {
    return new Promise((resolve) => {
      useOverlayStore.setState({ dialog: { ...spec, id: nextId++, resolve } });
    });
  },

  closeDialog(confirmed: boolean) {
    const dialog = useOverlayStore.getState().dialog;
    if (!dialog) return;
    useOverlayStore.setState({ dialog: null });
    dialog.resolve(confirmed);
    schedulePump();
  },

  /** 打开底部面板，返回关闭函数 */
  openSheet(render: SheetSpec['render'], options: Pick<SheetSpec, 'canDismiss'> = {}): () => void {
    const id = nextId++;
    useOverlayStore.setState((s) => ({ sheets: [...s.sheets, { id, render, ...options }] }));
    return () => overlay.closeSheet(id);
  },

  closeSheet(id: number) {
    useOverlayStore.setState((s) => ({ sheets: s.sheets.filter((sheet) => sheet.id !== id) }));
    schedulePump();
  },

  openMenu(items: MenuItem[], anchorY: number, onClose?: () => void) {
    useOverlayStore.setState({ menu: { id: nextId++, items, anchorY, onClose } });
  },

  closeMenu() {
    const menu = useOverlayStore.getState().menu;
    useOverlayStore.setState({ menu: null });
    menu?.onClose?.();
    schedulePump();
  },

  /** 加入排队弹层 */
  enqueue(kind: QueueKind, render: QueuedOverlay['render']) {
    useOverlayStore.setState((s) => ({ queue: [...s.queue, { id: nextId++, kind, render }] }));
    schedulePump();
  },

  closeActive() {
    useOverlayStore.setState({ active: null });
    schedulePump();
  },
};
