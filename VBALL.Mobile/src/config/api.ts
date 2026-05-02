import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getPort = (key: string, defaultPort: number): number => {
  const extra = Constants.expoConfig?.extra as Record<string, number> | undefined;
  return extra?.[key] ?? defaultPort;
};

/** Resolve API host for dev: web/localhost, Android emulator/10.0.2.2, real device/LAN IP */
const getDevHost = (): string => {
  const extra = Constants.expoConfig?.extra as Record<string, string | number> | undefined;
  const configHost = extra?.API_HOST;
  if (typeof configHost === 'string' && configHost) return configHost;

  if (Platform.OS === 'web') return '192.168.10.113';

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const match = hostUri.match(/^(?:exp|http):\/\/([^:/]+)/);
    const host = match?.[1];
    if (host && (host.startsWith('192.168.') || host.startsWith('10.') || host === 'localhost')) {
      return host;
    }
  }

  if (Platform.OS === 'android') {
    return '10.0.2.2';
  }
  return '192.168.1.103';
};

const getBaseUrl = (portKey: string, defaultPort: number): string => {
  const port = getPort(portKey, defaultPort);
  const host = __DEV__ ? getDevHost() : '192.168.1.103';
  return `http://${host}:${port}`;
};

export const API_CONFIG = {
  IDENTITY_API_URL: getBaseUrl('IDENTITY_API_PORT', 5000),
  SCHEDULE_API_URL: `${getBaseUrl('SCHEDULE_API_PORT', 5054)}/api`,
  NOTIFICATIONS_API_URL: getBaseUrl('NOTIFICATIONS_API_PORT', 8080),
};
