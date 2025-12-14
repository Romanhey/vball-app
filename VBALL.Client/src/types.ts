// Match Status enum matching C# backend
export enum MatchStatus {
  Scheduled = 0,
  InProgress = 1,
  Finished = 2,
  Cancelled = 3
}

// Participation Status enum
export enum ParticipationStatus {
  Applied = 'Applied',
  Reviewed = 'Reviewed',
  Registered = 'Registered',
  Confirmed = 'Confirmed',
  Waitlisted = 'Waitlisted',
  PendingCancellation = 'PendingCancellation',
  Cancelled = 'Cancelled'
}

// Cancellation Type enum
export enum CancellationType {
  PlayerRequest = 'PlayerRequest',
  AdminDecision = 'AdminDecision',
  NoConfirmation = 'NoConfirmation',
  Emergency = 'Emergency'
}

export interface Match {
  matchId: number;
  startTime: Date | string; // Can be Date or ISO string from API
  teamAId: number;
  teamBId: number;
  status: MatchStatus;
  finalScore?: string;
  // UI helper properties (optional, but useful if backend sends them)
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

// Notification Types
export type NotificationType = 'confirmation' | 'info';

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  text?: string;
  dateStr: string; // "2м" or "29 апр. 10:21"
  isRead: boolean;
  // Specific properties for confirmation
  actionRequired?: boolean;
}

export interface PlayerProfile {
  id: number;
  name: string;
  email: string;
  height: number;
  age: number;
  gamesPlayed: number;
  winRate: number; // percentage
  phone: string;
}

// ========== Auth DTOs ==========
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
  AccesToken: string;
}

// ========== Match DTOs ==========
export interface CreateMatchDTO {
  startTime: string; // ISO date-time string
  teamAId: number;
  teamBId: number;
}

export interface UpdateMatchDTO {
  startTime?: string;
  teamAId?: number;
  teamBId?: number;
  status?: MatchStatus;
  finalScore?: string;
}

// ========== Team DTOs ==========
export interface CreateTeamDTO {
  name: string;
  rating: number;
}

export interface UpdateTeamDTO {
  name?: string;
  rating?: number;
}

// ========== Participation DTOs ==========
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

// ========== Notification DTOs ==========
export interface NotificationResponse {
  id: number;
  title: string;
  message: string;
  type: string; // INFO, WARNING, ERROR, etc.
  createdAt: string; // ISO date-time string
}

export interface NotificationRequest {
  title: string;
  message: string;
  type?: string;
}
