/**
 * 主题：根据"外观"偏好与系统深浅色，提供当前的语义颜色（设计规范 3.8）。
 * 组件通过 useTheme() 取色，禁止直接引用色板。
 */
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { usePrefs } from '@/stores/prefsStore';
import { colorSchemes, heatColors, type ColorScheme, type SemanticColors } from '@/ui/tokens';

export interface Theme {
  scheme: ColorScheme;
  colors: SemanticColors;
  heat: readonly string[];
}

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const appearance = usePrefs((s) => s.appearance);
  const scheme: ColorScheme = appearance === 'system' ? (system === 'dark' ? 'dark' : 'light') : appearance;
  const value = useMemo<Theme>(() => ({ scheme, colors: colorSchemes[scheme], heat: heatColors[scheme] }), [scheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error('useTheme 必须在 ThemeProvider 内使用');
  return theme;
}
