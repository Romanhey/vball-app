import { scheduleApiClient } from './httpClient';
import type {
  Match,
  CreateMatchDTO,
  MatchStatus,
  UpdateMatchDTO,
} from '../types';

export interface GetMatchesParams {
  FromDate?: string;
  ToDate?: string;
  TeamId?: number;
  Status?: MatchStatus;
  skip?: number;
  take?: number;
}

export const matchService = {
  async getMatches(params?: GetMatchesParams): Promise<Match[]> {
    const queryParams = new URLSearchParams();
    if (params?.FromDate) queryParams.append('FromDate', params.FromDate);
    if (params?.ToDate) queryParams.append('ToDate', params.ToDate);
    if (params?.TeamId !== undefined)
      queryParams.append('TeamId', params.TeamId.toString());
    if (params?.Status !== undefined)
      queryParams.append('Status', params.Status.toString());
    if (params?.skip !== undefined)
      queryParams.append('skip', params.skip.toString());
    if (params?.take !== undefined)
      queryParams.append('take', params.take.toString());

    const queryString = queryParams.toString();
    const url = `/Match${queryString ? `?${queryString}` : ''}`;

    const response = await scheduleApiClient.get<Match[]>(url);
    return response.data.map((match) => ({
      ...match,
      startTime:
        typeof match.startTime === 'string'
          ? new Date(match.startTime)
          : match.startTime,
    }));
  },

  async getMatch(id: number): Promise<Match | null> {
    try {
      const response = await scheduleApiClient.get<Match>(`/Match/${id}`);
      return {
        ...response.data,
        startTime:
          typeof response.data.startTime === 'string'
            ? new Date(response.data.startTime)
            : response.data.startTime,
      };
    } catch (error: unknown) {
      if ((error as { response?: { status?: number } })?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async createMatch(dto: CreateMatchDTO): Promise<void> {
    await scheduleApiClient.post('/Match', dto);
  },

  async updateMatch(id: number, dto: UpdateMatchDTO): Promise<void> {
    await scheduleApiClient.put(`/Match/${id}`, dto);
  },

  async deleteMatch(id: number): Promise<void> {
    await scheduleApiClient.delete(`/Match/${id}`);
  },

  async startMatch(id: number): Promise<void> {
    await scheduleApiClient.put(`/Match/${id}/start`);
  },

  async finishMatch(id: number, finalScore: string): Promise<void> {
    await scheduleApiClient.put(`/Match/${id}/finish`, finalScore, {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
