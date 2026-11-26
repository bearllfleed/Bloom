/**
 * 心情详情路由：/mood/[id]
 */
import { useLocalSearchParams } from 'expo-router';

import { MoodDetail } from '@/features/mood';

export default function MoodDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <MoodDetail id={typeof id === 'string' ? id : ''} />;
}
