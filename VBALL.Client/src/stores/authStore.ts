import { makeAutoObservable } from 'mobx';

export type UserRole = 'Player' | 'Admin';

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
}

export class AuthStore {
  token: string | null = null;
  user: AuthUser | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setCredentials(token: string, user: AuthUser) {
    this.token = token;
    this.user = user;
  }

  logout() {
    this.token = null;
    this.user = null;
  }

  get isAuthenticated() {
    return Boolean(this.token && this.user);
  }

  get isAdmin() {
    return this.user?.role === 'Admin';
  }
}
