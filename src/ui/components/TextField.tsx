/**
 * 输入框（设计规范第 8 节）：凹面底、圆角 14；聚焦时 2px 莓果外圈。
 * 字数到达 countFrom 后显示计数，接近上限变为提醒色；出错时左右轻摇并在下方显示一行提示。
 */
import { useEffect, useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { haptics } from '@/platform/haptics';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { radius, type } from '@/ui/tokens';

import { AppText } from './AppText';

export interface TextFieldProps extends Omit<TextInputProps, 'style' | 'maxLength'> {
  maxLength: number;
  /** 从第几个字开始显示计数；默认达到上限的 75% */
  countFrom?: number;
  /** 错误提示；每次变为新的非空值时轻摇一次 */
  error?: string | null;
  large?: boolean;
}

export function TextField({
  maxLength,
  countFrom,
  error,
  large = false,
  value = '',
  onFocus,
  onBlur,
  ...rest
}: TextFieldProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const shake = useSharedValue(0);
  const length = [...value].length;
  const showCount = length >= (countFrom ?? Math.floor(maxLength * 0.75));
  const nearLimit = length >= maxLength - Math.max(2, Math.floor(maxLength * 0.04));

  useEffect(() => {
    if (!error) return;
    haptics.warning();
    shake.value = withSequence(
      withTiming(-6, { duration: 50 }),
      withTiming(6, { duration: 50 }),
      withTiming(-4, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
  }, [error, shake]);

  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  return (
    <View>
      <Animated.View
        style={[
          styles.box,
          {
            backgroundColor: colors.sunken,
            borderColor: focused ? colors.focusRing : error ? colors.danger : 'transparent',
          },
          shakeStyle,
        ]}
      >
        <TextInput
          {...rest}
          value={value}
          maxLength={maxLength}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.accent}
          maxFontSizeMultiplier={1.3}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[
            large ? type.title1 : type.body,
            styles.input,
            { color: colors.text },
            rest.multiline && styles.multiline,
          ]}
        />
        {showCount ? (
          <AppText variant="caption" tone={nearLimit ? 'warning' : 'muted'} style={styles.count}>
            {length}/{maxLength}
          </AppText>
        ) : null}
      </Animated.View>
      {error ? (
        <AppText variant="caption" tone="danger" style={styles.error}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: radius.input,
    borderWidth: 2,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  input: { flex: 1, padding: 0 },
  multiline: { minHeight: 88, textAlignVertical: 'top' },
  count: { marginLeft: 8 },
  error: { marginTop: 6, marginLeft: 4 },
});
