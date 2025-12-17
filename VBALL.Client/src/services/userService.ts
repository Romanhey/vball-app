import { identityApiClient } from './httpClient';
import type { PlayerProfile, UserRole } from '../types';

interface UserProfileResponse extends Omit<PlayerProfile, 'role'> {
  role?: UserRole;
  isAdmin?: boolean;
}

const mapProfile = (profile: UserProfileResponse): PlayerProfile => ({
  ...profile,
  role: profile.role ?? (profile.isAdmin ? 'Admin' : 'Player'),
});

export const userService = {
  async getCurrentUser(): Promise<PlayerProfile> {
    const response = await identityApiClient.get<UserProfileResponse>('/api/Users/me');
    return mapProfile(response.data);
  },

  async getUser(id: number): Promise<PlayerProfile> {
    const response = await identityApiClient.get<UserProfileResponse>(`/api/Users/${id}`);
    return mapProfile(response.data);
  },

  async getUsersByIds(ids: number[]): Promise<PlayerProfile[]> {
    if (!ids.length) {
      return [];
    }

    const params = new URLSearchParams();
    ids.forEach((id) => params.append('ids', id.toString()));
    const response = await identityApiClient.get<UserProfileResponse[]>(`/api/Users?${params.toString()}`);
    return response.data.map(mapProfile);
  },
};

