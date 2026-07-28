import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Eye,
  FileText,
  Filter,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Timer,
} from 'lucide-react';
import RecruiterSidebar from '../../../components/common/RecruiterSidebar';
import TopBar from '../../../components/TopBar/TopBar';
import './AssessmentsPage.css';

const ASSESSMENTS = [
  { id: 'senior-fullstack', name: 'Senior Fullstack Engineering Challenge', updated: '2 hours ago', role: 'Senior Software Engineer', candidates: 42, duration: 90, status: 'Active' },
  { id: 'product-strategy', name: 'Product Management Strategy Case', updated: '5 hours ago', role: 'Product Manager', candidates: 18, duration: 120, status: 'Reviewing' },
  { id: 'design-systems', name: 'UI/UX Design Systems Proficiency', updated: 'yesterday', role: 'Lead Designer', candidates: 25, duration: 60, status: 'Active' },
  { id: 'marketing-analytics', name: 'Q3 Marketing Analytics Test', updated: '3 days ago', role: 'Data Analyst', candidates: 124, duration: 45, status: 'Completed' },
  { id: 'success-communication', name: 'Customer Success Communication Lab', updated: '1 week ago', role: 'CS Manager', candidates: 9, duration: 30, status: 'Draft' },
  { id: 'devops-fundamentals', name: 'Entry Level DevOps Fundamentals', updated: '2 hours ago', role: 'Junior DevOps', candidates: 56, duration: 75, status: 'Active' },
];

const SUMMARY = [
  { label: 'Total assessments', value: 148, detail: 'Total created in the last 12 months', icon: FileText, trend: '+12%' },
  { label: 'Active now', value: 12, detail: 'Assessments currently accepting candidates', icon: CheckCircle2 },
  { label: 'Completed', value: 84, detail: 'Evaluation process finished', icon: BarChart3, trend: '+5%' },
  { label: 'Pending review', value: 26, detail: 'Candidates waiting for manual scoring', icon: Clock3 },
];

function AssessmentsPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [assessments, setAssessments] = useState(ASSESSMENTS);
  const [actionMenu, setActionMenu] = useState(null);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return assessments.filter((item) => {
      const matchesQuery = !normalized || `${item.name} ${item.role} ${item.status}`.toLowerCase().includes(normalized);
      return matchesQuery && (statusFilter === 'All' || item.status === statusFilter);
    });
  }, [query, statusFilter, assessments]);

  const duplicateAssessment = (item) => {
    setAssessments([...assessments, { ...item, id: `${item.id}-copy-${Date.now()}`, name: `${item.name} (Copy)`, status: 'Draft', updated: 'just now' }]);
    setActionMenu(null);
  };

  const toggleArchive = (item) => {
    setAssessments(assessments.map((assessment) => assessment.id === item.id ? { ...assessment, status: assessment.status === 'Archived' ? 'Draft' : 'Archived', updated: 'just now' } : assessment));
    setActionMenu(null);
  };

  const exportAssessments = () => {
    const header = 'Assessment Name,Job Role,Candidates,Duration,Status\n';
    const rows = filtered.map((item) =>
      [item.name, item.role, item.candidates, `${item.duration} min`, item.status]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    const url = URL.createObjectURL(new Blob([header + rows], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'assessments.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="create-vacancy assessments-shell">
      <RecruiterSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activeItem="Assessments" />
      <div className="create-vacancy__main">
        <TopBar
          user={{ name: 'Sarah Parker', role: 'Talent Acquisition Partner' }}
          notificationsCount={3}
          breadcrumbItems={[{ label: 'Assessments' }]}
          searchPlaceholder="Search assessments, roles, or candidates..."
          onSearch={(value) => { setQuery(value); setPage(1); }}
          onHamburgerClick={() => setSidebarOpen(true)}
        />

        <main className="assessments-content">
          <section className="assessment-summary" aria-label="Assessment summary">
            {SUMMARY.map(({ label, value, detail, icon: Icon, trend }) => (
              <article className="assessment-stat-card" key={label}>
                <div className="assessment-stat-top">
                  <span className="assessment-stat-icon"><Icon size={21} /></span>
                  {trend && <span className="assessment-trend">{trend}</span>}
                </div>
                <span className="assessment-stat-label">{label}</span>
                <strong>{value}</strong>
                <span className="assessment-stat-detail">{detail}</span>
              </article>
            ))}
          </section>

          <section className="assessment-management">
            <div className="assessment-section-head">
              <div>
                <h1>Manage Assessments</h1>
                <p>Review and manage your current recruitment assessments and workflows.</p>
              </div>
              <div className="assessment-controls">
                <div className="assessment-filter-wrap">
                  <button className={`assessment-dark-btn ${filterOpen ? 'is-active' : ''}`} type="button" onClick={() => setFilterOpen(!filterOpen)}>
                    <Filter size={16} /> Filter
                  </button>
                  {filterOpen && (
                    <div className="assessment-filter-menu">
                      {['All', 'Active', 'Reviewing', 'Completed', 'Draft'].map((status) => (
                        <button key={status} className={statusFilter === status ? 'is-selected' : ''} type="button" onClick={() => { setStatusFilter(status); setFilterOpen(false); setPage(1); }}>
                          {status}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button className="assessment-dark-btn" type="button" onClick={exportAssessments}><Download size={16} /> Export</button>
                <button className="assessment-dark-btn" type="button" onClick={() => navigate('/recruiter/question-bank')}><FileText size={16} /> Question Bank</button>
                <button className="assessment-primary-btn" type="button" onClick={() => navigate('/recruiter/assessments/new')}><Plus size={17} /> New Assessment</button>
              </div>
            </div>

            <div className="assessment-mobile-search">
              <Search size={16} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search assessments..." />
            </div>

            <div className="assessment-table-wrap">
              <table className="assessment-table">
                <thead><tr><th>Assessment Name</th><th>Job Role</th><th>Candidates</th><th>Duration</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.name}>
                      <td><strong>{item.name}</strong><small>Last updated {item.updated}</small></td>
                      <td>{item.role}</td>
                      <td><span className="candidate-count">{item.candidates}</span></td>
                      <td><span className="duration"><Timer size={15} /> {item.duration} min</span></td>
                      <td><span className={`assessment-status status-${item.status.toLowerCase()}`}>{item.status}</span></td>
                      <td>
                        <div className="assessment-actions">
                          <button title="Preview assessment" type="button" onClick={() => navigate(`/recruiter/assessments/${item.id}`)}><Eye size={17} /></button>
                          <button title="Edit assessment" type="button" onClick={() => navigate(`/recruiter/assessments/${item.id}/edit`)}><Pencil size={16} /></button>
                          <div className="assessment-more-wrap">
                            <button title="More assessment actions" type="button" aria-expanded={actionMenu === item.id} onClick={() => setActionMenu(actionMenu === item.id ? null : item.id)}><MoreHorizontal size={18} /></button>
                            {actionMenu === item.id && <div className="assessment-more-menu">
                              <button type="button" onClick={() => navigate(`/recruiter/assessments/${item.id}/candidates`)}>View candidate results</button>
                              <button type="button" onClick={() => duplicateAssessment(item)}>Duplicate assessment</button>
                              <button type="button" onClick={() => toggleArchive(item)}>{item.status === 'Archived' ? 'Restore assessment' : 'Archive assessment'}</button>
                              <button className="danger" type="button" onClick={() => { if (window.confirm(`Delete "${item.name}"?`)) setAssessments(assessments.filter((assessment) => assessment.id !== item.id)); setActionMenu(null); }}>Delete assessment</button>
                            </div>}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!filtered.length && <tr><td className="assessment-empty" colSpan="6">No assessments match your search.</td></tr>}
                </tbody>
              </table>
            </div>

            <footer className="assessment-footer">
              <span>Showing <strong>{filtered.length}</strong> of <strong>148</strong> assessments</span>
              <div className="assessment-pagination">
                <button disabled={page === 1} type="button" onClick={() => setPage(Math.max(1, page - 1))}><ChevronLeft size={15} /> Previous</button>
                {[1, 2, 3].map((number) => <button key={number} className={page === number ? 'current' : ''} type="button" onClick={() => setPage(number)}>{number}</button>)}
                <span>...</span><button type="button" onClick={() => setPage(12)}>12</button>
                <button disabled={page === 12} type="button" onClick={() => setPage(Math.min(12, page + 1))}>Next <ChevronRight size={15} /></button>
              </div>
            </footer>
          </section>
        </main>
      </div>
    </div>
  );
}

export default AssessmentsPage;
