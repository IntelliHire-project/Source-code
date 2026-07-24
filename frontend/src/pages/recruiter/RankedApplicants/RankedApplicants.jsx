import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Users,
  Target,
  Clock,
  ChevronDown,
  ChevronRight,
  Play,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ExternalLink,
  X,
  Sliders,
  Filter,
  ArrowLeft,
  Check,
  UserMinus,
  UserCheck,
  FileText,
} from 'lucide-react';
import RecruiterSidebar from '../../../components/common/RecruiterSidebar';
import TopBar from '../../../components/TopBar/TopBar';
import './RankedApplicants.css';
import '../../../style.css';

// Mock Vacancies Data
const MOCK_VACANCIES = [
  {
    id: 1,
    title: 'Software Engineer',
    code: '#1023',
    status: 'Active',
    postedTime: 'Posted 12 days ago',
    totalApplicants: 48,
    avgScore: '72%',
    lastMatched: '2 mins ago',
    lastMatchedBy: 'By Admin Recruiter',
    applicantsCountSubtext: '+12 since last run',
    engineConfidence: 'Engine Confidence: High',
    insightText: 'The matching engine has prioritised React and AWS for this role. Check the Job Parsing preview to adjust weighted skill importance.',
  },
  {
    id: 2,
    title: 'Product Manager',
    code: '#1024',
    status: 'Active',
    postedTime: 'Posted 5 days ago',
    totalApplicants: 14,
    avgScore: '81%',
    lastMatched: '1 hour ago',
    lastMatchedBy: 'By Senior Recruiter',
    applicantsCountSubtext: '+3 since last run',
    engineConfidence: 'Engine Confidence: Very High',
    insightText: 'The matching engine has prioritised Product Strategy and Agile Roadmap for this role. Check the Job Parsing preview to adjust weighted skill importance.',
  },
  {
    id: 3,
    title: 'UX Designer',
    code: '#1025',
    status: 'Closed',
    postedTime: 'Posted 20 days ago',
    totalApplicants: 35,
    avgScore: '79%',
    lastMatched: '2 days ago',
    lastMatchedBy: 'By HR Assistant',
    applicantsCountSubtext: 'Finalized',
    engineConfidence: 'Engine Confidence: High',
    insightText: 'The matching engine has prioritised Figma prototyping and User Research for this role. Check the Job Parsing preview to adjust weighted skill importance.',
  }
];

// Rich Mock Candidates Data
const MOCK_CANDIDATES = [
  // Vacancy 1: Software Engineer
  {
    vacancyId: 1,
    rank: '#1',
    name: 'Alex Sterling',
    activeTime: 'ACTIVE 2H AGO',
    score: 94,
    skills: ['React', 'TypeScript', 'Node.js', 'AWS'],
    expMatch: 'Matched',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80',
    email: 'alex.sterling@example.com',
    phone: '+1 (555) 124-5678',
    experience: '6 Years',
    bio: 'Senior Frontend Engineer with deep expertise in building cloud-native React architectures. Passionate about performance tuning and UI design systems.',
    education: 'B.S. in Computer Science - Stanford University',
    matchReason: 'Exceptional match. Over 5 years of industry React experience, verified AWS certification, and strong full-stack skills matching job description.',
    shortlisted: true,
  },
  {
    vacancyId: 1,
    rank: '#2',
    name: 'Sarah Jenkins',
    activeTime: 'ACTIVE 5H AGO',
    score: 94,
    skills: ['React.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS Lambda', 'GraphQL', 'Docker', 'CI/CD'],
    expMatch: 'Matched',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80',
    email: 'sarah.jenkins@example.com',
    phone: '+1 (555) 987-6543',
    experience: '8 Years',
    bio: 'Senior Full Stack Engineer with deep expertise in full-stack JavaScript architectures. Proactive in setting up CI/CD pipelines, optimizing databases, and orchestrating serverless APIs.',
    education: 'B.S. Computer Science - Georgia Institute of Technology',
    matchReason: 'Strong alignment in core technical stack and leadership duration. Minor penalties applied for missing niche DevOps tooling (Kubernetes), but semantic similarity suggests high adaptability based on Docker/AWS experience.',
  },
  {
    vacancyId: 1,
    rank: '#3',
    name: 'Michael Chen',
    activeTime: 'ACTIVE 1D AGO',
    score: 72,
    skills: ['Java', 'Spring Boot', 'MySQL'],
    expMatch: 'Underqualified',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&h=100&q=80',
    email: 'michael.chen@example.com',
    phone: '+1 (555) 246-8101',
    experience: '2 Years',
    bio: 'Junior Backend Developer specializing in Java microservices. Fast learner with strong computer science fundamentals and algorithmic skills.',
    education: 'B.S. in Computer Engineering - UC Berkeley',
    matchReason: 'Underqualified. Candidate has solid backend foundation but lacks modern JavaScript framework experience (React) and cloud skills (AWS).',
  },
  {
    vacancyId: 1,
    rank: '#4',
    name: 'Elena Rodriguez',
    activeTime: 'ACTIVE 3H AGO',
    score: 65,
    skills: ['Vue.js', 'JavaScript', 'Firebase'],
    expMatch: 'Matched',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&h=100&q=80',
    email: 'elena.rodriguez@example.com',
    phone: '+1 (555) 369-1215',
    experience: '5 Years',
    bio: 'Frontend Specialist focused on responsive web design and real-time databases. Deeply experienced in JavaScript frameworks and CSS modules.',
    education: 'B.A. in Web Design & Dev - UT Austin',
    matchReason: 'Partial core skills. Exceptional JavaScript and frontend developer, but core skills are Vue-heavy instead of React. Quick transferability expected.',
    shortlisted: true,
  },
  {
    vacancyId: 1,
    rank: '#5',
    name: 'Jordan Smith',
    activeTime: 'ACTIVE 1W AGO',
    score: 42,
    skills: ['PHP', 'Laravel', 'jQuery'],
    expMatch: 'Mismatch',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80',
    email: 'jordan.smith@example.com',
    phone: '+1 (555) 456-7890',
    experience: '3 Years',
    bio: 'Full Stack PHP developer with experience building content management solutions and enterprise websites. Well-versed in traditional server-side rendering.',
    education: 'Self-Taught & Certified Web Developer',
    matchReason: 'Mismatch. Experience is centered around server-side PHP/Laravel and legacy jQuery. Missing modern React, TypeScript, and AWS cloud competencies.',
  },
  {
    vacancyId: 1,
    rank: '#6',
    name: 'Priya Patel',
    activeTime: 'ACTIVE 4D AGO',
    score: 38,
    skills: ['Java', 'React Native'],
    expMatch: 'Mismatch',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80',
    email: 'priya.patel@example.com',
    phone: '+1 (555) 789-0123',
    experience: '3 Years',
    bio: 'Mobile App Developer focused on cross-platform frameworks. Experienced in React Native and Java/Android apps.',
    education: 'B.S. in Computer Science - Georgia Tech',
    matchReason: 'Mismatch. Specialized in mobile applications; lacks web application architecture, system design, and AWS environment expertise.',
  },
  {
    vacancyId: 1,
    rank: '#7',
    name: 'Lucas Dubois',
    activeTime: 'ACTIVE 6D AGO',
    score: 35,
    skills: ['Ruby', 'Rails', 'PostgreSQL'],
    expMatch: 'Mismatch',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80',
    email: 'lucas.dubois@example.com',
    phone: '+1 (555) 890-1234',
    experience: '4 Years',
    bio: 'Backend specialist with Rails focus. Enjoys database optimization, SQL debugging, and setting up automated CI/CD pipelines.',
    education: 'B.S. in Software Engineering - Sorbonne University',
    matchReason: 'Mismatch. High proficiency in backend Ruby on Rails, but missing required React and AWS cloud experience.',
  },
  {
    vacancyId: 1,
    rank: '#8',
    name: 'Emily Wong',
    activeTime: 'ACTIVE 2W AGO',
    score: 28,
    skills: ['HTML', 'CSS', 'jQuery'],
    expMatch: 'Mismatch',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100&q=80',
    email: 'emily.wong@example.com',
    phone: '+1 (555) 901-2345',
    experience: '1 Year',
    bio: 'Entry-level UI Web Developer with a strong eye for graphics design and responsive layouts. Experienced with legacy sites.',
    education: 'Web Design Bootcamp Graduate',
    matchReason: 'Mismatch. Lacks required professional programming depth, framework knowledge, and cloud computing infrastructure experience.',
  },

  // Vacancy 2: Product Manager
  {
    vacancyId: 2,
    rank: '#1',
    name: 'Diana Prince',
    activeTime: 'ACTIVE 1H AGO',
    score: 96,
    skills: ['Product Strategy', 'Agile', 'Roadmapping', 'User Analytics'],
    expMatch: 'Matched',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&h=100&q=80',
    email: 'diana.prince@example.com',
    phone: '+1 (555) 321-4321',
    experience: '8 Years',
    bio: 'Senior Product Manager with a track record of driving cross-functional engineering and design teams to deliver high-growth consumer apps.',
    education: 'MBA - Harvard Business School',
    matchReason: 'Outstanding candidate. Proven success in Agile methodologies, stellar technical product management background, and excellent roadmap formulation.',
    shortlisted: true,
  },
  {
    vacancyId: 2,
    rank: '#2',
    name: 'Clark Kent',
    activeTime: 'ACTIVE 3H AGO',
    score: 85,
    skills: ['Stakeholder Management', 'Agile', 'JIRA', 'Product Launch'],
    expMatch: 'Matched',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80',
    email: 'clark.kent@example.com',
    phone: '+1 (555) 765-4321',
    experience: '5 Years',
    bio: 'Product Manager focused on workflow optimization and SaaS integrations. Excellent at translating complex requirements into simple user stories.',
    education: 'B.A. in Journalism & Business - Northwestern',
    matchReason: 'Strong match. Solid experience managing product lifecycle, although lacks extensive mobile-native release experience.',
  },
  {
    vacancyId: 2,
    rank: '#3',
    name: 'Bruce Wayne',
    activeTime: 'ACTIVE 3D AGO',
    score: 70,
    skills: ['Roadmapping', 'Budgeting', 'Risk Management'],
    expMatch: 'Partial Match',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&h=100&q=80',
    email: 'bruce.wayne@example.com',
    phone: '+1 (555) 888-8888',
    experience: '10 Years',
    bio: 'Executive Product Strategist who focuses on corporate risk assessment and high-level enterprise software deployment planning.',
    education: 'B.S. in Economics - Yale University',
    matchReason: 'Experienced leader but lacks hand-on technical Agile scrum team management credentials. More suited for portfolio strategy.',
  },
  {
    vacancyId: 2,
    rank: '#4',
    name: 'Barry Allen',
    activeTime: 'ACTIVE 4H AGO',
    score: 52,
    skills: ['Scrum', 'JIRA', 'Rapid Delivery'],
    expMatch: 'Underqualified',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=100&h=100&q=80',
    email: 'barry.allen@example.com',
    phone: '+1 (555) 999-9999',
    experience: '2 Years',
    bio: 'Associate Product Manager passionate about fast iterations, continuous deployment loops, and rapid prototyping workflows.',
    education: 'B.S. in Chemistry - Central City College',
    matchReason: 'Underqualified. Fast pace and high energy, but lacks structural product management experience and strategic roadmap definition skills.',
  },

  // Vacancy 3: UX Designer
  {
    vacancyId: 3,
    rank: '#1',
    name: 'Ada Lovelace',
    activeTime: 'ACTIVE 30M AGO',
    score: 98,
    skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
    expMatch: 'Matched',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100&q=80',
    email: 'ada.lovelace@example.com',
    phone: '+1 (555) 101-0101',
    experience: '7 Years',
    bio: 'Lead UX Designer focused on complex data visualization frameworks and clean, pixel-perfect user journeys.',
    education: 'BFA in Graphic Design - RISD',
    matchReason: 'Perfect design match. Deep Figma capabilities, stellar design systems expertise, and strong technical coding knowledge for seamless developer handoff.',
    shortlisted: true,
  },
  {
    vacancyId: 3,
    rank: '#2',
    name: 'Alan Turing',
    activeTime: 'ACTIVE 1H AGO',
    score: 91,
    skills: ['Wireframing', 'User Research', 'Information Architecture'],
    expMatch: 'Matched',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80',
    email: 'alan.turing@example.com',
    phone: '+1 (555) 202-0202',
    experience: '6 Years',
    bio: 'Cognitive UX researcher specializing in user behavior analysis, wireframing workflows, and usability testing protocols.',
    education: 'Ph.D. in Mathematical Logic - Princeton',
    matchReason: 'Excellent analytical UX specialist. Strong wireframing and user flow skills, though UI visual styling could be supplementary.',
  },
  {
    vacancyId: 3,
    rank: '#3',
    name: 'Grace Hopper',
    activeTime: 'ACTIVE 1D AGO',
    score: 75,
    skills: ['Figma', 'Prototyping', 'CSS/HTML'],
    expMatch: 'Partial Match',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&h=100&q=80',
    email: 'grace.hopper@example.com',
    phone: '+1 (555) 303-0303',
    experience: '4 Years',
    bio: 'UI Developer / Designer hybrid who bridges the gap between Figma mockups and clean CSS implementation.',
    education: 'B.S. in Computer Science - Vassar College',
    matchReason: 'Solid designer-developer with good prototyping skills, but lacks deep user research and journey mapping experience.',
  },
  {
    vacancyId: 3,
    rank: '#4',
    name: 'John von Neumann',
    activeTime: 'ACTIVE 5D AGO',
    score: 60,
    skills: ['Figma', 'Wireframing'],
    expMatch: 'Mismatch',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&h=100&q=80',
    email: 'john.neumann@example.com',
    phone: '+1 (555) 404-0404',
    experience: '3 Years',
    bio: 'Product generalist who drafts quick wireframes and manages basic CSS layouts.',
    education: 'B.S. in Mathematics - University of Budapest',
    matchReason: 'Mismatch. Skill set is more mathematical and logical than visual design. Strong logical layouts but misses creative visual elements.',
  }
];

const enrichCandidateDetails = (candidate) => {
  if (!candidate) return null;

  if (candidate.name === 'Sarah Jenkins') {
    return {
      ...candidate,
      role: 'Senior Full Stack Engineer',
      id: '#49202',
      matchedSkills: ['React.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS Lambda', 'GraphQL', 'Docker', 'CI/CD'],
      missingSkills: ['Kubernetes', 'Redis'],
      matchBreakdown: {
        skillMatch: 96,
        experienceMatch: 100,
        semanticSimilarity: 89,
        educationAlignment: 100
      },
      requiredExp: '5 Years',
      candidateExp: '8 Years',
      expInsight: 'The candidate exceeds the minimum requirement by 3 years, specifically in relevant tech stacks.',
      educationDegree: 'B.S. Computer Science',
      educationSchool: 'Georgia Institute of Technology',
      jobEducationReq: 'B.S. in Computer Science or related field',
      engineSummary: 'Strong alignment in core technical stack and leadership duration. Minor penalties applied for missing niche DevOps tooling (Kubernetes), but semantic similarity suggests high adaptability based on Docker/AWS experience.'
    };
  }

  if (candidate.name === 'Alex Sterling') {
    return {
      ...candidate,
      role: 'Senior Frontend Architect',
      id: '#49201',
      matchedSkills: ['React', 'TypeScript', 'Node.js', 'AWS'],
      missingSkills: ['Kubernetes', 'Redis'],
      matchBreakdown: {
        skillMatch: 96,
        experienceMatch: 100,
        semanticSimilarity: 89,
        educationAlignment: 100
      },
      requiredExp: '5 Years',
      candidateExp: '6 Years',
      expInsight: 'The candidate exceeds the minimum requirement by 1 year, specifically in frontend systems.',
      educationDegree: 'B.S. Computer Science',
      educationSchool: 'Stanford University',
      jobEducationReq: 'B.S. in Computer Science or related field',
      engineSummary: 'Exceptional match. Over 5 years of industry React experience, verified AWS certification, and strong full-stack skills matching job description.'
    };
  }

  // General fallback for others
  const matchPct = candidate.score;

  return {
    ...candidate,
    role: candidate.vacancyId === 2 ? 'Product Manager' : (candidate.vacancyId === 3 ? 'UX Designer' : 'Software Engineer'),
    id: `#492${candidate.score}`,
    matchedSkills: candidate.skills,
    missingSkills: candidate.vacancyId === 2 ? ['SQL', 'Python'] : (candidate.vacancyId === 3 ? ['React Native', 'Swift'] : ['Kubernetes', 'Redis']),
    matchBreakdown: {
      skillMatch: Math.min(100, matchPct + 2),
      experienceMatch: candidate.expMatch === 'Matched' ? 100 : (candidate.expMatch === 'Partial Match' ? 80 : 50),
      semanticSimilarity: Math.max(50, matchPct - 5),
      educationAlignment: candidate.education.includes('B.S.') || candidate.education.includes('M.S.') || candidate.education.includes('MBA') || candidate.education.includes('RISD') ? 100 : 70
    },
    requiredExp: candidate.vacancyId === 2 ? '7 Years' : (candidate.vacancyId === 3 ? '5 Years' : '5 Years'),
    candidateExp: candidate.experience || '3 Years',
    expInsight: candidate.expMatch === 'Matched'
      ? `The candidate meets and exceeds the requested job experience duration.`
      : `The candidate is slightly below the target experience but shows strong skills alignment.`,
    educationDegree: candidate.education ? candidate.education.split(' - ')[0] : 'B.S. Computer Science',
    educationSchool: candidate.education && candidate.education.includes(' - ') ? candidate.education.split(' - ')[1] : 'State University',
    jobEducationReq: candidate.vacancyId === 2 ? 'MBA or equivalent business degree' : (candidate.vacancyId === 3 ? 'Design or equivalent degree' : 'B.S. in Computer Science or related field'),
    engineSummary: candidate.matchReason || 'Candidate possesses relevant foundational knowledge and experience matching the core specifications.'
  };
};

function CandidateDetailView({ candidate, onBack, onShortlist, onReject, onApprove }) {
  const circumference = 263.89;
  const strokeDashoffset = circumference - (circumference * candidate.score) / 100;

  return (
    <div className="candidate-detail-view">
      {/* Top Header Actions */}
      <div className="detail-header-actions">
        <button className="btn-back" onClick={onBack}>
          <ArrowLeft size={16} /> Back to Applicants
        </button>
        <div className="detail-action-buttons">
          <button
            className={`btn-action-reject ${candidate.rejected ? 'active' : ''}`}
            onClick={() => onReject(candidate)}
          >
            <UserMinus size={16} /> Reject
          </button>
          <button
            className={`btn-action-shortlist ${candidate.shortlisted ? 'active' : ''}`}
            onClick={() => onShortlist(candidate)}
          >
            <UserCheck size={16} /> {candidate.shortlisted ? 'Shortlisted' : 'Shortlist Candidate'}
          </button>
        </div>
      </div>

      {/* Candidate Profile Header Card */}
      <div className="detail-profile-card">
        <div className="profile-info-left">
          <img
            className="detail-avatar"
            src={candidate.avatar}
            alt={candidate.name}
          />
          <div className="profile-metadata">
            <h2 className="detail-name">{candidate.name}</h2>
            <p className="detail-title">{candidate.role}</p>
            <div className="detail-badge-row">
              <span className="badge-active">Active Applicant</span>
              <span className="badge-id">ID: {candidate.id}</span>
            </div>
          </div>
        </div>

        {/* Circular Progress Gauge */}
        <div className="match-gauge-container">
          <div className="radial-progress-svg-wrap">
            <svg viewBox="0 0 100 100" className="radial-progress-svg">
              <circle cx="50" cy="50" r="42" className="radial-progress-bg" />
              <circle
                cx="50"
                cy="50"
                r="42"
                className="radial-progress-fill"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            <div className="radial-progress-text">
              <span className="radial-pct">{candidate.score}%</span>
              <span className="radial-lbl">MATCH</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Core Grid */}
      <div className="detail-core-grid">
        {/* Left Column */}
        <div className="detail-column-left">
          {/* Skills Analysis */}
          <div className="detail-card skills-analysis-card">
            <h3 className="card-section-title">
              <Sliders size={18} className="title-icon animate-pulse" /> Skills Analysis
            </h3>

            <div className="skills-group">
              <h4 className="skills-sub-title matched-title">
                <CheckCircle2 size={16} style={{ color: 'var(--accent)' }} />
                MATCHED REQUIREMENTS ({candidate.matchedSkills.length})
              </h4>
              <div className="skills-pill-container">
                {candidate.matchedSkills.map((skill) => (
                  <span key={skill} className="pill-skill matched-pill">
                    <Check size={12} className="pill-icon" /> {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="skills-group">
              <h4 className="skills-sub-title missing-title">
                <XCircle size={16} style={{ color: '#ff6b6b' }} />
                MISSING SKILLS ({candidate.missingSkills.length})
              </h4>
              <div className="skills-pill-container">
                {candidate.missingSkills.map((skill) => (
                  <span key={skill} className="pill-skill missing-pill">
                    <X size={12} className="pill-icon" /> {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Experience and Education row */}
          <div className="exp-edu-row">
            {/* Experience */}
            <div className="detail-card exp-card">
              <h3 className="card-section-title">
                <Briefcase size={18} className="title-icon" /> Experience
              </h3>

              <div className="exp-bar-group">
                <div className="exp-bar-label-row">
                  <span className="bar-lbl">Required by Job</span>
                  <span className="bar-val">{candidate.requiredExp}</span>
                </div>
                <div className="exp-bar-track">
                  <div
                    className="exp-bar-fill required-fill"
                    style={{ width: `${(parseInt(candidate.requiredExp) / 10) * 100}%` }}
                  />
                </div>
              </div>

              <div className="exp-bar-group">
                <div className="exp-bar-label-row">
                  <span className="bar-lbl">Candidate Tenure</span>
                  <span className="bar-val">{candidate.candidateExp}</span>
                </div>
                <div className="exp-bar-track">
                  <div
                    className="exp-bar-fill tenure-fill"
                    style={{ width: `${(parseInt(candidate.candidateExp) / 10) * 100}%` }}
                  />
                </div>
              </div>

              <p className="exp-insight-text">
                {candidate.expInsight}
              </p>
            </div>

            {/* Education Alignment */}
            <div className="detail-card edu-card">
              <h3 className="card-section-title">
                <Users size={18} className="title-icon" /> Education Alignment
              </h3>

              <div className="edu-degree-header">
                <div className="edu-tick-icon-wrap">
                  <Check size={18} style={{ color: 'var(--accent)' }} />
                </div>
                <div className="edu-degree-details">
                  <span className="edu-degree-name">{candidate.educationDegree}</span>
                  <span className="edu-school-name">{candidate.educationSchool}</span>
                </div>
              </div>

              <div className="edu-job-req-box">
                <span className="edu-req-lbl">Job Requirement:</span>
                <span className="edu-req-val">{candidate.jobEducationReq}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="detail-column-right">
          <div className="detail-card match-breakdown-card">
            <h3 className="card-section-title uppercase-title">
              Match Breakdown
              <span className="info-icon" title="Automated metrics alignment">ⓘ</span>
            </h3>

            <div className="breakdown-list">
              <div className="breakdown-item">
                <div className="breakdown-label-row">
                  <span className="breakdown-lbl">SKILL MATCH</span>
                  <span className="breakdown-val">{candidate.matchBreakdown.skillMatch}%</span>
                </div>
                <div className="breakdown-progress-track">
                  <div
                    className="breakdown-progress-fill"
                    style={{ width: `${candidate.matchBreakdown.skillMatch}%` }}
                  />
                </div>
              </div>

              <div className="breakdown-item">
                <div className="breakdown-label-row">
                  <span className="breakdown-lbl">EXPERIENCE MATCH</span>
                  <span className="breakdown-val">{candidate.matchBreakdown.experienceMatch}%</span>
                </div>
                <div className="breakdown-progress-track">
                  <div
                    className="breakdown-progress-fill"
                    style={{ width: `${candidate.matchBreakdown.experienceMatch}%` }}
                  />
                </div>
              </div>

              <div className="breakdown-item">
                <div className="breakdown-label-row">
                  <span className="breakdown-lbl">SEMANTIC SIMILARITY</span>
                  <span className="breakdown-val">{candidate.matchBreakdown.semanticSimilarity}%</span>
                </div>
                <div className="breakdown-progress-track">
                  <div
                    className="breakdown-progress-fill"
                    style={{ width: `${candidate.matchBreakdown.semanticSimilarity}%` }}
                  />
                </div>
              </div>

              <div className="breakdown-item">
                <div className="breakdown-label-row">
                  <span className="breakdown-lbl">EDUCATION ALIGNMENT</span>
                  <span className="breakdown-val">{candidate.matchBreakdown.educationAlignment}%</span>
                </div>
                <div className="breakdown-progress-track">
                  <div
                    className="breakdown-progress-fill"
                    style={{ width: `${candidate.matchBreakdown.educationAlignment}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="detail-divider" />

            <div className="engine-summary-block">
              <span className="engine-lbl">ENGINE SUMMARY</span>
              <p className="engine-text">
                {candidate.engineSummary}
              </p>
            </div>

            <div className="breakdown-actions">
              <button className="btn-approve-interview" onClick={onApprove}>
                Approve for Interview
              </button>
              <button className="btn-download-report" onClick={() => alert("Downloading PDF Report...")}>
                <FileText size={16} style={{ marginRight: '8px' }} /> Download Report (PDF)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RankedApplicants() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [candidates, setCandidates] = useState(MOCK_CANDIDATES);
  const [selectedVacancyId, setSelectedVacancyId] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedCandidateNames, setSelectedCandidateNames] = useState([]);

  // Tab State: 'All Applicants', 'Ranked Candidates', 'Shortlisted'
  const [activeTab, setActiveTab] = useState('Ranked Candidates');

  // Filtering & Sorting State
  const [sortBy, setSortBy] = useState('Highest Match');
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All'); // 'All', 'Matched', 'Partial Match', 'Underqualified', 'Mismatch'

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const selectedVacancy = MOCK_VACANCIES.find(v => v.id === selectedVacancyId) || MOCK_VACANCIES[0];

  useEffect(() => {
    setSelectedCandidateNames([]);
  }, [selectedVacancyId, activeTab, currentPage, activeFilter, searchQuery]);

  // Handle run matching simulation
  const handleRunMatching = () => {
    setIsMatching(true);
    // Simulate AI scanning and ranking pipeline
    setTimeout(() => {
      setIsMatching(false);
      setToastMessage(`AI matching engine completed successfully! ${selectedVacancy.totalApplicants} applicants processed for ${selectedVacancy.title}.`);
      setShowToast(true);

      // Auto dismiss toast after 4s
      setTimeout(() => {
        setShowToast(false);
      }, 4000);
    }, 2500);
  };

  // Perform Sorting and Filtering
  const filteredCandidates = candidates.filter((c) => {
    // Vacancy filtering
    if (c.vacancyId !== selectedVacancyId) return false;

    // Search query filtering
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesName = c.name.toLowerCase().includes(q);
      const matchesSkill = c.skills.some((s) => s.toLowerCase().includes(q));
      if (!matchesName && !matchesSkill) return false;
    }

    // Tab filtering
    if (activeTab === 'Shortlisted' && !c.shortlisted) return false;

    // Experience matching filtering
    if (activeFilter === 'All') return true;
    return c.expMatch === activeFilter;
  });

  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    if (sortBy === 'Highest Match') {
      return b.score - a.score;
    } else if (sortBy === 'Lowest Match') {
      return a.score - b.score;
    } else if (sortBy === 'Alphabetical') {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  // Paginated List
  const totalPages = Math.ceil(sortedCandidates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCandidates = sortedCandidates.slice(startIndex, startIndex + itemsPerPage);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Matched':
        return <CheckCircle2 size={16} className="status-indicator--matched" />;
      case 'Partial Match':
        return <CheckCircle2 size={16} className="status-indicator--partial" />;
      case 'Underqualified':
        return <AlertCircle size={16} className="status-indicator--underqualified" />;
      case 'Mismatch':
      default:
        return <XCircle size={16} className="status-indicator--mismatch" />;
    }
  };

  return (
    <div className="create-vacancy ranked-page">
      <RecruiterSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="create-vacancy__main">
        <TopBar
          user={{ name: 'Recruiter', role: 'Recruiter Account' }}
          notificationsCount={3}
          searchPlaceholder="Search applicants..."
          onSearch={(q) => {
            setSearchQuery(q);
            setCurrentPage(1);
          }}
          onHamburgerClick={() => setSidebarOpen(true)}
        />

        <main className="ranked-content">
          {selectedCandidate ? (
            <CandidateDetailView
              candidate={enrichCandidateDetails(selectedCandidate)}
              onBack={() => setSelectedCandidate(null)}
              onShortlist={(cand) => {
                const isCurrentlyShortlisted = !!cand.shortlisted;
                setCandidates(prev =>
                  prev.map(c => c.name === cand.name ? { ...c, shortlisted: !isCurrentlyShortlisted } : c)
                );
                setSelectedCandidate(prev => prev ? { ...prev, shortlisted: !isCurrentlyShortlisted } : null);
                setToastMessage(
                  isCurrentlyShortlisted
                    ? `${cand.name} has been removed from the shortlisted board.`
                    : `${cand.name} has been added to the shortlisted board.`
                );
                setShowToast(true);
                setTimeout(() => setShowToast(false), 4000);
              }}
              onReject={(cand) => {
                setCandidates(prev =>
                  prev.map(c => c.name === cand.name ? { ...c, shortlisted: false, rejected: true } : c)
                );
                setSelectedCandidate(prev => prev ? { ...prev, shortlisted: false, rejected: true } : null);
                setToastMessage(`${cand.name} has been marked as rejected.`);
                setShowToast(true);
                setTimeout(() => setShowToast(false), 4000);
              }}
              onApprove={() => {
                setToastMessage(`${selectedCandidate.name} has been approved for interview!`);
                setShowToast(true);
                setTimeout(() => setShowToast(false), 4000);
              }}
            />
          ) : (
            <>
              {/* Breadcrumbs & Vacancy Selector */}
              <div className="vacancy-selection-header">
                <nav className="ranked-breadcrumbs">
                  Vacancies / <span className="ranked-breadcrumbs__active">{selectedVacancy.title}</span>
                </nav>
                <div className="vacancy-dropdown-wrap">
                  <span className="vacancy-dropdown-label">Active Vacancy:</span>
                  <select
                    className="vacancy-select"
                    value={selectedVacancyId}
                    onChange={(e) => {
                      setSelectedVacancyId(Number(e.target.value));
                      setCurrentPage(1);
                      setSearchQuery('');
                    }}
                  >
                    {MOCK_VACANCIES.map((vac) => (
                      <option key={vac.id} value={vac.id}>
                        {vac.title} ({vac.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Header Section */}
              <div className="ranked-header">
                <div>
                  <h1 className="ranked-header__title">
                    {selectedVacancy.title} <span className="ranked-header__number">{selectedVacancy.code}</span>
                  </h1>
                  <div className="ranked-header__meta">
                    <span className={`status-badge-active status-badge-${selectedVacancy.status.toLowerCase()}`}>
                      Status: {selectedVacancy.status}
                    </span>
                    <span className="posted-time">
                      <Clock size={15} /> {selectedVacancy.postedTime}
                    </span>
                  </div>
                </div>
                <div className="ranked-header__actions">
                  <button className="btn btn-outline">Edit Job</button>
                  <button
                    className="btn btn-primary"
                    onClick={handleRunMatching}
                    disabled={isMatching}
                    style={{ opacity: isMatching ? 0.7 : 1 }}
                  >
                    <Play size={16} fill="currentColor" /> {isMatching ? 'Matching...' : 'Run Matching'}
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="ranked-stats-grid">
                <div className="ranked-stat-card">
                  <div className="ranked-stat-card__info">
                    <span className="ranked-stat-card__label">Total Applicants</span>
                    <span className="ranked-stat-card__value">{selectedVacancy.totalApplicants}</span>
                    <span className="ranked-stat-card__subtext positive">{selectedVacancy.applicantsCountSubtext}</span>
                  </div>
                  <div className="ranked-stat-card__icon-wrap">
                    <Users size={20} />
                  </div>
                </div>

                <div className="ranked-stat-card">
                  <div className="ranked-stat-card__info">
                    <span className="ranked-stat-card__label">Avg. Match Score</span>
                    <span className="ranked-stat-card__value">{selectedVacancy.avgScore}</span>
                    <span className="ranked-stat-card__subtext">{selectedVacancy.engineConfidence}</span>
                  </div>
                  <div className="ranked-stat-card__icon-wrap">
                    <Target size={20} />
                  </div>
                </div>

                <div className="ranked-stat-card">
                  <div className="ranked-stat-card__info">
                    <span className="ranked-stat-card__label">Last Matched</span>
                    <span className="ranked-stat-card__value">{selectedVacancy.lastMatched}</span>
                    <span className="ranked-stat-card__subtext">{selectedVacancy.lastMatchedBy}</span>
                  </div>
                  <div className="ranked-stat-card__icon-wrap">
                    <Clock size={20} />
                  </div>
                </div>
              </div>

              {/* Candidates Main Table Section */}
              <div className="candidates-card">
                {/* Run Matching Loading Scanner Overlay */}
                {isMatching && (
                  <div className="matching-overlay">
                    <div className="scanning-bar" />
                    <div className="scanner-text">AI engine parsing CV profiles and calculating match scores...</div>
                  </div>
                )}

                <div className="candidates-header">
                  <div className="candidates-header__left-group">
                    <div className="candidates-tabs">
                      <button
                        className={`tab-btn ${activeTab === 'All Applicants' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('All Applicants'); setCurrentPage(1); }}
                      >
                        All Applicants
                      </button>
                      <button
                        className={`tab-btn ${activeTab === 'Ranked Candidates' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('Ranked Candidates'); setCurrentPage(1); }}
                      >
                        Ranked Candidates
                      </button>
                      <button
                        className={`tab-btn ${activeTab === 'Shortlisted' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('Shortlisted'); setCurrentPage(1); }}
                      >
                        Shortlisted
                      </button>
                    </div>
                    <p className="candidates-header__subtitle">
                      {activeTab === 'All Applicants' && 'Showing all applied candidate profiles for this vacancy.'}
                      {activeTab === 'Ranked Candidates' && 'Automated matching results based on CV parsing and job requirements.'}
                      {activeTab === 'Shortlisted' && 'Selected candidates marked for shortlisting board.'}
                    </p>
                  </div>

                  <div className="filter-actions">
                    <div className="sort-container">
                      <span>Sort:</span>
                      <select
                        className="sort-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                      >
                        <option value="Highest Match">Highest Match</option>
                        <option value="Lowest Match">Lowest Match</option>
                        <option value="Alphabetical">Alphabetical</option>
                      </select>
                    </div>

                    <div style={{ position: 'relative' }}>
                      <button
                        className={`filter-icon-btn ${activeFilter !== 'All' ? 'active' : ''}`}
                        onClick={() => setFilterOpen(!filterOpen)}
                        title="Filter by status"
                      >
                        <Filter size={18} />
                      </button>
                      {filterOpen && (
                        <div style={{
                          position: 'absolute',
                          top: '46px',
                          right: '0',
                          backgroundColor: 'var(--primary-light)',
                          border: '1px solid var(--border-dark)',
                          borderRadius: '8px',
                          padding: '8px 0',
                          width: '160px',
                          boxShadow: 'var(--shadow-md)',
                          zIndex: 30
                        }}>
                          {['All', 'Matched', 'Partial Match', 'Underqualified', 'Mismatch'].map((f) => (
                            <div
                              key={f}
                              onClick={() => {
                                setActiveFilter(f);
                                setFilterOpen(false);
                                setCurrentPage(1);
                              }}
                              style={{
                                padding: '8px 16px',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                color: activeFilter === f ? 'var(--accent)' : 'var(--text-on-dark)',
                                backgroundColor: activeFilter === f ? 'rgba(255,255,255,0.05)' : 'transparent',
                                fontWeight: activeFilter === f ? '600' : 'normal'
                              }}
                            >
                              {f}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Candidates Grid Table */}
                <div className={`candidates-table ${activeTab !== 'Shortlisted' ? 'has-checkbox' : ''}`}>
                  <div className="table-header">
                    {activeTab !== 'Shortlisted' && (
                      <div className="cell-checkbox">
                        <input
                          type="checkbox"
                          className="candidate-checkbox"
                          checked={
                            paginatedCandidates.length > 0 &&
                            paginatedCandidates.every(c => selectedCandidateNames.includes(c.name))
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              const newSelections = [
                                ...selectedCandidateNames,
                                ...paginatedCandidates
                                  .map(c => c.name)
                                  .filter(name => !selectedCandidateNames.includes(name))
                              ];
                              setSelectedCandidateNames(newSelections);
                            } else {
                              const pageNames = paginatedCandidates.map(c => c.name);
                              setSelectedCandidateNames(
                                selectedCandidateNames.filter(name => !pageNames.includes(name))
                              );
                            }
                          }}
                        />
                      </div>
                    )}
                    <div>Rank</div>
                    <div>Candidate Name</div>
                    <div>Match Score</div>
                    <div>Key Matched Skills</div>
                    <div>Exp. Match</div>
                    <div style={{ textAlign: 'right', paddingRight: '20px' }}>Actions</div>
                  </div>

                  {paginatedCandidates.length > 0 ? (
                    paginatedCandidates.map((candidate) => (
                      <div key={candidate.name} className="table-row-container">
                        <div className="table-row">
                          {activeTab !== 'Shortlisted' && (
                            <div className="cell-checkbox">
                              <input
                                type="checkbox"
                                className="candidate-checkbox"
                                checked={selectedCandidateNames.includes(candidate.name)}
                                onChange={() => {
                                  if (selectedCandidateNames.includes(candidate.name)) {
                                    setSelectedCandidateNames(
                                      selectedCandidateNames.filter(name => name !== candidate.name)
                                    );
                                  } else {
                                    setSelectedCandidateNames([...selectedCandidateNames, candidate.name]);
                                  }
                                }}
                              />
                            </div>
                          )}
                          <div className="cell-rank">{candidate.rank}</div>
                          <div className="cell-candidate">
                            <img
                              src={candidate.avatar}
                              alt={candidate.name}
                              className="candidate-avatar"
                            />
                            <div className="candidate-meta">
                              <span className="candidate-name">{candidate.name}</span>
                              <span className="candidate-active-time">{candidate.activeTime}</span>
                            </div>
                          </div>

                          <div className="cell-score">
                            <span className="score-number">{candidate.score}%</span>
                            <div className="score-bar-track">
                              <div
                                className="score-bar-fill"
                                style={{ width: `${candidate.score}%` }}
                              />
                            </div>
                          </div>

                          <div className="cell-skills">
                            {candidate.skills.map((skill) => (
                              <span key={skill} className="skill-badge">{skill}</span>
                            ))}
                          </div>

                          <div className="cell-exp">
                            <span className="status-indicator">
                              {getStatusIcon(candidate.expMatch)}
                              <span style={{
                                color: candidate.expMatch === 'Matched' ? 'var(--success)' :
                                  candidate.expMatch === 'Partial Match' ? 'var(--accent)' :
                                    candidate.expMatch === 'Underqualified' ? '#ff6b6b' : '#ff4a4a'
                              }}>
                                {candidate.expMatch}
                              </span>
                            </span>
                          </div>

                          <div className="cell-actions">
                            <button
                              className="btn-view-details"
                              onClick={() => setSelectedCandidate(candidate)}
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state-container">
                      <Users size={32} className="empty-state-icon" />
                      <h4 className="empty-state-title">No candidates found</h4>
                      <p className="empty-state-text">
                        {activeTab === 'Shortlisted'
                          ? 'No candidates have been shortlisted yet. Open candidate details to shortlist them.'
                          : 'No candidates match the selected filters.'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Table Pagination Footer */}
                <div className="table-footer">
                  <div>
                    Showing {paginatedCandidates.length} of {filteredCandidates.length} potential matches for this vacancy.
                  </div>
                  {totalPages > 1 && (
                    <div className="pagination-controls">
                      <button
                        className="pagination-btn"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        style={{ opacity: currentPage === 1 ? 0.4 : 1 }}
                      >
                        Previous
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        className="pagination-btn next-active"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        style={{ opacity: currentPage === totalPages ? 0.4 : 1 }}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Grid Section */}
              <div className="bottom-grid">
                {/* Requirement Insight */}
                <div className="insight-card">
                  <span className="insight-card__title">
                    <Target size={16} /> Requirement Insight
                  </span>
                  <p className="insight-card__text">
                    {selectedVacancy.insightText}
                  </p>
                  <a href="#review-parsing" className="insight-card__link" onClick={(e) => e.preventDefault()}>
                    Review Job Parsing Data <ExternalLink size={14} />
                  </a>
                </div>

                {/* Shortlist Progress */}
                <div className="progress-card">
                  <span className="progress-card__title">
                    <Users size={16} /> Shortlist Progress
                  </span>
                  <div className="progress-card__content">
                    <div className="avatar-group">
                      {candidates
                        .filter((c) => c.vacancyId === selectedVacancyId && c.shortlisted)
                        .slice(0, 4)
                        .map((c, i) => (
                          <img
                            key={i}
                            src={c.avatar}
                            alt={c.name}
                            className="avatar-stacked"
                          />
                        ))
                      }
                    </div>
                    <p className="progress-card__text">
                      <strong>
                        {candidates.filter((c) => c.vacancyId === selectedVacancyId && c.shortlisted).length} candidates
                      </strong> already shortlisted for interview stage.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Matching Success Toast Notification */}
      {showToast && (
        <div className="matching-toast">
          <CheckCircle2 size={20} style={{ color: 'var(--success)' }} />
          <span className="matching-toast__text">{toastMessage}</span>
          <button
            style={{ background: 'none', border: 'none', color: 'var(--text-on-dark-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            onClick={() => setShowToast(false)}
          >
            <X size={16} />
          </button>
        </div>
      )}
      {selectedCandidateNames.length > 0 && (
        <div className="batch-actions-bar">
          <span className="batch-selected-count">
            {selectedCandidateNames.length} candidate{selectedCandidateNames.length > 1 ? 's' : ''} selected
          </span>
          <div className="batch-buttons">
            <button 
              className="btn-batch btn-batch-shortlist"
              onClick={() => {
                setCandidates(prev => 
                  prev.map(c => selectedCandidateNames.includes(c.name) ? { ...c, shortlisted: true } : c)
                );
                setToastMessage(`Shortlisted ${selectedCandidateNames.length} candidate(s).`);
                setShowToast(true);
                setSelectedCandidateNames([]);
                setTimeout(() => setShowToast(false), 4000);
              }}
            >
              Shortlist Selected
            </button>
            
            <button 
              className="btn-batch btn-batch-approve"
              onClick={() => {
                setToastMessage(`Approved ${selectedCandidateNames.length} candidate(s) for interview.`);
                setShowToast(true);
                setSelectedCandidateNames([]);
                setTimeout(() => setShowToast(false), 4000);
              }}
            >
              Approve for Interview
            </button>

            <button 
              className="btn-batch btn-batch-reject"
              onClick={() => {
                setCandidates(prev => 
                  prev.map(c => selectedCandidateNames.includes(c.name) ? { ...c, shortlisted: false, rejected: true } : c)
                );
                setToastMessage(`Rejected ${selectedCandidateNames.length} candidate(s).`);
                setShowToast(true);
                setSelectedCandidateNames([]);
                setTimeout(() => setShowToast(false), 4000);
              }}
            >
              Reject Selected
            </button>

            <button 
              className="btn-batch-clear"
              onClick={() => setSelectedCandidateNames([])}
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default RankedApplicants;
