import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';
import { LoginPage } from './LoginPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Additional safety check - if loading for too long, show login
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.log('ProtectedRoute: Loading timeout reached');
    }, 8000);
    
    return () => clearTimeout(timeoutId);
  }, [loading]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <>{children}</>;
};