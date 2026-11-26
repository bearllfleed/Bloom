/**
 * 统计页：总览、月、年。没有记录时请人先去打卡。
 */
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { addMonths, formatMonthDay, formatYearMonth, parseLocalDate, startOfMonth, weekdayChar } from '@/domain/date';
import type { LocalDate } from '@/domain/types';
import { statsCopy } from '@/copy/phase2';
import { useLiveQuery } from '@/features/common/useLiveQuery';
import { TodayCard } from '@/features/today/TodayCard';
import { getDayView } from '@/services/queries';
import {
  daysInYearSoFar,
  getMonthStats,
  getOverview,
  getYearStats,
  heatOfYear,
  monthCells,
  statsBounds,
  type HeatCell,
} from '@/services/statsQuery';
import { overlay } from '@/stores/overlayQueue';
import { usePrefs } from '@/stores/prefsStore';
import { AppText } from '@/ui/components/AppText';
import { EmptyState } from '@/ui/components/EmptyState';
import { FlowerMark } from '@/ui/components/FlowerMark';
import { projectColorOf } from '@/ui/components/ProjectBadge';
import { SegmentedControl } from '@/ui/components/SegmentedControl';
import { StatTile } from '@/ui/components/StatTile';
import { StickerCard } from '@/ui/components/StickerCard';
import { ProjectIcon } from '@/ui/icons/ProjectIcon';
import { Icon } from '@/ui/icons/Icon';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { heatColors, inset, radius, space } from '@/ui/tokens';

type Tab = 'overview' | 'month' | 'year';

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

function percent(rate: number | null): string {
  return rate === null ? '—' : `${Math.round(rate * 100)}%`;
}

function openDay(date: LocalDate) {
  overlay.openSheet(() => <DayList date={date} />);
}

function DayList({ date }: { date: LocalDate }) {
  const view = useLiveQuery(() => getDayView(date), [date]);
  return (
    <View style={styles.dayList}>
      <AppText variant="title3">{formatMonthDay(date)}</AppText>
      {view.items.map((item) => (
        <TodayCard key={item.project.id} item={item} date={date} today={view.today} />
      ))}
      {view.items.length === 0 ? (
        <AppText variant="callout" tone="muted">
          这天没有安排
        </AppText>
      ) : null}
    </View>
  );
}

export function StatsView() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('overview');
  const weekStart = usePrefs((s) => s.weekStart);
  const bounds = useLiveQuery(statsBounds, [weekStart]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <AppText variant="title1">{statsCopy.title}</AppText>
        <Pressable accessibilityRole="button" hitSlop={8} onPress={() => router.push('/history')}>
          <AppText variant="callout" tone="link">
            {statsCopy.records}
          </AppText>
        </Pressable>
      </View>
      {!bounds.hasRecords ? (
        <EmptyState
          message={statsCopy.empty}
          mood="expectant"
          pose="seed"
          actionLabel={statsCopy.emptyAction}
          onAction={() => router.push('/')}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <SegmentedControl
            options={[
              { value: 'overview', label: statsCopy.overview },
              { value: 'month', label: statsCopy.month },
              { value: 'year', label: statsCopy.year },
            ]}
            value={tab}
            onChange={setTab}
          />
          {tab === 'overview' ? <Overview /> : null}
          {tab === 'month' ? <MonthPanel min={bounds.min} max={bounds.max} today={bounds.today} /> : null}
          {tab === 'year' ? <YearPanel today={bounds.today} min={bounds.min} /> : null}
        </ScrollView>
      )}
    </View>
  );
}

function Overview() {
  const weekStart = usePrefs((s) => s.weekStart);
  const data = useLiveQuery(getOverview, [weekStart]);
  const { year } = parseLocalDate(data.today);
  const place = daysInYearSoFar(data.today);
  const [caption, setCaption] = useState<string | null>(null);
  const heat = useLiveQuery(() => heatOfYear(year), [year, weekStart]);
  const maxWeek = Math.max(1, ...data.weeks.map((point) => point.count));

  return (
    <View style={styles.stack}>
      <StickerCard>
        <View style={styles.tiles}>
          <StatTile label={statsCopy.active} value={data.active} unit={statsCopy.unitCount} size="M" />
          <StatTile label={statsCopy.recordDays} value={data.recordDays} unit={statsCopy.unitDay} size="M" />
          <StatTile label={statsCopy.total} value={data.total} unit={statsCopy.unitTimes} size="M" />
          <StatTile label={statsCopy.best} value={data.best} unit={statsCopy.unitDay} size="M" />
        </View>
      </StickerCard>
      <AppText variant="caption" tone="secondary">
        {year} · 第 {place.week} 周 · 第 {place.day} 天 · 还剩 {place.left} 天
      </AppText>
      <StickerCard>
        <AppText variant="title3">{statsCopy.garden}</AppText>
        <YearHeat
          rows={heat}
          onPick={(cell) =>
            cell.planned > 0 &&
            setCaption(statsCopy.heatCaption(formatMonthDay(cell.date), cell.completed, cell.planned))
          }
        />
        {caption ? (
          <AppText variant="caption" tone="secondary">
            {caption}
          </AppText>
        ) : null}
        <View style={styles.legend}>
          <AppText variant="micro" tone="muted">
            少
          </AppText>
          {[0, 1, 2, 3, 4].map((level) => (
            <LegendDot key={level} level={level} />
          ))}
          <AppText variant="micro" tone="muted">
            多
          </AppText>
        </View>
      </StickerCard>
      <StickerCard>
        <AppText variant="title3">{statsCopy.weeks}</AppText>
        <View style={styles.bars}>
          {data.weeks.map((point) => (
            <Pressable
              key={point.start}
              accessibilityLabel={statsCopy.weekPoint(point.week, point.count)}
              style={styles.barCol}
              onPress={() => setCaption(statsCopy.weekPoint(point.week, point.count))}
            >
              <View style={[styles.bar, { height: 8 + (point.count / maxWeek) * 72 }]} />
            </Pressable>
          ))}
        </View>
      </StickerCard>
      <StickerCard>
        <AppText variant="title3">{statsCopy.habit}</AppText>
        {data.habit ? (
          <>
            <AppText variant="callout">{statsCopy.busiestDay(WEEKDAYS[data.habit.peakWeekday - 1])}</AppText>
            <View style={styles.bars}>
              {data.habit.weekdayCounts.map((count, index) => {
                const max = Math.max(1, ...data.habit!.weekdayCounts);
                const peak = index + 1 === data.habit!.peakWeekday;
                return (
                  <View key={WEEKDAYS[index]} style={styles.barCol}>
                    <View style={[styles.habitBar, { height: 8 + (count / max) * 56 }, peak && styles.habitPeak]} />
                    <AppText variant="micro" tone="muted">
                      {WEEKDAYS[index]}
                    </AppText>
                  </View>
                );
              })}
            </View>
            <AppText variant="callout" tone="secondary">
              最常在{data.habit.peakHourLabel}打卡
            </AppText>
          </>
        ) : (
          <AppText variant="callout" tone="muted">
            {statsCopy.habitEmpty}
          </AppText>
        )}
      </StickerCard>
    </View>
  );
}

function YearHeat({ rows, onPick }: { rows: (HeatCell | null)[][]; onPick: (cell: HeatCell) => void }) {
  const { scheme } = useTheme();
  const { width } = useWindowDimensions();
  const cell = Math.max(6, Math.floor((width - inset.page * 2 - 36 - 30) / 31));
  const colors = heatColors[scheme];
  return (
    <View style={styles.heat}>
      {rows.map((row, month) => (
        <View key={month} style={styles.heatRow}>
          <AppText variant="micro" tone="muted" style={styles.monthLabel}>
            {month + 1}月
          </AppText>
          {row.map((item, day) => {
            if (!item) return <View key={day} style={{ width: cell, height: cell }} />;
            const perfect = item.perfect;
            return (
              <Pressable
                key={item.date}
                onPress={() => onPick(item)}
                style={[
                  styles.heatCell,
                  {
                    width: cell,
                    height: cell,
                    backgroundColor: item.level === null ? 'transparent' : colors[item.level],
                  },
                ]}
              >
                {perfect ? <FlowerMark mark="bloom" size={cell} /> : null}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

function LegendDot({ level }: { level: number }) {
  const { scheme } = useTheme();
  return <View style={[styles.legendDot, { backgroundColor: heatColors[scheme][level] }]} />;
}

function MonthPanel({ min, max, today }: { min: LocalDate; max: LocalDate; today: LocalDate }) {
  const [month, setMonth] = useState(startOfMonth(today));
  const weekStart = usePrefs((s) => s.weekStart);
  const stats = useLiveQuery(() => getMonthStats(month), [month, weekStart]);
  const cells = useLiveQuery(() => monthCells(month), [month, weekStart]);
  const canPrev = month > min;
  const canNext = month < max;
  const delta =
    stats.rate !== null && stats.previousRate !== null
      ? Math.round(stats.rate * 100) - Math.round(stats.previousRate * 100)
      : null;
  const header = weekStart === 1 ? [1, 2, 3, 4, 5, 6, 7] : [7, 1, 2, 3, 4, 5, 6];

  return (
    <View style={styles.stack}>
      <View style={styles.switcher}>
        <Arrow enabled={canPrev} name="chevron-left" label="上个月" onPress={() => setMonth(addMonths(month, -1))} />
        <AppText variant="title3">{formatYearMonth(month)}</AppText>
        <Arrow enabled={canNext} name="chevron-right" label="下个月" onPress={() => setMonth(addMonths(month, 1))} />
      </View>
      <StickerCard>
        <View style={styles.weekHead}>
          {header.map((day) => (
            <AppText key={day} variant="micro" tone="muted" style={styles.weekCell}>
              {weekdayChar(day)}
            </AppText>
          ))}
        </View>
        <View style={styles.weekHead}>
          {cells.map((cell) => (
            <Pressable
              key={cell.date}
              disabled={!cell.inMonth}
              onPress={() => openDay(cell.date)}
              style={styles.monthCell}
            >
              <AppText variant="micro" tone={cell.inMonth ? (cell.isToday ? 'link' : 'primary') : 'muted'}>
                {cell.inMonth ? Number(cell.date.slice(8)) : ''}
              </AppText>
              {cell.inMonth && cell.overview && cell.overview.planned > 0 && !cell.isFuture ? (
                cell.overview.isPerfect ? (
                  <FlowerMark mark="bloom" size={12} />
                ) : (
                  <AppText variant="micro" tone="muted">
                    {cell.overview.completed}/{cell.overview.planned}
                  </AppText>
                )
              ) : (
                <View style={styles.markSpace} />
              )}
            </Pressable>
          ))}
        </View>
      </StickerCard>
      <StickerCard>
        <View style={styles.tiles}>
          <StatTile label={statsCopy.monthCheckins} value={stats.checkinDays} unit={statsCopy.unitDay} size="M" />
          <StatTile label={statsCopy.perfect} value={stats.perfectDays} unit={statsCopy.unitDay} size="M" />
          <View style={styles.rateTile}>
            <AppText variant="caption" tone="secondary">
              {statsCopy.rate}
            </AppText>
            <AppText variant="numberM">{percent(stats.rate)}</AppText>
            {delta !== null && delta !== 0 ? (
              <AppText variant="micro" tone={delta > 0 ? 'success' : 'warning'}>
                {statsCopy.vsLast(delta)}
              </AppText>
            ) : null}
          </View>
        </View>
      </StickerCard>
      <Ranking items={stats.ranking} />
      {stats.streak || stats.busiest ? (
        <StickerCard>
          <AppText variant="title3">{statsCopy.highlight}</AppText>
          {stats.streak ? (
            <AppText variant="callout">
              最长连续 {stats.streak.length} 天 · {stats.streak.name}（{formatMonthDay(stats.streak.from)}–
              {formatMonthDay(stats.streak.to)}）
            </AppText>
          ) : null}
          {stats.busiest ? (
            <AppText variant="callout" tone="secondary">
              最勤快的一天 · {formatMonthDay(stats.busiest.date)}，完成 {stats.busiest.count} 次
            </AppText>
          ) : null}
        </StickerCard>
      ) : null}
    </View>
  );
}

function YearPanel({ today, min }: { today: LocalDate; min: LocalDate }) {
  const [year, setYear] = useState(parseLocalDate(today).year);
  const weekStart = usePrefs((s) => s.weekStart);
  const stats = useLiveQuery(() => getYearStats(year), [year, weekStart]);
  const heat = useLiveQuery(() => heatOfYear(year), [year, weekStart]);
  const minYear = parseLocalDate(min).year;
  const maxYear = parseLocalDate(today).year;
  const maxDays = Math.max(1, ...stats.months.map((item) => item.days));
  const { colors } = useTheme();

  return (
    <View style={styles.stack}>
      <View style={styles.switcher}>
        <Arrow enabled={year > minYear} name="chevron-left" label="上一年" onPress={() => setYear(year - 1)} />
        <AppText variant="title3">{year}</AppText>
        <Arrow enabled={year < maxYear} name="chevron-right" label="下一年" onPress={() => setYear(year + 1)} />
      </View>
      <StickerCard>
        <View style={styles.bars}>
          {stats.months.map((item) => (
            <View key={item.month} style={styles.barCol}>
              <View
                style={[
                  styles.yearBar,
                  { height: 8 + (item.days / maxDays) * 80 },
                  item.month === parseLocalDate(today).month && year === maxYear
                    ? { backgroundColor: colors.primary }
                    : { backgroundColor: colors.accentSoft },
                ]}
              />
              <AppText variant="micro" tone="muted">
                {item.month}
              </AppText>
            </View>
          ))}
        </View>
      </StickerCard>
      <StickerCard>
        <View style={styles.tiles}>
          <StatTile label={statsCopy.recordDays} value={stats.recordDays} unit={statsCopy.unitDay} size="M" />
          <StatTile label={statsCopy.total} value={stats.total} unit={statsCopy.unitTimes} size="M" />
          <StatTile label={statsCopy.perfect} value={stats.perfect} unit={statsCopy.unitDay} size="M" />
          <StatTile label={statsCopy.graduated} value={stats.graduated} unit={statsCopy.unitCount} size="M" />
        </View>
      </StickerCard>
      <StickerCard>
        <StatTile label="获得徽章" value={stats.achievements} unit="枚" size="M" />
      </StickerCard>
      <Ranking items={stats.ranking} />
      <StickerCard>
        <AppText variant="title3">{year} 的花园</AppText>
        <YearHeat rows={heat} onPick={() => undefined} />
      </StickerCard>
    </View>
  );
}

function Ranking({ items }: { items: { id: string; name: string; iconId: string; colorId: string; rate: number }[] }) {
  if (items.length === 0) return null;
  return (
    <StickerCard>
      <AppText variant="title3">{statsCopy.ranking}</AppText>
      {items.map((item) => {
        const color = projectColorOf(item.colorId);
        return (
          <View key={item.id} style={styles.rank}>
            <ProjectIcon id={item.iconId} size={28} sticker />
            <View style={styles.rankBody}>
              <AppText variant="callout" numberOfLines={1}>
                {item.name}
              </AppText>
              <View style={styles.track}>
                <View
                  style={[styles.fill, { width: `${Math.round(item.rate * 100)}%`, backgroundColor: color.deep }]}
                />
              </View>
            </View>
            <AppText variant="callout">{percent(item.rate)}</AppText>
          </View>
        );
      })}
    </StickerCard>
  );
}

function Arrow({
  enabled,
  name,
  label,
  onPress,
}: {
  enabled: boolean;
  name: 'chevron-left' | 'chevron-right';
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={!enabled}
      onPress={onPress}
      style={{ opacity: enabled ? 1 : 0.3 }}
    >
      <Icon name={name} size={22} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: inset.page,
    paddingBottom: space.sm,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  content: { padding: inset.page, gap: space.lg, paddingBottom: space.giant },
  stack: { gap: space.lg },
  tiles: { flexDirection: 'row', gap: space.sm },
  heat: { gap: 2, marginTop: space.sm },
  heatRow: { flexDirection: 'row', alignItems: 'center', gap: 1 },
  monthLabel: { width: 28 },
  heatCell: { borderRadius: 2, alignItems: 'center', justifyContent: 'center' },
  legend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 3, marginTop: space.sm },
  legendDot: { width: 8, height: 8, borderRadius: 2 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 100, marginTop: space.sm },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  bar: { width: 8, borderRadius: 4, backgroundColor: '#FFB3CF' },
  habitBar: { width: 8, borderRadius: 4, backgroundColor: '#FFD9E7' },
  habitPeak: { backgroundColor: '#FF7BA9' },
  yearBar: { width: 10, borderRadius: 4 },
  switcher: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  weekHead: { flexDirection: 'row', flexWrap: 'wrap' },
  weekCell: { width: `${100 / 7}%`, textAlign: 'center' },
  monthCell: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 4, gap: 2 },
  markSpace: { height: 12 },
  rateTile: { flex: 1, gap: 2 },
  rank: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.sm },
  rankBody: { flex: 1, gap: 4 },
  track: { height: 6, borderRadius: radius.small, backgroundColor: '#F5EEF1', overflow: 'hidden' },
  fill: { height: 6, borderRadius: radius.small },
  dayList: { gap: space.sm, paddingBottom: space.md },
});
