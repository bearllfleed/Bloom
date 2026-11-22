/**
 * 项目图标徽：圆形浅色底 + 贴纸图标（今日卡片 48/44、记录列表等）。
 */
import { StyleSheet, View } from 'react-native';

import { ProjectIcon } from '@/ui/icons/ProjectIcon';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { projectColors, type ProjectColorId } from '@/ui/tokens';

export interface ProjectBadgeProps {
  iconId: string;
  colorId: string;
  size?: number;
  mono?: boolean;
}

export function projectColorOf(colorId: string) {
  return projectColors[(colorId in projectColors ? colorId : 'strawberry') as ProjectColorId];
}

export function ProjectBadge({ iconId, colorId, size = 48, mono = false }: ProjectBadgeProps) {
  const { scheme, colors } = useTheme();
  const color = projectColorOf(colorId);
  const background = mono ? colors.weak : scheme === 'dark' ? `${color.base}33` : color.tint;
  return (
    <View style={[styles.root, { width: size, height: size, borderRadius: size / 2, backgroundColor: background }]}>
      <ProjectIcon id={iconId} size={Math.round(size * 0.86)} mono={mono} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center' },
});
