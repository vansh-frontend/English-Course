import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading, isAdmin } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>;
  }
  
  if (!currentUser || !isAdmin()) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
}