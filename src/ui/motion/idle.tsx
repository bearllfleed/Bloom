/**
 * 待机动画开关（设计规范 9.2 第 3 条、9.5）。
 * 朵朵眨眼、图标叶子轻晃、徽章光芒慢转这类持续循环，统一用 useIdleMotion() 判断此刻能不能播：
 * - 系统开启"减弱动态效果"（或开发版预览开关）时不播；
 * - App 不在前台时不播；
 * - 所在页面不在前台时不播（被新页面盖住、切到别的页签）。
 *
 * 页面是否在前台由根 Stack 和页签的 screenLayout 写入上下文（screenLayout 渲染在导航上下文里，
 * 可以安全调用 useIsFocused）。弹层、启动失败页等导航之外的地方读到默认值"开"。
 * 嵌套导航时与外层取"且"，页签所在的 Stack 页被盖住时页签里的动画也会停。
 */
import { useIsFocused } from 'expo-router';
import { createContext, use, useSyncExternalStore, type ReactNode } from 'react';
import { AppState } from 'react-native';

import { useMotionReduced } from './index';

const ScreenActiveContext = createContext(true);

function subscribeAppState(onChange: () => void) {
  const sub = AppState.addEventListener('change', onChange);
  return () => sub.remove();
}

function isAppActive() {
  return AppState.currentState === 'active';
}

/** App 是否在前台 */
export function useAppActive(): boolean {
  return useSyncExternalStore(subscribeAppState, isAppActive, isAppActive);
}

/** 此刻是否可以播放待机循环动画 */
export function useIdleMotion(): boolean {
  const reduced = useMotionReduced();
  const appActive = useAppActive();
  const screenActive = use(ScreenActiveContext);
  return !reduced && appActive && screenActive;
}

function FocusGate({ children }: { children: ReactNode }) {
  const parent = use(ScreenActiveContext);
  const focused = useIsFocused();
  return <ScreenActiveContext value={parent && focused}>{children}</ScreenActiveContext>;
}

/** 交给导航的 screenLayout：每个页面外包一层，记录页面是否在前台 */
export function focusGateLayout({ children }: { children: ReactNode }) {
  return <FocusGate>{children}</FocusGate>;
}
