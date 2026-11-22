/**
 * 全局弹层宿主：挂在根布局最上层，按层级渲染排队弹层、面板、菜单、确认框、撤销条。
 * 层级从下到上：排队弹层 → 底部面板 → 长按菜单 → 确认框 → 撤销条。
 */
import { StyleSheet, View } from 'react-native';

import { overlay, useOverlayStore } from '@/stores/overlayQueue';

import { DialogView } from './DialogView';
import { MenuView } from './MenuView';
import { SheetView } from './SheetView';
import { ToastView } from './ToastView';

export function OverlayHost() {
  const { toast, dialog, sheets, menu, active } = useOverlayStore();
  const hasAny = toast || dialog || sheets.length > 0 || menu || active;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={hasAny ? 'box-none' : 'none'}>
      {active ? <View style={StyleSheet.absoluteFill}>{active.render(() => overlay.closeActive())}</View> : null}
      {sheets.map((sheet) => (
        <SheetView key={sheet.id} sheet={sheet} />
      ))}
      {menu ? <MenuView key={menu.id} menu={menu} /> : null}
      {dialog ? <DialogView key={dialog.id} dialog={dialog} /> : null}
      {toast ? <ToastView key={toast.id} toast={toast} /> : null}
    </View>
  );
}
