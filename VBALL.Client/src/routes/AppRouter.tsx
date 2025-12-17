import { Routes, Route, Navigate } from 'react-router-dom';
import { CalendarPage } from '../pages/CalendarPage/CalendarPage';
import { MatchDetailsPage } from '../pages/MatchDetailsPage/MatchDetailsPage';
import { AdminPage } from '../pages/AdminPage/AdminPage';
import { AdminTeamsPage } from '../pages/AdminTeamsPage/AdminTeamsPage';
import { NotFoundPage } from '../pages/NotFoundPage/NotFoundPage';
import type { Match, Team } from '../types';

const noop = () => {};
const noopAsync = async () => {};
const placeholderMatches: Match[] = [];
const placeholderTeams: Record<number, Team> = {};

export const AppRouter: React.FC = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/calendar" replace />} />
    <Route path="/calendar" element={<CalendarPage />} />
    <Route path="/matches/:matchId" element={<MatchDetailsPage />} />
    <Route
      path="/admin"
      element={
        <AdminPage
          matches={placeholderMatches}
          teams={placeholderTeams}
          onRefresh={noopAsync}
          onOpenMenu={noop}
          onMatchClick={noop}
          isLoading
        />
      }
    />
    <Route
      path="/admin/teams"
      element={<AdminTeamsPage teams={[]} onRefresh={noopAsync} onOpenMenu={noop} isLoading />}
    />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);
