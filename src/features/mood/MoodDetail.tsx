/**
 * 心情详情（第 3 期 3-9）：
 * - 标题"11月22日 · 早睡"，来自已删除项目的心情显示"（已删除的项目）"；
 * - 表情 56pt 进入时轻弹一次；
 * - 全文 + 照片网格：1 张通栏、2 张两列、3–5 张三列，点开图片查看；
 * - 更多：编辑 / 删除（先确认，照片一起删除）。
 */
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatMonthDay } from '@/domain/date';
import { photoColumns } from '@/domain/mood';
import { moodCopy } from '@/copy/phase3';
import { useLiveQuery } from '@/features/common/useLiveQuery';
import { haptics } from '@/platform/haptics';
import { media } from '@/platform/media';
import { getProject } from '@/services/queries';
import { moodService } from '@/services/moodService';
import { overlay } from '@/stores/overlayQueue';
import { AppText } from '@/ui/components/AppText';
import { DotPaper } from '@/ui/components/DotPaper';
import { EmptyState } from '@/ui/components/EmptyState';
import { TopBar } from '@/ui/components/TopBar';
import { useMotionReduced } from '@/ui/motion';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { inset, radius, space } from '@/ui/tokens';

import { moodProjectLabel } from './heading';
import { MoodFaceIcon } from './MoodFace';
import { PhotoViewer } from './PhotoViewer';

const GAP = space.sm;

interface GridPhoto {
  id: string;
  fileName: string;
  width: number;
  height: number;
}

function PhotoGrid({
  photos,
  width,
  onOpen,
}: {
  photos: readonly GridPhoto[];
  width: number;
  onOpen: (index: number) => void;
}) {
  const cols = photoColumns(photos.length);
  const cell = (width - GAP * (cols - 1)) / cols;
  return (
    <View style={styles.grid}>
      {photos.map((photo, index) => {
        // 单张按原始宽高比给一个舒服的高度，不裁掉太多
        const height = cols === 1 ? Math.min(width * 0.9, (width * photo.height) / Math.max(1, photo.width)) : cell;
        return (
          <Pressable
            key={photo.id}
            accessibilityRole="button"
            accessibilityLabel={moodCopy.photoAlt(index + 1)}
            onPress={() => onOpen(index)}
          >
            <Image
              source={{ uri: media.thumbUri(photo.fileName) }}
              style={{ width: cols === 1 ? width : cell, height, borderRadius: radius.small }}
              resizeMode="cover"
            />
          </Pressable>
        );
      })}
    </View>
  );
}

export function MoodDetail({ id }: { id: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const reduced = useMotionReduced();
  const [width, setWidth] = useState(0);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const moreAnchor = useRef<ComponentRef<typeof View>>(null);

  // 数据版本变化（编辑、删除、导入）后自动重读
  const mood = useLiveQuery(() => moodService.getById(id), [id], ['moods']);

  // 进入时表情轻弹一次；减弱动态时直接显示
  const faceScale = useSharedValue(reduced ? 1 : 0.82);
  useEffect(() => {
    if (reduced) return;
    faceScale.value = 0.82;
    faceScale.value = withSpring(1, { damping: 11, stiffness: 260 });
  }, [faceScale, reduced]);
  const faceStyle = useAnimatedStyle(() => ({ transform: [{ scale: faceScale.value }] }));

  if (!mood) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <TopBar title={moodCopy.title} onBack={() => router.back()} />
        <EmptyState message={moodCopy.empty} mood="puzzled" />
      </View>
    );
  }

  const projectExists = mood.projectId !== null && getProject(mood.projectId) !== null;
  const projectLabel = moodProjectLabel(mood.projectNameSnapshot, projectExists);
  const title = `${formatMonthDay(mood.date)} · ${projectLabel ?? moodCopy.dayTitle}`;

  const confirmDelete = () => {
    void overlay
      .confirm({
        title: moodCopy.deleteTitle,
        message: moodCopy.deleteMessage,
        confirmLabel: moodCopy.delete,
        cancelLabel: moodCopy.cancel,
        destructive: true,
      })
      .then((confirmed) => {
        if (!confirmed) return;
        moodService.delete(mood.id);
        haptics.warning();
        overlay.toast(moodCopy.deleted);
        router.back();
      });
  };

  const openMore = () => {
    moreAnchor.current?.measureInWindow((_x: number, y: number, _w: number, h: number) => {
      overlay.openMenu(
        [
          {
            label: moodCopy.edit,
            icon: 'edit',
            onPress: () =>
              router.push({
                pathname: '/mood/editor',
                params: { date: mood.date, projectId: mood.projectId ?? undefined },
              }),
          },
          { label: moodCopy.delete, icon: 'trash', destructive: true, onPress: confirmDelete },
        ],
        y + h / 2,
      );
    });
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View ref={moreAnchor} collapsable={false} style={styles.topWrap}>
        <TopBar
          title={title}
          onBack={() => router.back()}
          right={
            <Pressable accessibilityRole="button" accessibilityLabel={moodCopy.more} hitSlop={8} onPress={openMore}>
              <AppText variant="callout" tone="link">
                {moodCopy.more}
              </AppText>
            </Pressable>
          }
        />
      </View>
      <DotPaper>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space.giant }]}
          onLayout={(e) => setWidth(e.nativeEvent.layout.width - inset.page * 2)}
        >
          {mood.face ? (
            <Animated.View style={[styles.face, faceStyle]}>
              <MoodFaceIcon face={mood.face} size={56} />
            </Animated.View>
          ) : null}
          {mood.text ? <AppText variant="body">{mood.text}</AppText> : null}
          {mood.photos.length > 0 && width > 0 ? (
            <PhotoGrid photos={mood.photos} width={width} onOpen={setViewerIndex} />
          ) : null}
        </ScrollView>
      </DotPaper>
      {viewerIndex !== null ? (
        <PhotoViewer
          photos={mood.photos.map((photo) => ({ fileName: photo.fileName }))}
          initialIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topWrap: { zIndex: 2 },
  content: { padding: inset.page, gap: space.lg },
  face: { alignSelf: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
});
