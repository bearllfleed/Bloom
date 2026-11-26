/**
 * 五个心情表情的选择行（第 3 期 3-8、动效 M30）：
 * 点选播放"放大到 1.15 并上跳 4px、其余变 60% 透明"；再点一次取消选择。
 */
import { useEffect } from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { MOOD_FACES, type MoodFace } from '@/domain/mood';
import { moodCopy } from '@/copy/phase3';
import { haptics } from '@/platform/haptics';
import { AppText } from '@/ui/components/AppText';
import { springs } from '@/ui/motion';

import { MoodFaceIcon } from './MoodFace';

const SIZE = 52;

function Option({
  face,
  selected,
  dimmed,
  onPress,
}: {
  face: MoodFace;
  selected: boolean;
  dimmed: boolean;
  onPress: () => void;
}) {
  const lift = useSharedValue(selected ? 1 : 0);
  useEffect(() => {
    lift.value = withSpring(selected ? 1 : 0, springs.bouncy);
  }, [lift, selected]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: -4 * lift.value }, { scale: 1 + 0.15 * lift.value }],
    opacity: dimmed ? 0.6 : 1,
  }));
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={moodCopy.faces[face]}
      accessibilityState={{ selected }}
      hitSlop={4}
      onPress={onPress}
      style={styles.option}
    >
      <Animated.View style={style}>
        <MoodFaceIcon face={face} size={SIZE} idle={selected} />
      </Animated.View>
      <AppText variant="caption" tone={selected ? 'primary' : 'secondary'}>
        {moodCopy.faces[face]}
      </AppText>
    </Pressable>
  );
}

export function MoodFacePicker({
  value,
  onChange,
}: {
  value: MoodFace | null;
  onChange: (face: MoodFace | null) => void;
}) {
  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {MOOD_FACES.map((face) => (
        <Option
          key={face}
          face={face}
          selected={value === face}
          dimmed={value !== null && value !== face}
          onPress={() => {
            haptics.selection();
            onChange(value === face ? null : face);
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 4 },
  option: { alignItems: 'center', gap: 6, width: SIZE + 8 },
});
