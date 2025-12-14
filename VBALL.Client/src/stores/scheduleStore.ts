import { makeAutoObservable } from 'mobx';
import type { MatchSummary } from '../types/match';

export type ScheduleView = 'calendar' | 'table';

export class ScheduleStore {
  matches: MatchSummary[] = [];
  view: ScheduleView = 'calendar';
  isLoading = false;

  constructor() {
    makeAutoObservable(this);
  }

  setView(view: ScheduleView) {
    this.view = view;
  }

  setMatches(data: MatchSummary[]) {
    this.matches = data;
  }

  bootstrapMockData() {
    const now = new Date();
    const createMatch = (offsetHours: number, id: number): MatchSummary => {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8 + offsetHours);
      const end = new Date(start.getTime() + 90 * 60 * 1000);
      return {
        id,
        title: `Матч #${id}`,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        status: id % 3 === 0 ? 'InProgress' : 'Scheduled',
        teamA: { id: id * 10, name: 'Team A', rating: 1450 },
        teamB: { id: id * 10 + 1, name: 'Team B', rating: 1480 },
        court: 'Главный зал',
      };
    };

    this.matches = [0, 2, 4, 6].map((offset, index) => createMatch(offset, index + 1));
  }
}
