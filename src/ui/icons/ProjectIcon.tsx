/**
 * 项目贴纸图标（设计规范 7.2）。
 * - sticker：放在彩色块上时加 3px 白色贴纸边；
 * - 深色模式下自动加奶油色外描边，避免可可色墨线融进背景（设计规范 3.8）；
 * - mono：暂停、禁用时的灰度版本；
 * - idle：待机动画，叶子、星星、水波等部件轻微摆动（设计规范 9.2 第 3 条）。小于 40pt 或灰度时不动。
 */
import { useTheme } from '@/ui/theme/ThemeProvider';

import { projectIconParts, projectIcons, type ProjectIconId } from './generated/projectIcons';
import { IdleClockProvider, IdlePart } from './IdleParts';

export type { ProjectIconId };

export interface ProjectIconProps {
  id: string;
  size?: number;
  sticker?: boolean;
  mono?: boolean;
  idle?: boolean;
}

const FALLBACK: ProjectIconId = 'collect/flower';

/** 列表和网格里的小图标不做待机循环（设计规范 9.2 第 3 条） */
const IDLE_MIN_SIZE = 40;

export function isProjectIconId(id: string): id is ProjectIconId {
  return id in projectIcons;
}

export function ProjectIcon({ id, size = 44, sticker = false, mono = false, idle = false }: ProjectIconProps) {
  const { scheme } = useTheme();
  const iconId = isProjectIconId(id) ? id : FALLBACK;
  const Component = projectIcons[iconId];
  const outline = sticker ? '#FFFFFF' : scheme === 'dark' ? 'rgba(255,248,243,0.9)' : undefined;
  const parts = projectIconParts[iconId];
  if (idle && !mono && size >= IDLE_MIN_SIZE && parts.length > 0) {
    return (
      <IdleClockProvider parts={parts}>
        <Component size={size} outline={outline} part={IdlePart} />
      </IdleClockProvider>
    );
  }
  return <Component size={size} outline={outline} mono={mono} />;
}
