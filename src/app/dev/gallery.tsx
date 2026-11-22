/**
 * 组件陈列页（第 0 期 2.2）：逐个展示基础组件全部状态，支持深色预览与减弱动态预览。
 */
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { overlay } from '@/stores/overlayQueue';
import { usePrefs } from '@/stores/prefsStore';
import { AppText } from '@/ui/components/AppText';
import { BloomButton } from '@/ui/components/BloomButton';
import { CandyButton } from '@/ui/components/CandyButton';
import { CandySwitch } from '@/ui/components/CandySwitch';
import { Chip } from '@/ui/components/Chip';
import { DayCell } from '@/ui/components/DayCell';
import { EmptyState } from '@/ui/components/EmptyState';
import { SegmentedControl } from '@/ui/components/SegmentedControl';
import { StatTile } from '@/ui/components/StatTile';
import { Stepper } from '@/ui/components/Stepper';
import { StickerCard } from '@/ui/components/StickerCard';
import { TextField } from '@/ui/components/TextField';
import { TopBar } from '@/ui/components/TopBar';
import { ProjectIcon } from '@/ui/icons/ProjectIcon';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { inset, projectColors, space } from '@/ui/tokens';

type Section = 'colors' | 'buttons' | 'bloom' | 'forms' | 'calendar' | 'cards' | 'overlays';

const SECTIONS: { value: Section; label: string }[] = [
  { value: 'colors', label: '颜色' },
  { value: 'buttons', label: '按钮' },
  { value: 'bloom', label: '花苞' },
  { value: 'forms', label: '表单' },
  { value: 'calendar', label: '日期' },
  { value: 'cards', label: '卡片' },
  { value: 'overlays', label: '弹层' },
];

function SectionTitle({ children }: { children: string }) {
  return (
    <AppText variant="title3" style={styles.sectionTitle}>
      {children}
    </AppText>
  );
}

export default function GalleryScreen() {
  const { colors, scheme } = useTheme();
  const router = useRouter();
  const appearance = usePrefs((s) => s.appearance);
  const reduce = usePrefs((s) => s.devReduceMotion);
  const update = usePrefs((s) => s.update);
  const [section, setSection] = useState<Section>('bloom');
  const [bloomDone, setBloomDone] = useState(0);
  const [switchOn, setSwitchOn] = useState(true);
  const [step, setStep] = useState(3);
  const [chip, setChip] = useState('一');
  const [text, setText] = useState('');
  const strawberry = projectColors.strawberry;

  const swatches = useMemo(
    () =>
      (
        [
          ['background', colors.background],
          ['card', colors.card],
          ['text', colors.text],
          ['link', colors.link],
          ['primary', colors.primary],
          ['accent', colors.accent],
          ['weak', colors.weak],
        ] as const
      ).map(([name, value]) => ({ name, value })),
    [colors],
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <TopBar title="组件陈列" onBack={() => router.back()} />
      <View style={styles.toggles}>
        <View style={styles.toggleRow}>
          <AppText variant="callout">深色预览</AppText>
          <CandySwitch
            value={appearance === 'dark' || (appearance === 'system' && scheme === 'dark')}
            onValueChange={(on) => update({ appearance: on ? 'dark' : 'light' })}
            accessibilityLabel="深色预览"
          />
        </View>
        <View style={styles.toggleRow}>
          <AppText variant="callout">减弱动态预览</AppText>
          <CandySwitch
            value={reduce}
            onValueChange={(on) => update({ devReduceMotion: on })}
            accessibilityLabel="减弱动态预览"
          />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {SECTIONS.map((item) => (
          <Chip
            key={item.value}
            label={item.label}
            selected={section === item.value}
            onPress={() => setSection(item.value)}
          />
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content}>
        {section === 'colors' ? (
          <>
            <SectionTitle>语义色</SectionTitle>
            <View style={styles.swatchRow}>
              {swatches.map((s) => (
                <View key={s.name} style={styles.swatch}>
                  <View style={[styles.swatchBlock, { backgroundColor: s.value, borderColor: colors.hairline }]} />
                  <AppText variant="micro" tone="muted">
                    {s.name}
                  </AppText>
                </View>
              ))}
            </View>
            <SectionTitle>项目色</SectionTitle>
            <View style={styles.swatchRow}>
              {Object.entries(projectColors).map(([id, c]) => (
                <View key={id} style={styles.swatch}>
                  <View style={[styles.swatchBlock, { backgroundColor: c.base }]} />
                  <AppText variant="micro" tone="muted">
                    {c.name}
                  </AppText>
                </View>
              ))}
            </View>
          </>
        ) : null}

        {section === 'buttons' ? (
          <>
            <SectionTitle>糖果按钮</SectionTitle>
            <CandyButton label="种下它" onPress={() => overlay.toast('点了主按钮')} />
            <CandyButton label="次按钮" variant="secondary" onPress={() => undefined} />
            <CandyButton label="文字按钮" variant="text" onPress={() => undefined} />
            <CandyButton label="危险" variant="danger" onPress={() => undefined} />
            <CandyButton label="禁用" disabled onPress={() => undefined} />
            <CandyButton label="加载中" loading onPress={() => undefined} />
          </>
        ) : null}

        {section === 'bloom' ? (
          <>
            <SectionTitle>花苞按钮</SectionTitle>
            <View style={styles.bloomRow}>
              <BloomButton
                completed={false}
                color={strawberry.base}
                deepColor={strawberry.deep}
                onPress={() => setBloomDone(1)}
                accessibilityLabel="待打卡"
              />
              <BloomButton
                completed={false}
                segments={{ done: 1, total: 3 }}
                color={strawberry.base}
                deepColor={strawberry.deep}
                onPress={() => setBloomDone(2)}
                accessibilityLabel="1/3"
              />
              <BloomButton
                completed={false}
                segments={{ done: 2, total: 3 }}
                color={strawberry.base}
                deepColor={strawberry.deep}
                onPress={() => setBloomDone(3)}
                accessibilityLabel="2/3"
              />
              <BloomButton
                completed
                segments={{ done: 3, total: 3 }}
                color={strawberry.base}
                deepColor={strawberry.deep}
                onPress={() => setBloomDone(0)}
                accessibilityLabel="已完成"
              />
              <BloomButton
                completed={false}
                color={strawberry.base}
                deepColor={strawberry.deep}
                disabled
                onDisabledPress={() => overlay.toast('今天还不能打卡')}
                accessibilityLabel="不可打卡"
              />
            </View>
            <View style={styles.row}>
              <CandyButton
                label="重播绽放"
                size="sm"
                variant="secondary"
                onPress={() => setBloomDone((n) => (n >= 3 ? 0 : 3))}
                style={styles.flex}
              />
              <CandyButton
                label="重播撤销"
                size="sm"
                variant="secondary"
                onPress={() => setBloomDone(0)}
                style={styles.flex}
              />
            </View>
            <BloomButton
              completed={bloomDone >= 3}
              segments={{ done: Math.min(bloomDone, 3), total: 3 }}
              color={strawberry.base}
              deepColor={strawberry.deep}
              onPress={() => setBloomDone((n) => Math.min(3, n + 1))}
              accessibilityLabel={`演示 ${bloomDone}/3`}
            />
          </>
        ) : null}

        {section === 'forms' ? (
          <>
            <SectionTitle>分段 / 开关 / 步进</SectionTitle>
            <SegmentedControl
              options={[
                { value: 'week', label: '周' },
                { value: 'month', label: '月' },
              ]}
              value="week"
              onChange={() => undefined}
            />
            <View style={styles.toggleRow}>
              <AppText variant="body">开关</AppText>
              <CandySwitch value={switchOn} onValueChange={setSwitchOn} accessibilityLabel="演示开关" />
            </View>
            <Stepper value={step} min={1} max={10} onChange={setStep} unit="次" accessibilityLabel="演示次数" />
            <SectionTitle>芯片</SectionTitle>
            <View style={styles.row}>
              {['一', '二', '三', '四', '五'].map((d) => (
                <Chip key={d} label={d} selected={chip === d} onPress={() => setChip(d)} square />
              ))}
            </View>
            <SectionTitle>输入框</SectionTitle>
            <TextField value={text} onChangeText={setText} maxLength={20} placeholder="给它起个名字" />
          </>
        ) : null}

        {section === 'calendar' ? (
          <>
            <SectionTitle>日期格</SectionTitle>
            <View style={styles.row}>
              <DayCell day={8} mark="none" accessibilityLabel="普通" onPress={() => undefined} />
              <DayCell day={9} mark="dot" isToday accessibilityLabel="今天" onPress={() => undefined} />
              <DayCell day={10} mark="bud" isSelected accessibilityLabel="选中" onPress={() => undefined} />
              <DayCell
                day={11}
                mark="bloom"
                isOutsideMonth
                flowerColor={strawberry.base}
                accessibilityLabel="非本月"
                onPress={() => undefined}
              />
              <DayCell day={12} mark="none" isFuture accessibilityLabel="未来" onPress={() => undefined} />
            </View>
            <SectionTitle>数据块</SectionTitle>
            <View style={styles.row}>
              <StatTile label="连续" value={12} unit="天" />
              <StatTile label="完成率" value={86} unit="%" size="M" />
            </View>
          </>
        ) : null}

        {section === 'cards' ? (
          <>
            <SectionTitle>贴纸卡片</SectionTitle>
            <StickerCard onPress={() => overlay.toast('点了卡片')} accessibilityLabel="演示卡片">
              <View style={styles.cardInner}>
                <ProjectIcon id="health/water-cup" size={44} sticker />
                <View style={{ flex: 1, gap: 4 }}>
                  <AppText variant="title3">每天喝水</AppText>
                  <AppText variant="caption" tone="secondary">
                    今天 2/8 杯
                  </AppText>
                </View>
              </View>
            </StickerCard>
            <SectionTitle>空状态</SectionTitle>
            <EmptyState message="还没有种下任何习惯" actionLabel="种下一颗" onAction={() => overlay.toast('去创建')} />
          </>
        ) : null}

        {section === 'overlays' ? (
          <>
            <SectionTitle>弹层队列</SectionTitle>
            <CandyButton
              label="撤销条"
              variant="secondary"
              onPress={() =>
                overlay.toast('已撤销打卡', { actionLabel: '恢复', onAction: () => overlay.toast('已恢复') })
              }
            />
            <CandyButton
              label="确认框"
              variant="secondary"
              onPress={() =>
                void overlay.confirm({
                  title: '删掉这个项目？',
                  message: '打卡记录会一起清掉，删了就回不来了',
                  confirmLabel: '删掉',
                  cancelLabel: '留着',
                  destructive: true,
                })
              }
            />
            <CandyButton
              label="底部面板"
              variant="secondary"
              onPress={() =>
                overlay.openSheet((close) => (
                  <View style={{ padding: 24, gap: 12 }}>
                    <AppText variant="title3">底部面板</AppText>
                    <CandyButton label="关掉" onPress={close} size="md" />
                  </View>
                ))
              }
            />
            <CandyButton
              label="排队：完美日 → 成就"
              variant="secondary"
              onPress={() => {
                overlay.enqueue('perfectDay', (close) => (
                  <View style={[styles.queueCard, { backgroundColor: colors.card }]}>
                    <AppText variant="title3">完美日</AppText>
                    <CandyButton label="好" onPress={close} size="sm" />
                  </View>
                ));
                overlay.enqueue('achievement', (close) => (
                  <View style={[styles.queueCard, { backgroundColor: colors.card }]}>
                    <AppText variant="title3">新徽章</AppText>
                    <CandyButton label="收下" onPress={close} size="sm" />
                  </View>
                ));
              }}
            />
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  toggles: { paddingHorizontal: inset.page, gap: space.sm, paddingBottom: space.sm },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chips: { paddingHorizontal: inset.page, gap: space.sm, paddingBottom: space.md },
  content: { paddingHorizontal: inset.page, paddingBottom: space.giant, gap: space.md },
  sectionTitle: { marginTop: space.sm },
  bloomRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md, alignItems: 'center' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, alignItems: 'center' },
  flex: { flex: 1 },
  swatchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  swatch: { width: 64, alignItems: 'center', gap: 4 },
  swatchBlock: { width: 48, height: 48, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
  cardInner: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  queueCard: {
    margin: 40,
    marginTop: 120,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    gap: 12,
  },
});
