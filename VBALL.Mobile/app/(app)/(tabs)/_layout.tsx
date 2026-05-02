import { Pressable } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { observer } from 'mobx-react-lite';
import { useAuthStore } from '../../../src/stores/rootStore';
import { BottomAdminPanelProvider, useBottomAdminPanel } from '../../../src/contexts/BottomAdminPanelContext';
import { BottomAdminPanel } from '../../../src/components/BottomAdminPanel';
import { VBALL_COLORS } from '../../../src/constants/theme';

function TabLayoutContent() {
  const authStore = useAuthStore();
  const router = useRouter();
  const { open, close, isOpen } = useBottomAdminPanel();
  const showAdminBtn = authStore.isAdmin;

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: VBALL_COLORS.primary,
          tabBarInactiveTintColor: VBALL_COLORS.textMuted,
          headerShown: false,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Главная',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            title: 'Уведомления',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="notifications" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="admin"
          options={{
            title: 'Админ',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings" size={size} color={color} />
            ),
            ...(showAdminBtn
              ? {
                  tabBarButton: (props: { onPress?: () => void; [k: string]: unknown }) => {
                    const { onPress: _onPress, ...rest } = props;
                    return <Pressable {...rest} onPress={open} />;
                  },
                }
              : { href: null }),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Профиль',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="admin-teams"
          options={{
            href: null,
          }}
        />
      </Tabs>

      <BottomAdminPanel
        isOpen={isOpen}
        onClose={close}
        onNavigateToMatches={() => router.push('/(app)/(tabs)/admin')}
        onNavigateToTeams={() => router.push('/(app)/(tabs)/admin-teams')}
      />
    </>
  );
}

export default observer(function TabLayout() {
  return (
    <BottomAdminPanelProvider>
      <TabLayoutContent />
    </BottomAdminPanelProvider>
  );
});
