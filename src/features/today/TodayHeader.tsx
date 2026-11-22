/**
 * 今日页顶栏：朵朵头像（表情随今天进度变化）+ 问候语 + 今天的日期，右侧历史与新建。
 * 点朵朵轻跳并冒出一句随机气泡（M28），连点 5 次说"别戳啦，好痒"；完美日时跳起 16px（M05）。
 */
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { formatMonthDayWeekday } from '@/domain/date';
import type { LocalDate } from '@/domain/types';
import { duoduoTickled, greeting, randomBubble } from '@/copy/encouragement';
import { todayCopy } from '@/copy/today';
import { clock } from '@/platform/clock';
import { haptics } from '@/platform/haptics';
import { usePrefs } from '@/stores/prefsStore';
import { AppText } from '@/ui/components/AppText';
import { RoundIconButton } from '@/ui/components/TopBar';
import { DuoduoAvatar } from '@/ui/illustrations/DuoduoAvatar';
import type { DuoduoMood } from '@/ui/illustrations/Duoduo';
import { springs, useMotionReduced } from '@/ui/motion';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { inset, radius, shadow, space } from '@/ui/tokens';

import { useCelebration } from './celebration';

const BUBBLE_MS = 2500;
const TICKLE_TAPS = 5;
const TICKLE_WINDOW_MS = 2000;

export function TodayHeader({ today, mood }: { today: LocalDate; mood: DuoduoMood }) {
  const router = useRouter();
  const { colors } = useTheme();
  const nickname = usePrefs((s) => s.nickname);
  const avatarId = usePrefs((s) => s.avatarId);
  const reduced = useMotionReduced();
  const jump = useSharedValue(0);
  const [bubble, setBubble] = useState<string | null>(null);
  const taps = useRef<number[]>([]);
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fullToken = useCelebration((s) => s.fullToken);
  const seenToken = useRef(fullToken);

  useEffect(
    () => () => {
      if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    },
    [],
  );

  useEffect(() => {
    if (fullToken === seenToken.current) return;
    seenToken.current = fullToken;
    if (!reduced) jump.value = withSequence(withTiming(-16, { duration: 200 }), withSpring(0, springs.bouncy));
  }, [fullToken, jump, reduced]);

  const onDuoduo = () => {
    haptics.light();
    const now = clock.now();
    taps.current = [...taps.current.filter((t) => now - t < TICKLE_WINDOW_MS), now];
    const text = taps.current.length >= TICKLE_TAPS ? duoduoTickled : randomBubble(bubble ?? undefined);
    if (taps.current.length >= TICKLE_TAPS) taps.current = [];
    setBubble(text);
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    bubbleTimer.current = setTimeout(() => setBubble(null), BUBBLE_MS);
    if (!reduced) jump.value = withSequence(withTiming(-6, { duration: 120 }), withSpring(0, springs.bouncy));
  };

  const jumpStyle = useAnimatedStyle(() => ({ transform: [{ translateY: jump.value }] }));
  const hour = new Date(clock.now()).getHours();

  return (
    <View style={styles.root}>
      <Pressable accessibilityRole="button" accessibilityLabel="朵朵" onPress={onDuoduo} hitSlop={6}>
        <Animated.View style={jumpStyle}>
          <DuoduoAvatar avatarId={avatarId} size={44} mood={mood} />
        </Animated.View>
      </Pressable>
      <View style={styles.text}>
        <AppText variant="title2" numberOfLines={1}>
          {greeting(hour, nickname)}
        </AppText>
        <AppText variant="caption" tone="secondary">
          {formatMonthDayWeekday(today)}
        </AppText>
      </View>
      <RoundIconButton icon="history" label={todayCopy.history} onPress={() => router.push('/history')} />
      <RoundIconButton icon="plus" label={todayCopy.newProject} onPress={() => router.push('/project/new')} />
      {bubble ? (
        <Animated.View
          entering={FadeIn.duration(160)}
          exiting={FadeOut.duration(200)}
          pointerEvents="none"
          style={[styles.bubble, { backgroundColor: colors.card, shadowColor: colors.shadow }]}
        >
          <AppText variant="callout">{bubble}</AppText>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: inset.page,
    zIndex: 2,
  },
  text: { flex: 1, marginLeft: 4 },
  bubble: {
    position: 'absolute',
    left: inset.page + 36,
    top: 52,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.menu,
    borderTopLeftRadius: 4,
    shadowOffset: { width: 0, height: shadow.lifted.offsetY / 2 },
    shadowRadius: shadow.lifted.blur / 2,
    shadowOpacity: shadow.lifted.opacity,
    elevation: 4,
  },
});
