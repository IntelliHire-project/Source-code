import React, { useState, createContext } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import CandidateSidebar from '../../../components/common/CandidateSidebar';
import TopBar from '../../../components/TopBar/TopBar';
import useAuth from '../../../hooks/useAuth';
import '../../../styles/tokens.css';
import '../../../styles/admin.css';
import '../../../styles/candidate.css';

export const CandidatePageContext = createContext();

function CandidateDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pageLabel, setPageLabel] = useState('CANDIDATE PROFILE');
  const navigate = useNavigate();
  const { user, updateAuthUser } = useAuth();

  // Map the auth user to the expected shape, with fallbacks for UI
  const candidateUser = {
    ...user,
    name: user?.fullName || user?.name || 'Candidate User',
    avatar: user?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=280&h=280&q=80',
  };

  return (
    <CandidatePageContext.Provider value={{ setPageLabel, user: candidateUser, updateAuthUser }}>
      <div className="admin-theme candidate-dashboard">
        <CandidateSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          user={candidateUser}
        />

        <div className="candidate-dashboard__main">
          <TopBar
            user={candidateUser}
            notificationsCount={2}
            searchPlaceholder="Search…"
            onSearch={(q) => console.log('Search:', q)}
            onNotificationClick={() => console.log('Notifications clicked')}
            onProfileClick={() => navigate('/candidate/profile')}
            onHamburgerClick={() => setSidebarOpen(true)}
            breadcrumbItems={[{ label: pageLabel }]}
          />

          <div className="candidate-dashboard__content">
            <Outlet />
          </div>
        </div>
      </div>
    </CandidatePageContext.Provider>
  );
}

export default CandidateDashboard;
