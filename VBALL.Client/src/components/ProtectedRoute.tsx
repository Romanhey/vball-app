import React from 'react';
import { Navigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useAuthStore } from '../stores/rootStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = observer(({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const authStore = useAuthStore();

  if (!authStore.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !authStore.isAdmin) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
});
