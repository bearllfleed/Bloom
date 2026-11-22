/**
 * 编辑项目（模态）：频率从今天起按新规则计算；开始日期不能晚于最早记录；已毕业只能改外观。
 */
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

import { toastCopy } from '@/copy/today';
import { draftFromProject } from '@/features/project/draft';
import { ProjectForm } from '@/features/project/ProjectForm';
import { clock } from '@/platform/clock';
import { projectService } from '@/services/projectService';
import { getProject } from '@/services/queries';
import { overlay } from '@/stores/overlayQueue';
import { usePrefs } from '@/stores/prefsStore';
import { EmptyState } from '@/ui/components/EmptyState';

export default function EditProjectScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const weekStart = usePrefs((s) => s.weekStart);
  const [today] = useState(() => clock.today());
  const [project] = useState(() => getProject(id));
  const [initial] = useState(() => (project ? draftFromProject(project, today) : null));
  const [earliest] = useState(() => (project ? projectService.earliestRecordDate(project.id) : null));

  if (!project || !initial)
    return <EmptyState message="这个项目找不到了" mood="puzzled" actionLabel="返回" onAction={() => router.back()} />;

  return (
    <ProjectForm
      mode="edit"
      initial={initial}
      today={today}
      weekStart={weekStart}
      originalName={project.name}
      graduated={project.status === 'graduated'}
      earliestRecord={earliest}
      onSubmit={(draft) => {
        const result = projectService.update(project.id, draft);
        if (result.ok) overlay.toast(toastCopy.saved);
        return result;
      }}
      onClose={() => router.back()}
    />
  );
}
