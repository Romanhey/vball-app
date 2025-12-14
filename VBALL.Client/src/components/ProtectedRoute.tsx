import React from 'react';
import { Navigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useAuthStore } from '../stores/rootStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = observer(({ children }: ProtectedRouteProps) => {
  const authStore = useAuthStore();

  if (!authStore.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
});
