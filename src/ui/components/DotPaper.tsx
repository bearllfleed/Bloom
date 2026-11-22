/**
 * 点阵手账纸背景（设计规范第 6 节）：纸色底 + 间距 16 的小圆点，固定不随内容滚动。
 * 用 SVG 图案一次性绘制，避免成百上千个视图。
 */
import { StyleSheet, View, type ViewProps } from 'react-native';
import Svg, { Circle, Defs, Pattern, Rect } from 'react-native-svg';

import { useTheme } from '@/ui/theme/ThemeProvider';

const GAP = 16;
const DOT_RADIUS = 0.75;

export function DotPaper({ style, children, ...rest }: ViewProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.root, { backgroundColor: colors.background }, style]} {...rest}>
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <Pattern id="dot-paper" width={GAP} height={GAP} patternUnits="userSpaceOnUse">
            <Circle cx={GAP / 2} cy={GAP / 2} r={DOT_RADIUS} fill={colors.dot} />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#dot-paper)" />
      </Svg>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
