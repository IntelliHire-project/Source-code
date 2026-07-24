import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../pages/landingpage/LandingPage';
import SignupPage from '../pages/candidate/Signup/SignupPage';
import SignInPage from '../pages/candidate/SignIn/SignInPage';
import RecruiterSignupPage from '../pages/recruiter/Signup/SignupPage';
import RecruiterPendingApprovalPage from '../pages/recruiter/PendingApproval/PendingApprovalPage';
import RecruiterInterviewTimeSlotManagementPage from '../pages/recruiter/InterviewTimeSlotManagement/InterviewTimeSlotManagementPage';
import CommunityPage from '../pages/community/CommunityPage';
import CandidateProfilePage from '../pages/candidate/Profile/CandidateProfilePage';
import CandidateDashboard from '../pages/candidate/CandidateDashboard';
import CvManagementPage from '../pages/candidate/Profile/CvManagementPage';
import RecruiterDashboard from '../pages/recruiter/Dashboard/RecruiterDashboard';
import RankedApplicants from '../pages/recruiter/RankedApplicants/RankedApplicants';
import RecruiterSidebar from '../components/common/RecruiterSidebar';
import TopBar from '../components/TopBar/TopBar';
import AdminSignInPage from '../pages/admin/SignIn/SignInPage';
import ManageUsers from '../pages/admin/ManageUsers/ManageUsers';
import VerifyRecruiters from '../pages/admin/VerifyRecruiters/VerifyRecruiters';
import ModerateContent from '../pages/admin/ModerateContent/ModerateContent';
import ProtectedRoute from './ProtectedRoute';
import AdminSidebar from '../components/common/AdminSidebar';
import { Menu } from 'lucide-react';
import '../styles/admin.css';
import '../pages/admin/VerifyRecruiters/VerifyRecruiters.css';

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

// Simple placeholder page for under-construction admin panels
function AdminPlaceholder({ title }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  return (
    <div className="admin-theme admin-dashboard">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItem={title}
      />
      <div className="admin-dashboard__main">
        <header className="admin-verifier-topbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', borderBottom: '1px solid var(--border)', background: 'var(--primary)' }}>
          <button
            className="topbar__hamburger verifier-hamburger-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Toggle sidebar"
            type="button"
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <Menu />
          </button>
          <div style={{ color: '#fff', fontWeight: 600, fontSize: '1.1rem', marginLeft: '12px' }}>IntelliHire Admin Panel</div>
        </header>

        <div style={{ color: '#fff', textAlign: 'center', padding: '100px 20px', minHeight: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'var(--primary-dark)' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '20px', fontWeight: 'bold' }}>{title}</h1>
          <p style={{ color: '#a79e8c', fontSize: '18px' }}>This admin page is currently under construction.</p>
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
        <Route path="/candidate" element={<CandidateDashboard />}>
          <Route index element={<Navigate to="/candidate/profile" replace />} />
          <Route path="profile" element={<CandidateProfilePage initialMode="view" />} />
          <Route path="profile/edit" element={<CandidateProfilePage initialMode="edit" />} />
          <Route path="cv-management" element={<CvManagementPage />} />
        </Route>
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
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminPlaceholder title="Dashboard" />
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
          path="/admin/companies"
          element={
            <ProtectedRoute>
              <VerifyRecruiters />
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
        <Route
          path="/admin/job-moderation"
          element={
            <ProtectedRoute>
              <AdminPlaceholder title="Job moderation" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <ProtectedRoute>
              <AdminPlaceholder title="Payments" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/community-mod"
          element={
            <ProtectedRoute>
              <ModerateContent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute>
              <AdminPlaceholder title="Reports" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/system-health"
          element={
            <ProtectedRoute>
              <AdminPlaceholder title="System health" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <ProtectedRoute>
              <AdminPlaceholder title="Notifications" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute>
              <AdminPlaceholder title="System settings" />
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
