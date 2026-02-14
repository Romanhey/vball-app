// Match Status enum matching C# backend
export enum MatchStatus {
  Scheduled = 0,
  InProgress = 1,
  Finished = 2,
  Cancelled = 3,
}

// Participation Status enum
export enum ParticipationStatus {
  Applied = 'Applied',
  Reviewed = 'Reviewed',
  Registered = 'Registered',
  Confirmed = 'Confirmed',
  Waitlisted = 'Waitlisted',
  PendingCancellation = 'PendingCancellation',
  Cancelled = 'Cancelled',
}

// Cancellation Type enum
export enum CancellationType {
  PlayerRequest = 'PlayerRequest',
  AdminDecision = 'AdminDecision',
  NoConfirmation = 'NoConfirmation',
  Emergency = 'Emergency',
}

export interface Match {
  matchId: number;
  startTime: Date | string;
  teamAId: number;
  teamBId: number;
  status: MatchStatus;
  finalScore?: string;
  format?: '4x4' | 'Classic';
  stage?: 'Group' | 'Final' | 'StarMatch';
}

export interface Team {
  teamId: number;
  name: string;
  rating: number;
}

export interface DayGroup {
  date: Date;
  matches: Match[];
}

export type FilterFormat = '4x4' | 'Classic' | 'All';
export type FilterStage = 'Group' | 'Final' | 'StarMatch' | 'All';

export type NotificationType = 'confirmation' | 'info';

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  text?: string;
  dateStr: string;
  isRead: boolean;
  actionRequired?: boolean;
}

export type UserRole = 'Player' | 'Admin';

export interface PlayerProfileStats {
  totalRequests: number;
  confirmed: number;
  finished: number;
  cancellations: number;
}

export interface PlayerProfile {
  id: number;
  name: string;
  email: string;
  role?: UserRole;
  phone?: string;
  height?: number;
  age?: number;
  stats?: PlayerProfileStats;
}

export interface Participation {
  participationId: number;
  matchId: number;
  playerId: number;
  teamId?: number | null;
  createdAt: string;
  updatedAt?: string;
  status: ParticipationStatus;
  cancellationReason?: string | null;
  cancellationType?: CancellationType | null;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  email: string;
  name: string;
  password: string;
  passwordRepeat: string;
}

export interface LoginResponse {
  AccesToken?: string;
  accesToken?: string;
  AccessToken?: string;
  accessToken?: string;
}

export interface CreateMatchDTO {
  startTime: string;
  teamAId: number;
  teamBId: number;
}

export interface UpdateMatchDTO {
  startTime?: string;
  teamAId?: number;
  teamBId?: number;
  matchStatus?: MatchStatus;
  finalScore?: string;
}

export interface CreateTeamDTO {
  name: string;
  rating: number;
}

export interface UpdateTeamDTO {
  name?: string;
  rating?: number;
}

export interface CreateParticipationDTO {
  matchId: number;
  playerId: number;
}

export interface UpdateParticipationDTO {
  status?: ParticipationStatus;
}

export interface RequestCancellationDTO {
  reason?: string;
}

export interface AdminCancelParticipationDTO {
  cancellationType: CancellationType;
  reason?: string;
}

export interface NotificationResponse {
  id: number;
  title: string;
  message: string;
  type: string;
  createdAt: string;
}

export interface NotificationRequest {
  title: string;
  message: string;
  type?: string;
}
