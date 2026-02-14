import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosError,
  AxiosResponse,
} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api';

const TOKEN_STORAGE_KEY = 'vball_access_token';

let isRefreshing = false;
let failedQueue: {
  resolve: (value?: string) => void;
  reject: (error?: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token ?? undefined);
    }
  });
  failedQueue = [];
};

export const getToken = async (): Promise<string | null> => {
  return AsyncStorage.getItem(TOKEN_STORAGE_KEY);
};

export const setToken = async (token: string | null): Promise<void> => {
  if (token) {
    await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
  }
};

export const clearToken = async (): Promise<void> => {
  await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
};

let onUnauthorized: (() => void) | null = null;
export const setOnUnauthorized = (fn: () => void) => {
  onUnauthorized = fn;
};

const setupRequestInterceptor = (client: AxiosInstance) => {
  client.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const token = await getToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
};

const setupResponseInterceptor = (
  client: AxiosInstance,
  refreshTokenFn: () => Promise<string>
) => {
  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (originalRequest.headers && token) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return client(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const newToken = await refreshTokenFn();
          await setToken(newToken);
          processQueue(null, newToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return client(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          await clearToken();
          onUnauthorized?.();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
};

export const identityApiClient = axios.create({
  baseURL: API_CONFIG.IDENTITY_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const scheduleApiClient = axios.create({
  baseURL: API_CONFIG.SCHEDULE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const notificationsApiClient = axios.create({
  baseURL: API_CONFIG.NOTIFICATIONS_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

setupRequestInterceptor(identityApiClient);
setupRequestInterceptor(scheduleApiClient);

export const setupTokenRefresh = (refreshTokenFn: () => Promise<string>) => {
  setupResponseInterceptor(identityApiClient, refreshTokenFn);
  setupResponseInterceptor(scheduleApiClient, refreshTokenFn);
};

export default identityApiClient;
