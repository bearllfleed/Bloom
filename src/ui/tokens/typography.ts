/**
 * 字体与字号（设计规范第 4 节）。
 * - 标题字：阿里妈妈方圆体（授权与包体待第 0 期预研结论，未接入前回退为系统粗体）；
 * - 数字字：Fredoka（开源 OFL）；
 * - 正文：系统字体。
 */
import type { TextStyle } from 'react-native';

export const fontFamily = {
  /** 标题字体；接入方圆体后改为其字体名 */
  display: undefined as string | undefined,
  /** 与 @expo-google-fonts/fredoka 的 useFonts 键名一致 */
  numeric: 'Fredoka_600SemiBold',
  numericMedium: 'Fredoka_500Medium',
  body: undefined as string | undefined,
} as const;

type TypeStyle = Pick<TextStyle, 'fontSize' | 'lineHeight' | 'fontWeight' | 'fontFamily' | 'fontVariant'>;

const tabular: TextStyle['fontVariant'] = ['tabular-nums'];

export const type = {
  display: { fontSize: 30, lineHeight: 38, fontWeight: '700', fontFamily: fontFamily.display },
  title1: { fontSize: 24, lineHeight: 32, fontWeight: '700', fontFamily: fontFamily.display },
  title2: { fontSize: 20, lineHeight: 28, fontWeight: '600', fontFamily: fontFamily.display },
  title3: { fontSize: 17, lineHeight: 24, fontWeight: '600' },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' },
  callout: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
  micro: { fontSize: 11, lineHeight: 14, fontWeight: '500' },
  numberXL: { fontSize: 40, lineHeight: 46, fontFamily: fontFamily.numeric, fontVariant: tabular },
  numberL: { fontSize: 28, lineHeight: 34, fontFamily: fontFamily.numeric, fontVariant: tabular },
  numberM: { fontSize: 20, lineHeight: 24, fontFamily: fontFamily.numeric, fontVariant: tabular },
  numberS: { fontSize: 15, lineHeight: 20, fontFamily: fontFamily.numericMedium, fontVariant: tabular },
} satisfies Record<string, TypeStyle>;

export type TypeVariant = keyof typeof type;

/** 字体未成功注册时移除自定义字体名，让 React Native 使用系统字体。 */
export function resolveTypeStyle(variant: TypeVariant, customFontsAvailable: boolean): TextStyle {
  const style: TextStyle = type[variant];
  return !customFontsAvailable && style.fontFamily ? { ...style, fontFamily: undefined } : style;
}
