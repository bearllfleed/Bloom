/**
 * 长按菜单（设计规范第 8 节）：白底圆角 16，每项图标 + 文字，高 48；从手指位置附近展开。
 */
import { Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { overlay, type MenuSpec } from '@/stores/overlayQueue';
import { AppText } from '@/ui/components/AppText';
import { Icon } from '@/ui/icons/Icon';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { inset, radius, shadow } from '@/ui/tokens';

const ITEM_HEIGHT = 48;

export function MenuView({ menu }: { menu: MenuSpec }) {
  const { colors } = useTheme();
  const { height } = useWindowDimensions();
  const menuHeight = menu.items.length * ITEM_HEIGHT + 8;
  // 菜单尽量出现在手指下方，放不下时改到上方
  const top =
    menu.anchorY + menuHeight + 24 > height ? Math.max(48, menu.anchorY - menuHeight - 12) : menu.anchorY + 12;

  return (
    <Animated.View entering={FadeIn.duration(140)} exiting={FadeOut.duration(120)} style={StyleSheet.absoluteFill}>
      <Pressable accessibilityLabel="关闭菜单" style={StyleSheet.absoluteFill} onPress={() => overlay.closeMenu()} />
      <Animated.View
        entering={FadeIn.duration(180)}
        style={[styles.menu, { top, backgroundColor: colors.card, shadowColor: colors.shadow }]}
      >
        {menu.items.map((item) => (
          <Pressable
            key={item.label}
            accessibilityRole="menuitem"
            onPress={() => {
              overlay.closeMenu();
              item.onPress();
            }}
            style={({ pressed }) => [styles.item, pressed && { backgroundColor: colors.accentSofter }]}
          >
            {item.icon ? (
              <Icon name={item.icon} size={20} color={item.destructive ? colors.dangerText : colors.text} />
            ) : null}
            <AppText variant="body" tone={item.destructive ? 'danger' : 'primary'}>
              {item.label}
            </AppText>
          </Pressable>
        ))}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  menu: {
    position: 'absolute',
    right: inset.page,
    minWidth: 200,
    borderRadius: radius.menu,
    paddingVertical: 4,
    shadowOffset: { width: 0, height: shadow.overlay.offsetY / 2 },
    shadowRadius: shadow.overlay.blur / 2,
    shadowOpacity: shadow.overlay.opacity,
    elevation: 8,
  },
  item: { height: ITEM_HEIGHT, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16 },
});
