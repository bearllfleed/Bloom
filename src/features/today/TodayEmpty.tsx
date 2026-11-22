/**
 * 今日页的空状态（第 1 期 1-2"状态"）：没有项目 / 休息日 / 早于所有项目。
 * 没有项目时附 4 个模板芯片，点一下进入预填好的创建页。
 */
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { EMPTY_STATE_TEMPLATE_IDS, templateById } from '@/copy/templates';
import { todayCopy } from '@/copy/today';
import type { DayEmptyReason } from '@/services/queries';
import { Chip } from '@/ui/components/Chip';
import { EmptyState } from '@/ui/components/EmptyState';
import { space } from '@/ui/tokens';

export function TodayEmpty({ reason, isToday }: { reason: Exclude<DayEmptyReason, null>; isToday: boolean }) {
  const router = useRouter();
  if (reason === 'noProjects') {
    return (
      <View>
        <EmptyState
          message={todayCopy.emptyNoProjects}
          mood="expectant"
          pose="seed"
          actionLabel={todayCopy.emptyNoProjectsAction}
          onAction={() => router.push('/project/new')}
        />
        <View style={styles.chips}>
          {EMPTY_STATE_TEMPLATE_IDS.map((id) => {
            const template = templateById(id);
            if (!template) return null;
            return (
              <Chip
                key={id}
                label={template.name}
                onPress={() => router.push({ pathname: '/project/new', params: { template: id } })}
              />
            );
          })}
        </View>
      </View>
    );
  }
  if (reason === 'restDay') {
    return (
      <EmptyState
        message={isToday ? todayCopy.emptyRestDay : todayCopy.emptyRestDayOther}
        mood="sleepy"
        pose="cloud"
        actionLabel={todayCopy.emptyRestDayAction}
        onAction={() => router.push('/projects')}
        secondary
      />
    );
  }
  return <EmptyState message={todayCopy.emptyBeforeAll} mood="puzzled" />;
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: space.sm, marginTop: -space.lg },
});
