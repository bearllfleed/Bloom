/**
 * 偏好设置：周起始、一天的结束、首页日历、触感和音效。
 */
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { DayEndHour } from '@/domain/date';
import { prefsCopy } from '@/copy/phase2';
import { reminderService } from '@/services/reminderService';
import { usePrefs, type CalendarHome } from '@/stores/prefsStore';
import { AppText } from '@/ui/components/AppText';
import { CandySwitch } from '@/ui/components/CandySwitch';
import { DotPaper } from '@/ui/components/DotPaper';
import { SegmentedControl } from '@/ui/components/SegmentedControl';
import { StickerCard } from '@/ui/components/StickerCard';
import { TopBar } from '@/ui/components/TopBar';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { inset, space } from '@/ui/tokens';

const DAY_ENDS: DayEndHour[] = [0, 1, 2, 3, 4];

export default function PreferencesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const prefs = usePrefs();

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingBottom: insets.bottom }]}>
      <TopBar title={prefsCopy.title} onBack={() => router.back()} />
      <DotPaper>
        <ScrollView contentContainerStyle={styles.content}>
          <StickerCard>
            <AppText variant="body">{prefsCopy.weekStart}</AppText>
            <SegmentedControl
              options={[
                { value: '1', label: prefsCopy.monday },
                { value: '7', label: prefsCopy.sunday },
              ]}
              value={String(prefs.weekStart)}
              onChange={(value) => prefs.update({ weekStart: value === '7' ? 7 : 1 })}
            />
            <AppText variant="caption" tone="secondary">
              {prefsCopy.weekHint}
            </AppText>
          </StickerCard>

          <StickerCard>
            <AppText variant="body">{prefsCopy.dayEnd}</AppText>
            <View style={styles.hours}>
              {DAY_ENDS.map((hour) => {
                const selected = prefs.dayEndHour === hour;
                return (
                  <AppText
                    key={hour}
                    variant="callout"
                    tone={selected ? 'link' : 'secondary'}
                    onPress={() => prefs.update({ dayEndHour: hour })}
                    accessibilityRole="button"
                    style={[styles.hour, selected && { backgroundColor: colors.accentSofter }]}
                  >
                    {hour}:00
                  </AppText>
                );
              })}
            </View>
            {prefs.dayEndHour !== 0 ? (
              <AppText variant="caption" tone="secondary">
                {prefsCopy.dayEndHint}
              </AppText>
            ) : null}
          </StickerCard>

          <StickerCard>
            <AppText variant="body">{prefsCopy.calendar}</AppText>
            <SegmentedControl
              options={[
                { value: 'remember', label: prefsCopy.remember },
                { value: 'month', label: prefsCopy.month },
                { value: 'week', label: prefsCopy.week },
              ]}
              value={prefs.calendarHome}
              onChange={(value) => {
                const home = value as CalendarHome;
                prefs.update(home === 'remember' ? { calendarHome: home } : { calendarHome: home, calendarMode: home });
              }}
            />
          </StickerCard>

          <StickerCard>
            <View style={styles.flag}>
              <AppText variant="body" style={styles.flex}>
                {prefsCopy.haptics}
              </AppText>
              <CandySwitch
                value={prefs.haptics}
                accessibilityLabel={prefsCopy.haptics}
                onValueChange={(haptics) => prefs.update({ haptics })}
              />
            </View>
            <View style={styles.flag}>
              <AppText variant="body" style={styles.flex}>
                {prefsCopy.sound}
              </AppText>
              <CandySwitch
                value={prefs.sound}
                accessibilityLabel={prefsCopy.sound}
                onValueChange={(sound) => {
                  prefs.update({ sound });
                  reminderService.kick();
                }}
              />
            </View>
          </StickerCard>
        </ScrollView>
      </DotPaper>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: inset.page, gap: space.md, paddingBottom: space.giant },
  hours: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  hour: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, overflow: 'hidden' },
  flag: { flexDirection: 'row', alignItems: 'center', minHeight: 44 },
  flex: { flex: 1 },
});
