import { FileText, House, ListChecks, Users, type LucideIcon } from 'lucide-react-native';
import { Tabs } from 'expo-router/js-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useIsFocused } from 'expo-router';

import { fontFamily, haptics, tabBarHeight, useTheme, useToastBottomInset } from '@/ui';

export default function TabsLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  // Toasts sit above the tab bar, except while a modal covers the tabs.
  useToastBottomInset(useIsFocused() ? tabBarHeight : 0);
  const tabIcon = (Glyph: LucideIcon) =>
    function TabIcon({ focused }: { focused: boolean }) {
      return (
        <Glyph
          size={24}
          color={focused ? colors.primary : colors.fgSubtle}
          strokeWidth={focused ? 2.2 : 1.75}
        />
      );
    };
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.fgSubtle,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: tabBarHeight + insets.bottom,
          paddingTop: 6,
          paddingBottom: insets.bottom + 6,
        },
        tabBarLabelStyle: { fontFamily: fontFamily.medium, fontSize: 12, lineHeight: 16 },
        tabBarAllowFontScaling: false,
        sceneStyle: { backgroundColor: colors.canvas },
      }}
      screenListeners={{ tabPress: () => haptics.select() }}
    >
      <Tabs.Screen name="index" options={{ title: 'Start', tabBarIcon: tabIcon(House) }} />
      <Tabs.Screen name="aufgaben" options={{ title: 'Aufgaben', tabBarIcon: tabIcon(ListChecks) }} />
      <Tabs.Screen name="familie" options={{ title: 'Familie', tabBarIcon: tabIcon(Users) }} />
      <Tabs.Screen name="dokumente" options={{ title: 'Dokumente', tabBarIcon: tabIcon(FileText) }} />
    </Tabs>
  );
}
