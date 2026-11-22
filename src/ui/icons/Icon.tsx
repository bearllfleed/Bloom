/**
 * 界面图标（设计规范 7.1）：默认取当前文字色，深色模式自动变浅；active 时显示糖果色填充块。
 */
import { useTheme } from '@/ui/theme/ThemeProvider';

import { uiIcons, type UiIconName } from './generated/uiIcons';

export type { UiIconName };

export interface IconProps {
  name: UiIconName;
  size?: number;
  color?: string;
  active?: boolean;
  accent?: string;
}

export function Icon({ name, size = 24, color, active = false, accent }: IconProps) {
  const { colors } = useTheme();
  const Component = uiIcons[name];
  return <Component size={size} color={color ?? colors.text} active={active} accent={accent} />;
}
