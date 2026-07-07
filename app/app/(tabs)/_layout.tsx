import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography } from '../../constants/theme';
import { Text, View } from 'react-native';

const TAB_ICONS: Record<string, string> = {
  index: '🏠',
  map: '🔍',
  community: '💬',
  my: '👤',
};

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    // Fixed width: the tab icon slot is narrow by default and makes
    // multi-syllable labels (커뮤니티, 내 정보) wrap onto two lines.
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 4, width: 84 }}>
      <Text style={{ fontSize: 21, marginBottom: 4 }}>{emoji}</Text>
      <Text
        numberOfLines={1}
        style={{
          ...typography.caption,
          color: focused ? colors.action : colors.textCaption,
          fontWeight: focused ? '700' : '400',
          textAlign: 'center',
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.action,
        tabBarInactiveTintColor: colors.textCaption,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 84,
          paddingTop: 8,
          paddingBottom: 14,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji={TAB_ICONS.index} label={lang === 'ko' ? '홈' : 'Home'} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: lang === 'ko' ? '찾기' : 'Find',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji={TAB_ICONS.map} label={lang === 'ko' ? '찾기' : 'Find'} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: t('tabs.community'),
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji={TAB_ICONS.community} label={lang === 'ko' ? '커뮤니티' : 'Community'} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="my"
        options={{
          title: t('tabs.my'),
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji={TAB_ICONS.my} label={lang === 'ko' ? '내 정보' : 'My'} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
