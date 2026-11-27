/**
 * 心情编辑页路由：/mood/editor?date=2026-11-22&projectId=p1
 * 不传 projectId 表示当天的整体心情。
 */
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import type { LocalDate } from '@/domain/types';
import { MoodEditor } from '@/features/mood';
import { useTheme } from '@/ui/theme/ThemeProvider';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export default function MoodEditorScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ date?: string; projectId?: string }>();
  const date = typeof params.date === 'string' ? params.date : '';
  const valid = DATE_PATTERN.test(date);
  const projectId = typeof params.projectId === 'string' && params.projectId.length > 0 ? params.projectId : null;

  // 参数不完整（例如从链接进来）时直接返回，不渲染半截编辑页
  useEffect(() => {
    if (!valid) router.back();
  }, [router, valid]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {valid ? <MoodEditor key={`${date}|${projectId ?? ''}`} date={date as LocalDate} projectId={projectId} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
