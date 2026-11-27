import type { MoodEntity } from '@/domain/mood';
import { assignDayMoods } from '@/features/today/moodAssignments';

function mood(id: string, projectId: string | null): MoodEntity {
  return {
    id,
    date: '2026-11-22',
    projectId,
    projectNameSnapshot: projectId,
    face: 'happy',
    text: '',
    createdAt: 1,
    updatedAt: 1,
    photos: [],
  };
}

describe('今日页心情分配', () => {
  it('一次结果同时提供当天整体心情和项目心情映射', () => {
    const dayMood = mood('day', null);
    const projectMood = mood('project', 'p1');

    const assigned = assignDayMoods([projectMood, dayMood]);

    expect(assigned.dayMood).toBe(dayMood);
    expect(assigned.projectMoods.get('p1')).toBe(projectMood);
    expect(assigned.hasAnyMood).toBe(true);
  });

  it('没有对应心情时保持空值且不创建伪项目键', () => {
    const assigned = assignDayMoods([]);

    expect(assigned.dayMood).toBeNull();
    expect(assigned.projectMoods.size).toBe(0);
    expect(assigned.hasAnyMood).toBe(false);
  });
});
