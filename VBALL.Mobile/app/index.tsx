import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';

import { useAuthStore } from '../src/stores/rootStore';
import { VBALL_COLORS } from '../src/constants/theme';

export default observer(function IndexScreen() {
  const authStore = useAuthStore();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    authStore.init();
  }, [authStore]);

  if (!authStore.isInitialized) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={VBALL_COLORS.primary} />
      </View>
    );
  }

  if (authStore.isAuthenticated) {
    return (
      <Redirect
        href={
          authStore.isAdmin ? '/(app)/(tabs)/admin' : '/(app)/(tabs)'
        }
      />
    );
  }

  return <Redirect href="/(auth)/login" />;
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: VBALL_COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
