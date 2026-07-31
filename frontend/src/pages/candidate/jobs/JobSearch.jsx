import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Briefcase,
  GraduationCap,
  X,
  Sparkles,
  ArrowDown,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { CandidatePageContext } from '../CandidateDashboard/CandidateDashboard';
import './jobs.css';

/* ── Mock Data ── */

const MOCK_JOBS = [
  {
    id: 1,
    title: 'Senior Frontend Engineer',
    company: 'TechFlow Systems',
    location: 'Remote (NYC Based)',
    salaryRange: 'Rs 250,000 - Rs 350,000',
    postedTime: '2 hours ago',
    skills: ['React', 'TypeScript', 'Node.js'],
    matchScore: 95,
  },
  {
    id: 2,
    title: 'Product Designer',
    company: 'Nexus Creative',
    location: 'San Francisco, CA',
    salaryRange: 'Rs 220,000 - Rs 300,000',
    postedTime: '5 hours ago',
    skills: ['Figma', 'UI/UX', 'Design Systems'],
    matchScore: 82,
  },
  {
    id: 3,
    title: 'Full Stack Developer',
    company: 'Financier AI',
    location: 'London, UK',
    salaryRange: 'Rs 180,000 - Rs 260,000',
    postedTime: '1 day ago',
    skills: ['Python', 'PostgreSQL', 'Next.js'],
    matchScore: 60,
  },
  {
    id: 4,
    title: 'Cloud Architect',
    company: 'SkyScale Solutions',
    location: 'Austin, TX',
    postedTime: '2 days ago',
    skills: ['AWS', 'Terraform', 'Kubernetes'],
    matchScore: 45,
  },
];

const MOCK_TOP_MATCHES = [
  { id: 1, title: 'Senior Frontend Engineer', company: 'TechFlow Systems', matchPercent: 98 },
  { id: 2, title: 'Product Designer', company: 'Nexus Creative', matchPercent: 95 },
  { id: 3, title: 'Full Stack Developer', company: 'Financier AI', matchPercent: 88 },
  { id: 4, title: 'Cloud Architect', company: 'SkyScale Solutions', matchPercent: 85 },
];

/* ── Inline Components ── */

function JobCard({ title, company, location, salaryRange, postedTime, skills = [], onViewDetails }) {
  return (
    <div className="job-card">
      <div className="job-card__header">
        <div className="job-card__header-info">
          <h3 className="job-card__title">{title}</h3>
          <p className="job-card__company">
            {company}
            <span className="job-card__location"><MapPin size={13} />{location}</span>
          </p>
        </div>
      </div>
      <div className="job-card__badges">
        {salaryRange && <span className="job-card__badge">{salaryRange}</span>}
        <span className="job-card__badge"><Clock size={13} />{postedTime}</span>
      </div>
      {skills.length > 0 && (
        <div className="job-card__skills">
          {skills.map((skill) => <span key={skill} className="job-card__skill-tag">{skill}</span>)}
        </div>
      )}
      <div className="job-card__footer">
        <button className="job-card__btn job-card__btn--gold" onClick={onViewDetails}>View Details<ChevronRight size={15} /></button>
      </div>
    </div>
  );
}

function TopMatchItem({ title, company, matchPercent, onClick }) {
  return (
    <div className="top-match__item" onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}>
      <div className="top-match__item-header">
        <div className="top-match__item-info">
          <h4 className="top-match__item-title">{title}</h4>
          <p className="top-match__item-company">{company}</p>
        </div>
        <span className="top-match__item-percent">{matchPercent}%</span>
      </div>
    </div>
  );
}

/* ── Main Page ── */

function JobSearch() {
  const navigate = useNavigate();
  const { setPageLabel } = useContext(CandidatePageContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [experienceFilter, setExperienceFilter] = useState('Any Experience');

  useEffect(() => {
    setPageLabel('FIND JOBS');
  }, [setPageLabel]);

  const hasActiveFilters = typeFilter !== 'All Types' || experienceFilter !== 'Any Experience' || searchQuery;

  function handleClearAll() {
    setSearchQuery('');
    setTypeFilter('All Types');
    setExperienceFilter('Any Experience');
  }

  const filteredJobs = MOCK_JOBS.filter((job) => {
    if (typeFilter !== 'All Types' && job.type !== typeFilter) return false;
    if (experienceFilter !== 'Any Experience' && job.experience !== experienceFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !job.title.toLowerCase().includes(q) &&
        !job.company.toLowerCase().includes(q) &&
        !job.skills.some((s) => s.toLowerCase().includes(q))
      ) return false;
    }
    return true;
  });

  return (
    <div className="job-search">
      {/* Search & Filters */}
      <section className="job-search__filters">
        <div className="job-search__search-wrap">
          <Search size={18} className="job-search__search-icon" />
          <input
            type="text"
            className="job-search__search-input"
            placeholder="Search for your next role (e.g. Frontend Engineer, Product Manager)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="job-search__filter-row">
          <div className="job-search__filter-dropdowns">
            <div className="job-search__dropdown">
              <Briefcase size={15} />
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option>All Types</option><option>Full-time</option><option>Part-time</option><option>Contract</option><option>Freelance</option>
              </select>
            </div>
            <div className="job-search__dropdown">
              <GraduationCap size={15} />
              <select value={experienceFilter} onChange={(e) => setExperienceFilter(e.target.value)}>
                <option>Any Experience</option><option>Entry Level</option><option>Mid Level</option><option>Senior Level</option><option>Lead</option>
              </select>
            </div>
          </div>
          {hasActiveFilters && (
            <button className="job-search__clear-btn" onClick={handleClearAll}>
              <X size={14} />Clear All
            </button>
          )}
        </div>
      </section>

      {/* Body */}
      <div className="job-search__body">
        <main className="job-search__main">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} {...job} onViewDetails={() => navigate(`/candidate/jobs/${job.id}`)} />
          ))}
          {filteredJobs.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>No jobs match your current filters.</p>
          )}
          <button className="job-search__load-more">Load more opportunities<ArrowDown size={16} /></button>
        </main>

        <aside className="job-search__sidebar">
          <div className="job-search__sidebar-card">
            <div className="job-search__sidebar-header"><Sparkles size={18} /><h3>Top Jobs For You</h3></div>
            <p className="job-search__sidebar-caption">Recommended jobs based on your current active CV</p>
            <div className="job-search__match-list">
              {MOCK_TOP_MATCHES.map((match) => (
                <TopMatchItem key={match.id} {...match} onClick={() => navigate(`/candidate/jobs/${match.id}`)} />
              ))}
            </div>
            <button className="job-search__cv-score-btn" onClick={() => navigate('/candidate/cv-management')}>CV Management</button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default JobSearch;
