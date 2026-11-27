import type { MoodEntity } from '@/domain/mood';

export interface DayMoodAssignments {
  dayMood: MoodEntity | null;
  projectMoods: ReadonlyMap<string, MoodEntity>;
  hasAnyMood: boolean;
}

/** 把一次按日查询的结果分给当天入口和各项目卡片。 */
export function assignDayMoods(moods: readonly MoodEntity[]): DayMoodAssignments {
  let dayMood: MoodEntity | null = null;
  const projectMoods = new Map<string, MoodEntity>();
  for (const mood of moods) {
    if (mood.projectId === null) dayMood ??= mood;
    else projectMoods.set(mood.projectId, mood);
  }
  return { dayMood, projectMoods, hasAnyMood: moods.length > 0 };
}
