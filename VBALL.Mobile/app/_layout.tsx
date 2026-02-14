import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { StoreProvider } from '../src/stores/rootStore';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
        </Stack>
        <StatusBar style="dark" />
      </StoreProvider>
    </SafeAreaProvider>
  );
}
