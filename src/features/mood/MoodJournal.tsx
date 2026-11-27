/**
 * 心情手账（第 3 期 3-9）：入口在"我的"。
 * - 顶部"全部 / 只看有照片"，月份标题吸顶；
 * - 每篇是便签卡片，奇偶交替 ±1° 微旋转，带一段和纸胶带；正文最多 3 行；
 * - 照片最多显示 3 张缩略图，多出的写 +N；
 * - 空状态：朵朵趴着写日记 + 一句引导。
 */
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, SectionList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatMonthDayWeekday, formatYearMonth } from '@/domain/date';
import { journalMonths, type MoodEntity } from '@/domain/mood';
import { moodCopy } from '@/copy/phase3';
import { useLiveQuery } from '@/features/common/useLiveQuery';
import { media } from '@/platform/media';
import { moodService } from '@/services/moodService';
import { AppText } from '@/ui/components/AppText';
import { DotPaper } from '@/ui/components/DotPaper';
import { EmptyState } from '@/ui/components/EmptyState';
import { SegmentedControl } from '@/ui/components/SegmentedControl';
import { TopBar } from '@/ui/components/TopBar';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { inset, radius, space } from '@/ui/tokens';

import { journalMonthTitle, moodProjectLabel } from './heading';
import { MoodFaceIcon } from './MoodFace';

type Filter = 'all' | 'photos';

const FILTERS: readonly { value: Filter; label: string }[] = [
  { value: 'all', label: moodCopy.all },
  { value: 'photos', label: moodCopy.withPhotos },
];

const THUMB = 44;

/** 便签卡片，奇偶交替微旋转；照片最多 3 张 +N */
function MoodNote({ index, mood, onPress }: { index: number; mood: MoodEntity; onPress: () => void }) {
  const { colors } = useTheme();
  const projectLabel = moodProjectLabel(mood.projectNameSnapshot, mood.projectId !== null);
  const extra = mood.photos.length - 3;
  return (
    <View style={[styles.noteWrap, { transform: [{ rotate: index % 2 === 0 ? '-1deg' : '1deg' }] }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={formatMonthDayWeekday(mood.date)}
        onPress={onPress}
        style={[
          styles.note,
          { backgroundColor: colors.card, borderBottomColor: colors.cardEdge, shadowColor: colors.shadow },
        ]}
      >
        <View style={[styles.tape, { backgroundColor: colors.accentSoft }]} />
        <View style={styles.noteHead}>
          {mood.face ? <MoodFaceIcon face={mood.face} size={28} /> : null}
          <AppText variant="callout" tone="secondary" numberOfLines={1} style={styles.flex}>
            {`${formatMonthDayWeekday(mood.date)}${projectLabel ? ` · ${projectLabel}` : ''}`}
          </AppText>
        </View>
        {mood.text ? (
          <AppText variant="body" numberOfLines={3}>
            {mood.text}
          </AppText>
        ) : null}
        {mood.photos.length > 0 ? (
          <View style={styles.photos}>
            {mood.photos.slice(0, 3).map((photo) => (
              <Image
                key={photo.id}
                source={{ uri: media.thumbUri(photo.fileName) }}
                style={styles.thumb}
                resizeMode="cover"
              />
            ))}
            {extra > 0 ? (
              <View style={[styles.more, { backgroundColor: colors.weak }]}>
                <AppText variant="caption" tone="secondary">
                  {moodCopy.morePhotos(extra)}
                </AppText>
              </View>
            ) : null}
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}

export function MoodJournal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [filter, setFilter] = useState<Filter>('all');
  const moods = useLiveQuery(() => moodService.list({ hasPhotos: filter === 'photos' }), [filter], ['moods']);
  const groups = journalMonths(moods);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <TopBar title={moodCopy.title} onBack={() => router.back()} />
      <DotPaper>
        <View style={styles.filter}>
          <SegmentedControl options={FILTERS} value={filter} onChange={setFilter} />
        </View>
        <SectionList
          sections={groups.map((group) => ({
            key: group.month,
            title: journalMonthTitle(formatYearMonth(`${group.month}-01`), group.moods.length),
            data: group.moods,
          }))}
          keyExtractor={(mood) => mood.id}
          stickySectionHeadersEnabled
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + space.giant }]}
          renderSectionHeader={({ section }) => (
            <View style={[styles.sectionHead, { backgroundColor: colors.background }]}>
              <AppText variant="callout" tone="secondary">
                {section.title}
              </AppText>
            </View>
          )}
          renderItem={({ item, index }) => (
            <MoodNote
              index={index}
              mood={item}
              onPress={() => router.push({ pathname: '/mood/[id]', params: { id: item.id } })}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            filter === 'all' ? (
              <EmptyState message={moodCopy.empty} mood="happy" pose="write" />
            ) : (
              <EmptyState message={moodCopy.emptyPhotos} mood="puzzled" pose="write" />
            )
          }
        />
      </DotPaper>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  filter: { paddingHorizontal: inset.page, paddingTop: space.sm },
  list: { paddingHorizontal: inset.page, paddingTop: space.sm },
  sectionHead: { paddingVertical: space.sm },
  separator: { height: space.md },
  noteWrap: { borderRadius: radius.card + 2 },
  note: {
    borderRadius: radius.card,
    borderBottomWidth: 4,
    padding: inset.card,
    paddingTop: space.lg,
    gap: space.sm,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 0.06,
    elevation: 1,
  },
  tape: {
    position: 'absolute',
    top: -8,
    left: inset.card,
    width: 52,
    height: 16,
    borderRadius: 3,
    opacity: 0.9,
    transform: [{ rotate: '-3deg' }],
  },
  noteHead: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  photos: { flexDirection: 'row', gap: space.sm, marginTop: space.xs },
  thumb: { width: THUMB, height: THUMB, borderRadius: radius.small },
  more: { width: THUMB, height: THUMB, borderRadius: radius.small, alignItems: 'center', justifyContent: 'center' },
});
