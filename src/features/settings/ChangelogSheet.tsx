/**
 * 更新说明面板（第 1 期 1-9）："这次更新了什么" + 知道啦。
 */
import { StyleSheet, View } from 'react-native';

import { changelogCopy } from '@/copy/project';
import type { ChangelogEntry } from '@/copy/changelog';
import { overlay } from '@/stores/overlayQueue';
import { AppText } from '@/ui/components/AppText';
import { CandyButton } from '@/ui/components/CandyButton';
import { FlowerGlyph } from '@/ui/components/FlowerMark';
import { SheetTitle } from '@/ui/components/SheetTitle';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { space } from '@/ui/tokens';

function ChangelogContent({ entry, onClose }: { entry: ChangelogEntry; onClose: () => void }) {
  const { colors } = useTheme();
  return (
    <View style={styles.root}>
      <SheetTitle title={changelogCopy.title} subtitle={`版本 ${entry.version}`} />
      <View style={styles.list}>
        {entry.items.map((item) => (
          <View key={item} style={styles.item}>
            <FlowerGlyph size={16} petal={colors.accent} outlined />
            <AppText variant="body" style={styles.itemText}>
              {item}
            </AppText>
          </View>
        ))}
      </View>
      <CandyButton label={changelogCopy.ok} onPress={onClose} />
    </View>
  );
}

export function openChangelog(entry: ChangelogEntry, onClosed?: () => void) {
  overlay.openSheet((close) => (
    <ChangelogContent
      entry={entry}
      onClose={() => {
        close();
        onClosed?.();
      }}
    />
  ));
}

const styles = StyleSheet.create({
  root: { gap: space.lg, paddingBottom: space.sm },
  list: { gap: space.md },
  item: { flexDirection: 'row', gap: space.sm, alignItems: 'flex-start' },
  itemText: { flex: 1 },
});
