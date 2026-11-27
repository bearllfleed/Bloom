/**
 * 五个页签布局：用 expo-router/ui 自绘标签栏（设计规范 + 第 0 期 2.1）。
 * TabList 必须是 Tabs 的直接子节点，路由才会登记这些页面；包进其他组件里，内容区会是空的。
 * 再次点当前页签：resetOnFocus 回到该页签顶部。
 */
import { Redirect } from 'expo-router';
import { Tabs, TabList, TabSlot, TabTrigger } from 'expo-router/ui';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePrefs } from '@/stores/prefsStore';
import { TAB_BAR_HEIGHT, TabButton } from '@/ui/components/TabBar';
import { focusGateLayout } from '@/ui/motion/idle';
import { useTheme } from '@/ui/theme/ThemeProvider';

export default function TabsLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const onboarded = usePrefs((s) => s.onboarded);
  if (!onboarded) return <Redirect href="/welcome" />;
  return (
    <Tabs activityEnabled options={{ screenLayout: focusGateLayout }}>
      <View style={[styles.body, { backgroundColor: colors.background }]}>
        <TabSlot />
      </View>
      <TabList
        style={{
          height: TAB_BAR_HEIGHT + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 6,
          backgroundColor: colors.card,
          borderTopColor: colors.hairline,
          borderTopWidth: StyleSheet.hairlineWidth,
        }}
      >
        <TabTrigger name="today" href="/" asChild resetOnFocus>
          <TabButton tab="today" />
        </TabTrigger>
        <TabTrigger name="projects" href="/projects" asChild resetOnFocus>
          <TabButton tab="projects" />
        </TabTrigger>
        <TabTrigger name="stats" href="/stats" asChild resetOnFocus>
          <TabButton tab="stats" />
        </TabTrigger>
        <TabTrigger name="achievements" href="/achievements" asChild resetOnFocus>
          <TabButton tab="achievements" />
        </TabTrigger>
        <TabTrigger name="me" href="/me" asChild resetOnFocus>
          <TabButton tab="me" />
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1 },
});
