import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../pages/landingpage/LandingPage';
import SignupPage from '../pages/candidate/Signup/SignupPage';
import SignInPage from '../pages/candidate/SignIn/SignInPage';
import RecruiterSignupPage from '../pages/recruiter/Signup/SignupPage';
import RecruiterPendingApprovalPage from '../pages/recruiter/PendingApproval/PendingApprovalPage';
import RecruiterInterviewTimeSlotManagementPage from '../pages/recruiter/InterviewTimeSlotManagement/InterviewTimeSlotManagementPage';
import CommunityPage from '../pages/community/CommunityPage';
import RecruiterDashboard from '../pages/recruiter/Dashboard/RecruiterDashboard';
import RankedApplicants from '../pages/recruiter/RankedApplicants/RankedApplicants';
import RecruiterSidebar from '../components/common/RecruiterSidebar';
import TopBar from '../components/TopBar/TopBar';
import AdminSignInPage from '../pages/admin/SignIn/SignInPage';
import ManageUsers from '../pages/admin/ManageUsers/ManageUsers';
import VerifyRecruiters from '../pages/admin/VerifyRecruiters/VerifyRecruiters';
import ProtectedRoute from './ProtectedRoute';

// Simple placeholder page for other applicant categories
function PlaceholderApplicants({ title }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  return (
    <div className="create-vacancy">
      <RecruiterSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItem={title}
      />
      <div className="create-vacancy__main">
        <TopBar
          user={{ name: 'Recruiter', role: 'Recruiter Account' }}
          notificationsCount={3}
          searchPlaceholder="Search..."
          onHamburgerClick={() => setSidebarOpen(true)}
        />
        <div style={{ color: '#fff', textAlign: 'center', padding: '100px 20px', background: 'var(--primary-dark)', minHeight: 'calc(100vh - 64px)' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>{title}</h1>
          <p style={{ color: '#a79e8c' }}>This page is currently under construction.</p>
        </div>
      </div>
    </div>
  );
}

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
        <Route path="/recruiter/interviews" element={<RecruiterInterviewTimeSlotManagementPage />} />
        <Route path="/recruiter/signin" element={<SignInPage />} />
        <Route path="/admin/signin" element={<AdminSignInPage />} />
        <Route
          path="/recruiter/dashboard"
          element={<RecruiterDashboard />}
        />
        <Route
          path="/recruiter/applicants/ranked"
          element={<RankedApplicants />}
        />
        <Route
          path="/recruiter/applicants/all"
          element={<PlaceholderApplicants title="All Applicants" />}
        />
        <Route
          path="/recruiter/applicants/shortlisted"
          element={<PlaceholderApplicants title="Shortlisted" />}
        />
        <Route
          path="/recruiter/applicants/interviewed"
          element={<PlaceholderApplicants title="Interviewed" />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <ManageUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/verifications"
          element={
            <ProtectedRoute>
              <VerifyRecruiters />
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
