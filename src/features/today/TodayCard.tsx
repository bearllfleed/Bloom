/**
 * 今日页项目卡片（第 1 期 1-2"项目卡片"）：左贴纸图标、中名称与副文案、右花苞按钮。
 * - 点空白处 → 项目详情；点花苞 → 打卡；长按 → 菜单（撤销一次、写成绩、写/看心情、查看详情）；
 * - 完成后底色从花苞中心圆形扩散为项目浅色（M02 卡片部分）；
 * - 第 3 期 3-7：当天完成后副文案末尾出现心情入口（小云朵，写过换成迷你表情）。
 */
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import type { MoodEntity } from '@/domain/mood';
import { canShowProjectMood } from '@/domain/achievement/presentation';
import { formatClock } from '@/domain/date';
import type { LocalDate } from '@/domain/types';
import { moodCopy } from '@/copy/phase3';
import { blockReasonCopy, todayCopy } from '@/copy/today';
import { MoodFaceIcon } from '@/features/mood/MoodFace';
import { readMoodPath, writeMoodPath } from '@/features/mood/links';
import type { DayItem } from '@/services/queries';
import { overlay, type MenuItem } from '@/stores/overlayQueue';
import { AppText } from '@/ui/components/AppText';
import { BloomButton } from '@/ui/components/BloomButton';
import { ProjectBadge, projectColorOf } from '@/ui/components/ProjectBadge';
import { RippleFill } from '@/ui/components/RippleFill';
import { StickerCard } from '@/ui/components/StickerCard';
import { Icon } from '@/ui/icons/Icon';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { inset, space } from '@/ui/tokens';

import { blockedFeedback, checkInWithFeedback, editLatestNote, undoLatestCheckIn } from './checkInFlow';

const BUTTON = 52;

/** 副文案：周期型看周期进度，按天计数的看当天进度，其余显示鼓励语 */
export function subtitleOf(item: DayItem, date: LocalDate, today: LocalDate): string {
  const { project, state, lastCheckedAt } = item;
  if (date > today) return project.motto;
  if (state.period) {
    const label = state.period.period.type === 'week' ? '本周' : '本月';
    if (state.met) return `${label}已达标`;
    const unit = state.period.unit === 'days' ? '天' : project.unit;
    return `${label} ${state.period.achieved}/${state.period.target} ${unit}`;
  }
  if (state.dayCompleted && lastCheckedAt !== null) return `已完成 ${formatClock(lastCheckedAt)}`;
  if (state.target !== null && state.target > 1) {
    return `${date === today ? '今天' : '这天'} ${state.count}/${state.target} ${project.unit}`;
  }
  return project.motto;
}

export function TodayCard({
  item,
  date,
  today,
  mood,
  pulseToken = 0,
}: {
  item: DayItem;
  date: LocalDate;
  today: LocalDate;
  mood: MoodEntity | null;
  /** 变化时把卡片轻轻弹一下，用来响应通知点击 */
  pulseToken?: number;
}) {
  const router = useRouter();
  const { colors, scheme } = useTheme();
  const { project, state } = item;
  const color = projectColorOf(project.colorId);
  const anchor = useRef<ComponentRef<typeof View>>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const scale = useSharedValue(1);
  useEffect(() => {
    if (pulseToken === 0) return;
    scale.value = withSequence(withTiming(1.02, { duration: 180 }), withTiming(1, { duration: 220 }));
  }, [pulseToken, scale]);
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  // 心情由页面按日期一次性读取后分配给卡片，避免逐卡同步查询。
  const moodEntry = canShowProjectMood({
    completed: state.dayCompleted,
    hasMood: mood !== null,
    future: date > today,
  });

  const openMenu = (withDetail: boolean) => {
    const items: MenuItem[] = [];
    if (state.count > 0) {
      items.push({ label: todayCopy.menuUndo, icon: 'undo', onPress: () => undoLatestCheckIn(project.id, date) });
      if (project.noteEnabled) {
        items.push({ label: todayCopy.menuNote, icon: 'note', onPress: () => editLatestNote(project, date) });
      }
    }
    if (moodEntry) {
      items.push(
        mood
          ? {
              label: moodCopy.read,
              icon: 'note',
              onPress: () => router.push(readMoodPath(mood.id)),
            }
          : {
              label: moodCopy.write,
              icon: 'edit',
              onPress: () => router.push(writeMoodPath(date, project.id)),
            },
      );
    }
    if (withDetail) {
      items.push({
        label: todayCopy.menuDetail,
        icon: 'chevron-right',
        onPress: () => router.push(`/project/${project.id}`),
      });
    }
    if (items.length === 0) return;
    anchor.current?.measureInWindow((_x: number, y: number, _w: number, h: number) =>
      overlay.openMenu(items, y + h / 2),
    );
  };

  const onMoodPress = () => {
    if (mood) router.push(readMoodPath(mood.id));
    else router.push(writeMoodPath(date, project.id));
  };

  const onBloomPress = () => {
    if (state.tapAction === 'menu') openMenu(false);
    else if (state.tapAction === 'checkIn') checkInWithFeedback(project, date);
  };

  const subtitle = subtitleOf(item, date, today);
  const tint = scheme === 'dark' ? `${color.base}2E` : color.tint;
  const reach = Math.hypot(size.width, size.height);

  return (
    <Animated.View ref={anchor} collapsable={false} style={pulseStyle}>
      <StickerCard
        padding={0}
        onPress={() => router.push(`/project/${project.id}`)}
        onLongPress={() => openMenu(true)}
        accessibilityLabel={`${project.name}，${subtitle}`}
      >
        <View style={styles.body} onLayout={(e) => setSize(e.nativeEvent.layout)}>
          <RippleFill
            filled={state.bloomed}
            color={tint}
            originX={size.width - inset.card - BUTTON / 2}
            originY={size.height / 2}
            reach={reach}
          />
          <ProjectBadge iconId={project.iconId} colorId={project.colorId} size={48} />
          <View style={styles.text}>
            <AppText variant="title3" numberOfLines={1}>
              {project.name}
            </AppText>
            {subtitle ? (
              <View style={styles.subtitleRow}>
                <AppText variant="caption" tone="secondary" numberOfLines={1} style={styles.subtitleText}>
                  {subtitle}
                </AppText>
                {moodEntry ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={mood ? moodCopy.read : moodCopy.write}
                    hitSlop={12}
                    onPress={onMoodPress}
                    style={styles.moodSlot}
                  >
                    {mood?.face ? (
                      <MoodFaceIcon face={mood.face} size={16} />
                    ) : (
                      <Icon name="cloud" size={16} color={colors.textMuted} />
                    )}
                  </Pressable>
                ) : null}
              </View>
            ) : null}
          </View>
          <BloomButton
            completed={state.bloomed}
            segments={state.segments ?? undefined}
            met={state.met}
            color={color.base}
            deepColor={color.deep}
            disabled={state.tapAction === 'blocked'}
            onPress={onBloomPress}
            onDisabledPress={() => state.blockReason && blockedFeedback(state.blockReason)}
            accessibilityLabel={
              state.tapAction === 'blocked' && state.blockReason
                ? `${project.name}，${blockReasonCopy[state.blockReason]}`
                : state.bloomed
                  ? `${project.name}已完成，双击查看选项`
                  : `为${project.name}打卡，${subtitle}`
            }
          />
        </View>
      </StickerCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  body: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: inset.card,
  },
  text: { flex: 1, gap: 2 },
  subtitleRow: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  subtitleText: { flexShrink: 1 },
  /** 视觉 16pt、热区 32×32，跟副文案基线居中对齐 */
  moodSlot: { width: 32, height: 32, marginVertical: -8, alignItems: 'center', justifyContent: 'center' },
});
