import React, { useState } from 'react';
import RecruiterSidebar from '../../../components/common/RecruiterSidebar';
import TopBar from '../../../components/TopBar/TopBar';

export default function AssessmentShell({
  children,
  currentPage,
  searchPlaceholder = 'Search platform...',
  onSearch,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const breadcrumbs = [
    { label: 'Recruiter', path: '/recruiter/dashboard' },
    ...(currentPage
      ? [
          { label: 'Assessments', path: '/recruiter/assessments' },
          { label: currentPage },
        ]
      : [{ label: 'Assessments' }]),
  ];

  return (
    <div className="create-vacancy assessment-flow-shell">
      <RecruiterSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activeItem="Assessments" />
      <div className="create-vacancy__main">
        <TopBar
          user={{ name: 'Sarah Parker', role: 'Talent Acquisition Partner' }}
          notificationsCount={3}
          breadcrumbItems={breadcrumbs}
          searchPlaceholder={searchPlaceholder}
          onSearch={onSearch}
          onHamburgerClick={() => setSidebarOpen(true)}
        />
        {children}
      </div>
    </div>
  );
}
