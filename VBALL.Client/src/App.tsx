import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { StoreProvider, useAuthStore } from './stores/rootStore';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { SideMenu } from './components/SideMenu';
import { NotificationsPage } from './components/NotificationsPage';
import { ProfilePage } from './components/ProfilePage';
import { MatchDetails } from './components/MatchDetails';
import { Match, Team, Notification, PlayerProfile, Participation, UserRole } from './types';
import { matchService } from './services/matchService';
import { teamService } from './services/teamService';
import { notificationService } from './services/notificationService';
import { NotificationResponse } from './types';
import { participationService } from './services/participationService';
import { userService } from './services/userService';
import { AdminPage } from './pages/AdminPage/AdminPage';
import { AdminTeamsPage } from './pages/AdminTeamsPage/AdminTeamsPage';

// Main App Content with routing
const AppContent: React.FC = observer(() => {
  const authStore = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Navigation State
  type ShellPage = 'HOME' | 'NOTIFICATIONS' | 'PROFILE';
  type MenuPage = ShellPage | 'ADMIN' | 'ADMIN_TEAMS';
  const [activePage, setActivePage] = useState<ShellPage>('HOME');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [viewMatchId, setViewMatchId] = useState<number | null>(null);

  // Data State
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
    } catch (error) {
      console.error('Error loading participations:', error);
    }
  }, [authStore.isAuthenticated, authStore.user?.id]);

  const createProfileFromAuth = useCallback((): PlayerProfile | null => {
    if (!authStore.user) {
      return null;
    }

    const inferredRole: UserRole = authStore.isAdmin ? 'Admin' : 'Player';

    return {
      id: Number(authStore.user.id),
      name: authStore.user.name ?? authStore.user.email,
      email: authStore.user.email,
      role: inferredRole,
    };
  }, [authStore.user, authStore.isAdmin]);

  useEffect(() => {
    if (authStore.user) {
      setProfile((prev) => prev ?? createProfileFromAuth());
    } else {
      setProfile(null);
    }
  }, [authStore.user, createProfileFromAuth]);

  const loadAllData = useCallback(async () => {
    if (!authStore.isAuthenticated) {
      setMatches([]);
      setTeams({});
      setNotifications([]);
      setProfile(null);
      setParticipations([]);
      return;
    }

    setLoading(true);
    try {
      const [matchesResult, teamsResult, notificationsResult, profileResult] = await Promise.allSettled([
        matchService.getMatches({ skip: 0, take: 100 }),
        teamService.getTeams({ skip: 0, take: 100 }),
        notificationService.getRecentNotifications(),
        userService.getCurrentUser(),
      ]);

      if (matchesResult.status === 'fulfilled') {
        setMatches(matchesResult.value);
      } else {
        console.warn('Не удалось загрузить матчи', matchesResult.reason);
        setMatches([]);
      }

      if (teamsResult.status === 'fulfilled') {
        const teamsRecord: Record<number, Team> = {};
        teamsResult.value.forEach((team) => {
          teamsRecord[team.teamId] = team;
        });
        setTeams(teamsRecord);
      } else {
        console.warn('Не удалось загрузить команды', teamsResult.reason);
        setTeams({});
      }

      if (notificationsResult.status === 'fulfilled') {
        const convertedNotifications: Notification[] = notificationsResult.value.map((n: NotificationResponse) => ({
          id: n.id,
          type: n.type === 'INFO' ? 'info' : 'confirmation',
          title: n.title,
          text: n.message,
          dateStr: new Date(n.createdAt).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          }),
          isRead: false,
        }));
        setNotifications(convertedNotifications);
      } else {
        console.warn('Не удалось загрузить уведомления', notificationsResult.reason);
        setNotifications([]);
      }

      if (profileResult.status === 'fulfilled' && profileResult.value) {
        setProfile(profileResult.value);
      } else if (authStore.user) {
        setProfile((prev) => prev ?? createProfileFromAuth());
      }

      await refreshParticipations();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [authStore.isAuthenticated, authStore.user, createProfileFromAuth, refreshParticipations]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleNavigate = (page: MenuPage) => {
    if (page === 'ADMIN' || page === 'ADMIN_TEAMS') {
      setIsMenuOpen(false);
      navigate(page === 'ADMIN' ? '/admin' : '/admin/teams');
      return;
    }

    if (location.pathname !== '/home') {
      navigate('/home');
    }

    setActivePage(page);
    setIsMenuOpen(false);
    setViewMatchId(null);
  };

  const handleMatchClick = (id: number) => {
    setViewMatchId(id);
  };

  const handleApplyToMatches = async (matchIds: number[]) => {
    if (!authStore.user?.id) {
      throw new Error('Не удалось определить пользователя');
    }

    const availableIds = matchIds.filter(
      (matchId) => !participations.some((p) => p.matchId === matchId)
    );

    if (!availableIds.length) {
      return;
    }

    await Promise.all(
      availableIds.map((matchId) =>
        participationService.createParticipation({
          matchId,
          playerId: Number(authStore.user!.id),
        })
      )
    );

    await refreshParticipations();
  };

  const handleLoginSuccess = () => {
    setActivePage('HOME');
    setViewMatchId(null);
    setIsMenuOpen(false);
    navigate(authStore.isAdmin ? '/admin' : '/home');
  };

  const handleRegisterSuccess = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    authStore.logout();
    setMatches([]);
    setTeams({});
    setNotifications([]);
    setParticipations([]);
    setProfile(null);
    setViewMatchId(null);
    setActivePage('HOME');
    setIsMenuOpen(false);
    navigate('/login');
  };

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;
  const menuActivePage: MenuPage = useMemo(() => {
    if (location.pathname.startsWith('/admin/teams')) {
      return 'ADMIN_TEAMS';
    }
    if (location.pathname.startsWith('/admin')) {
      return 'ADMIN';
    }
    return activePage;
  }, [activePage, location.pathname]);

  const renderAdminLayout = (content: React.ReactNode) => (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-[#ECE6F0] text-[#1D1B20] flex justify-center font-sans">
        <div className="w-full max-w-5xl bg-[#ECE6F0] min-h-screen shadow-2xl relative flex flex-col overflow-hidden">
          <SideMenu
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            activePage={menuActivePage}
            onNavigate={handleNavigate}
            unreadCount={unreadNotificationsCount}
            showAdminLink={authStore.isAdmin}
            onLogout={handleLogout}
          />

          <main className="flex-1 flex flex-col overflow-hidden">{content}</main>
        </div>
      </div>
    </ProtectedRoute>
  );

  // Loading state
  if (loading && authStore.isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#ECE6F0] flex items-center justify-center">
        <div className="text-[#1D1B20]">Загрузка...</div>
      </div>
    );
  }

  // Render Details View (Overrides everything else if active)
  if (viewMatchId !== null && authStore.isAuthenticated) {
    const match = matches.find(m => m.matchId === viewMatchId);
    
    if (match) {
      const teamA = teams[match.teamAId] || null;
      const teamB = teams[match.teamBId] || null;
      
      return (
        <div className="min-h-screen bg-[#ECE6F0] flex justify-center font-sans">
          <div className="w-full max-w-md bg-[#ECE6F0] min-h-screen shadow-2xl relative flex flex-col">
            <MatchDetails 
              match={match} 
              teamA={teamA}
              teamB={teamB}
              onBack={() => setViewMatchId(null)} 
            />
          </div>
        </div>
      );
    }
  }

  return (
    <Routes>
      <Route path="/login" element={
        authStore.isAuthenticated ? (
          <Navigate to="/home" replace />
        ) : (
          <LoginForm 
            onSuccess={handleLoginSuccess}
            onSwitchToRegister={() => navigate('/register')}
          />
        )
      } />
      <Route path="/register" element={
        authStore.isAuthenticated ? (
          <Navigate to="/home" replace />
        ) : (
          <RegisterForm 
            onSuccess={handleRegisterSuccess}
            onSwitchToLogin={() => navigate('/login')}
          />
        )
      } />
      <Route
        path="/admin"
        element={renderAdminLayout(
          <AdminPage
            matches={matches}
            teams={teams}
            onRefresh={loadAllData}
            onOpenMenu={() => setIsMenuOpen(true)}
            onMatchClick={handleMatchClick}
            isLoading={loading}
          />
        )}
      />
      <Route
        path="/admin/teams"
        element={renderAdminLayout(
          <AdminTeamsPage
            teams={Object.values(teams)}
            onRefresh={loadAllData}
            onOpenMenu={() => setIsMenuOpen(true)}
            isLoading={loading}
          />
        )}
      />
      <Route path="/home" element={
        <ProtectedRoute>
          <div className="min-h-screen bg-[#ECE6F0] text-[#1D1B20] flex justify-center font-sans">
            <div className="w-full max-w-md bg-[#ECE6F0] min-h-screen shadow-2xl relative flex flex-col overflow-hidden">
              <SideMenu 
                isOpen={isMenuOpen} 
                onClose={() => setIsMenuOpen(false)} 
                activePage={menuActivePage}
                onNavigate={handleNavigate}
                unreadCount={unreadNotificationsCount}
                showAdminLink={authStore.isAdmin}
                onLogout={handleLogout}
              />

              <main className="flex-1 flex flex-col overflow-hidden">
                {activePage === 'NOTIFICATIONS' && (
                  <NotificationsPage 
                    notifications={notifications}
                    onBack={() => handleNavigate('HOME')} 
                  />
                )}

                {activePage === 'PROFILE' && (
                  <ProfilePage 
                    profile={profile}
                    participations={participations}
                    matches={matches}
                    teams={teams}
                    onOpenMenu={() => setIsMenuOpen(true)}
                    onMatchClick={handleMatchClick}
                    onLogout={handleLogout}
                  />
                )}

                {activePage === 'HOME' && (
                  <HomePage 
                    matches={matches}
                    teams={teams}
                    participations={participations}
                    isLoading={loading}
                    onNavigate={(page) => handleNavigate(page)}
                    onOpenMenu={() => setIsMenuOpen(true)}
                    onMatchClick={handleMatchClick}
                    onApplyToMatches={handleApplyToMatches}
                  />
                )}
              </main>
            </div>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/" element={<Navigate to={authStore.isAdmin ? '/admin' : '/home'} replace />} />
    </Routes>
  );
});

// Root App Component
const App: React.FC = () => {
  return (
    <StoreProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </StoreProvider>
  );
};

export default App;
