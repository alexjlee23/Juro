import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography } from '../../constants/theme';
import { Text, View } from 'react-native';

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 4 }}>
      <Text
        style={{
          ...typography.caption,
          color: focused ? colors.action : colors.textCaption,
          fontWeight: focused ? '700' : '400',
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.action,
        tabBarInactiveTintColor: colors.textCaption,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { ...typography.caption, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: t('tabs.home'), tabBarLabel: `홈 ${t('tabs.home')}` }}
      />
      <Tabs.Screen
        name="map"
        options={{ title: t('tabs.map'), tabBarLabel: `지도 ${t('tabs.map')}` }}
      />
      <Tabs.Screen
        name="community"
        options={{ title: t('tabs.community'), tabBarLabel: `커뮤니티 ${t('tabs.community')}` }}
      />
      <Tabs.Screen
        name="my"
        options={{ title: t('tabs.my'), tabBarLabel: `내 ${t('tabs.my')}` }}
      />
    </Tabs>
  );
}
