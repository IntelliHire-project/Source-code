import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SignupPage from '../pages/Signup/SignupPage';
import SignInPage from '../pages/SignIn/SignInPage';
import ProtectedRoute from './ProtectedRoute';

// Simple Dashboard template for authenticated users
function Dashboard() {
  return (
    <div style={{ color: '#fff', textAlign: 'center', padding: '100px 20px' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>Welcome to IntelliHire Dashboard</h1>
      <p style={{ color: '#a79e8c' }}>You have successfully signed in and accessed this protected route!</p>
    </div>
  );
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        {/* Default route redirects to /signup */}
        <Route path="*" element={<Navigate to="/signup" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
