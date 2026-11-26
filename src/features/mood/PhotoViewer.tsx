/**
 * 图片查看（第 3 期 3-9）：全屏墨色 96% 背景、左右滑动切换、双指缩放、双击放大、下滑关闭，
 * 顶部显示"2/5"。不引入新依赖：RN Image + Gesture Handler + Reanimated。
 * 关闭时通过 onClose 回到调用页面；调用页面自己决定显示在详情还是编辑页。
 */
import { useState } from 'react';
import { Image, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import {
  GestureDetector,
  usePanGesture,
  usePinchGesture,
  useSimultaneousGestures,
  useTapGesture,
} from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { clampPhotoIndex } from '@/domain/mood';
import { moodCopy } from '@/copy/phase3';
import { media } from '@/platform/media';
import { AppText } from '@/ui/components/AppText';
import { Icon } from '@/ui/icons/Icon';
import { springs, timing } from '@/ui/motion';

const INK = 'rgba(24,16,20,0.96)';
const MAX_ZOOM = 4;
const DOUBLE_TAP_ZOOM = 2.2;

export interface ViewerPhoto {
  fileName: string;
}

export interface PhotoViewerProps {
  photos: readonly ViewerPhoto[];
  initialIndex: number;
  onClose: () => void;
}

export function PhotoViewer({ photos, initialIndex, onClose }: PhotoViewerProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(() => clampPhotoIndex(initialIndex, photos.length));
  const page = useSharedValue(index);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const zoom = useSharedValue(1);
  const pinchStart = useSharedValue(1);

  const updateIndex = (next: number) => setIndex(clampPhotoIndex(next, photos.length));

  const settlePage = (target: number) => {
    'worklet';
    page.value = withTiming(target, timing.base);
    offsetX.value = withTiming(0, timing.base);
    offsetY.value = withTiming(0, timing.base);
  };

  const dismiss = () => {
    'worklet';
    offsetY.value = withTiming(height, timing.base, () => {
      scheduleOnRN(onClose);
    });
  };

  const pan = usePanGesture({
    activeOffsetX: [-14, 14],
    activeOffsetY: [-14, 14],
    onUpdate: (e) => {
      'worklet';
      if (zoom.value > 1.01) {
        offsetX.value = e.translationX;
        offsetY.value = e.translationY;
        return;
      }
      // 横向为主时翻页，纵向为主时准备下滑关闭
      if (Math.abs(e.translationX) >= Math.abs(e.translationY)) {
        offsetX.value = e.translationX;
        offsetY.value = 0;
      } else {
        offsetY.value = Math.max(0, e.translationY);
      }
    },
    onDeactivate: (e) => {
      'worklet';
      if (zoom.value > 1.01) {
        offsetX.value = withSpring(0, springs.gentle);
        offsetY.value = withSpring(0, springs.gentle);
        return;
      }
      if ((e.translationY > 120 && Math.abs(e.translationX) < 60) || e.velocityY > 1100) {
        dismiss();
        return;
      }
      const current = Math.round(page.value);
      let target = current;
      if (e.translationX < -width * 0.22 || e.velocityX < -800) target = current + 1;
      else if (e.translationX > width * 0.22 || e.velocityX > 800) target = current - 1;
      target = Math.max(0, Math.min(photos.length - 1, target));
      settlePage(target);
      if (target !== current) scheduleOnRN(updateIndex, target);
    },
  });

  const pinch = usePinchGesture({
    onActivate: () => {
      'worklet';
      pinchStart.value = zoom.value;
    },
    onUpdate: (e) => {
      'worklet';
      zoom.value = Math.max(1, Math.min(MAX_ZOOM, pinchStart.value * e.scale));
    },
    onDeactivate: () => {
      'worklet';
      if (zoom.value < 1.05) zoom.value = withSpring(1, springs.gentle);
    },
  });

  const doubleTap = useTapGesture({
    numberOfTaps: 2,
    onActivate: () => {
      'worklet';
      zoom.value = withSpring(zoom.value > 1.01 ? 1 : DOUBLE_TAP_ZOOM, springs.bouncy);
      offsetX.value = withSpring(0, springs.gentle);
      offsetY.value = withSpring(0, springs.gentle);
    },
  });

  const gesture = useSimultaneousGestures(pan, pinch, doubleTap);

  const frame = useAnimatedStyle(() => ({
    opacity: 1 - Math.min(0.6, offsetY.value / height),
    transform: [{ translateY: offsetY.value * 0.6 }],
  }));

  const strip = useAnimatedStyle(() => ({
    transform: [{ translateX: -page.value * width + offsetX.value }],
  }));

  const zoomStyle = useAnimatedStyle(() => ({
    transform: [{ scale: zoom.value }, { translateX: offsetX.value }, { translateY: offsetY.value }],
  }));

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: INK }]}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[StyleSheet.absoluteFill, frame]}>
          <Animated.View style={[styles.strip, { width: width * photos.length }, strip]}>
            {photos.map((photo, i) => (
              <View
                key={`${photo.fileName}-${i}`}
                style={{ width, height, alignItems: 'center', justifyContent: 'center' }}
              >
                <Animated.View style={i === index ? zoomStyle : undefined}>
                  <Image
                    source={{ uri: media.uri(photo.fileName) }}
                    style={{ width, height }}
                    resizeMode="contain"
                    accessibilityLabel={moodCopy.photoAlt(i + 1)}
                  />
                </Animated.View>
              </View>
            ))}
          </Animated.View>
        </Animated.View>
      </GestureDetector>
      <View style={[styles.top, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
        <View style={styles.topSide} />
        <AppText variant="callout" color="#FFFFFF" style={styles.index}>
          {`${index + 1}/${photos.length}`}
        </AppText>
        <View style={[styles.topSide, styles.topRight]}>
          <Pressable accessibilityRole="button" accessibilityLabel={moodCopy.close} hitSlop={8} onPress={onClose}>
            <Icon name="close" size={24} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: { flexDirection: 'row', height: '100%' },
  top: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  topSide: { width: 56 },
  topRight: { alignItems: 'flex-end' },
  index: { flex: 1, textAlign: 'center' },
});
