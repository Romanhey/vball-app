import { identityApiClient } from './httpClient';
import type { LoginDTO, RegisterDTO, LoginResponse } from '../types';

export const authService = {
  /**
   * Login user with email and password
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const dto: LoginDTO = { email, password };
    const response = await identityApiClient.post<LoginResponse>('/api/Auth/login', dto);
    return response.data;
  },

  /**
   * Register new user
   */
  async register(
    email: string,
    name: string,
    password: string,
    passwordRepeat: string
  ): Promise<void> {
    const dto: RegisterDTO = { email, name, password, passwordRepeat };
    await identityApiClient.post('/api/Auth/register', dto);
  },

  /**
   * Refresh access token using refresh token from cookie
   */
  async refreshToken(): Promise<LoginResponse | string> {
    const response = await identityApiClient.post<LoginResponse | string>('/api/Auth/refresh-token');
    return response.data;
  },
};
