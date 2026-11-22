/**
 * 欢迎页（第 1 期 1-1）：只在首次启动出现一次。
 * 朵朵弹入挥手，标题、说明、输入框、按钮依次淡入上移（M10）；键盘弹出时朵朵缩小让出空间。
 */
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { trustCopy } from '@/copy/common';
import { welcomeCopy, meCopy } from '@/copy/project';
import { markChangelogSeen } from '@/services/changelogService';
import { usePrefs } from '@/stores/prefsStore';
import { AppText } from '@/ui/components/AppText';
import { CandyButton } from '@/ui/components/CandyButton';
import { DotPaper } from '@/ui/components/DotPaper';
import { TextField } from '@/ui/components/TextField';
import { Duoduo } from '@/ui/illustrations/Duoduo';
import { springs, useMotionReduced } from '@/ui/motion';
import { useKeyboardHeight } from '@/ui/motion/useKeyboardHeight';
import { inset, space } from '@/ui/tokens';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const update = usePrefs((s) => s.update);
  const [nickname, setNickname] = useState('');
  const reduced = useMotionReduced();
  const keyboard = useKeyboardHeight();
  const rise = useSharedValue(reduced ? 0 : 40);
  const wave = useSharedValue(0);

  useEffect(() => {
    if (reduced) return;
    rise.value = withSpring(0, springs.bouncy);
    wave.value = withDelay(
      300,
      withSequence(
        withTiming(-8, { duration: 160 }),
        withTiming(8, { duration: 160 }),
        withTiming(-8, { duration: 160 }),
        withTiming(0, { duration: 160 }),
      ),
    );
  }, [reduced, rise, wave]);

  const duoduoStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: rise.value }, { rotate: `${wave.value}deg` }],
  }));

  const enter = (index: number) => (reduced ? undefined : FadeInDown.delay(200 + index * 80).duration(240));

  const start = () => {
    update({ nickname: nickname.trim(), onboarded: true });
    markChangelogSeen();
    router.replace('/');
  };

  return (
    <DotPaper style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.content}>
          <Animated.View style={duoduoStyle}>
            <Duoduo size={keyboard > 0 ? 120 : 160} mood="happy" pose="wave" />
          </Animated.View>
          <Animated.View entering={enter(0)}>
            <AppText variant="title1" align="center">
              {welcomeCopy.title}
            </AppText>
          </Animated.View>
          <Animated.View entering={enter(1)}>
            <AppText variant="body" tone="secondary" align="center">
              {welcomeCopy.message}
            </AppText>
          </Animated.View>
          <Animated.View entering={enter(2)} style={styles.field}>
            <TextField
              value={nickname}
              onChangeText={setNickname}
              maxLength={meCopy.nicknameMax}
              placeholder={welcomeCopy.placeholder}
              returnKeyType="done"
              onSubmitEditing={start}
            />
          </Animated.View>
          <Animated.View entering={enter(3)} style={styles.field}>
            <CandyButton label={welcomeCopy.start} onPress={start} />
          </Animated.View>
          <AppText variant="caption" tone="muted" align="center">
            {trustCopy.localOnly}
          </AppText>
        </View>
      </KeyboardAvoidingView>
    </DotPaper>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: inset.page + 8,
    gap: space.lg,
  },
  field: { alignSelf: 'stretch' },
});
