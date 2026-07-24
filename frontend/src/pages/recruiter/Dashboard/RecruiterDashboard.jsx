import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Users,
  Eye,
  TrendingUp,
  PlusCircle,
} from 'lucide-react';
import RecruiterSidebar from '../../../components/common/RecruiterSidebar';
import TopBar from '../../../components/TopBar/TopBar';
import '../../../style.css';

const STATS = [
  { label: 'Active Vacancies', value: '12', icon: Briefcase, color: 'var(--accent)' },
  { label: 'Total Applicants', value: '284', icon: Users, color: 'var(--accent-info)' },
  { label: 'Total Views', value: '1,847', icon: Eye, color: 'var(--accent-success)' },
  { label: 'Conversion Rate', value: '8.2%', icon: TrendingUp, color: 'var(--accent-dark)' },
];

function RecruiterDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
          searchPlaceholder="Search vacancies…"
          onSearch={(q) => console.log('Search:', q)}
          onNotificationClick={() => console.log('Notifications clicked')}
          onLogout={() => console.log('Logout')}
          onHamburgerClick={() => setSidebarOpen(true)}
        />

      </div>
    </div>
  );
}

export default RecruiterDashboard;
