import { makeAutoObservable } from 'mobx';
import { jwtDecode } from 'jwt-decode';
import { authService } from '../services/authService';
import { setToken, clearToken, getToken, setupTokenRefresh } from '../services/httpClient';
import type { LoginResponse, UserRole } from '../types';
import type { AxiosError } from 'axios';

const extractAccessToken = (response: LoginResponse | string | null | undefined): string | null => {
  if (!response) {
    return null;
  }

  if (typeof response === 'string') {
    const trimmed = response.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  return (
    response.AccesToken ??
    response.accesToken ??
    response.AccessToken ??
    response.accessToken ??
    null
  );
};

const getFirstValidationError = (errors: Record<string, string[] | string> | undefined): string | undefined => {
  if (!errors) {
    return undefined;
  }

  for (const value of Object.values(errors)) {
    if (Array.isArray(value) && value.length > 0) {
      return value[0];
    }
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  return undefined;
};

const mapAuthErrorMessage = (error: AxiosError | any): string => {
  const status = error?.response?.status;
  const data = error?.response?.data;

  let rawMessage: string | undefined;

  if (typeof data === 'string') {
    rawMessage = data;
  } else if (data?.message) {
    rawMessage = data.message;
  } else if (data?.error) {
    rawMessage = data.error;
  } else if (data?.errors) {
    rawMessage = getFirstValidationError(data.errors as Record<string, string[] | string>);
  }

  if (!rawMessage && typeof error?.message === 'string') {
    rawMessage = error.message;
  }

  const normalized = rawMessage?.toLowerCase();

  if (normalized?.includes('user not found')) {
    return 'Пользователь с таким email не найден';
  }

  if (normalized?.includes('wrong password') || normalized?.includes('invalid password')) {
    return 'Неверный пароль';
  }

  if (normalized?.includes('invalid token')) {
    return 'Сессия недействительна. Войдите заново.';
  }

  if (status === 401) {
    return 'Неверный email или пароль';
  }

  if (status === 400) {
    return rawMessage || 'Некорректные данные. Проверьте введённые значения.';
  }

  if (status && status >= 500) {
    return 'Сервер временно недоступен. Попробуйте позже.';
  }

  return rawMessage || 'Не удалось выполнить вход. Попробуйте ещё раз.';
};

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
}

interface JWTPayload {
  uid: string;
  email: string;
  adm: string;
  exp?: number;
  iat?: number;
}

export class AuthStore {
  token: string | null = null;
  user: AuthUser | null = null;
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
    this.initializeFromStorage();
    this.setupRefreshTokenHandler();
  }

  /**
   * Initialize store from localStorage
   */
  private initializeFromStorage() {
    const storedToken = getToken();
    if (storedToken) {
      try {
        this.setToken(storedToken);
      } catch (error) {
        // Invalid token, clear it
        this.logout();
      }
    }
  }

  /**
   * Setup refresh token handler for HTTP client
   */
  private setupRefreshTokenHandler() {
    setupTokenRefresh(async () => {
      return await this.refreshToken();
    });
  }

  /**
   * Decode JWT token and extract user information
   */
  private decodeToken(token: string): AuthUser | null {
    try {
      const decoded = jwtDecode<JWTPayload>(token);
      return {
        id: decoded.uid,
        email: decoded.email,
        role: decoded.adm === '1' ? 'Admin' : 'Player',
      };
    } catch (error) {
      console.error('Failed to decode JWT token:', error);
      return null;
    }
  }

  /**
   * Set token and update user info
   */
  private setToken(token: string) {
    this.token = token;
    setToken(token);
    const user = this.decodeToken(token);
    this.user = user;
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<void> {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await authService.login(email, password);
      const token = extractAccessToken(response);

      if (!token) {
        throw new Error('Токен авторизации отсутствует в ответе сервера');
      }

      this.setToken(token);
    } catch (error: any) {
      this.error = mapAuthErrorMessage(error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Register new user
   */
  async register(
    email: string,
    name: string,
    password: string,
    passwordRepeat: string
  ): Promise<void> {
    this.isLoading = true;
    this.error = null;
    try {
      await authService.register(email, name, password, passwordRepeat);
    } catch (error: any) {
      this.error = error.response?.data?.message || error.message || 'Registration failed';
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<string> {
    try {
      const responseToken = await authService.refreshToken();
      const newToken = extractAccessToken(responseToken);

      if (!newToken) {
        throw new Error('Сервер не вернул новый токен');
      }

      this.setToken(newToken);
      return newToken;
    } catch (error) {
      // If refresh fails, logout user
      this.logout();
      throw error;
    }
  }

  /**
   * Logout user
   */
  logout() {
    this.token = null;
    this.user = null;
    clearToken();
  }

  get isAuthenticated() {
    return Boolean(this.token && this.user);
  }

  get isAdmin() {
    return this.user?.role === 'Admin';
  }
}
