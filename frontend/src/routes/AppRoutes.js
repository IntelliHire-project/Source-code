import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../pages/landingpage/LandingPage';
import SignupPage from '../pages/candidate/Signup/SignupPage';
import SignInPage from '../pages/candidate/SignIn/SignInPage';
import VerifyEmailPage from '../pages/candidate/VerifyEmail/VerifyEmailPage';
import VerifyEmailSentPage from '../pages/candidate/VerifyEmailSent/VerifyEmailSentPage';
import RecruiterSignupPage from '../pages/recruiter/Signup/SignupPage';
import RecruiterPendingApprovalPage from '../pages/recruiter/PendingApproval/PendingApprovalPage';
import RecruiterInterviewTimeSlotManagement from '../pages/recruiter/InterviewTimeSlotManagement/InterviewTimeSlotManagement';
import CandidateInterviewAllocation from '../pages/recruiter/InterviewAllocation/CandidateInterviewAllocation';
import PanelInterviewSchedule from '../pages/panel/PanelInterviewSchedule';

import CommunityPage, {
  CommunityProfilePage,
  CreateDiscussionPage,
  DiscussionPage,
  GuidelinesPage,
  SavedPostsPage,
} from '../pages/community/CommunityPage';
import CandidateProfilePage from '../pages/candidate/Profile/CandidateProfilePage';
import CandidateDashboard from '../pages/candidate/CandidateDashboard/CandidateDashboard';
import SettingsPage from '../pages/candidate/Settings/SettingsPage';
import CvManagementPage from '../pages/candidate/Profile/CvManagementPage';
import JobSearch from '../pages/candidate/jobs/JobSearch';
import JobDetail from '../pages/candidate/jobs/JobDetail';
import ApplicationConfirmation from '../pages/candidate/jobs/ApplicationConfirmation';
import MyApplications from '../pages/candidate/MyApplications/MyApplications';
import ApplicationDetails from '../pages/candidate/ApplicationDetails/ApplicationDetails';
import CVInsights from '../pages/candidate/CVInsights/CVInsights';
import DashboardPage from '../pages/candidate/DashboardPage/DashboardPage';
import TakeAssessmentPage from '../pages/candidate/Assessments/TakeAssessmentPage';
import CandidateAssessmentsListPage from '../pages/candidate/Assessments/CandidateAssessmentsListPage';
import RecruiterDashboard from '../pages/recruiter/Dashboard/RecruiterDashboard';
import RankedApplicants from '../pages/recruiter/RankedApplicants/RankedApplicants';
import InterviewedApplicants from '../pages/recruiter/InterviewedApplicants/InterviewedApplicants';
import CreateVacancyPage from '../pages/recruiter/CreateVacancy/CreateVacancyPage';
import PreviewVacancyPage from '../pages/recruiter/PreviewVacancy/PreviewVacancyPage';
import VacancyManagementPage from '../pages/recruiter/VacancyManagement/VacancyManagementPage';
import VacancyDetailPage from '../pages/recruiter/VacancyDetail/VacancyDetailPage';
import PaymentBillingPage from '../pages/recruiter/PaymentBilling/PaymentBillingPage';
import SelectPaymentMethodPage from '../pages/recruiter/SelectPaymentMethod/SelectPaymentMethodPage';
import BankTransferPage from '../pages/recruiter/BankTransfer/BankTransferPage';
import MobileWalletPage from '../pages/recruiter/MobileWallet/MobileWalletPage';
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
import AddQuestionPage from '../pages/recruiter/Assessments/AddQuestionPage';
import AssessmentCandidatesPage from '../pages/recruiter/Assessments/AssessmentCandidatesPage';
import RecruiterProfilePage from '../pages/recruiter/RecruiterProfile/RecruiterProfilePage';
import RecruiterSidebar from '../components/common/RecruiterSidebar';
import TopBar from '../components/TopBar/TopBar';
import VacancySelectorModal from '../components/common/VacancySelectorModal';
import AdminDashboard from '../pages/admin/Dashboard/AdminDashboard';
import ManageUsers from '../pages/admin/ManageUsers/ManageUsers';
import VerifyRecruiters from '../pages/admin/VerifyRecruiters/VerifyRecruiters';
import ModerateContent from '../pages/admin/ModerateCommunity/ModerateCommunity';
import MonitorSystem from '../pages/admin/MonitorSystem/MonitorSystem';
import ViewAuditLogs from '../pages/admin/ViewAuditLogs/ViewAuditLogs';
import Payments from '../pages/admin/Payments/Payments';
import AdminProfile from '../pages/admin/AdminProfile/AdminProfile';
import RoleSelection from '../pages/candidate/MockInterview/RoleSelection';
import GeneratedQuestions from '../pages/candidate/MockInterview/GeneratedQuestions';
import MockInterviewSession from '../pages/candidate/MockInterview/MockInterviewSession';
import InterviewPerformanceAnalysis from '../pages/candidate/MockInterview/InterviewPerformanceAnalysis';
import InterviewHistory from '../pages/candidate/MockInterview/InterviewHistory';
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

// Role guard for recruiter-only routes
function RecruiterProtected({ children }) {
  return <ProtectedRoute allowedRoles={['recruiter']}>{children}</ProtectedRoute>;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/verify-email-sent" element={<VerifyEmailSentPage />} />
        <Route path="/recruiter/signup" element={<RecruiterSignupPage />} />
        <Route path="/recruiter/pending-approval" element={<RecruiterPendingApprovalPage />} />
        <Route path="/recruiter/interviews" element={<RecruiterProtected><RecruiterInterviewTimeSlotManagement /></RecruiterProtected>} />
        <Route path="/recruiter/interviews/allocation" element={<RecruiterProtected><CandidateInterviewAllocation /></RecruiterProtected>} />
        <Route path="/recruiter/interviews/invitations" element={<Navigate to="/recruiter/interviews/allocation" replace />} />
        <Route path="/recruiter/interviews/communication" element={<Navigate to="/recruiter/interviews/allocation" replace />} />
        <Route path="/recruiter/interviews/evaluation" element={<Navigate to="/panel/interviews" replace />} />

        <Route path="/recruiter/signin" element={<Navigate to="/signin" replace />} />
        <Route path="/admin/signin" element={<Navigate to="/signin" replace />} />
        <Route
          path="/candidate"
          element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <CandidateDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/candidate/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="profile" element={<CandidateProfilePage initialMode="view" />} />
          <Route path="profile/edit" element={<CandidateProfilePage initialMode="edit" />} />
          <Route path="cv-management" element={<CvManagementPage />} />
          <Route path="cv-insights" element={<CVInsights />} />
          <Route path="jobs" element={<JobSearch />} />
          <Route path="jobs/:jobId" element={<JobDetail />} />
          <Route path="application-confirmation" element={<ApplicationConfirmation />} />
          <Route path="applications" element={<MyApplications />} />
          <Route path="applications/:applicationId" element={<ApplicationDetails />} />
          <Route path="mock-interviews" element={<Navigate to="/candidate/mock-interviews/roleselection" replace />} />
          <Route path="mock-interviews/roleselection" element={<RoleSelection roleOverride="candidate" />} />
          <Route path="mock-interviews/questions" element={<GeneratedQuestions roleOverride="candidate" />} />
          <Route path="mock-interviews/session" element={<MockInterviewSession roleOverride="candidate" />} />
          <Route path="mock-interviews/feedback" element={<InterviewPerformanceAnalysis roleOverride="candidate" />} />
          <Route path="mock-interviews/history" element={<InterviewHistory roleOverride="candidate" />} />
          <Route path="interview-history" element={<InterviewHistory roleOverride="candidate" />} />
          <Route path="community" element={<CommunityPage roleOverride="candidate" />} />
          <Route path="community/new" element={<CreateDiscussionPage roleOverride="candidate" />} />
          <Route path="community/post/:postId" element={<DiscussionPage roleOverride="candidate" />} />
          <Route path="community/profile/:slug" element={<CommunityProfilePage roleOverride="candidate" />} />
          <Route path="community/saved" element={<SavedPostsPage roleOverride="candidate" />} />
          <Route path="community/guidelines" element={<GuidelinesPage roleOverride="candidate" />} />
          <Route path="notifications" element={<CandidatePlaceholder title="Notifications" />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="assessments" element={<CandidateAssessmentsListPage />} />
          <Route path="assessments/:assessmentId" element={<TakeAssessmentPage />} />
        </Route>
        <Route path="/candidate/my-assessments" element={<CandidateAssessmentsListPage />} />
        <Route path="/a/:assessmentId" element={<TakeAssessmentPage />} />
        <Route
          path="/recruiter/dashboard"
          element={<RecruiterProtected><RecruiterDashboard /></RecruiterProtected>}
        />
        <Route
          path="/recruiter/vacancies"
          element={<RecruiterProtected><VacancyManagementPage /></RecruiterProtected>}
        />
        <Route
          path="/vacancies/:id"
          element={<RecruiterProtected><VacancyDetailPage /></RecruiterProtected>}
        />
        <Route
          path="/recruiter/vacancies/:id"
          element={<RecruiterProtected><VacancyDetailPage /></RecruiterProtected>}
        />
        <Route
          path="/recruiter/create-vacancy"
          element={<RecruiterProtected><CreateVacancyPage /></RecruiterProtected>}
        />
        <Route
          path="/recruiter/create-vacancy/:id"
          element={<RecruiterProtected><CreateVacancyPage /></RecruiterProtected>}
        />
        <Route
          path="/recruiter/edit-vacancy/:id"
          element={<RecruiterProtected><CreateVacancyPage /></RecruiterProtected>}
        />
        <Route
          path="/recruiter/vacancy-preview"
          element={<RecruiterProtected><PreviewVacancyPage /></RecruiterProtected>}
        />
        <Route
          path="/recruiter/select-payment"
          element={<RecruiterProtected><SelectPaymentMethodPage /></RecruiterProtected>}
        />
        <Route
          path="/recruiter/bank-transfer"
          element={<RecruiterProtected><BankTransferPage /></RecruiterProtected>}
        />
        <Route
          path="/recruiter/mobile-wallet"
          element={<RecruiterProtected><MobileWalletPage /></RecruiterProtected>}
        />
        <Route
          path="/recruiter/complete-purchase"
          element={<RecruiterProtected><CompleteYourPurchasePage /></RecruiterProtected>}
        />
        <Route
          path="/recruiter/otp-verification"
          element={<RecruiterProtected><OTPVerificationPage /></RecruiterProtected>}
        />
        <Route
          path="/recruiter/payment-status"
          element={<RecruiterProtected><PaymentStatusPage /></RecruiterProtected>}
        />
        <Route
          path="/recruiter/payments"
          element={<RecruiterProtected><PaymentBillingPage /></RecruiterProtected>}
        />
        <Route
          path="/recruiter/profile"
          element={<RecruiterProtected><RecruiterProfilePage /></RecruiterProtected>}
        />
        <Route
          path="/recruiter/analytics"
          element={<RecruiterProtected><Navigate to="/recruiter/analytics/applicants" replace /></RecruiterProtected>}
        />
        <Route
          path="/recruiter/analytics/applicants"
          element={<RecruiterProtected><ApplicantAnalytics /></RecruiterProtected>}
        />
        <Route
          path="/recruiter/analytics/shortlisting"
          element={<RecruiterProtected><ShortlistingAnalytics /></RecruiterProtected>}
        />
        <Route
          path="/recruiter/analytics/assessment"
          element={<RecruiterProtected><AssessmentAnalytics /></RecruiterProtected>}
        />
        <Route
          path="/recruiter/analytics/progress"
          element={<RecruiterProtected><RecruitmentProgress /></RecruiterProtected>}
        />
        <Route
          path="/recruiter/assessments"
          element={<RecruiterProtected><AssessmentsPage /></RecruiterProtected>}
        />
        <Route path="/recruiter/question-bank" element={<RecruiterProtected><AssessmentsPage defaultTab="question-bank" /></RecruiterProtected>} />
        <Route path="/recruiter/question-bank/add" element={<RecruiterProtected><AddQuestionPage /></RecruiterProtected>} />
        <Route path="/recruiter/question-bank/edit/:questionId" element={<RecruiterProtected><AddQuestionPage /></RecruiterProtected>} />
        <Route path="/recruiter/assessments/new" element={<RecruiterProtected><CreateAssessmentPage /></RecruiterProtected>} />
        <Route path="/recruiter/assessments/:assessmentId" element={<RecruiterProtected><AssessmentPreviewPage /></RecruiterProtected>} />
        <Route path="/recruiter/assessments/:assessmentId/edit" element={<RecruiterProtected><CreateAssessmentPage /></RecruiterProtected>} />
        <Route path="/recruiter/assessments/:assessmentId/candidates" element={<RecruiterProtected><AssessmentCandidatesPage /></RecruiterProtected>} />
        <Route path="/recruiter/assessments/report/:candidateId" element={<RecruiterProtected><CandidateReportPage /></RecruiterProtected>} />
        <Route
          path="/recruiter/notifications"
          element={<RecruiterProtected><PlaceholderApplicants title="Notifications" /></RecruiterProtected>}
        />
        <Route
          path="/recruiter/company-profile"
          element={<RecruiterProtected><PlaceholderApplicants title="Company profile" /></RecruiterProtected>}
        />
        <Route
          path="/recruiter/applicants/ranked"
          element={<RecruiterProtected><RankedApplicants /></RecruiterProtected>}
        />
        <Route
          path="/recruiter/applicants/all"
          element={<RecruiterProtected><RankedApplicants /></RecruiterProtected>}
        />
        <Route
          path="/recruiter/applicants/shortlisted"
          element={<RecruiterProtected><RankedApplicants /></RecruiterProtected>}
        />
        <Route
          path="/recruiter/applicants/interviewed"
          element={<RecruiterProtected><InterviewedApplicants /></RecruiterProtected>}
        />
        <Route
          path="/recruiter/interviews"
          element={<RecruiterProtected><RecruiterInterviewTimeSlotManagement /></RecruiterProtected>}
        />
        <Route
          path="/recruiter/interviews/slots"
          element={<RecruiterProtected><RecruiterInterviewTimeSlotManagement /></RecruiterProtected>}
        />
        <Route
          path="/recruiter/interviews/allocation"
          element={<RecruiterProtected><CandidateInterviewAllocation /></RecruiterProtected>}
        />
        <Route
          path="/recruiter/panel-schedule"
          element={<RecruiterProtected><PanelInterviewSchedule /></RecruiterProtected>}
        />
        <Route
          path="/recruiter/interviews/evaluation"
          element={<Navigate to="/panel/interviews" replace />}
        />
        <Route
          path="/panel/interviews"
          element={<PanelInterviewSchedule />}
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
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/companies"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <VerifyRecruiters />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/verifications"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <VerifyRecruiters />
            </ProtectedRoute>
          }
        />
        <Route

          path="/admin/payments"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Payments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/community-mod"
          element={
            <ProtectedRoute allowedRoles={['admin', 'recruiter']}>
              <ModerateContent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/audit-log"
          element={
            <ProtectedRoute allowedRoles={['admin', 'recruiter']}>
              <ViewAuditLogs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/system-health"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <MonitorSystem />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPlaceholder title="Notifications" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPlaceholder title="System settings" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminProfile />
            </ProtectedRoute>
          }
        />
        {/* Community Forum — shared for both recruiters and candidates */}
        <Route path="/community" element={<Navigate to="/candidate/community" replace />} />
        <Route path="/recruiter/community" element={<RecruiterProtected><CommunityPage roleOverride="recruiter" /></RecruiterProtected>} />
        <Route path="/recruiter/community/new" element={<RecruiterProtected><CreateDiscussionPage roleOverride="recruiter" /></RecruiterProtected>} />
        <Route path="/recruiter/community/post/:postId" element={<RecruiterProtected><DiscussionPage roleOverride="recruiter" /></RecruiterProtected>} />
        <Route path="/recruiter/community/profile/:slug" element={<RecruiterProtected><CommunityProfilePage roleOverride="recruiter" /></RecruiterProtected>} />
        <Route path="/recruiter/community/saved" element={<RecruiterProtected><SavedPostsPage roleOverride="recruiter" /></RecruiterProtected>} />
        <Route path="/recruiter/community/guidelines" element={<RecruiterProtected><GuidelinesPage roleOverride="recruiter" /></RecruiterProtected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
