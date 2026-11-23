/**
 * 创建项目（模态）：可带 template 参数预填模板（今日页空状态的模板芯片）。
 * 种下后回到上一页；开始日期在未来时提示"会在 X 开始"。
 */
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

import { formatMonthDay } from '@/domain/date';
import { templateById } from '@/copy/templates';
import { toastCopy } from '@/copy/today';
import { graduationCopy } from '@/copy/phase2';
import { anotherRoundDraft, applyTemplate, defaultDraft } from '@/features/project/draft';
import { ProjectForm } from '@/features/project/ProjectForm';
import { usePlanted } from '@/features/today/celebration';
import { clock } from '@/platform/clock';
import { haptics } from '@/platform/haptics';
import { projectService } from '@/services/projectService';
import { getProject } from '@/services/queries';
import { overlay } from '@/stores/overlayQueue';
import { usePrefs } from '@/stores/prefsStore';

export default function NewProjectScreen() {
  const router = useRouter();
  const { template, from } = useLocalSearchParams<{ template?: string; from?: string }>();
  const weekStart = usePrefs((s) => s.weekStart);
  const [today] = useState(() => clock.today());
  const [source] = useState(() => (from ? getProject(from) : null));
  const [initial] = useState(() => {
    if (source) return anotherRoundDraft(source, today);
    const base = defaultDraft(today);
    const t = templateById(template);
    return t ? applyTemplate(base, t) : base;
  });

  return (
    <ProjectForm
      mode="create"
      initial={initial}
      today={today}
      weekStart={weekStart}
      heading={source ? graduationCopy.againTitle(source.name) : undefined}
      onSubmit={(draft) => {
        const result = projectService.create(draft);
        if (!result.ok) return result;
        haptics.success();
        usePlanted.getState().plant(result.id);
        if (draft.startDate > today)
          overlay.toast(toastCopy.futureStart(draft.name.trim(), formatMonthDay(draft.startDate)));
        return { ok: true };
      }}
      onClose={() => router.back()}
    />
  );
}
