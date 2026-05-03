import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type {
  Match,
  Team,
  Notification,
  PlayerProfile,
  Participation,
} from '../types';
import { matchService } from '../services/matchService';
import { teamService } from '../services/teamService';
import { notificationService } from '../services/notificationService';
import { participationService } from '../services/participationService';
import { userService } from '../services/userService';
import { useAuthStore } from '../stores/rootStore';

interface AppDataContextValue {
  matches: Match[];
  teams: Record<number, Team>;
  notifications: Notification[];
  profile: PlayerProfile | null;
  participations: Participation[];
  loading: boolean;
  loadAllData: () => Promise<void>;
  refreshParticipations: () => Promise<void>;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({
  children,
}: {
  children: ReactNode;
}) {
  const authStore = useAuthStore();
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Record<number, Team>>({});
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshParticipations = useCallback(async () => {
    if (!authStore.isAuthenticated || !authStore.user?.id) {
      setParticipations([]);
      return;
    }
    try {
      const data = await participationService.getParticipations({
        PlayerId: Number(authStore.user.id),
        take: 200,
      });
      setParticipations(data);
    } catch (err) {
      console.error('Error loading participations:', err);
    }
  }, [authStore.isAuthenticated, authStore.user?.id]);

  const loadAllData = useCallback(async () => {
    if (!authStore.isAuthenticated) {
      setMatches([]);
      setTeams({});
      setNotifications([]);
      setProfile(null);
      setParticipations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [matchesResult, teamsResult, notificationsResult, profileResult] =
        await Promise.allSettled([
          matchService.getMatches({ skip: 0, take: 100 }),
          teamService.getTeams({ skip: 0, take: 100 }),
          notificationService.getRecentNotifications(authStore.user!.id),
          userService.getCurrentUser(),
        ]);

      if (matchesResult.status === 'fulfilled') {
        setMatches(matchesResult.value);
      } else {
        setMatches([]);
      }

      if (teamsResult.status === 'fulfilled') {
        const teamsRecord: Record<number, Team> = {};
        teamsResult.value.forEach((team) => {
          teamsRecord[team.teamId] = team;
        });
        setTeams(teamsRecord);
      } else {
        setTeams({});
      }

      if (notificationsResult.status === 'fulfilled') {
        const converted: Notification[] = notificationsResult.value.map(
          (n) => ({
            id: n.id,
            type: n.type?.toUpperCase() === 'INFO' ? 'info' : 'confirmation',
            title: n.title,
            text: n.message,
            dateStr: new Date(n.createdAt).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            }),
            isRead: false,
          })
        );
        setNotifications(converted);
      } else {
        setNotifications([]);
      }

      if (profileResult.status === 'fulfilled' && profileResult.value) {
        setProfile(profileResult.value);
      } else if (authStore.user) {
        setProfile({
          id: Number(authStore.user.id),
          name: authStore.user.name ?? authStore.user.email,
          email: authStore.user.email,
          role: authStore.isAdmin ? 'Admin' : 'Player',
        });
      }

      await refreshParticipations();
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, [authStore.isAuthenticated, authStore.user, authStore.isAdmin, refreshParticipations]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const value: AppDataContextValue = {
    matches,
    teams,
    notifications,
    profile,
    participations,
    loading,
    loadAllData,
    refreshParticipations,
  };

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error('useAppData must be used within AppDataProvider');
  }
  return ctx;
}
