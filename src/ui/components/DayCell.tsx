/**
 * 日历日期格（设计规范第 8 节）：上方日期数字，下方花朵标记。
 * 状态：普通 / 今天（描边）/ 选中（莓果底）/ 非本月（淡色）/ 未来（不显示标记）。
 */
import { Pressable, StyleSheet, View } from 'react-native';

import type { FlowerMark as FlowerMarkKind } from '@/domain/stats';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { ON_PROJECT_COLOR, radius } from '@/ui/tokens';

import { AppText } from './AppText';
import { FlowerMark } from './FlowerMark';

export interface DayCellProps {
  day: number;
  mark: FlowerMarkKind;
  isToday?: boolean;
  isSelected?: boolean;
  isOutsideMonth?: boolean;
  isFuture?: boolean;
  /** 盛开花瓣颜色（项目详情传项目色） */
  flowerColor?: string;
  onPress?: () => void;
  accessibilityLabel: string;
}

export const DAY_CELL_WIDTH = 44;
export const DAY_CELL_HEIGHT = 52;

export function DayCell({
  day,
  mark,
  isToday = false,
  isSelected = false,
  isOutsideMonth = false,
  isFuture = false,
  flowerColor,
  onPress,
  accessibilityLabel,
}: DayCellProps) {
  const { colors } = useTheme();
  const numberColor = isSelected
    ? ON_PROJECT_COLOR
    : isOutsideMonth
      ? colors.hairline
      : isToday
        ? colors.link
        : isFuture
          ? colors.textMuted
          : colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: isSelected }}
      onPress={onPress}
      style={[
        styles.cell,
        isSelected && { backgroundColor: colors.accent },
        isToday && !isSelected && { borderWidth: 2, borderColor: colors.accent },
      ]}
    >
      <AppText variant="numberM" color={numberColor} style={styles.number}>
        {day}
      </AppText>
      <View style={styles.mark}>
        <FlowerMark mark={isFuture ? 'none' : mark} size={14} color={isSelected ? '#FFFFFF' : flowerColor} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: {
    width: DAY_CELL_WIDTH,
    height: DAY_CELL_HEIGHT,
    borderRadius: radius.small,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  number: { fontSize: 17, lineHeight: 22 },
  mark: { height: 14 },
});
