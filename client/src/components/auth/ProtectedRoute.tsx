import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { currentUser, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show clean loading spinner while checking session
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin mb-2" />
        <p className="text-xs text-stone-500 font-medium">Verifying authorization...</p>
      </div>
    );
  }

  // 1. Unauthenticated users must be redirected to /login
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Role-based access control:
  // If user role is not allowed for this route, redirect to their own dashboard
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    let targetDashboard = '/customer/dashboard';
    if (currentUser.role === 'provider') {
      targetDashboard = '/provider/dashboard';
    } else if (currentUser.role === 'admin') {
      targetDashboard = '/admin/dashboard';
    }

    return <Navigate to={targetDashboard} replace />;
  }

  return <>{children}</>;
};
