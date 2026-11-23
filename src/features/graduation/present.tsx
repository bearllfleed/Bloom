/**
 * 把还没看过的毕业典礼放进弹层队列。每个项目只排一次，关掉后记入数据库。
 */
import { Ceremony } from '@/features/graduation/Ceremony';
import { projectService } from '@/services/projectService';
import { overlay } from '@/stores/overlayQueue';

const queued = new Set<string>();

export function presentPendingGraduations(): void {
  for (const project of projectService.unseenGraduations()) {
    if (queued.has(project.id)) continue;
    queued.add(project.id);
    const id = project.id;
    overlay.enqueue('graduation', (close) => (
      <Ceremony
        projectId={id}
        onDone={() => {
          projectService.markGraduationSeen(id);
          queued.delete(id);
          close();
        }}
      />
    ));
  }
}
