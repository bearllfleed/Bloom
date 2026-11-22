/**
 * 项目贴纸图标（设计规范 7.2）。
 * - sticker：放在彩色块上时加 3px 白色贴纸边；
 * - 深色模式下自动加奶油色外描边，避免可可色墨线融进背景（设计规范 3.8）；
 * - mono：暂停、禁用时的灰度版本。
 */
import { useTheme } from '@/ui/theme/ThemeProvider';

import { projectIcons, type ProjectIconId } from './generated/projectIcons';

export type { ProjectIconId };

export interface ProjectIconProps {
  id: string;
  size?: number;
  sticker?: boolean;
  mono?: boolean;
}

const FALLBACK: ProjectIconId = 'collect/flower';

export function isProjectIconId(id: string): id is ProjectIconId {
  return id in projectIcons;
}

export function ProjectIcon({ id, size = 44, sticker = false, mono = false }: ProjectIconProps) {
  const { scheme } = useTheme();
  const Component = projectIcons[isProjectIconId(id) ? id : FALLBACK];
  const outline = sticker ? '#FFFFFF' : scheme === 'dark' ? 'rgba(255,248,243,0.9)' : undefined;
  return <Component size={size} outline={outline} mono={mono} />;
}
