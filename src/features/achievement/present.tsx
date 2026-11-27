/**
 * 把未展示的新徽章放进全局弹层队列（第 3 期 3-3、3-4）。
 * - 每枚普通徽章一个弹窗，补发合并成一张卡；展示完一组再排下一组；
 * - 收下后标记已看；"去成就馆看看"把当前与剩余都标已看并跳转定位；
 * - 收下的徽章在成就馆带"新"圆点，打开详情后消失；
 * - 队列按弹层优先级排在完美日与毕业典礼之后。
 */
import { router } from 'expo-router';

import { achievementService } from '@/services/achievementService';
import { useNewBadges } from '@/stores/achievementSignals';
import { overlay } from '@/stores/overlayQueue';

import { createPresentationQueue } from './presentationFlow';
import { ReissueCard } from './ReissueCard';
import { UnlockCelebration } from './UnlockCelebration';

/** 打开成就页并定位到某枚徽章 */
export function openAchievementMuseum(id?: string): void {
  router.navigate(id ? { pathname: '/achievements', params: { focus: id } } : '/achievements');
}

let presenting = false;

/** 把还没展示的徽章排进队列；正在展示时忽略，避免事件风暴重复弹窗 */
export function presentPendingUnlocks(): void {
  if (presenting) return;
  const queue = createPresentationQueue({
    unseen: () => achievementService.unseen(),
    markSeen: (ids) => achievementService.markSeen(ids),
  });
  const total = queue.total();
  if (total === 0) return;
  presenting = true;

  const enqueueNext = (): void => {
    const group = queue.next();
    if (!group) {
      presenting = false;
      return;
    }
    const index = total - queue.remaining() - 1;
    if (group.kind === 'reissue') {
      overlay.enqueue('reissue', () => (
        <ReissueCard
          ids={group.ids}
          onAccept={() => {
            useNewBadges.getState().add(group.ids);
            queue.finish();
            overlay.closeActive();
            enqueueNext();
          }}
          onVisitMuseum={() => {
            useNewBadges.getState().add(queue.finishAll());
            presenting = false;
            overlay.closeActive();
            openAchievementMuseum(group.ids[0]);
          }}
        />
      ));
      return;
    }
    const id = group.ids[0];
    overlay.enqueue('achievement', () => (
      <UnlockCelebration
        id={id}
        index={index}
        total={total}
        remaining={queue.remaining()}
        onAccept={() => {
          useNewBadges.getState().add(group.ids);
          queue.finish();
          overlay.closeActive();
          enqueueNext();
        }}
        onAcceptAll={() => {
          useNewBadges.getState().add(queue.finishAll());
          presenting = false;
          overlay.closeActive();
        }}
        onVisitMuseum={() => {
          useNewBadges.getState().add(queue.finishAll());
          presenting = false;
          overlay.closeActive();
          openAchievementMuseum(id);
        }}
      />
    ));
  };

  enqueueNext();
}

/** 仅用于测试与首屏重置 */
export function resetPresentation(): void {
  presenting = false;
}
