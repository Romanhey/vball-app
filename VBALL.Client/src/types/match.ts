export type MatchStatus = 'Scheduled' | 'InProgress' | 'Finished';
export type ParticipationStatus =
  | 'Applied'
  | 'Reviewed'
  | 'Registered'
  | 'Confirmed'
  | 'Waitlisted'
  | 'PendingCancellation'
  | 'Cancelled';

export interface TeamSummary {
  id: number;
  name: string;
  rating: number;
}

export interface MatchSummary {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  status: MatchStatus;
  court?: string;
  teamA?: TeamSummary;
  teamB?: TeamSummary;
}

export interface MatchEvent extends MatchSummary {
  playerCount?: number;
}
