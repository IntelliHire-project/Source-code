import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Briefcase,
  GraduationCap,
  X,
  Sparkles,
  Zap,
  ArrowDown,
  Bell,
  Bookmark,
  DollarSign,
  Clock,
  ChevronRight,
} from 'lucide-react';
import './JobSearch.css';

/* ── Mock Data ── */

const MOCK_JOBS = [
  {
    id: 1,
    logo: 'https://images.unsplash.com/photo-1563986768609-322da13575f2?auto=format&fit=crop&w=80&h=80&q=80',
    title: 'Senior Frontend Engineer',
    company: 'TechFlow Systems',
    location: 'Remote (NYC Based)',
    salaryRange: '$140k - $180k',
    postedTime: '2 hours ago',
    skills: ['React', 'TypeScript', 'Node.js'],
  },
  {
    id: 2,
    logo: 'https://images.unsplash.com/photo-1572044272145-01352ee573fa?auto=format&fit=crop&w=80&h=80&q=80',
    title: 'Product Designer',
    company: 'Nexus Creative',
    location: 'San Francisco, CA',
    salaryRange: '$120k - $160k',
    postedTime: '5 hours ago',
    skills: ['Figma', 'UI/UX', 'Design Systems'],
  },
  {
    id: 3,
    logo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=80&h=80&q=80',
    title: 'Full Stack Developer',
    company: 'Financier AI',
    location: 'London, UK',
    salaryRange: '£70k - £95k',
    postedTime: '1 day ago',
    skills: ['Python', 'PostgreSQL', 'Next.js'],
  },
  {
    id: 4,
    logo: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=80&h=80&q=80',
    title: 'Cloud Architect',
    company: 'SkyScale Solutions',
    location: 'Austin, TX',
    salaryRange: '$100 - $130/hr',
    postedTime: '2 days ago',
    skills: ['AWS', 'Terraform', 'Kubernetes'],
  },
];

const MOCK_TOP_MATCHES = [
  { id: 1, title: 'Senior React Developer', company: 'InnovaTech', matchPercent: 98, reasoning: 'Strong React/TypeScript match with your 8+ years of frontend experience' },
  { id: 2, title: 'Lead UI Engineer', company: 'Starlight', matchPercent: 95, reasoning: 'Aligns with your design systems expertise and leadership skills' },
  { id: 3, title: 'Software Engineer III', company: 'GlobalBank', matchPercent: 92, reasoning: 'Your Node.js and cloud skills are a strong match for this role' },
  { id: 4, title: 'Frontend Specialist', company: 'Growth Labs', matchPercent: 89, reasoning: 'Perfect fit for your React and performance optimization experience' },
  { id: 5, title: 'Full Stack Engineer', company: 'EcoConnect', matchPercent: 88, reasoning: 'Matches your full-stack profile with Python and Next.js skills' },
];

const TABS = [
  { label: 'Recommended', count: 24 },
  { label: 'Saved Jobs', count: 8 },
  { label: 'Applied', count: 3 },
];

/* ── Inline Components ── */

function JobCard({ logo, title, company, location, salaryRange, postedTime, skills = [], onViewDetails, onApply }) {
  return (
    <div className="job-card">
      <div className="job-card__header">
        <div className="job-card__logo-wrap">
          {logo ? (
            <img src={logo} alt={`${company} logo`} className="job-card__logo" />
          ) : (
            <div className="job-card__logo-placeholder">{company?.charAt(0) || 'C'}</div>
          )}
        </div>
        <div className="job-card__header-info">
          <h3 className="job-card__title">{title}</h3>
          <p className="job-card__company">
            {company}
            <span className="job-card__location"><MapPin size={13} />{location}</span>
          </p>
        </div>
        <button className="job-card__bookmark" aria-label="Save job"><Bookmark size={18} /></button>
      </div>
      <div className="job-card__badges">
        <span className="job-card__badge"><DollarSign size={13} />{salaryRange}</span>
        <span className="job-card__badge"><Clock size={13} />{postedTime}</span>
      </div>
      {skills.length > 0 && (
        <div className="job-card__skills">
          {skills.map((skill) => <span key={skill} className="job-card__skill-tag">{skill}</span>)}
        </div>
      )}
      <div className="job-card__footer">
        <button className="job-card__btn job-card__btn--outline" onClick={onViewDetails}>View Details</button>
        <button className="job-card__btn job-card__btn--gold" onClick={onApply}>Apply Now<ChevronRight size={15} /></button>
      </div>
    </div>
  );
}

function TopMatchItem({ title, company, matchPercent, reasoning, onClick }) {
  return (
    <div className="top-match__item" onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}>
      <div className="top-match__item-header">
        <div className="top-match__item-info">
          <h4 className="top-match__item-title">{title}</h4>
          <p className="top-match__item-company">{company}</p>
        </div>
        <span className="top-match__item-percent">{matchPercent}%</span>
      </div>
      {reasoning && (
        <div className="top-match__item-reason">
          <Zap size={12} />
          <span>{reasoning}</span>
        </div>
      )}
    </div>
  );
}

/* ── Main Page ── */

function JobSearch() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [experienceFilter, setExperienceFilter] = useState('Any Experience');

  const hasActiveFilters = locationFilter !== 'All Locations' || typeFilter !== 'All Types' || experienceFilter !== 'Any Experience' || searchQuery;

  function handleClearAll() {
    setSearchQuery('');
    setLocationFilter('All Locations');
    setTypeFilter('All Types');
    setExperienceFilter('Any Experience');
  }

  return (
    <div className="job-search">
      {/* Hero */}
      <section className="job-search__hero">
        <h1 className="job-search__hero-title">
          Find Your Next <em className="job-search__hero-gold">Career Move</em>
        </h1>
        <p className="job-search__hero-sub">
          AI-powered job searching that prioritises roles matching your unique skill set and career aspirations.
        </p>
      </section>

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
              <MapPin size={15} />
              <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
                <option>All Locations</option><option>Remote</option><option>New York</option><option>San Francisco</option><option>London</option><option>Austin</option>
              </select>
            </div>
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

      {/* Tabs */}
      <section className="job-search__tabs-section">
        <div className="job-search__tabs">
          {TABS.map((tab, i) => (
            <button key={tab.label} className={`job-search__tab ${activeTab === i ? 'job-search__tab--active' : ''}`} onClick={() => setActiveTab(i)}>
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
        <p className="job-search__profile-note">Showing results based on your profile completeness (<strong>92%</strong>)</p>
      </section>

      {/* Body */}
      <div className="job-search__body">
        <main className="job-search__main">
          {MOCK_JOBS.map((job) => (
            <JobCard key={job.id} {...job} onViewDetails={() => navigate(`/candidate/jobs/${job.id}`)} onApply={() => console.log('Apply:', job.id)} />
          ))}
          <button className="job-search__load-more">Load more opportunities<ArrowDown size={16} /></button>
        </main>

        <aside className="job-search__sidebar">
          <div className="job-search__sidebar-card">
            <div className="job-search__sidebar-header"><Sparkles size={18} /><h3>Top 10 For You</h3></div>
            <p className="job-search__sidebar-caption">REFINED BY AI BASED ON YOUR 'CV MANAGEMENT' INSIGHTS</p>
            <div className="job-search__match-list">
              {MOCK_TOP_MATCHES.map((match) => (
                <TopMatchItem key={match.id} {...match} onClick={() => console.log('View match:', match.id)} />
              ))}
            </div>
            <button className="job-search__cv-score-btn">Improve CV Score</button>
          </div>
          <div className="job-search__alerts-card">
            <div className="job-search__alerts-header"><Zap size={18} /><h4>Job Alerts Active</h4></div>
            <p className="job-search__alerts-desc">You have 3 active alerts for roles matching your profile. Get notified when new opportunities are posted.</p>
            <button className="job-search__alerts-link"><Bell size={14} />Manage notification settings</button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default JobSearch;
