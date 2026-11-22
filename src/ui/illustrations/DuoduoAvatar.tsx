/**
 * 朵朵头像：圆形浅莓果底 + 朵朵头部（8 种配饰之一）。
 */
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/ui/theme/ThemeProvider';

import { DUODUO_AVATARS, Duoduo, type DuoduoAccessory, type DuoduoMood } from './Duoduo';

export function isAvatarId(id: string): id is DuoduoAccessory {
  return DUODUO_AVATARS.some((a) => a.id === id);
}

export function DuoduoAvatar({
  avatarId,
  size = 56,
  mood = 'happy',
}: {
  avatarId: string;
  size?: number;
  mood?: DuoduoMood;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={[styles.root, { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.accentSoft }]}
    >
      <Duoduo size={size} mood={mood} accessory={isAvatarId(avatarId) ? avatarId : 'plain'} crop="head" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
});
