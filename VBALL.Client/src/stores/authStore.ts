import { makeAutoObservable } from 'mobx';
import { authService } from '../services/authService';
import { setToken, clearToken, getToken, setupTokenRefresh } from '../services/httpClient';
import { jwtDecode } from 'jwt-decode';

export type UserRole = 'Player' | 'Admin';

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
      this.setToken(response.AccesToken);
    } catch (error: any) {
      this.error = error.response?.data?.message || error.message || 'Login failed';
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
      const newToken = await authService.refreshToken();
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
