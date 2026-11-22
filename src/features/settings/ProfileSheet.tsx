/**
 * 编辑资料面板（第 1 期 1-8）：改昵称（≤ 10 字）+ 从 8 个朵朵头像中选一个。
 */
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { meCopy } from '@/copy/project';
import { toastCopy } from '@/copy/today';
import { haptics } from '@/platform/haptics';
import { overlay } from '@/stores/overlayQueue';
import { usePrefs } from '@/stores/prefsStore';
import { AppText } from '@/ui/components/AppText';
import { CandyButton } from '@/ui/components/CandyButton';
import { SheetTitle } from '@/ui/components/SheetTitle';
import { TextField } from '@/ui/components/TextField';
import { DUODUO_AVATARS } from '@/ui/illustrations/Duoduo';
import { DuoduoAvatar } from '@/ui/illustrations/DuoduoAvatar';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { space } from '@/ui/tokens';

function ProfileContent({ onClose }: { onClose: () => void }) {
  const { colors } = useTheme();
  const prefs = usePrefs();
  const [nickname, setNickname] = useState(prefs.nickname);
  const [avatarId, setAvatarId] = useState(prefs.avatarId);

  return (
    <View style={styles.root}>
      <SheetTitle title={meCopy.editTitle} />
      <TextField
        value={nickname}
        onChangeText={setNickname}
        maxLength={meCopy.nicknameMax}
        placeholder={meCopy.nicknamePlaceholder}
        returnKeyType="done"
      />
      <AppText variant="callout" tone="secondary">
        {meCopy.avatar}
      </AppText>
      <View style={styles.grid}>
        {DUODUO_AVATARS.map((a) => {
          const selected = a.id === avatarId;
          return (
            <Pressable
              key={a.id}
              accessibilityRole="button"
              accessibilityLabel={a.name}
              accessibilityState={{ selected }}
              onPress={() => {
                haptics.selection();
                setAvatarId(a.id);
              }}
              style={[styles.avatar, { borderColor: selected ? colors.accent : 'transparent' }]}
            >
              <DuoduoAvatar avatarId={a.id} size={60} />
            </Pressable>
          );
        })}
      </View>
      <CandyButton
        label={meCopy.save}
        onPress={() => {
          prefs.update({ nickname: nickname.trim(), avatarId });
          onClose();
          overlay.toast(toastCopy.saved);
        }}
      />
    </View>
  );
}

export function openProfileSheet() {
  overlay.openSheet((close) => <ProfileContent onClose={close} />);
}

const styles = StyleSheet.create({
  root: { gap: space.lg, paddingBottom: space.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: space.md },
  avatar: { borderWidth: 3, borderRadius: 40, padding: 3 },
});
