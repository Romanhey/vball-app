import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';

// Token storage key
const TOKEN_STORAGE_KEY = 'vball_access_token';

// Queue for pending requests during token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Get token from storage
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
};

// Set token in storage
export const setToken = (token: string | null): void => {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
};

// Clear token
export const clearToken = (): void => {
  setToken(null);
};

const isProduction = process.env.NODE_ENV === 'production';
const identityBaseUrl =
  process.env.REACT_APP_IDENTITY_API ?? (isProduction ? '/identity' : 'http://localhost:5000');
const scheduleBaseUrl =
  process.env.REACT_APP_SCHEDULE_API ?? (isProduction ? '/schedule' : 'http://localhost:5054');
const notificationsBaseUrl =
  process.env.REACT_APP_NOTIFICATIONS_API ?? 'http://localhost:8080';

// Create axios instance for Identity API
export const identityApiClient = axios.create({
  baseURL: identityBaseUrl,
  withCredentials: true, // Important for cookie-based refresh tokens
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create axios instance for Schedule API
export const scheduleApiClient = axios.create({
  baseURL: scheduleBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create axios instance for Notifications API
export const notificationsApiClient = axios.create({
  baseURL: notificationsBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Setup request interceptor for Identity API
const setupRequestInterceptor = (client: AxiosInstance) => {
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

// Setup response interceptor for token refresh
const setupResponseInterceptor = (
  client: AxiosInstance,
  refreshTokenFn: () => Promise<string>
) => {
  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // If error is 401 and we haven't tried to refresh yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (originalRequest.headers && token) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return client(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const newToken = await refreshTokenFn();
          setToken(newToken);
          processQueue(null, newToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return client(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          clearToken();
          // Redirect to login page
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
};

// Setup interceptors for Identity API (will be configured with refresh function later)
setupRequestInterceptor(identityApiClient);

// Setup interceptors for Schedule API (will be configured with refresh function later)
setupRequestInterceptor(scheduleApiClient);

// Export function to setup refresh token handler
export const setupTokenRefresh = (refreshTokenFn: () => Promise<string>) => {
  setupResponseInterceptor(identityApiClient, refreshTokenFn);
  setupResponseInterceptor(scheduleApiClient, refreshTokenFn);
};

// Export default client (for backward compatibility)
export default identityApiClient;
