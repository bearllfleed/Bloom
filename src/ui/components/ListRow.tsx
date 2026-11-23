/**
 * 列表行（设计规范第 8 节）：左图标 + 标题 + 右侧值 + 箭头，高 52。
 * 用在创建页的频率/日期行、"我的"页入口、关于页。
 */
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, type UiIconName } from '@/ui/icons/Icon';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { inset } from '@/ui/tokens';

import { AppText, type TextTone } from './AppText';

export interface ListRowProps {
  icon?: UiIconName;
  label: string;
  value?: string;
  valueTone?: TextTone;
  /** 右侧自定义内容（如开关），传入后不显示箭头 */
  right?: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  /** 行下方的辅助说明 */
  hint?: string;
  hintTone?: TextTone;
  onHintPress?: () => void;
  showDivider?: boolean;
}

export function ListRow({
  icon,
  label,
  value,
  valueTone = 'secondary',
  right,
  onPress,
  disabled = false,
  hint,
  hintTone = 'link',
  onHintPress,
  showDivider = false,
}: ListRowProps) {
  const { colors } = useTheme();
  const content = (
    <View
      style={[styles.row, showDivider && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.hairline }]}
    >
      <View style={styles.main}>
        {icon ? <Icon name={icon} size={22} color={disabled ? colors.textMuted : colors.text} /> : null}
        <AppText variant="body" tone={disabled ? 'muted' : 'primary'} style={styles.label} numberOfLines={1}>
          {label}
        </AppText>
        {value ? (
          <AppText variant="callout" tone={disabled ? 'muted' : valueTone} numberOfLines={1} style={styles.value}>
            {value}
          </AppText>
        ) : null}
        {right ?? (onPress ? <Icon name="chevron-right" size={18} color={colors.textMuted} /> : null)}
      </View>
      {hint ? (
        <AppText
          variant="caption"
          tone={hintTone}
          style={styles.hint}
          onPress={onHintPress}
          accessibilityRole={onHintPress ? 'button' : undefined}
        >
          {hint}
        </AppText>
      ) : null}
    </View>
  );
  if (!onPress) return content;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={value ? `${label}，${value}` : label}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: inset.card, paddingVertical: 14, minHeight: 52, justifyContent: 'center' },
  main: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  label: { flexShrink: 0 },
  value: { flex: 1, textAlign: 'right' },
  hint: { marginTop: 4, marginLeft: 32 },
});
