import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getPort = (key: string, defaultPort: number): number => {
  const extra = Constants.expoConfig?.extra as Record<string, number> | undefined;
  return extra?.[key] ?? defaultPort;
};

const getBaseUrl = (portKey: string, defaultPort: number): string => {
  const port = getPort(portKey, defaultPort);
  if (__DEV__) {
    return Platform.OS === 'android'
      ? `http://10.0.2.2:${port}`
      : `http://localhost:${port}`;
  }
  return `http://localhost:${port}`;
};

export const API_CONFIG = {
  IDENTITY_API_URL: getBaseUrl('IDENTITY_API_PORT', 5000),
  SCHEDULE_API_URL: getBaseUrl('SCHEDULE_API_PORT', 5054),
  NOTIFICATIONS_API_URL: getBaseUrl('NOTIFICATIONS_API_PORT', 8080),
};
