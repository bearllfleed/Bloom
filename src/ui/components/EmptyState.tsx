/**
 * 空状态（设计规范第 8 节、10.3）：朵朵插画 + 一句具体的话 + 一个行动。
 * 文案从 src/copy 取，不写"暂无数据"之类的话。
 */
import { StyleSheet, View } from 'react-native';

import { Duoduo, type DuoduoMood, type DuoduoPose } from '@/ui/illustrations/Duoduo';
import { space } from '@/ui/tokens';

import { AppText } from './AppText';
import { CandyButton } from './CandyButton';

export interface EmptyStateProps {
  message: string;
  mood?: DuoduoMood;
  pose?: DuoduoPose;
  actionLabel?: string;
  onAction?: () => void;
  /** 次要动作用文字按钮 */
  secondary?: boolean;
}

export function EmptyState({
  message,
  mood = 'expectant',
  pose = 'none',
  actionLabel,
  onAction,
  secondary = false,
}: EmptyStateProps) {
  return (
    <View style={styles.root}>
      <Duoduo size={140} mood={mood} pose={pose} breathing />
      <AppText variant="body" tone="secondary" align="center" style={styles.message}>
        {message}
      </AppText>
      {actionLabel ? (
        <CandyButton label={actionLabel} onPress={onAction} variant={secondary ? 'text' : 'primary'} size="md" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', paddingVertical: space.xxxl, paddingHorizontal: space.xxl, gap: space.lg },
  message: { maxWidth: 260 },
});
