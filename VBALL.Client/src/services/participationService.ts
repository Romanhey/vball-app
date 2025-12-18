import { scheduleApiClient } from './httpClient';
import type {
  CreateParticipationDTO,
  UpdateParticipationDTO,
  RequestCancellationDTO,
  AdminCancelParticipationDTO,
  ParticipationStatus,
  Participation,
} from '../types';

export interface GetParticipationsParams {
  ParticipationId?: number;
  MatchId?: number;
  PlayerId?: number;
  TeamId?: number;
  CreatedFrom?: string; // ISO date-time string
  CreatedTo?: string; // ISO date-time string
  Status?: ParticipationStatus;
  skip?: number;
  take?: number;
}

export const participationService = {
  /**
   * Get all participations with optional filters
   */
  async getParticipations(params?: GetParticipationsParams): Promise<Participation[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.ParticipationId !== undefined) 
      queryParams.append('ParticipationId', params.ParticipationId.toString());
    if (params?.MatchId !== undefined) 
      queryParams.append('MatchId', params.MatchId.toString());
    if (params?.PlayerId !== undefined) 
      queryParams.append('PlayerId', params.PlayerId.toString());
    if (params?.TeamId !== undefined) 
      queryParams.append('TeamId', params.TeamId.toString());
    if (params?.CreatedFrom) 
      queryParams.append('CreatedFrom', params.CreatedFrom);
    if (params?.CreatedTo) 
      queryParams.append('CreatedTo', params.CreatedTo);
    if (params?.Status) 
      queryParams.append('Status', params.Status);
    if (params?.skip !== undefined) 
      queryParams.append('skip', params.skip.toString());
    if (params?.take !== undefined) 
      queryParams.append('take', params.take.toString());

    const queryString = queryParams.toString();
    const url = `/Participation${queryString ? `?${queryString}` : ''}`;
    
    const response = await scheduleApiClient.get<Participation[]>(url);
    return response.data;
  },

  /**
   * Create new participation
   */
  async createParticipation(dto: CreateParticipationDTO): Promise<Participation> {
    const response = await scheduleApiClient.post<Participation>('/Participation', dto);
    return response.data;
  },

  /**
   * Update participation
   */
  async updateParticipation(id: number, dto: UpdateParticipationDTO): Promise<Participation> {
    const response = await scheduleApiClient.put<Participation>(`/Participation/${id}`, dto);
    return response.data;
  },

  /**
   * Delete participation
   */
  async deleteParticipation(id: number): Promise<void> {
    await scheduleApiClient.delete(`/Participation/${id}`);
  },

  /**
   * Review participation
   */
  async reviewParticipation(id: number): Promise<void> {
    await scheduleApiClient.post(`/Participation/${id}/review`);
  },

  /**
   * Review waitlisted participation
   */
  async reviewWaitlistedParticipation(id: number): Promise<void> {
    await scheduleApiClient.post(`/Participation/${id}/review-waitlisted`);
  },

  /**
   * Approve participation
   */
  async approveParticipation(id: number): Promise<void> {
    await scheduleApiClient.post(`/Participation/${id}/approve`);
  },

  /**
   * Confirm participation with team ID
   */
  async confirmParticipation(id: number, teamId: number): Promise<void> {
    await scheduleApiClient.post(`/Participation/${id}/confirm`, teamId, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * Request cancellation
   */
  async requestCancellation(id: number, reason?: string): Promise<void> {
    const dto: RequestCancellationDTO = { reason };
    await scheduleApiClient.post(`/Participation/${id}/request-cancellation`, dto);
  },

  /**
   * Approve cancellation
   */
  async approveCancellation(id: number): Promise<void> {
    await scheduleApiClient.post(`/Participation/${id}/approve-cancellation`);
  },

  /**
   * Reject cancellation
   */
  async rejectCancellation(id: number): Promise<void> {
    await scheduleApiClient.post(`/Participation/${id}/reject-cancellation`);
  },

  /**
   * Admin cancel participation
   */
  async adminCancelParticipation(id: number, dto: AdminCancelParticipationDTO): Promise<void> {
    await scheduleApiClient.post(`/Participation/${id}/admin-cancel`, dto);
  },
};
