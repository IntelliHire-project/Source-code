import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { roleHomePath } from '../utils/roleRoutes';

/**
 * Route guard component ensuring authenticated session context exists.
 * Optionally restricts access to a set of allowed roles.
 */
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ color: '#fff', textAlign: 'center', padding: '50px' }}>Loading session...</div>;
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={roleHomePath(user.role)} replace />;
  }

  return children;
}

export default ProtectedRoute;
