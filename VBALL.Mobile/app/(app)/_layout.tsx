import { Stack, useRouter, Redirect } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '../../src/stores/rootStore';
import { setOnUnauthorized } from '../../src/services/httpClient';
import { AppDataProvider } from '../../src/contexts/AppDataContext';

export default function AppLayout() {
  const authStore = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    setOnUnauthorized(() => {
      authStore.logoutSync();
      router.replace('/(auth)/login');
    });
  }, [authStore, router]);

  if (!authStore.isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <AppDataProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="match/[id]" />
      </Stack>
    </AppDataProvider>
  );
}
