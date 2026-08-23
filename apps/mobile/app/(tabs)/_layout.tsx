import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Platform, type ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/src/ui/theme';
import { tabBarMetrics } from '@/src/navigation/tab-bar';

type TabIconProps = {
  android: 'today' | 'book_2' | 'settings';
  color: ColorValue;
  ios: 'calendar' | 'calendar.circle.fill' | 'books.vertical' | 'books.vertical.fill' | 'gearshape' | 'gearshape.fill';
};

function TabIcon({ android, color, ios }: TabIconProps) {
  return <SymbolView name={{ android, ios, web: android }} size={22} tintColor={color} />;
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const tabBar = tabBarMetrics(insets.bottom, Platform.OS === 'ios');

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.line,
          height: tabBar.height,
          paddingBottom: tabBar.bottomPadding,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, focused }) => <TabIcon android="today" color={color} ios={focused ? 'calendar.circle.fill' : 'calendar'} />,
        }}
      />
      <Tabs.Screen
        name="files"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, focused }) => <TabIcon android="book_2" color={color} ios={focused ? 'books.vertical.fill' : 'books.vertical'} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => <TabIcon android="settings" color={color} ios={focused ? 'gearshape.fill' : 'gearshape'} />,
        }}
      />
    </Tabs>
  );
}
