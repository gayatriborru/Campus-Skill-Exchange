import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner text="Checking authentication status..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    const isExplorerOrMentors =
      location.pathname.startsWith('/explore') ||
      location.pathname.startsWith('/users') ||
      location.pathname.startsWith('/mentors') ||
      location.pathname.startsWith('/leaderboard');

    const message = isExplorerOrMentors
      ? 'Please login to explore mentors and skills.'
      : 'Please login to access this page.';

    return <Navigate to="/login" state={{ from: location, message }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
