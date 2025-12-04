import { Routes, Route, Navigate } from 'react-router-dom';
import { CalendarPage } from '../pages/CalendarPage/CalendarPage';
import { MatchDetailsPage } from '../pages/MatchDetailsPage/MatchDetailsPage';
import { AdminPage } from '../pages/AdminPage/AdminPage';
import { NotFoundPage } from '../pages/NotFoundPage/NotFoundPage';

export const AppRouter: React.FC = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/calendar" replace />} />
    <Route path="/calendar" element={<CalendarPage />} />
    <Route path="/matches/:matchId" element={<MatchDetailsPage />} />
    <Route path="/admin" element={<AdminPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);
