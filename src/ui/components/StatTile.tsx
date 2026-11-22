/**
 * 数据块（设计规范第 8 节）：标签 + 滚动数字 + 单位。只放一个数字，不加装饰小图。
 */
import { StyleSheet, View } from 'react-native';

import { space } from '@/ui/tokens';

import { AppText } from './AppText';
import { RollingNumber } from './RollingNumber';

export interface StatTileProps {
  label: string;
  value: number;
  unit?: string;
  size?: 'L' | 'M';
}

export function StatTile({ label, value, unit, size = 'L' }: StatTileProps) {
  return (
    <View style={styles.root} accessible accessibilityLabel={`${label} ${value}${unit ?? ''}`}>
      <AppText variant="caption" tone="secondary">
        {label}
      </AppText>
      <View style={styles.valueRow}>
        <RollingNumber value={value} variant={size === 'L' ? 'numberL' : 'numberM'} />
        {unit ? (
          <AppText variant="caption" tone="secondary" style={styles.unit}>
            {unit}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: space.xs, flex: 1 },
  valueRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  unit: { marginBottom: 4 },
});
