import { Stack, useRouter, Redirect, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '../../src/stores/rootStore';
import { setOnUnauthorized } from '../../src/services/httpClient';
import { AppDataProvider } from '../../src/contexts/AppDataContext';

export default function AppLayout() {
  const authStore = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    setOnUnauthorized(() => {
      authStore.logoutSync();
      router.replace('/(auth)/login');
    });
  }, [authStore, router]);

  if (!authStore.isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  const isAdminRoute =
    segments[0] === '(app)' && segments[1] === 'admin';
  if (isAdminRoute && !authStore.isAdmin) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return (
    <AppDataProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="admin" />
        <Stack.Screen name="match/[id]" />
      </Stack>
    </AppDataProvider>
  );
}
