import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

/**
 * Route guard component ensuring authenticated session context exists.
 */
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ color: '#fff', textAlign: 'center', padding: '50px' }}>Loading session...</div>;
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return children;
}

export default ProtectedRoute;
