/**
 * 我的项目卡片（第 1 期 1-5）：项目色头部 + 破出头部的贴纸图标 + 右侧累计大数字，
 * 下方本月完成 / 当前连续 / 完成率，有截止日期时显示花藤进度，底行状态与开关。
 * - 未开始：大数字位置显示"3 天后"，无开关；
 * - 已暂停：整卡灰度、右上角睡觉的朵朵、"已暂停 5 天"，开关为关；
 * - 已毕业：右上角缎带，底行起止日期与完成率，无开关。
 */
import { useRouter } from 'expo-router';
import { useRef, type ComponentRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { formatDotDate, formatDotMonthDay, formatMonthDay } from '@/domain/date';
import { projectsCopy } from '@/copy/project';
import type { ProjectSummary } from '@/services/queries';
import { overlay, type MenuItem } from '@/stores/overlayQueue';
import { AppText } from '@/ui/components/AppText';
import { CandySwitch } from '@/ui/components/CandySwitch';
import { projectColorOf } from '@/ui/components/ProjectBadge';
import { RollingNumber } from '@/ui/components/RollingNumber';
import { StickerCard } from '@/ui/components/StickerCard';
import { ProjectIcon } from '@/ui/icons/ProjectIcon';
import { Duoduo } from '@/ui/illustrations/Duoduo';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { inset, projectColors, space } from '@/ui/tokens';

import { deleteProject, pauseProject, resumeProject } from './projectActions';

const BAND = 40;

function unitLabel(unit: 'day' | 'week' | 'month' | 'days' | 'times', projectUnit: string): string {
  if (unit === 'week') return '周';
  if (unit === 'month') return '月';
  if (unit === 'times') return projectUnit;
  return '天';
}

function Stat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <View style={styles.stat}>
      <AppText variant="micro" tone="muted">
        {label}
      </AppText>
      <AppText variant="numberS">
        {value}
        {unit ? <AppText variant="caption" tone="secondary">{` ${unit}`}</AppText> : null}
      </AppText>
    </View>
  );
}

/** 花藤进度：一根藤上长着叶子，已走过的部分为项目深色 */
function Vine({ day, total, color, track }: { day: number; total: number; color: string; track: string }) {
  const ratio = total > 0 ? Math.min(1, day / total) : 0;
  return (
    <View style={styles.vineRow}>
      <View style={[styles.vine, { backgroundColor: track }]}>
        <View style={[styles.vineFill, { width: `${ratio * 100}%`, backgroundColor: color }]} />
        {[0.25, 0.5, 0.75].map((p) => (
          <View
            key={p}
            style={[styles.leaf, { left: `${p * 100}%`, backgroundColor: ratio >= p ? '#7EDCC2' : track }]}
          />
        ))}
      </View>
      <AppText variant="caption" tone="secondary">
        {projectsCopy.journey(day, total)}
      </AppText>
    </View>
  );
}

export function ProjectListCard({ summary }: { summary: ProjectSummary }) {
  const router = useRouter();
  const { colors } = useTheme();
  const anchor = useRef<ComponentRef<typeof View>>(null);
  const { project, status } = summary;
  const paused = status === 'paused';
  const graduated = status === 'graduated';
  const notStarted = status === 'notStarted';
  const color = paused ? projectColors.cloud : projectColorOf(project.colorId);

  const openMenu = () => {
    const items: MenuItem[] = [
      { label: projectsCopy.edit, icon: 'edit', onPress: () => router.push(`/project/${project.id}/edit`) },
    ];
    if (status === 'active')
      items.push({ label: projectsCopy.pause, icon: 'moon', onPress: () => pauseProject(project) });
    if (paused) items.push({ label: projectsCopy.resume, icon: 'sun', onPress: () => resumeProject(project) });
    items.push({
      label: projectsCopy.delete,
      icon: 'trash',
      destructive: true,
      onPress: () => void deleteProject(project),
    });
    anchor.current?.measureInWindow((_x: number, y: number, _w: number, h: number) =>
      overlay.openMenu(items, y + h / 3),
    );
  };

  let bigNumber: React.ReactNode;
  if (notStarted) {
    bigNumber = <AppText variant="numberM">{projectsCopy.startsIn(summary.daysUntilStart)}</AppText>;
  } else if (paused) {
    bigNumber = (
      <AppText variant="callout" tone="secondary">
        {summary.pausedDays > 0 ? projectsCopy.pausedFor(summary.pausedDays) : projectsCopy.pausedTomorrow}
      </AppText>
    );
  } else {
    bigNumber = (
      <View style={styles.bigNumber}>
        <RollingNumber value={summary.total.value} variant="numberL" />
        <AppText variant="caption" tone="secondary">
          {unitLabel(summary.total.unit, project.unit)}
        </AppText>
      </View>
    );
  }

  const rate = summary.rate.rate === null ? '—' : `${Math.round(summary.rate.rate * 100)}`;
  const footer = graduated
    ? `${formatDotDate(project.startDate)} – ${formatDotMonthDay(project.graduatedOn ?? project.endDate ?? project.startDate)} · 完成率 ${rate}${summary.rate.rate === null ? '' : '%'}`
    : `${paused ? projectsCopy.groupPaused : projectsCopy.statusActive} · ${projectsCopy.startedOn(formatDotDate(project.startDate))}`;

  return (
    <View ref={anchor} collapsable={false}>
      <StickerCard
        padding={0}
        onPress={() => router.push(`/project/${project.id}`)}
        onLongPress={openMenu}
        accessibilityLabel={project.name}
      >
        <View style={[styles.band, { backgroundColor: color.base }]} />
        <View style={styles.sticker}>
          <ProjectIcon id={project.iconId} size={56} sticker mono={paused} />
        </View>
        {paused ? (
          <View style={styles.corner} pointerEvents="none">
            <Duoduo size={52} mood="sleepy" pose="sleep" />
          </View>
        ) : null}
        {graduated ? (
          <View style={[styles.ribbon, { backgroundColor: colors.accent }]} pointerEvents="none">
            <AppText variant="micro" color="#3F2A33">
              {projectsCopy.graduatedRibbon}
            </AppText>
          </View>
        ) : null}

        <View style={styles.main}>
          <View style={styles.titleRow}>
            <View style={styles.titleText}>
              <AppText variant="title3" numberOfLines={1} tone={paused ? 'secondary' : 'primary'}>
                {project.name}
              </AppText>
              <AppText variant="caption" tone="secondary" numberOfLines={1}>
                {notStarted ? projectsCopy.startsOn(formatMonthDay(project.startDate)) : project.motto}
              </AppText>
            </View>
            {bigNumber}
          </View>

          {!notStarted ? (
            <View style={[styles.stats, { borderTopColor: colors.hairline }]}>
              <Stat
                label={projectsCopy.monthDone}
                value={String(summary.monthDone.value)}
                unit={unitLabel(summary.monthDone.unit, project.unit)}
              />
              <Stat
                label={projectsCopy.streak}
                value={String(summary.streak.current)}
                unit={unitLabel(summary.streak.unit, project.unit)}
              />
              <Stat label={projectsCopy.rate} value={rate} unit={summary.rate.rate === null ? undefined : '%'} />
            </View>
          ) : null}

          {summary.journey && !notStarted ? (
            <Vine day={summary.journey.day} total={summary.journey.total} color={color.deep} track={colors.weak} />
          ) : null}

          {!notStarted ? (
            <View style={styles.footer}>
              <AppText variant="caption" tone="muted" style={styles.footerText} numberOfLines={1}>
                {footer}
              </AppText>
              {!graduated ? (
                <CandySwitch
                  value={!paused}
                  onValueChange={(on) => (on ? resumeProject(project) : pauseProject(project))}
                  accessibilityLabel={paused ? projectsCopy.resume : projectsCopy.pause}
                />
              ) : null}
            </View>
          ) : null}
        </View>
      </StickerCard>
    </View>
  );
}

const styles = StyleSheet.create({
  band: { height: BAND },
  sticker: { position: 'absolute', left: inset.card, top: BAND - 28 },
  corner: { position: 'absolute', right: 6, top: 0 },
  ribbon: {
    position: 'absolute',
    right: -28,
    top: 12,
    width: 110,
    paddingVertical: 3,
    alignItems: 'center',
    transform: [{ rotate: '35deg' }],
  },
  main: { paddingHorizontal: inset.card, paddingBottom: inset.card, paddingTop: 34, gap: space.md },
  titleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: space.md },
  titleText: { flex: 1, gap: 2 },
  bigNumber: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  stats: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, paddingTop: space.md },
  stat: { flex: 1, gap: 2 },
  vineRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  vine: { flex: 1, height: 6, borderRadius: 3 },
  vineFill: { height: 6, borderRadius: 3 },
  leaf: {
    position: 'absolute',
    top: -4,
    width: 10,
    height: 7,
    borderTopLeftRadius: 7,
    borderBottomRightRadius: 7,
    marginLeft: -5,
  },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md },
  footerText: { flex: 1 },
});
