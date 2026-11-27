/**
 * 文字：按字号层级（设计规范第 4 节）和颜色角色渲染。
 * 所有界面文字都用它，避免各处散落字号与颜色。
 */
import { createContext, type ReactNode, useContext } from 'react';
import { Text, type TextProps } from 'react-native';

import { useTheme } from '@/ui/theme/ThemeProvider';
import { resolveTypeStyle, type SemanticColors, type TypeVariant } from '@/ui/tokens';

export type TextTone = 'primary' | 'secondary' | 'muted' | 'link' | 'onPrimary' | 'danger' | 'warning' | 'success';

const toneKey: Record<TextTone, keyof SemanticColors> = {
  primary: 'text',
  secondary: 'textSecondary',
  muted: 'textMuted',
  link: 'link',
  onPrimary: 'onPrimary',
  danger: 'dangerText',
  warning: 'warningText',
  success: 'successText',
};

const customFontsAvailableContext = createContext(true);

export function FontAvailabilityProvider({ available, children }: { available: boolean; children: ReactNode }) {
  return <customFontsAvailableContext.Provider value={available}>{children}</customFontsAvailableContext.Provider>;
}

export interface AppTextProps extends TextProps {
  variant?: TypeVariant;
  tone?: TextTone;
  /** 直接指定颜色（如彩色块上的可可色），优先于 tone */
  color?: string;
  align?: 'left' | 'center' | 'right';
}

export function AppText({ variant = 'body', tone = 'primary', color, align, style, ...rest }: AppTextProps) {
  const { colors } = useTheme();
  const customFontsAvailable = useContext(customFontsAvailableContext);
  return (
    <Text
      maxFontSizeMultiplier={1.3}
      {...rest}
      style={[
        resolveTypeStyle(variant, customFontsAvailable),
        { color: color ?? colors[toneKey[tone]], textAlign: align },
        style,
      ]}
    />
  );
}
