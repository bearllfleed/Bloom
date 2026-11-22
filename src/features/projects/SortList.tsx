/**
 * 排序模式（第 1 期 1-5、动效 M25）：卡片收成紧凑行（图标 + 名称 + 拖动把手）。
 * 按住把手拖动，被拖的行抬起 1.03 并加深阴影；越过其他行时对方让位，每次换位轻震一下。
 * 松手后保存顺序，今日列表同步。
 */
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import type { ProjectEntity } from '@/domain/types';
import { haptics } from '@/platform/haptics';
import { AppText } from '@/ui/components/AppText';
import { ProjectBadge } from '@/ui/components/ProjectBadge';
import { Icon } from '@/ui/icons/Icon';
import { springs } from '@/ui/motion';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { radius, shadow } from '@/ui/tokens';

const ROW = 64;
const GAP = 8;
const STEP = ROW + GAP;

type Positions = Record<string, number>;

function SortRow({
  project,
  positions,
  count,
  onCommit,
}: {
  project: ProjectEntity;
  positions: SharedValue<Positions>;
  count: number;
  onCommit: () => void;
}) {
  const { colors } = useTheme();
  const id = project.id;
  const top = useSharedValue((positions.value[id] ?? 0) * STEP);
  const startTop = useSharedValue(0);
  const dragging = useSharedValue(false);

  useAnimatedReaction(
    () => positions.value[id],
    (current, previous) => {
      if (current !== previous && current !== undefined && !dragging.value) {
        top.value = withSpring(current * STEP, springs.gentle);
      }
    },
  );

  const pan = usePanGesture({
    minDistance: 0,
    onActivate: () => {
      'worklet';
      dragging.value = true;
      startTop.value = top.value;
      scheduleOnRN(haptics.selection);
    },
    onUpdate: (e) => {
      'worklet';
      top.value = Math.max(-ROW / 2, Math.min((count - 1) * STEP + ROW / 2, startTop.value + e.translationY));
      const next = Math.max(0, Math.min(count - 1, Math.round(top.value / STEP)));
      const prev = positions.value[id];
      if (next !== prev) {
        const updated: Positions = { ...positions.value };
        for (const key of Object.keys(updated)) {
          if (updated[key] === next) updated[key] = prev;
        }
        updated[id] = next;
        positions.value = updated;
        scheduleOnRN(haptics.selection);
      }
    },
    onDeactivate: () => {
      'worklet';
      top.value = withSpring((positions.value[id] ?? 0) * STEP, springs.gentle);
      dragging.value = false;
      scheduleOnRN(onCommit);
    },
  });

  const style = useAnimatedStyle(() => ({
    top: top.value,
    zIndex: dragging.value ? 10 : 0,
    shadowOpacity: dragging.value ? shadow.lifted.opacity : shadow.raised.opacity,
    transform: [{ scale: withSpring(dragging.value ? 1.03 : 1, springs.press) }],
  }));

  return (
    <Animated.View style={[styles.row, { backgroundColor: colors.card, shadowColor: colors.shadow }, style]}>
      <ProjectBadge iconId={project.iconId} colorId={project.colorId} size={40} />
      <AppText variant="title3" numberOfLines={1} style={styles.name}>
        {project.name}
      </AppText>
      <GestureDetector gesture={pan}>
        <View style={styles.handle} accessibilityLabel={`拖动调整 ${project.name} 的位置`}>
          <Icon name="drag-handle" size={24} color={colors.textMuted} />
        </View>
      </GestureDetector>
    </Animated.View>
  );
}

export function SortList({ projects, onReorder }: { projects: ProjectEntity[]; onReorder: (ids: string[]) => void }) {
  const positions = useSharedValue<Positions>(Object.fromEntries(projects.map((p, i) => [p.id, i])));

  useEffect(() => {
    positions.value = Object.fromEntries(projects.map((p, i) => [p.id, i]));
  }, [positions, projects]);

  const commit = () => {
    const order = Object.entries(positions.value)
      .sort((a, b) => a[1] - b[1])
      .map(([id]) => id);
    if (order.join() !== projects.map((p) => p.id).join()) onReorder(order);
  };

  return (
    <View style={{ height: projects.length * STEP }}>
      {projects.map((p) => (
        <SortRow key={p.id} project={p} positions={positions} count={projects.length} onCommit={commit} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: ROW,
    borderRadius: radius.card,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    gap: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
  },
  name: { flex: 1 },
  handle: { width: 56, height: ROW, alignItems: 'center', justifyContent: 'center' },
});
