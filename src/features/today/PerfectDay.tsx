/**
 * 完美日庆祝（M05）：24 片花瓣从屏幕上方左右摇摆飘落，顶部滑下横幅"今天的花全开啦"。
 * 横幅 4 秒后自动收起，点一下或上滑可提前关闭。减弱动态时只显示横幅。
 */
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  SlideInUp,
  SlideOutUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { todayCopy } from '@/copy/today';
import { haptics } from '@/platform/haptics';
import { AppText } from '@/ui/components/AppText';
import { FlowerGlyph } from '@/ui/components/FlowerMark';
import { useMotionReduced } from '@/ui/motion';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { inset, radius, shadow } from '@/ui/tokens';

import { useCelebration } from './celebration';

const PETAL_COUNT = 24;
const RAIN_MS = 1600;
const BANNER_MS = 4000;
const PETAL_COLORS = ['#FF8FB8', '#FFC7DB', '#FFD66B', '#FFA3C3', '#C6A2FF'];

function Petal({ index, width, height }: { index: number; width: number; height: number }) {
  const fall = useSharedValue(0);
  const sway = useSharedValue(0);
  const seed = useRef({
    x: (index / PETAL_COUNT) * width + ((index * 37) % 23) - 11,
    delay: (index * 53) % 500,
    size: 10 + ((index * 7) % 8),
    spin: (index % 2 === 0 ? 1 : -1) * (180 + ((index * 29) % 180)),
  }).current;

  useEffect(() => {
    fall.value = withDelay(
      seed.delay,
      withTiming(1, { duration: RAIN_MS - seed.delay / 2, easing: Easing.in(Easing.quad) }),
    );
    sway.value = withDelay(
      seed.delay,
      withRepeat(withSequence(withTiming(1, { duration: 360 }), withTiming(-1, { duration: 360 })), 3, true),
    );
  }, [fall, seed.delay, sway]);

  const style = useAnimatedStyle(() => ({
    opacity: fall.value < 0.85 ? 1 : (1 - fall.value) / 0.15,
    transform: [
      { translateX: seed.x + sway.value * 18 },
      { translateY: -40 + fall.value * (height * 0.75) },
      { rotate: `${fall.value * seed.spin}deg` },
    ],
  }));

  return (
    <Animated.View style={[styles.petal, style]}>
      <View
        style={{
          width: seed.size,
          height: seed.size,
          borderTopLeftRadius: seed.size,
          borderBottomRightRadius: seed.size,
          backgroundColor: PETAL_COLORS[index % PETAL_COLORS.length],
        }}
      />
    </Animated.View>
  );
}

function Banner({ onClose }: { onClose: () => void }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const pan = usePanGesture({
    activeOffsetY: [-10, 10],
    onDeactivate: (e) => {
      'worklet';
      if (e.translationY < -16) scheduleOnRN(onClose);
    },
  });
  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        entering={SlideInUp.springify().damping(16)}
        exiting={SlideOutUp.duration(200)}
        style={[styles.banner, { top: insets.top + 8, backgroundColor: colors.card, shadowColor: colors.shadow }]}
      >
        <Pressable accessibilityRole="button" onPress={onClose} style={styles.bannerInner}>
          <FlowerGlyph size={28} petal={colors.accent} outlined />
          <AppText variant="title3" tone="link">
            {todayCopy.perfectBanner}
          </AppText>
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}

export function PerfectDayLayer() {
  const { width, height } = useWindowDimensions();
  const reduced = useMotionReduced();
  const fullToken = useCelebration((s) => s.fullToken);
  const seen = useRef(fullToken);
  const [rainKey, setRainKey] = useState<number | null>(null);
  const [banner, setBanner] = useState(false);

  useEffect(() => {
    if (fullToken === seen.current) return;
    seen.current = fullToken;
    haptics.success();
    setBanner(true);
    if (!reduced) setRainKey(fullToken);
    const rainTimer = setTimeout(() => setRainKey(null), RAIN_MS + 300);
    const bannerTimer = setTimeout(() => setBanner(false), BANNER_MS);
    return () => {
      clearTimeout(rainTimer);
      clearTimeout(bannerTimer);
    };
  }, [fullToken, reduced]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {rainKey !== null ? (
        <View key={rainKey} style={StyleSheet.absoluteFill} pointerEvents="none">
          {Array.from({ length: PETAL_COUNT }, (_, i) => (
            <Petal key={i} index={i} width={width} height={height} />
          ))}
        </View>
      ) : null}
      {banner ? <Banner onClose={() => setBanner(false)} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  petal: { position: 'absolute', left: 0, top: 0 },
  banner: {
    position: 'absolute',
    left: inset.page,
    right: inset.page,
    borderRadius: radius.card,
    shadowOffset: { width: 0, height: shadow.lifted.offsetY / 2 },
    shadowRadius: shadow.lifted.blur / 2,
    shadowOpacity: shadow.lifted.opacity,
    elevation: 6,
  },
  bannerInner: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16 },
});
