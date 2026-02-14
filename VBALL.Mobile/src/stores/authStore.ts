import { makeAutoObservable, runInAction } from 'mobx';
import { jwtDecode } from 'jwt-decode';
import type { AxiosError } from 'axios';
import { authService } from '../services/authService';
import {
  setToken,
  clearToken,
  getToken,
  setupTokenRefresh,
} from '../services/httpClient';
import type { LoginResponse, UserRole } from '../types';

const extractAccessToken = (
  response: LoginResponse | string | null | undefined
): string | null => {
  if (!response) return null;
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

const getFirstValidationError = (
  errors: Record<string, string[] | string> | undefined
): string | undefined => {
  if (!errors) return undefined;
  for (const value of Object.values(errors)) {
    if (Array.isArray(value) && value.length > 0) return value[0];
    if (typeof value === 'string' && value.trim()) return value;
  }
  return undefined;
};

const mapAuthErrorMessage = (error: AxiosError & { response?: { data?: unknown; status?: number } }): string => {
  const status = error?.response?.status;
  const data = error?.response?.data as Record<string, unknown> | string | undefined;

  let rawMessage: string | undefined;
  if (typeof data === 'string') rawMessage = data;
  else if (data?.message) rawMessage = String(data.message);
  else if (data?.error) rawMessage = String(data.error);
  else if (data?.errors)
    rawMessage = getFirstValidationError(
      data.errors as Record<string, string[] | string>
    );

  if (!rawMessage && typeof error?.message === 'string') rawMessage = error.message;

  const normalized = rawMessage?.toLowerCase();
  if (normalized?.includes('user not found'))
    return 'Пользователь с таким email не найден';
  if (normalized?.includes('wrong password') || normalized?.includes('invalid password'))
    return 'Неверный пароль';
  if (normalized?.includes('invalid token'))
    return 'Сессия недействительна. Войдите заново.';
  if (status === 401) return 'Неверный email или пароль';
  if (status === 400)
    return rawMessage || 'Некорректные данные. Проверьте введённые значения.';
  if (status && status >= 500)
    return 'Сервер временно недоступен. Попробуйте позже.';
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
  isInitialized = false;

  constructor() {
    makeAutoObservable(this);
    this.setupRefreshTokenHandler();
  }

  async init(): Promise<void> {
    if (this.isInitialized) return;
    try {
      const storedToken = await getToken();
      if (storedToken) {
        try {
          runInAction(() => this.applyToken(storedToken));
          await setToken(storedToken);
        } catch {
          runInAction(() => this.logoutSync());
          await clearToken();
        }
      }
    } finally {
      runInAction(() => {
        this.isInitialized = true;
      });
    }
  }

  private setupRefreshTokenHandler(): void {
    setupTokenRefresh(async () => this.refreshToken());
  }

  private decodeToken(token: string): AuthUser | null {
    try {
      const decoded = jwtDecode<JWTPayload>(token);
      return {
        id: decoded.uid,
        email: decoded.email,
        role: decoded.adm === '1' ? 'Admin' : 'Player',
      };
    } catch {
      return null;
    }
  }

  private applyToken(token: string): void {
    this.token = token;
    const user = this.decodeToken(token);
    this.user = user;
  }

  async login(email: string, password: string): Promise<void> {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await authService.login(email, password);
      const token = extractAccessToken(response);
      if (!token) throw new Error('Токен авторизации отсутствует в ответе сервера');
      runInAction(() => this.applyToken(token));
      await setToken(token);
    } catch (error) {
      runInAction(() => {
        this.error = mapAuthErrorMessage(error as AxiosError & { response?: { data?: unknown; status?: number } });
      });
      throw error;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

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
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      runInAction(() => {
        this.error = err.response?.data?.message || err.message || 'Registration failed';
      });
      throw error;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async refreshToken(): Promise<string> {
    const responseToken = await authService.refreshToken();
    const newToken = extractAccessToken(responseToken);
    if (!newToken) throw new Error('Сервер не вернул новый токен');
    runInAction(() => this.applyToken(newToken));
    await setToken(newToken);
    return newToken;
  }

  logoutSync(): void {
    this.token = null;
    this.user = null;
  }

  async logout(): Promise<void> {
    this.logoutSync();
    await clearToken();
  }

  get isAuthenticated(): boolean {
    return Boolean(this.token && this.user);
  }

  get isAdmin(): boolean {
    return this.user?.role === 'Admin';
  }
}
