/**
 * 心情照片格子（第 3 期 3-8）：80×80、圆角 12，最多 5 张。
 * - 处理中：花瓣转圈；失败：显示"重试"；
 * - 点右上角小叉删除（保存前可再加回，不确认）；
 * - 快速点一下打开图片查看；按住 240ms 后拖动调整顺序，拖起时原位留浅色占位；
 * - 满 5 张隐藏"＋"。
 */
import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';

import { MAX_MOOD_PHOTOS, type MoodPhoto } from '@/domain/mood';
import { moodCopy } from '@/copy/phase3';
import { haptics } from '@/platform/haptics';
import { media } from '@/platform/media';
import { AppText } from '@/ui/components/AppText';
import { Icon } from '@/ui/icons/Icon';
import { useMotionReduced } from '@/ui/motion';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { radius } from '@/ui/tokens';

export type PhotoTile =
  | { key: string; status: 'processing' }
  | { key: string; status: 'ready'; photo: MoodPhoto }
  | { key: string; status: 'failed'; sourceUri: string };

const CELL = 80;
const GAP = 8;
const STEP = CELL + GAP;

/** 处理中的花瓣转圈；减弱动态时静止 */
function PetalSpinner() {
  const reduced = useMotionReduced();
  const { colors } = useTheme();
  const turn = useSharedValue(0);
  useEffect(() => {
    if (reduced) {
      turn.value = 0;
      return;
    }
    turn.value = withRepeat(withTiming(1, { duration: 1400 }), -1, false);
  }, [reduced, turn]);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.value * 360}deg` }] }));
  return (
    <Animated.View style={style}>
      <Svg width={26} height={26} viewBox="0 0 26 26">
        {[0, 72, 144, 216, 288].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          return (
            <Circle
              key={angle}
              cx={13 + Math.cos(rad) * 6}
              cy={13 + Math.sin(rad) * 6}
              r={4}
              fill={colors.accentSoft}
            />
          );
        })}
        <Circle cx={13} cy={13} r={3} fill={colors.accent} />
      </Svg>
    </Animated.View>
  );
}

function RemoveButton({ onPress }: { onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={moodCopy.remove}
      hitSlop={6}
      onPress={onPress}
      style={[styles.remove, { backgroundColor: colors.toast }]}
    >
      <Icon name="close" size={12} color={colors.onToast} />
    </Pressable>
  );
}

function TileFace({ tile }: { tile: PhotoTile | null }) {
  const { colors } = useTheme();
  if (!tile) return null;
  if (tile.status === 'ready') {
    return <Image source={{ uri: media.thumbUri(tile.photo.fileName) }} style={styles.image} resizeMode="cover" />;
  }
  if (tile.status === 'failed') {
    return (
      <View style={[styles.box, { backgroundColor: colors.sunken }]}>
        <AppText variant="caption" tone="link">
          {moodCopy.retry}
        </AppText>
      </View>
    );
  }
  return (
    <View style={[styles.box, { backgroundColor: colors.sunken }]}>
      <PetalSpinner />
      <AppText variant="micro" tone="muted">
        {moodCopy.processing}
      </AppText>
    </View>
  );
}

interface CellProps {
  tile: PhotoTile;
  index: number;
  cols: number;
  lifted: boolean;
  dragLeft: SharedValue<number>;
  dragTop: SharedValue<number>;
  dragIndex: SharedValue<number>;
  startIndex: SharedValue<number>;
  onBegin: (index: number, key: string) => void;
  onEnd: () => void;
  onRemove: (key: string) => void;
  onRetry: (key: string) => void;
  onReorder: (from: number, to: number) => void;
  onOpen: () => void;
}

function PhotoCell({
  tile,
  index,
  cols,
  lifted,
  dragLeft,
  dragTop,
  dragIndex,
  startIndex,
  onBegin,
  onEnd,
  onRemove,
  onRetry,
  onReorder,
  onOpen,
}: CellProps) {
  const { colors } = useTheme();
  const pan = usePanGesture({
    activateAfterLongPress: 240,
    onActivate: () => {
      'worklet';
      dragIndex.value = index;
      startIndex.value = index;
      scheduleOnRN(onBegin, index, tile.key);
    },
    onUpdate: (e) => {
      'worklet';
      dragLeft.value = (startIndex.value % cols) * STEP + e.translationX;
      dragTop.value = Math.floor(startIndex.value / cols) * STEP + e.translationY;
      const target = Math.max(
        0,
        Math.floor(dragTop.value / STEP + 0.5) * cols +
          Math.max(0, Math.min(cols - 1, Math.round(dragLeft.value / STEP))),
      );
      if (target !== dragIndex.value) {
        scheduleOnRN(onReorder, dragIndex.value, target);
        dragIndex.value = target;
      }
    },
    onDeactivate: () => {
      'worklet';
      scheduleOnRN(onEnd);
    },
  });

  return (
    <GestureDetector gesture={pan}>
      <View style={styles.cell}>
        {lifted ? (
          <View style={[styles.box, styles.placeholder, { backgroundColor: colors.weak }]} />
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={tile.status === 'ready' ? moodCopy.photoAlt(index + 1) : undefined}
            onPress={() => {
              if (tile.status === 'ready') onOpen();
              else if (tile.status === 'failed') onRetry(tile.key);
            }}
            style={styles.tile}
          >
            <TileFace tile={tile} />
          </Pressable>
        )}
        {!lifted && tile.status !== 'processing' ? <RemoveButton onPress={() => onRemove(tile.key)} /> : null}
      </View>
    </GestureDetector>
  );
}

interface GridProps {
  tiles: readonly PhotoTile[];
  onAdd: () => void;
  onRemove: (key: string) => void;
  onRetry: (key: string) => void;
  onReorder: (from: number, to: number) => void;
  /** 打开第几张已就绪的照片 */
  onOpen: (readyIndex: number) => void;
}

export function MoodPhotoGrid({ tiles, onAdd, onRemove, onRetry, onReorder, onOpen }: GridProps) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);
  const [drag, setDrag] = useState<{ key: string; left: number; top: number } | null>(null);
  const dragLeft = useSharedValue(0);
  const dragTop = useSharedValue(0);
  const dragIndex = useSharedValue(0);
  const startIndex = useSharedValue(0);
  const cols = width > 0 ? Math.max(1, Math.floor((width + GAP) / STEP)) : 1;
  const rows = Math.ceil(tiles.length / cols);

  const readyIndexes = new Map<string, number>();
  let ready = 0;
  for (const tile of tiles) if (tile.status === 'ready') readyIndexes.set(tile.key, ready++);

  const beginDrag = (index: number, key: string) => {
    dragLeft.value = (index % cols) * STEP;
    dragTop.value = Math.floor(index / cols) * STEP;
    setDrag({ key, left: (index % cols) * STEP, top: Math.floor(index / cols) * STEP });
    haptics.light();
  };

  const dragStyle = useAnimatedStyle(() => ({
    left: dragLeft.value,
    top: dragTop.value,
    transform: [{ scale: 1.06 }],
  }));

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <View style={[styles.grid, { height: Math.max(1, rows) * STEP - GAP }]}>
        {tiles.map((tile, index) => (
          <PhotoCell
            key={tile.key}
            tile={tile}
            index={index}
            cols={cols}
            lifted={drag?.key === tile.key}
            dragLeft={dragLeft}
            dragTop={dragTop}
            dragIndex={dragIndex}
            startIndex={startIndex}
            onBegin={beginDrag}
            onEnd={() => setDrag(null)}
            onRemove={onRemove}
            onRetry={onRetry}
            onReorder={onReorder}
            onOpen={() => {
              const readyIndex = readyIndexes.get(tile.key);
              if (readyIndex !== undefined) onOpen(readyIndex);
            }}
          />
        ))}
        {tiles.length < MAX_MOOD_PHOTOS ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={moodCopy.pickPhoto}
            onPress={onAdd}
            style={[styles.add, { backgroundColor: colors.sunken, borderColor: colors.hairline }]}
          >
            <Icon name="plus" size={26} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
      {drag ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.dragged,
            { backgroundColor: colors.card, shadowColor: colors.shadow },
            // 起始位置由共享值驱动，视觉上跟手
            dragStyle,
          ]}
        >
          <TileFace tile={tiles.find((tile) => tile.key === drag.key) ?? null} />
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  cell: { width: CELL, height: CELL },
  tile: { width: CELL, height: CELL },
  image: { width: CELL, height: CELL, borderRadius: radius.small },
  box: {
    width: CELL,
    height: CELL,
    borderRadius: radius.small,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  placeholder: { opacity: 0.7 },
  add: {
    width: CELL,
    height: CELL,
    borderRadius: radius.small,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  remove: {
    position: 'absolute',
    right: -6,
    top: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dragged: { position: 'absolute', width: CELL, height: CELL, elevation: 6 },
});
