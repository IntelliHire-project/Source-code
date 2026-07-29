import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../pages/landingpage/LandingPage';
import SignupPage from '../pages/candidate/Signup/SignupPage';
import SignInPage from '../pages/candidate/SignIn/SignInPage';
import RecruiterSignupPage from '../pages/recruiter/Signup/SignupPage';
import RecruiterPendingApprovalPage from '../pages/recruiter/PendingApproval/PendingApprovalPage';
import RecruiterInterviewTimeSlotManagement from '../pages/recruiter/InterviewTimeSlotManagement/InterviewTimeSlotManagement';
import CandidateInterviewAllocation from '../pages/recruiter/InterviewAllocation/CandidateInterviewAllocation';
import InterviewCommunication from '../pages/recruiter/InterviewCommunication/InterviewCommunication';
import InterviewEvaluationPage from '../pages/recruiter/InterviewEvaluation/InterviewEvaluation';
import CommunityPage, {
  CommunityProfilePage,
  CreateDiscussionPage,
  DiscussionPage,
  GuidelinesPage,
  SavedPostsPage,
} from '../pages/community/CommunityPage';
import CandidateProfilePage from '../pages/candidate/Profile/CandidateProfilePage';
import CandidateDashboard from '../pages/candidate/CandidateDashboard';
import CvManagementPage from '../pages/candidate/Profile/CvManagementPage';
import JobSearch from '../pages/candidate/jobs/JobSearch';
import JobDetail from '../pages/candidate/jobs/JobDetail';
import ApplicationConfirmation from '../pages/candidate/jobs/ApplicationConfirmation';
import RecruiterDashboard from '../pages/recruiter/Dashboard/RecruiterDashboard';
import RankedApplicants from '../pages/recruiter/RankedApplicants/RankedApplicants';
import InterviewedApplicants from '../pages/recruiter/InterviewedApplicants/InterviewedApplicants';
import CreateVacancyPage from '../pages/recruiter/CreateVacancy/CreateVacancyPage';
import PreviewVacancyPage from '../pages/recruiter/PreviewVacancy/PreviewVacancyPage';
import VacancyManagementPage from '../pages/recruiter/VacancyManagement/VacancyManagementPage';
import PaymentBillingPage from '../pages/recruiter/PaymentBilling/PaymentBillingPage';
import SelectPaymentMethodPage from '../pages/recruiter/SelectPaymentMethod/SelectPaymentMethodPage';
import CompleteYourPurchasePage from '../pages/recruiter/CompleteYourPurchase/CompleteYourPurchasePage';
import OTPVerificationPage from '../pages/recruiter/OTPVerification/OTPVerificationPage';
import PaymentStatusPage from '../pages/recruiter/PaymentStatus/PaymentStatusPage';
import ApplicantAnalytics from '../pages/recruiter/ApplicantAnalytics/ApplicantAnalytics';
import ShortlistingAnalytics from '../pages/recruiter/ShortlistingAnalytics/ShortlistingAnalytics';
import AssessmentAnalytics from '../pages/recruiter/AssessmentAnalytics/AssessmentAnalytics';
import RecruitmentProgress from '../pages/recruiter/RecruitmentProgress/RecruitmentProgress';
import AssessmentsPage from '../pages/recruiter/Assessments/AssessmentsPage';
import QuestionBankPage from '../pages/recruiter/Assessments/QuestionBankPage';
import CreateAssessmentPage from '../pages/recruiter/Assessments/CreateAssessmentPage';
import CandidateReportPage from '../pages/recruiter/Assessments/CandidateReportPage';
import AssessmentPreviewPage from '../pages/recruiter/Assessments/AssessmentPreviewPage';
import AssessmentCandidatesPage from '../pages/recruiter/Assessments/AssessmentCandidatesPage';
import RecruiterSidebar from '../components/common/RecruiterSidebar';
import TopBar from '../components/TopBar/TopBar';
import VacancySelectorModal from '../components/common/VacancySelectorModal';
import AdminSignInPage from '../pages/admin/SignIn/SignInPage';
import AdminDashboard from '../pages/admin/Dashboard/AdminDashboard';
import ManageUsers from '../pages/admin/ManageUsers/ManageUsers';
import VerifyRecruiters from '../pages/admin/VerifyRecruiters/VerifyRecruiters';
import ModerateContent from '../pages/admin/ModerateContent/ModerateContent';
import MonitorSystem from '../pages/admin/MonitorSystem/MonitorSystem';
import ViewAuditLogs from '../pages/admin/ViewAuditLogs/ViewAuditLogs';
import Payments from '../pages/admin/Payments/Payments';
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
      <VacancySelectorModal />
    </div>
  );
}

function CandidatePlaceholder({ title }) {
  return (
    <div style={{ color: '#fff', textAlign: 'center', padding: '100px 20px', minHeight: 'calc(100vh - 64px)' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>{title}</h1>
      <p style={{ color: '#a79e8c' }}>This candidate page is currently under construction.</p>
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
        <Route path="/recruiter/interviews" element={<RecruiterInterviewTimeSlotManagement />} />
        <Route path="/recruiter/interviews/allocation" element={<CandidateInterviewAllocation />} />
        <Route path="/recruiter/interviews/invitations" element={<InterviewCommunication />} />
        <Route path="/recruiter/interviews/communication" element={<InterviewCommunication />} />
        <Route path="/recruiter/interviews/evaluation" element={<InterviewEvaluationPage />} />
        <Route path="/recruiter/signin" element={<SignInPage />} />
        <Route path="/admin/signin" element={<AdminSignInPage />} />
        <Route path="/candidate" element={<CandidateDashboard />}>
          <Route index element={<Navigate to="/candidate/dashboard" replace />} />
          <Route path="dashboard" element={<CandidatePlaceholder title="Dashboard" />} />
          <Route path="profile" element={<CandidateProfilePage initialMode="view" />} />
          <Route path="profile/edit" element={<CandidateProfilePage initialMode="edit" />} />
          <Route path="cv-management" element={<CvManagementPage />} />
          <Route path="cv-insights" element={<CandidatePlaceholder title="CV insights" />} />
          <Route path="jobs" element={<JobSearch />} />
          <Route path="jobs/:jobId" element={<JobDetail />} />
          <Route path="application-confirmation" element={<ApplicationConfirmation />} />
          <Route path="applications" element={<CandidatePlaceholder title="My applications" />} />
          <Route path="mock-interviews" element={<CandidatePlaceholder title="Mock interviews" />} />
          <Route path="community" element={<CommunityPage roleOverride="candidate" />} />
          <Route path="community/new" element={<CreateDiscussionPage roleOverride="candidate" />} />
          <Route path="community/post/:postId" element={<DiscussionPage roleOverride="candidate" />} />
          <Route path="community/profile/:slug" element={<CommunityProfilePage roleOverride="candidate" />} />
          <Route path="community/saved" element={<SavedPostsPage roleOverride="candidate" />} />
          <Route path="community/guidelines" element={<GuidelinesPage roleOverride="candidate" />} />
          <Route path="notifications" element={<CandidatePlaceholder title="Notifications" />} />
          <Route path="settings" element={<CandidatePlaceholder title="Settings" />} />
        </Route>
        <Route
          path="/recruiter/dashboard"
          element={<RecruiterDashboard />}
        />
        <Route
          path="/recruiter/vacancies"
          element={<VacancyManagementPage />}
        />
        <Route
          path="/recruiter/create-vacancy"
          element={<CreateVacancyPage />}
        />
        <Route
          path="/recruiter/vacancy-preview"
          element={<PreviewVacancyPage />}
        />
        <Route
          path="/recruiter/select-payment"
          element={<SelectPaymentMethodPage />}
        />
        <Route
          path="/recruiter/complete-purchase"
          element={<CompleteYourPurchasePage />}
        />
        <Route
          path="/recruiter/otp-verification"
          element={<OTPVerificationPage />}
        />
        <Route
          path="/recruiter/payment-status"
          element={<PaymentStatusPage />}
        />
        <Route
          path="/recruiter/payments"
          element={<PaymentBillingPage />}
        />
        <Route
          path="/recruiter/analytics"
          element={<Navigate to="/recruiter/analytics/applicants" replace />}
        />
        <Route
          path="/recruiter/analytics/applicants"
          element={<ApplicantAnalytics />}
        />
        <Route
          path="/recruiter/analytics/shortlisting"
          element={<ShortlistingAnalytics />}
        />
        <Route
          path="/recruiter/analytics/assessment"
          element={<AssessmentAnalytics />}
        />
        <Route
          path="/recruiter/analytics/progress"
          element={<RecruitmentProgress />}
        />
        <Route
          path="/recruiter/assessments"
          element={<AssessmentsPage />}
        />
        <Route path="/recruiter/question-bank" element={<QuestionBankPage />} />
        <Route path="/recruiter/assessments/new" element={<CreateAssessmentPage />} />
        <Route path="/recruiter/assessments/:assessmentId" element={<AssessmentPreviewPage />} />
        <Route path="/recruiter/assessments/:assessmentId/edit" element={<CreateAssessmentPage />} />
        <Route path="/recruiter/assessments/:assessmentId/candidates" element={<AssessmentCandidatesPage />} />
        <Route path="/recruiter/assessments/report/:candidateId" element={<CandidateReportPage />} />
        <Route
          path="/recruiter/notifications"
          element={<PlaceholderApplicants title="Notifications" />}
        />
        <Route
          path="/recruiter/company-profile"
          element={<PlaceholderApplicants title="Company profile" />}
        />
        <Route
          path="/recruiter/applicants/ranked"
          element={<RankedApplicants />}
        />
        <Route
          path="/recruiter/applicants/all"
          element={<RankedApplicants />}
        />
        <Route
          path="/recruiter/applicants/shortlisted"
          element={<RankedApplicants />}
        />
        <Route
          path="/recruiter/applicants/interviewed"
          element={<InterviewedApplicants />}
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
              <AdminDashboard />
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
              <Payments />
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
              <ViewAuditLogs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/system-health"
          element={
            <ProtectedRoute>
              <MonitorSystem />
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
        <Route path="/community" element={<Navigate to="/candidate/community" replace />} />
        <Route path="/recruiter/community" element={<CommunityPage roleOverride="recruiter" />} />
        <Route path="/recruiter/community/new" element={<CreateDiscussionPage roleOverride="recruiter" />} />
        <Route path="/recruiter/community/post/:postId" element={<DiscussionPage roleOverride="recruiter" />} />
        <Route path="/recruiter/community/profile/:slug" element={<CommunityProfilePage roleOverride="recruiter" />} />
        <Route path="/recruiter/community/saved" element={<SavedPostsPage roleOverride="recruiter" />} />
        <Route path="/recruiter/community/guidelines" element={<GuidelinesPage roleOverride="recruiter" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
