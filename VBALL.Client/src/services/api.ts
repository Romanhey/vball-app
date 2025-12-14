import { Match, Team } from '../types';

const API_BASE_URL = 'http://localhost/api';

// Helper to convert API response dates to Date objects
const parseMatch = (match: any): Match => {
  return {
    ...match,
    matchId: match.matchId || match.MatchId || match.id || match.Id,
    startTime: typeof match.startTime === 'string' 
      ? new Date(match.startTime) 
      : typeof match.StartTime === 'string'
      ? new Date(match.StartTime)
      : match.startTime || match.StartTime,
    teamAId: match.teamAId || match.TeamAId,
    teamBId: match.teamBId || match.TeamBId,
    status: match.status !== undefined ? match.status : match.Status,
    finalScore: match.finalScore || match.FinalScore,
  };
};

export const api = {
  // Get all matches
  async getMatches(skip: number = 0, take: number = 100): Promise<Match[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/Match?skip=${skip}&take=${take}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return Array.isArray(data) ? data.map(parseMatch) : [];
    } catch (error) {
      console.error('Error fetching matches:', error);
      return [];
    }
  },

  // Get match by ID
  async getMatch(id: number): Promise<Match | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/Match/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return parseMatch(data);
    } catch (error) {
      console.error(`Error fetching match ${id}:`, error);
      return null;
    }
  },

  // Get all teams
  async getTeams(skip: number = 0, take: number = 100): Promise<Team[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/Team?skip=${skip}&take=${take}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return Array.isArray(data) ? data.map((team: any) => ({
        teamId: team.teamId || team.TeamId,
        name: team.name || team.Name,
        rating: team.rating || team.Rating,
      })) : [];
    } catch (error) {
      console.error('Error fetching teams:', error);
      return [];
    }
  },

  // Get team by ID
  async getTeam(id: number): Promise<Team | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/Team/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return {
        teamId: data.teamId || data.TeamId,
        name: data.name || data.Name,
        rating: data.rating || data.Rating,
      };
    } catch (error) {
      console.error(`Error fetching team ${id}:`, error);
      return null;
    }
  },
};
