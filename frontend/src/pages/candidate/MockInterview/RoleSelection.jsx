import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, Check, Plus, X, Database, MonitorPlay, Palette, ShieldCheck, BarChart3, Sparkles } from 'lucide-react';
import { CandidatePageContext } from '../CandidateDashboard/CandidateDashboard';
import {
  fetchAvailableRoles,
  createCustomJobRole,
  storeSelectedRole,
  saveMockInterviewJobDescription,
  attachJobDescriptionToSelectedRole,
} from '../../../api/mockInterviewApi';
import './RoleSelection.css';

const ICON_MAP = {
  Database,
  MonitorPlay,
  Palette,
  ShieldCheck,
  BarChart3,
  Sparkles,
};

const CATEGORIES = [
  { id: 'all',       label: 'All Categories' },
  { id: 'engineering', label: 'Engineering' },
  { id: 'design',    label: 'Design' },
  { id: 'data',      label: 'Data & Analytics' },
  { id: 'qa',        label: 'QA & Testing' },
];

const ROLE_CATEGORY_MAP = {
  backend:  'engineering',
  frontend: 'engineering',
  uiux:     'design',
  qa:       'qa',
  data:     'data',
};

const ROLES = [
  {
    id: 'backend',
    title: 'Backend Developer',
    description: 'System architecture, API design, database management, and server-side logic scaling.',
    category: 'engineering',
    skills: ['Node.js', 'Express', 'SQL', 'System Design', 'REST APIs', 'PostgreSQL'],
    icon: Database,
  },
  {
    id: 'frontend',
    title: 'Frontend Developer',
    description: 'Building responsive user interfaces, state management, and seamless UX implementation.',
    category: 'engineering',
    skills: ['React', 'JavaScript', 'CSS', 'HTML', 'State Management', 'Web Performance'],
    icon: MonitorPlay,
  },
  {
    id: 'uiux',
    title: 'UI/UX Designer',
    description: 'Visual storytelling, user research, wireframing, and creating high-fidelity prototypes.',
    category: 'design',
    skills: ['Figma', 'User Research', 'Wireframing', 'Prototyping', 'Design Systems'],
    icon: Palette,
  },
  {
    id: 'qa',
    title: 'QA Engineer',
    description: 'Automated testing, quality assurance frameworks, and ensuring bug-free product delivery.',
    category: 'qa',
    skills: ['Automated Testing', 'Jest', 'Cypress', 'Playwright', 'Test Planning', 'API Testing'],
    icon: ShieldCheck,
  },
  {
    id: 'data',
    title: 'Data Analyst',
    description: 'Statistical modeling, data visualization, and extracting actionable business insights.',
    category: 'data',
    skills: ['SQL', 'Python', 'Data Visualization', 'Tableau', 'Statistical Modeling'],
    icon: BarChart3,
  },
];

/**
 * Builds an industry-standard Job Description template tailored specifically to the selected role.
 */
const buildRoleIntegratedTemplate = (role) => {
  if (!role) return '';
  const skillsList =
    Array.isArray(role.skills) && role.skills.length > 0
      ? role.skills
      : ['Domain Knowledge', 'System Architecture', 'Problem Solving'];

  return [
    `# Position: ${role.title}`,
    `**Track**: ${(role.category || 'engineering').toUpperCase()} | **Mock Interview Focus**`,
    '',
    `## Role Overview`,
    `${role.description}`,
    '',
    `## Core Responsibilities`,
    `- Architect, develop, and maintain high-quality solutions for ${role.title}.`,
    `- Collaborate with cross-functional product and engineering teams to solve real-world problems.`,
    `- Champion technical excellence, automated testing, and reliable software delivery.`,
    '',
    `## Key Requirements & Technical Competencies`,
    skillsList.map((skill) => `- ${skill}`).join('\n'),
    '- Solid problem-solving fundamentals, system trade-off evaluation, and clean code principles.',
    '- Clear, structured communication during technical discussions and scenario walk-throughs.',
    '',
    `## Interview Preparation Scope`,
    `- Core technical domain questions and scenario-based problem solving for ${role.title}.`,
    `- Architecture decisions, scalability considerations, and debugging strategies.`,
  ].join('\n');
};

export default function MockInterviewRoleSelection() {
  const navigate = useNavigate();
  const pageCtx = useContext(CandidatePageContext);

  useEffect(() => {
    if (pageCtx?.setPageLabel) {
      pageCtx.setPageLabel('MOCK INTERVIEWS');
    }
  }, [pageCtx]);

  const [selectedRole, setSelectedRole] = useState('frontend');
  const [availableRoles, setAvailableRoles] = useState(ROLES);
  const [categories, setCategories] = useState(CATEGORIES);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customRoles, setCustomRoles] = useState([]);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const categoryDropdownRef = useRef(null);

  const [step, setStep] = useState(1);
  const [jobDescription, setJobDescription] = useState('');
  const [isSubmittingJd, setIsSubmittingJd] = useState(false);

  // Restore stored job description and role from sessionStorage if available
  useEffect(() => {
    try {
      const cachedJd = sessionStorage.getItem('mock_interview_job_description');
      if (cachedJd) {
        setJobDescription(cachedJd);
      }
      const cachedRole = sessionStorage.getItem('mock_interview_selected_role');
      if (cachedRole) {
        const parsed = JSON.parse(cachedRole);
        if (parsed?.roleId) {
          setSelectedRole(parsed.roleId);
        }
      }
    } catch (e) {
      // Storage unavailable or parse error
    }
  }, []);

  // Fetch available roles from backend on mount
  useEffect(() => {
    let isMounted = true;
    const loadAvailableRoles = async () => {
      try {
        setIsLoading(true);
        const res = await fetchAvailableRoles();
        if (isMounted && res && Array.isArray(res.roles) && res.roles.length > 0) {
          const mapped = res.roles.map((r) => {
            const IconComp = typeof r.icon === 'string' ? (ICON_MAP[r.icon] || Sparkles) : (r.icon || Sparkles);
            return {
              ...r,
              icon: IconComp,
            };
          });
          setAvailableRoles(mapped);
          if (res.categories && Array.isArray(res.categories) && res.categories.length > 0) {
            setCategories(res.categories);
          }
        }
      } catch (err) {
        console.warn('Could not load available roles from API, using default roles:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadAvailableRoles();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target)) {
        setShowCategoryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const allRoles = [...availableRoles, ...customRoles];

  const filteredRoles = allRoles.filter((role) => {
    const matchesSearch =
      role.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' ||
      role.isCustom ||
      role.category === selectedCategory ||
      ROLE_CATEGORY_MAP[role.id] === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const currentRole = allRoles.find(r => r.id === selectedRole);
  const activeCategoryLabel = categories.find(c => c.id === selectedCategory)?.label || 'All Categories';

  const matchedSkillsCount = (currentRole?.skills || []).filter((s) =>
    jobDescription.toLowerCase().includes(s.toLowerCase())
  ).length;

  const handleAddSkillToJd = (skill) => {
    if (!skill) return;
    if (jobDescription.toLowerCase().includes(skill.toLowerCase())) return;
    setJobDescription((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) {
        return `- Required Skill: ${skill}`;
      }
      return `${trimmed}\n- Required Skill: ${skill}`;
    });
  };

  const handleLoadRoleTemplate = () => {
    if (!currentRole) return;
    const template = buildRoleIntegratedTemplate(currentRole);
    setJobDescription(template);
  };

  const handleAddCustomRole = async () => {
    if (!customInput.trim()) return;
    const title = customInput.trim();
    const tempId = `custom-${Date.now()}`;
    const newRole = {
      id: tempId,
      title,
      description: 'Custom role defined by you for a personalised mock interview experience.',
      icon: Sparkles,
      isCustom: true,
      category: 'engineering',
      skills: ['Domain Expertise', 'Problem Solving', 'Communication'],
    };
    setCustomRoles(prev => [...prev, newRole]);
    setSelectedRole(tempId);
    setCustomInput('');
    setShowCustomModal(false);

    try {
      const res = await createCustomJobRole({ title });
      if (res && res.role) {
        const persistedId = res.role.id || res.role.roleId;
        setSelectedRole(persistedId);
        setCustomRoles(prev => prev.map(r => r.id === tempId ? { ...res.role, icon: Sparkles } : r));
      }
    } catch (err) {
      console.warn('Could not persist custom role to backend:', err.message);
    }
  };

  const handleContinue = async () => {
    if (step === 1) {
      // Automatically prefill role-integrated template if candidate hasn't entered a custom JD yet
      if (!jobDescription.trim() && currentRole) {
        setJobDescription(buildRoleIntegratedTemplate(currentRole));
      }

      try {
        storeSelectedRole({
          roleId: selectedRole,
          roleTitle: currentRole?.title,
          category: currentRole?.category,
        }).catch(() => {});
        sessionStorage.setItem(
          'mock_interview_selected_role',
          JSON.stringify({
            roleId: selectedRole,
            roleTitle: currentRole?.title,
            category: currentRole?.category,
          })
        );
      } catch (err) {
        // Continue even if network is offline
      }
      setStep(2);
    } else {
      setIsSubmittingJd(true);
      const cleanJd = (jobDescription || '').trim();

      // Store in sessionStorage for client persistence
      try {
        sessionStorage.setItem('mock_interview_job_description', cleanJd);
        sessionStorage.setItem(
          'mock_interview_selected_role',
          JSON.stringify({
            roleId: selectedRole,
            roleTitle: currentRole?.title,
            category: currentRole?.category,
            skills: currentRole?.skills,
            jobDescription: cleanJd,
          })
        );
      } catch (err) {
        // Storage unavailable or quota exceeded
      }

      // Submit and integrate with backend
      try {
        await Promise.allSettled([
          attachJobDescriptionToSelectedRole({
            roleId: selectedRole,
            roleTitle: currentRole?.title,
            category: currentRole?.category,
            skills: currentRole?.skills,
            jobDescription: cleanJd,
          }),
          saveMockInterviewJobDescription({
            roleId: selectedRole,
            roleTitle: currentRole?.title,
            category: currentRole?.category,
            skills: currentRole?.skills,
            jobDescription: cleanJd,
            source: 'role_integration',
          }),
          storeSelectedRole({
            roleId: selectedRole,
            roleTitle: currentRole?.title,
            category: currentRole?.category,
            jobDescription: cleanJd,
          }),
        ]);
      } catch (err) {
        console.warn('Could not store job description in backend:', err.message);
      } finally {
        setIsSubmittingJd(false);
      }

      navigate('/candidate/mock-interviews/questions', {
        state: { 
          roleId: selectedRole, 
          roleTitle: currentRole?.title,
          category: currentRole?.category,
          skills: currentRole?.skills,
          jobDescription: cleanJd,
        }
      });
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      navigate('/candidate/dashboard');
    }
  };

  return (
    <div className="role-selection-container">
      {step === 1 ? (
      <div className="role-selection-content">
        <div className="ai-badge">AI Powered Interviews</div>
        <h1 className="page-title">Select Job Role</h1>
        <p className="page-subtitle">
          Choose a specific career path to begin your AI-tailored mock interview. We'll generate realistic questions based on industry standards.
        </p>

        <div className="search-filter-bar">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              placeholder="Search for a role (e.g. Systems Architect, Mobile Lead)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="category-dropdown" ref={categoryDropdownRef}>
            <div
              className={`category-dropdown-trigger ${showCategoryDropdown ? 'open' : ''}`}
              onClick={() => setShowCategoryDropdown(prev => !prev)}
            >
              <span>{activeCategoryLabel}</span>
              <ChevronDown size={16} className={`dropdown-chevron ${showCategoryDropdown ? 'rotated' : ''}`} />
            </div>
            {showCategoryDropdown && (
              <ul className="category-dropdown-menu">
                {categories.map((cat) => (
                  <li
                    key={cat.id}
                    className={`category-option ${selectedCategory === cat.id ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setShowCategoryDropdown(false);
                    }}
                  >
                    {cat.label}
                    {selectedCategory === cat.id && <Check size={14} className="option-check" />}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="popular-roles-header">
          <div className="roles-title-group">
            <h2>Popular Roles</h2>
            <span className="available-badge">{filteredRoles.length} Available</span>
          </div>
          <button className="browse-all-btn">Browse all roles &gt;</button>
        </div>

        <div className="roles-grid">
          {filteredRoles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            return (
              <div 
                key={role.id} 
                className={`role-card ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedRole(role.id)}
              >
                {isSelected && (
                  <div className="selected-check">
                    <Check size={14} />
                  </div>
                )}
                <div className="role-icon-wrapper">
                  <Icon size={24} />
                </div>
                <h3>{role.title}</h3>
                <p>{role.description}</p>
              </div>
            );
          })}
          
          <div className="role-card custom-role-card" onClick={() => setShowCustomModal(true)}>
            <div className="role-icon-wrapper custom">
              <Plus size={24} />
            </div>
            <h3>Custom Role</h3>
            <p>Can't find your role? Define a custom one.</p>
          </div>
        </div>
      </div>
      ) : (
      <div className="role-selection-content">
        <div className="ai-badge">Tailored Questions</div>
        <h1 className="page-title">Provide a Job Description</h1>
        <p className="page-subtitle">
          Your mock interview is tailored for <strong>{currentRole?.title || 'your selected role'}</strong>. Use the integrated role description below or customize it with specific requirements.
        </p>

        {/* Selected Role Integration Card */}
        {currentRole && (
          <div className="selected-role-summary-card">
            <div className="selected-role-summary-left">
              <div className="selected-role-icon-box">
                {React.createElement(currentRole.icon || Sparkles, { size: 22 })}
              </div>
              <div className="selected-role-info">
                <div className="selected-role-title-row">
                  <span className="selected-role-title">{currentRole.title}</span>
                  <span className="selected-role-category-pill">
                    {(currentRole.category || 'engineering').toUpperCase()}
                  </span>
                </div>
                <p className="selected-role-desc">{currentRole.description}</p>
              </div>
            </div>
            <button
              type="button"
              className="change-role-btn"
              onClick={() => setStep(1)}
              title="Select a different job role"
            >
              Change Role
            </button>
          </div>
        )}

        {/* Role Skills Integration Chips */}
        {currentRole && currentRole.skills && currentRole.skills.length > 0 && (
          <div className="role-skills-integration-section">
            <div className="role-skills-header-row">
              <span className="role-skills-label">Integrated Role Skills:</span>
              <span className="role-skills-status">
                {matchedSkillsCount} of {currentRole.skills.length} skills in description
              </span>
            </div>
            <div className="role-skills-chips-wrapper">
              {currentRole.skills.map((skill) => {
                const isIncluded = jobDescription.toLowerCase().includes(skill.toLowerCase());
                return (
                  <button
                    key={skill}
                    type="button"
                    className={`role-skill-chip ${isIncluded ? 'active' : ''}`}
                    onClick={() => handleAddSkillToJd(skill)}
                    title={isIncluded ? `"${skill}" is included in the JD` : `Click to add "${skill}" to JD`}
                  >
                    <Check size={12} className={`skill-check-icon ${isIncluded ? 'visible' : ''}`} />
                    <span>{skill}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="jd-textarea-container">
          <textarea
            className="jd-textarea"
            placeholder={`Paste or customize ${currentRole?.title || 'Job'} Description here...`}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
          <div className="jd-footer-toolbar">
            <div className="jd-char-count">
              {jobDescription.length > 0 ? (
                <span>
                  {jobDescription.length.toLocaleString()} characters &bull;{' '}
                  {jobDescription.trim().split(/\s+/).filter(Boolean).length} words
                  {matchedSkillsCount > 0 && ` \u2022 ${matchedSkillsCount} skills linked`}
                </span>
              ) : (
                <span className="jd-hint">Click "Use Role Template" to generate a description tailored to {currentRole?.title}</span>
              )}
            </div>

            <div className="jd-toolbar-actions">
              {jobDescription.length > 0 && (
                <button
                  type="button"
                  className="jd-clear-btn"
                  onClick={() => setJobDescription('')}
                >
                  Clear
                </button>
              )}
              {currentRole && (
                <button
                  type="button"
                  className="jd-template-btn"
                  onClick={handleLoadRoleTemplate}
                >
                  Use Role Template
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      )}

      <div className="bottom-action-bar">
        <button type="button" className="back-btn" onClick={handleBack} disabled={isSubmittingJd}>&larr; Back</button>
        <div className="right-actions">
          {currentRole && (
            <div className="currently-selected">
              <span className="label">CURRENTLY SELECTED</span>
              <span className="value">{currentRole.title}</span>
            </div>
          )}
          <button
            type="button"
            className="continue-btn"
            onClick={handleContinue}
            disabled={isSubmittingJd}
          >
            {isSubmittingJd ? 'Saving...' : step === 2 ? 'Continue & Generate >' : 'Continue >'}
          </button>
        </div>
      </div>
      {/* Custom Role Modal */}
      {showCustomModal && (
        <div className="custom-role-modal-overlay" onClick={() => setShowCustomModal(false)}>
          <div className="custom-role-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon-wrap">
                <Sparkles size={22} />
              </div>
              <button className="modal-close-btn" onClick={() => setShowCustomModal(false)}>
                <X size={18} />
              </button>
            </div>
            <h2 className="modal-title">Define a Custom Role</h2>
            <p className="modal-subtitle">Enter the job title you want to be interviewed for and we'll generate tailored questions.</p>
            <input
              className="modal-input"
              type="text"
              placeholder="e.g. Machine Learning Engineer, Growth Hacker..."
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddCustomRole()}
              autoFocus
            />
            <div className="modal-actions">
              <button className="modal-cancel-btn" onClick={() => setShowCustomModal(false)}>Cancel</button>
              <button
                className="modal-submit-btn"
                onClick={handleAddCustomRole}
                disabled={!customInput.trim()}
              >
                <Plus size={16} /> Add Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
