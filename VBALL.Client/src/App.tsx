import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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
import { Match, Team, Notification, PlayerProfile } from './types';
import { matchService } from './services/matchService';
import { teamService } from './services/teamService';
import { notificationService } from './services/notificationService';
import { NotificationResponse } from './types';

// Main App Content with routing
const AppContent: React.FC = observer(() => {
  const authStore = useAuthStore();
  const navigate = useNavigate();
  
  // Navigation State
  const [activePage, setActivePage] = useState<'HOME' | 'NOTIFICATIONS' | 'PROFILE'>('HOME');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [viewMatchId, setViewMatchId] = useState<number | null>(null);

  // Data State
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Record<number, Team>>({});
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load data when authenticated
  useEffect(() => {
    if (!authStore.isAuthenticated) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [matchesData, teamsData, notificationsData] = await Promise.all([
          matchService.getMatches({ skip: 0, take: 100 }),
          teamService.getTeams({ skip: 0, take: 100 }),
          notificationService.getRecentNotifications().catch(() => [])
        ]);

        setMatches(matchesData);
        
        const teamsRecord: Record<number, Team> = {};
        teamsData.forEach(team => {
          teamsRecord[team.teamId] = team;
        });
        setTeams(teamsRecord);

        // Convert NotificationResponse to Notification format
        const convertedNotifications: Notification[] = notificationsData.map((n: NotificationResponse) => ({
          id: n.id,
          type: n.type === 'INFO' ? 'info' : 'confirmation',
          title: n.title,
          text: n.message,
          dateStr: new Date(n.createdAt).toLocaleDateString('ru-RU', { 
            day: 'numeric', 
            month: 'short', 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          isRead: false, // TODO: Add read status from API if available
        }));

        setNotifications(convertedNotifications);
        setProfile(null); // TODO: Load profile from API when available
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [authStore.isAuthenticated]);

  const handleNavigate = (page: 'HOME' | 'NOTIFICATIONS' | 'PROFILE') => {
    setActivePage(page);
    setIsMenuOpen(false);
    setViewMatchId(null);
  };

  const handleMatchClick = (id: number) => {
    setViewMatchId(id);
  };

  const handleLoginSuccess = () => {
    navigate('/home');
  };

  const handleRegisterSuccess = () => {
    navigate('/login');
  };

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

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
      <Route path="/home" element={
        <ProtectedRoute>
          <div className="min-h-screen bg-[#ECE6F0] text-[#1D1B20] flex justify-center font-sans">
            <div className="w-full max-w-md bg-[#ECE6F0] min-h-screen shadow-2xl relative flex flex-col overflow-hidden">
              <SideMenu 
                isOpen={isMenuOpen} 
                onClose={() => setIsMenuOpen(false)} 
                activePage={activePage}
                onNavigate={handleNavigate}
                unreadCount={unreadNotificationsCount}
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
                    historyMatches={matches.filter(m => m.status === 2)}
                    teams={teams}
                    onOpenMenu={() => setIsMenuOpen(true)}
                    onMatchClick={handleMatchClick}
                  />
                )}

                {activePage === 'HOME' && (
                  <HomePage 
                    onNavigate={handleNavigate}
                    onOpenMenu={() => setIsMenuOpen(true)}
                  />
                )}
              </main>
            </div>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/" element={<Navigate to="/home" replace />} />
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
