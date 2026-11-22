/**
 * 开发工具路由组：仅开发版可进入（根布局按构建类型条件注册）。
 */
import { Stack } from 'expo-router';

import { useTheme } from '@/ui/theme/ThemeProvider';

export default function DevLayout() {
  const { colors } = useTheme();
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />;
}
