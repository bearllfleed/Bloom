/**
 * 图标选择面板（第 1 期 1-3c）：搜索 + 吸顶分类芯片 + 按分类分组的 5 列网格。
 * - 滚动时分类芯片联动高亮，点芯片滚动到对应分类；
 * - 点图标出现选中外圈并轻弹，200ms 后面板关闭；
 * - 搜索匹配中文名和关键词，无结果时朵朵疑惑 + "没找到，换个词试试"。
 */
import { useMemo, useRef, useState, type ComponentRef } from 'react';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { iconPickerCopy } from '@/copy/project';
import { haptics } from '@/platform/haptics';
import { kv } from '@/platform/kv';
import { AppText } from '@/ui/components/AppText';
import { Chip } from '@/ui/components/Chip';
import { TextField } from '@/ui/components/TextField';
import { ProjectIcon } from '@/ui/icons/ProjectIcon';
import { projectIconCategories, projectIconRegistry } from '@/ui/icons/generated/projectIcons';
import { Duoduo } from '@/ui/illustrations/Duoduo';
import { springs } from '@/ui/motion';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { radius, space } from '@/ui/tokens';

const RECENT_KEY = 'recentIcons';
const RECENT_MAX = 10;
const CELL = 64;
const CLOSE_DELAY_MS = 200;

export function recentIcons(): string[] {
  return kv.getJSON<string[]>(RECENT_KEY) ?? [];
}

export function rememberIcon(id: string): void {
  kv.setJSON(RECENT_KEY, [id, ...recentIcons().filter((x) => x !== id)].slice(0, RECENT_MAX));
}

/** 图标所在分类的推荐颜色 */
export function recommendedColorOf(iconId: string): string | null {
  const category = iconId.split('/')[0];
  return projectIconCategories.find((c) => c.id === category)?.color ?? null;
}

function IconCell({ id, selected, onPress }: { id: string; selected: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const name = projectIconRegistry.find((i) => i.id === id)?.name ?? id;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={name}
      accessibilityState={{ selected }}
      onPress={() => {
        scale.value = withSequence(withTiming(1.12, { duration: 90 }), withSpring(1, springs.bouncy));
        onPress();
      }}
      style={styles.cell}
    >
      <Animated.View style={[styles.cellInner, { borderColor: selected ? colors.accent : 'transparent' }, style]}>
        <ProjectIcon id={id} size={52} />
      </Animated.View>
    </Pressable>
  );
}

interface Section {
  id: string;
  title: string;
  icons: string[];
}

export function IconPickerSheet({ value, onPick }: { value: string; onPick: (id: string) => void }) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState(value);
  const [active, setActive] = useState<string>('recent');
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const offsets = useRef<Record<string, number>>({});

  const sections = useMemo<Section[]>(() => {
    const q = query.trim();
    if (q) {
      const icons = projectIconRegistry
        .filter((i) => i.name.includes(q) || i.keywords.some((k) => k.includes(q) || q.includes(k)))
        .map((i) => i.id);
      return [{ id: 'search', title: '', icons }];
    }
    const recent = recentIcons().filter((id) => projectIconRegistry.some((i) => i.id === id));
    const byCategory = projectIconCategories.map((c) => ({
      id: c.id,
      title: c.name,
      icons: projectIconRegistry.filter((i) => i.category === c.id).map((i) => i.id),
    }));
    return recent.length > 0
      ? [{ id: 'recent', title: iconPickerCopy.recentTitle, icons: recent }, ...byCategory]
      : byCategory;
  }, [query]);

  const pick = (id: string) => {
    haptics.selection();
    setPicked(id);
    setTimeout(() => {
      rememberIcon(id);
      onPick(id);
    }, CLOSE_DELAY_MS);
  };

  const onScroll = (y: number) => {
    let current = sections[0]?.id ?? 'recent';
    for (const s of sections) if ((offsets.current[s.id] ?? Infinity) <= y + 8) current = s.id;
    if (current !== active) setActive(current);
  };

  const chips = [
    ...(sections.some((s) => s.id === 'recent') ? [{ id: 'recent', name: iconPickerCopy.recent }] : []),
    ...projectIconCategories.map((c) => ({ id: c.id, name: c.name.slice(0, 2) })),
  ];

  return (
    <View style={{ height: height - insets.top - 96 }}>
      <TextField
        value={query}
        onChangeText={setQuery}
        maxLength={10}
        placeholder={iconPickerCopy.search}
        returnKeyType="search"
      />
      {!query ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentInsetAdjustmentBehavior="never"
          contentContainerStyle={styles.chips}
        >
          {chips.map((c) => (
            <Chip
              key={c.id}
              label={c.name}
              selected={active === c.id}
              onPress={() => {
                setActive(c.id);
                scroll.current?.scrollTo({ y: offsets.current[c.id] ?? 0, animated: true });
              }}
            />
          ))}
        </ScrollView>
      ) : null}
      <ScrollView
        ref={scroll}
        style={styles.flex}
        contentContainerStyle={styles.body}
        contentInsetAdjustmentBehavior="never"
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={32}
        onScroll={(e) => onScroll(e.nativeEvent.contentOffset.y)}
      >
        {sections.map((section) => (
          <View
            key={section.id}
            onLayout={(e) => {
              offsets.current[section.id] = e.nativeEvent.layout.y;
            }}
          >
            {section.title ? (
              <AppText variant="callout" tone="secondary" style={styles.sectionTitle}>
                {section.title}
              </AppText>
            ) : null}
            <View style={styles.grid}>
              {section.icons.map((id) => (
                <IconCell key={`${section.id}-${id}`} id={id} selected={picked === id} onPress={() => pick(id)} />
              ))}
            </View>
          </View>
        ))}
        {query && sections[0]?.icons.length === 0 ? (
          <View style={styles.empty}>
            <Duoduo size={110} mood="puzzled" />
            <AppText variant="body" tone="secondary">
              {iconPickerCopy.empty}
            </AppText>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  chips: { gap: space.sm, paddingVertical: space.md },
  body: { paddingBottom: space.xxl },
  sectionTitle: { marginTop: space.md, marginBottom: space.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '20%', alignItems: 'center', marginBottom: space.sm },
  cellInner: {
    width: CELL,
    height: CELL,
    borderRadius: radius.small,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { alignItems: 'center', gap: space.md, paddingTop: space.xxl },
});
