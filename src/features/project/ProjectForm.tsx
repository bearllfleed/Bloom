/**
 * 创建/编辑项目表单（第 1 期 1-3）：全屏模态，可下滑关闭；有改动时关闭先确认。
 * - 新建：模板芯片仅在名称为空时显示，点一下填好所有项；
 * - 选图标后，没手动选过颜色时颜色跟随图标分类的推荐色；
 * - 编辑：频率改动后提示"从今天起按新频率计算"；已毕业项目频率、日期、时长置灰。
 */
import { usePreventRemove } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatMonthDay } from '@/domain/date';
import { describeRule, durationLabel, isSameRule, type DurationPreset } from '@/domain/project';
import type { LocalDate, WeekStart } from '@/domain/types';
import { randomEncouragement } from '@/copy/encouragement';
import { confirmCopy, formCopy } from '@/copy/project';
import { templates, type ProjectTemplate } from '@/copy/templates';
import { haptics } from '@/platform/haptics';
import type { ProjectDraft, SaveError } from '@/services/projectService';
import { overlay } from '@/stores/overlayQueue';
import { AppText } from '@/ui/components/AppText';
import { CandySwitch } from '@/ui/components/CandySwitch';
import { CandyButton } from '@/ui/components/CandyButton';
import { Chip } from '@/ui/components/Chip';
import { ListRow } from '@/ui/components/ListRow';
import { projectColorOf } from '@/ui/components/ProjectBadge';
import { StickerCard } from '@/ui/components/StickerCard';
import { TextField } from '@/ui/components/TextField';
import { RoundIconButton } from '@/ui/components/TopBar';
import { Icon } from '@/ui/icons/Icon';
import { ProjectIcon } from '@/ui/icons/ProjectIcon';
import { useMotionReduced } from '@/ui/motion';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { PROJECT_COLOR_IDS, inset, radius, space } from '@/ui/tokens';

import { applyTemplate, isDraftDirty } from './draft';
import { FrequencySheet } from './FrequencySheet';
import { IconPickerSheet, recommendedColorOf } from './IconPickerSheet';
import { ScheduleSheet } from './ScheduleSheet';

export interface ProjectFormProps {
  mode: 'create' | 'edit';
  initial: ProjectDraft;
  today: LocalDate;
  weekStart: WeekStart;
  /** 编辑时：项目名（标题用）、是否已毕业、最早记录日期 */
  originalName?: string;
  graduated?: boolean;
  earliestRecord?: LocalDate | null;
  onSubmit: (draft: ProjectDraft) => { ok: true } | { ok: false; error: SaveError };
  onClose: () => void;
}

function ColorDots({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <View style={styles.dots}>
      {PROJECT_COLOR_IDS.map((id) => {
        const c = projectColorOf(id);
        const selected = id === value;
        return (
          <Pressable
            key={id}
            accessibilityRole="button"
            accessibilityLabel={c.name}
            accessibilityState={{ selected }}
            hitSlop={4}
            onPress={() => onChange(id)}
            style={[styles.dotRing, { borderColor: selected ? '#3F2A33' : 'transparent' }]}
          >
            <View style={[styles.dot, { backgroundColor: c.base }]}>
              {selected ? <Icon name="check" size={14} color="#3F2A33" /> : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ProjectForm({
  mode,
  initial,
  today,
  weekStart,
  originalName,
  graduated = false,
  earliestRecord = null,
  onSubmit,
  onClose,
}: ProjectFormProps) {
  const { colors, scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const reduced = useMotionReduced();
  const [draft, setDraft] = useState(initial);
  const [colorTouched, setColorTouched] = useState(mode === 'edit');
  const [nameError, setNameError] = useState<string | null>(null);
  const dice = useSharedValue(0);
  const color = projectColorOf(draft.colorId);
  const dirty = isDraftDirty(draft, initial);

  const disablePrevention = usePreventRemove(dirty, ({ repeat }) => {
    void overlay
      .confirm({
        title: confirmCopy.discardTitle,
        confirmLabel: confirmCopy.discardConfirm,
        cancelLabel: confirmCopy.discardCancel,
        destructive: true,
      })
      .then((discard) => {
        if (discard) repeat();
      });
  });

  const set = (patch: Partial<ProjectDraft>) => setDraft((d) => ({ ...d, ...patch }));

  const pickTemplate = (t: ProjectTemplate) => {
    haptics.selection();
    setDraft((d) => applyTemplate(d, t));
    setColorTouched(true);
    setNameError(null);
  };

  const locked = () => overlay.toast(formCopy.graduatedLocked);

  const openFrequency = () => {
    if (graduated) return locked();
    overlay.openSheet((close) => (
      <FrequencySheet
        rule={draft.rule}
        unit={draft.unit}
        weekStart={weekStart}
        onDone={(rule, unit) => {
          set({ rule, unit });
          close();
        }}
      />
    ));
  };

  const openSchedule = (focus: 'start' | 'duration') => {
    if (graduated) return locked();
    overlay.openSheet((close) => (
      <ScheduleSheet
        value={{
          startDate: draft.startDate,
          endDate: draft.endDate,
          durationPreset: (draft.durationPreset as DurationPreset | null) ?? (draft.endDate ? 'custom' : 'forever'),
        }}
        today={today}
        weekStart={weekStart}
        earliestRecord={earliestRecord}
        focus={focus}
        onDone={(v) => {
          set({ startDate: v.startDate, endDate: v.endDate, durationPreset: v.durationPreset });
          close();
        }}
      />
    ));
  };

  const openIcons = () => {
    overlay.openSheet((close) => (
      <IconPickerSheet
        value={draft.iconId}
        onPick={(iconId) => {
          const recommended = recommendedColorOf(iconId);
          setDraft((d) => ({ ...d, iconId, colorId: !colorTouched && recommended ? recommended : d.colorId }));
          close();
        }}
      />
    ));
  };

  const shuffle = () => {
    dice.value = 0;
    dice.value = withTiming(1, { duration: 300 });
    haptics.selection();
    set({ motto: randomEncouragement(draft.motto) });
  };
  const diceStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${dice.value * 360}deg` }] }));

  const submit = () => {
    if (draft.name.trim() === '') {
      setNameError(formCopy.nameEmpty);
      return;
    }
    const result = onSubmit(draft);
    if (!result.ok) {
      if (result.error === 'nameEmpty') setNameError(formCopy.nameEmpty);
      else if (result.error === 'startAfterRecords' && earliestRecord) {
        overlay.toast(formCopy.earliestRecord(formatMonthDay(earliestRecord)));
      }
      return;
    }
    disablePrevention();
    onClose();
  };

  const ruleChanged = mode === 'edit' && !isSameRule(draft.rule, initial.rule);
  const headTint = scheme === 'dark' ? `${color.base}33` : color.tint;
  const title = mode === 'create' ? formCopy.newTitle : formCopy.editTitle(originalName ?? draft.name);

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <RoundIconButton icon="close" label={formCopy.close} onPress={onClose} />
        <AppText variant="title2" numberOfLines={1} style={styles.title}>
          {title}
        </AppText>
        <View style={styles.topSpacer} />
      </View>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={12}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={[styles.head, { backgroundColor: headTint }]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={formCopy.changeIcon}
              onPress={openIcons}
              style={styles.iconButton}
            >
              <Animated.View key={draft.iconId} entering={reduced ? undefined : FadeInUp.springify().damping(14)}>
                <ProjectIcon id={draft.iconId} size={88} sticker />
              </Animated.View>
              <AppText variant="caption" tone="link">
                {formCopy.changeIcon}
              </AppText>
            </Pressable>
            <ColorDots
              value={draft.colorId}
              onChange={(colorId) => {
                haptics.selection();
                setColorTouched(true);
                set({ colorId });
              }}
            />
          </View>

          <TextField
            value={draft.name}
            onChangeText={(name) => {
              set({ name });
              if (nameError && name.trim()) setNameError(null);
            }}
            maxLength={formCopy.nameMax}
            countFrom={15}
            placeholder={formCopy.namePlaceholder}
            large
            textAlign="center"
            error={nameError}
            returnKeyType="done"
          />

          {mode === 'create' && draft.name === '' ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.templates}>
              {templates.map((t) => (
                <Chip key={t.id} label={t.name} onPress={() => pickTemplate(t)} />
              ))}
            </ScrollView>
          ) : null}

          <StickerCard padding={0}>
            <ListRow
              icon="repeat"
              label={formCopy.frequency}
              value={describeRule(draft.rule, draft.unit)}
              onPress={openFrequency}
              disabled={graduated}
              hint={ruleChanged ? formCopy.ruleChangeHint : undefined}
            />
            <ListRow
              icon="calendar"
              label={formCopy.startDate}
              value={draft.startDate === today ? '今天' : formatMonthDay(draft.startDate)}
              onPress={() => openSchedule('start')}
              disabled={graduated}
              showDivider
            />
            <ListRow
              icon="hourglass"
              label={formCopy.duration}
              value={durationLabel(
                (draft.durationPreset as DurationPreset | null) ?? null,
                draft.startDate,
                draft.endDate,
              )}
              onPress={() => openSchedule('duration')}
              disabled={graduated}
              showDivider
            />
          </StickerCard>

          <StickerCard>
            <View style={styles.mottoHead}>
              <Icon name="note" size={22} />
              <AppText variant="body" style={styles.flex}>
                {formCopy.motto}
              </AppText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={formCopy.shuffle}
                onPress={shuffle}
                hitSlop={8}
                style={styles.shuffle}
              >
                <Animated.View style={diceStyle}>
                  <Icon name="dice" size={20} color={colors.link} />
                </Animated.View>
                <AppText variant="callout" tone="link">
                  {formCopy.shuffle}
                </AppText>
              </Pressable>
            </View>
            <Animated.View
              key={draft.motto}
              entering={reduced ? undefined : FadeInUp.duration(200)}
              exiting={FadeOutUp.duration(120)}
            >
              <TextField
                value={draft.motto}
                onChangeText={(motto) => set({ motto })}
                maxLength={formCopy.mottoMax}
                countFrom={0}
              />
            </Animated.View>
          </StickerCard>

          <StickerCard padding={0}>
            <ListRow
              icon="edit"
              label={formCopy.note}
              right={
                <CandySwitch
                  value={draft.noteEnabled}
                  onValueChange={(noteEnabled) => set({ noteEnabled })}
                  accessibilityLabel={formCopy.note}
                />
              }
            />
          </StickerCard>
        </ScrollView>
        <View style={[styles.footer, { paddingBottom: insets.bottom + 12, backgroundColor: colors.background }]}>
          <CandyButton label={mode === 'create' ? formCopy.create : formCopy.save} onPress={submit} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  topBar: { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: inset.page },
  title: { flex: 1, textAlign: 'center' },
  topSpacer: { width: 40 },
  content: { padding: inset.page, gap: space.lg, paddingBottom: space.xxl },
  head: { borderRadius: radius.card, padding: space.lg, alignItems: 'center', gap: space.md },
  iconButton: { alignItems: 'center', gap: space.xs },
  dots: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 },
  dotRing: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  templates: { gap: space.sm },
  mottoHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: space.md },
  shuffle: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footer: { paddingHorizontal: inset.page, paddingTop: 12 },
});
