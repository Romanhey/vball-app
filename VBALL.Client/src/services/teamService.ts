import { scheduleApiClient } from './httpClient';
import type { Team, CreateTeamDTO, UpdateTeamDTO, Match } from '../types';

export interface GetTeamsParams {
  TeamId?: number;
  Name?: string;
  MinRating?: number;
  MaxRating?: number;
  skip?: number;
  take?: number;
}

export const teamService = {
  /**
   * Get all teams with optional filters
   */
  async getTeams(params?: GetTeamsParams): Promise<Team[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.TeamId !== undefined) queryParams.append('TeamId', params.TeamId.toString());
    if (params?.Name) queryParams.append('Name', params.Name);
    if (params?.MinRating !== undefined) queryParams.append('MinRating', params.MinRating.toString());
    if (params?.MaxRating !== undefined) queryParams.append('MaxRating', params.MaxRating.toString());
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.take !== undefined) queryParams.append('take', params.take.toString());

    const queryString = queryParams.toString();
    const url = `/Team${queryString ? `?${queryString}` : ''}`;
    
    const response = await scheduleApiClient.get<Team[]>(url);
    return response.data;
  },

  /**
   * Get team by ID
   */
  async getTeam(id: number): Promise<Team | null> {
    try {
      const response = await scheduleApiClient.get<Team>(`/Team/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Create new team
   */
  async createTeam(dto: CreateTeamDTO): Promise<Team> {
    const response = await scheduleApiClient.post<Team>('/Team', dto);
    return response.data;
  },

  /**
   * Update team
   */
  async updateTeam(id: number, dto: UpdateTeamDTO): Promise<Team> {
    const response = await scheduleApiClient.put<Team>(`/Team/${id}`, dto);
    return response.data;
  },

  /**
   * Delete team
   */
  async deleteTeam(id: number): Promise<void> {
    await scheduleApiClient.delete(`/Team/${id}`);
  },

  /**
   * Get team players
   */
  async getTeamPlayers(id: number): Promise<any[]> {
    const response = await scheduleApiClient.get<any[]>(`/Team/${id}/players`);
    return response.data;
  },

  /**
   * Get team matches
   */
  async getTeamMatches(id: number): Promise<Match[]> {
    const response = await scheduleApiClient.get<Match[]>(`/Team/${id}/matches`);
    return response.data.map(match => ({
      ...match,
      startTime: typeof match.startTime === 'string' 
        ? new Date(match.startTime) 
        : match.startTime,
    }));
  },
};
