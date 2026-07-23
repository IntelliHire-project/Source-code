import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../pages/landingpage/LandingPage';
import SignupPage from '../pages/candidate/Signup/SignupPage';
import SignInPage from '../pages/candidate/SignIn/SignInPage';
import RecruiterSignupPage from '../pages/recruiter/Signup/SignupPage';
import RecruiterPendingApprovalPage from '../pages/recruiter/PendingApproval/PendingApprovalPage';
import RecruiterSignInPage from '../pages/recruiter/SignIn/SignInPage';
import RecruiterInterviewTimeSlotManagementPage from '../pages/recruiter/InterviewTimeSlotManagement/InterviewTimeSlotManagementPage';
import CommunityPage from '../pages/community/CommunityPage';
import RecruiterDashboard from '../pages/recruiter/Dashboard/RecruiterDashboard';
import AdminSignInPage from '../pages/admin/SignIn/SignInPage';
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
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/recruiter/signup" element={<RecruiterSignupPage />} />
        <Route path="/recruiter/pending-approval" element={<RecruiterPendingApprovalPage />} />
        <Route path="/recruiter/signin" element={<RecruiterSignInPage />} />
        <Route path="/recruiter/interviews" element={<RecruiterInterviewTimeSlotManagementPage />} />
        <Route path="/recruiter/signin" element={<SignInPage />} />
        <Route path="/admin/signin" element={<AdminSignInPage />} />
        <Route
          path="/recruiter/dashboard"
          element={<RecruiterDashboard />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        {/* Community Forum — shared for both recruiters and candidates */}
        <Route
          path="/community"
          element={
            <ProtectedRoute>
              <CommunityPage />
            </ProtectedRoute>
          }
        />
        {/* Public preview route (no auth required — for visual QA) */}
        <Route path="/community" element={<CommunityPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
