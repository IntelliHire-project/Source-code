import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ChevronDown,
  Check,
  Plus,
  X,
  Database,
  MonitorPlay,
  Palette,
  ShieldCheck,
  BarChart3,
  Sparkles,
  Save,
  RotateCcw,
  RefreshCw,
  Brain,
  Target,
  Lightbulb,
  AlertTriangle,
  Briefcase,
  Award,
} from 'lucide-react';
import { CandidatePageContext } from '../CandidateDashboard/CandidateDashboard';
import {
  fetchAvailableRoles,
  createCustomJobRole,
  storeSelectedRole,
  saveMockInterviewJobDescription,
  attachJobDescriptionToSelectedRole,
  fetchRoleIntegratedJobDescription,
  fetchLatestJobDescription,
  updateJobDescription,
  updateSelectedRoleJobDescription,
  analyzeMockInterviewJobDescription,
  generateMockInterviewQuestions,
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
  const [savedJdId, setSavedJdId] = useState(null);
  const [isRetrievingJd, setIsRetrievingJd] = useState(false);
  const [isUpdatingJd, setIsUpdatingJd] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [updateNotice, setUpdateNotice] = useState(null);
  const [jdAnalysis, setJdAnalysis] = useState(null);
  const [isAnalyzingJd, setIsAnalyzingJd] = useState(false);
  const [analyzedJdText, setAnalyzedJdText] = useState('');

  // Restore stored job description, role, and analysis from sessionStorage if available
  useEffect(() => {
    try {
      const cachedJd = sessionStorage.getItem('mock_interview_job_description');
      if (cachedJd) {
        setJobDescription(cachedJd);
      }
      const cachedAnalysis = sessionStorage.getItem('mock_interview_jd_analysis');
      if (cachedAnalysis) {
        const parsedAnalysis = JSON.parse(cachedAnalysis);
        if (parsedAnalysis && typeof parsedAnalysis === 'object') {
          setJdAnalysis(parsedAnalysis);
          if (cachedJd) setAnalyzedJdText(cachedJd.trim());
        }
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

  const handleAnalyzeJobDescription = async (jdOverride = null, silent = false) => {
    const targetText = (typeof jdOverride === 'string' ? jdOverride : jobDescription || '').trim();
    if (targetText.length < 5) {
      if (!silent) {
        setUpdateNotice({
          type: 'error',
          text: 'Please provide at least 5 characters in the job description to analyze with AI.',
        });
      }
      return null;
    }

    setIsAnalyzingJd(true);
    if (!silent) setUpdateNotice(null);

    try {
      const res = await analyzeMockInterviewJobDescription({
        jobDescription: targetText,
        roleId: selectedRole,
        roleTitle: currentRole?.title,
        category: currentRole?.category,
        skills: currentRole?.skills,
        jdId: savedJdId || undefined,
      });

      const analysis = res?.analysis || null;
      if (analysis) {
        setJdAnalysis(analysis);
        setAnalyzedJdText(targetText);
        try {
          sessionStorage.setItem('mock_interview_jd_analysis', JSON.stringify(analysis));
        } catch (e) {}
        if (!silent) {
          setUpdateNotice({
            type: 'success',
            text:
              analysis.analysisSource === 'gemini'
                ? 'AI job description analysis completed using Gemini AI.'
                : 'Job description analyzed and tailored focus areas extracted.',
          });
        }
      }
      return analysis;
    } catch (err) {
      console.warn('Could not analyze job description:', err.message);
      if (!silent) {
        setUpdateNotice({
          type: 'error',
          text: err.response?.data?.message || err.message || 'Failed to analyze job description.',
        });
      }
      return null;
    } finally {
      setIsAnalyzingJd(false);
    }
  };

  const handleRetrieveSavedJd = async (roleIdToFetch, showNotification = false) => {
    const targetRoleId = roleIdToFetch || selectedRole;
    if (!targetRoleId) return;
    setIsRetrievingJd(true);
    try {
      const res = await fetchRoleIntegratedJobDescription(targetRoleId);
      if (res && res.savedJobDescription) {
        const saved = res.savedJobDescription;
        if (saved.jobDescription) {
          setJobDescription(saved.jobDescription);
          if (saved.id) setSavedJdId(saved.id);
          if (saved.updatedAt) setLastUpdated(saved.updatedAt);
          if (saved.analysis) {
            setJdAnalysis(saved.analysis);
            setAnalyzedJdText(saved.jobDescription.trim());
          }
          if (showNotification) {
            setUpdateNotice({ type: 'success', text: 'Saved job description reloaded.' });
          }
          return;
        }
      } else if (res && res.activeJobDescription) {
        if (!jobDescription.trim()) {
          setJobDescription(res.activeJobDescription);
        }
        if (showNotification) {
          setUpdateNotice({ type: 'info', text: 'Loaded role-integrated template.' });
        }
      } else {
        const latestRes = await fetchLatestJobDescription();
        if (latestRes && latestRes.jobDescription) {
          const jd = latestRes.jobDescription;
          if (jd.jobDescription && (!jd.roleId || jd.roleId === targetRoleId)) {
            setJobDescription(jd.jobDescription);
            if (jd.id) setSavedJdId(jd.id);
            if (jd.updatedAt) setLastUpdated(jd.updatedAt);
            if (showNotification) {
              setUpdateNotice({ type: 'success', text: 'Loaded latest job description.' });
            }
          }
        }
      }
    } catch (err) {
      console.warn('Could not retrieve job description:', err.message);
      if (showNotification) {
        setUpdateNotice({ type: 'error', text: 'Could not retrieve saved description.' });
      }
    } finally {
      setIsRetrievingJd(false);
      if (showNotification) {
        setTimeout(() => {
          setUpdateNotice((prev) => (prev?.type === 'success' || prev?.type === 'info' ? null : prev));
        }, 3000);
      }
    }
  };

  const handleUpdateJobDescription = async () => {
    const cleanJd = (jobDescription || '').trim();
    if (!cleanJd) {
      setUpdateNotice({ type: 'error', text: 'Job description cannot be empty to update.' });
      return;
    }

    setIsUpdatingJd(true);
    setUpdateNotice(null);

    const payload = {
      roleId: selectedRole,
      roleTitle: currentRole?.title,
      category: currentRole?.category,
      skills: currentRole?.skills,
      jobDescription: cleanJd,
    };

    try {
      let updatedRecord = null;
      if (savedJdId) {
        const res = await updateJobDescription(savedJdId, payload);
        updatedRecord = res?.jobDescription;
      } else {
        const res = await updateSelectedRoleJobDescription(payload);
        updatedRecord = res?.jobDescription || res?.updatedRole?.jobDescription;
        if (res?.updatedRole?.id || res?.jobDescription?.id) {
          setSavedJdId(res.updatedRole?.id || res.jobDescription?.id);
        }
      }

      const timestamp = updatedRecord?.updatedAt || new Date().toISOString();
      setLastUpdated(timestamp);
      setUpdateNotice({ type: 'success', text: 'Job description updated successfully!' });

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
            jdId: savedJdId || updatedRecord?.id,
            updatedAt: timestamp,
          })
        );
      } catch (e) {}
    } catch (err) {
      console.error('Failed to update job description:', err);
      setUpdateNotice({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Failed to update job description.',
      });
    } finally {
      setIsUpdatingJd(false);
      setTimeout(() => {
        setUpdateNotice((prev) => (prev?.type === 'success' ? null : prev));
      }, 3500);
    }
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
    handleSelectRole(tempId);
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

  const handleSelectRole = (nextRoleId) => {
    if (nextRoleId === selectedRole) return;
    setSelectedRole(nextRoleId);
    setJobDescription('');
    setSavedJdId(null);
    setLastUpdated(null);
    setJdAnalysis(null);
    setAnalyzedJdText('');
    setUpdateNotice(null);
    try {
      sessionStorage.removeItem('mock_interview_job_description');
      sessionStorage.removeItem('mock_interview_jd_analysis');
      sessionStorage.removeItem('mock_interview_generated_questions');
    } catch {}
  };

  const handleContinue = async () => {
    if (step === 1) {
      const targetRole = currentRole;
      try {
        storeSelectedRole({
          roleId: selectedRole,
          roleTitle: targetRole?.title,
          category: targetRole?.category,
        }).catch(() => {});
        sessionStorage.setItem(
          'mock_interview_selected_role',
          JSON.stringify({
            roleId: selectedRole,
            roleTitle: targetRole?.title,
            category: targetRole?.category,
          })
        );
      } catch (err) {
        // Continue even if network is offline
      }

      setStep(2);

      // Attempt to retrieve saved JD for this role
      handleRetrieveSavedJd(selectedRole, false).then(() => {
        setJobDescription((prev) => {
          if (!prev.trim() && targetRole) {
            return buildRoleIntegratedTemplate(targetRole);
          }
          return prev;
        });
      });
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
            jdId: savedJdId,
            updatedAt: lastUpdated,
          })
        );
      } catch (err) {
        // Storage unavailable or quota exceeded
      }

      let resolvedAnalysis =
        jdAnalysis && analyzedJdText === cleanJd ? jdAnalysis : null;
      let generatedQuestions = null;
      let generationSource = null;

      // Submit and integrate with backend (persist JD + run AI JD analysis & question generation)
      try {
        const persistCalls = [
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
        ];

        if (savedJdId) {
          persistCalls.push(
            updateJobDescription(savedJdId, {
              roleId: selectedRole,
              roleTitle: currentRole?.title,
              category: currentRole?.category,
              skills: currentRole?.skills,
              jobDescription: cleanJd,
            }).catch(() => {})
          );
        }

        const generatePromise =
          cleanJd.length >= 5 || currentRole?.title
            ? generateMockInterviewQuestions({
                jobDescription: cleanJd || undefined,
                jdAnalysis: resolvedAnalysis || undefined,
                roleId: selectedRole,
                roleTitle: currentRole?.title,
                roleDescription: currentRole?.description,
                category: currentRole?.category,
                skills: currentRole?.skills,
                questionCount: 5,
                focusType: 'balanced',
                difficulty: 'mixed',
                jdId: savedJdId || undefined,
              }).catch(() => null)
            : Promise.resolve(null);

        const [, generatedResult] = await Promise.all([
          Promise.allSettled(persistCalls),
          generatePromise,
        ]);

        if (generatedResult) {
          if (generatedResult.analysis) {
            resolvedAnalysis = generatedResult.analysis;
            setJdAnalysis(generatedResult.analysis);
            setAnalyzedJdText(cleanJd);
            try {
              sessionStorage.setItem('mock_interview_jd_analysis', JSON.stringify(generatedResult.analysis));
            } catch (e) {}
          }
          if (Array.isArray(generatedResult.questions) && generatedResult.questions.length > 0) {
            generatedQuestions = generatedResult.questions;
            generationSource = generatedResult.generationSource || null;
            try {
              sessionStorage.setItem(
                'mock_interview_generated_questions',
                JSON.stringify({
                  jobDescription: cleanJd,
                  roleId: selectedRole,
                  questions: generatedResult.questions,
                  generationSource,
                })
              );
            } catch (e) {}
          }
        }
      } catch (err) {
        console.warn('Could not store job description in backend:', err.message);
      } finally {
        setIsSubmittingJd(false);
      }

      navigate('/candidate/mock-interviews/questions', {
        state: {
          roleId: selectedRole,
          roleTitle: currentRole?.title,
          roleDescription: currentRole?.description,
          category: currentRole?.category,
          skills: currentRole?.skills,
          jobDescription: cleanJd,
          jdAnalysis: resolvedAnalysis,
          generatedQuestions,
          generationSource,
        },
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
                onClick={() => handleSelectRole(role.id)}
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

        {/* Retrieval/Update Status Feedback */}
        {updateNotice && (
          <div className={`jd-status-notice ${updateNotice.type}`}>
            <span className="jd-status-notice-text">{updateNotice.text}</span>
            <button
              type="button"
              className="jd-notice-dismiss"
              onClick={() => setUpdateNotice(null)}
              aria-label="Dismiss message"
            >
              <X size={14} />
            </button>
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
                  {lastUpdated && (
                    <span className="jd-last-saved-time">
                      {' '}&bull; Saved {new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
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
                  onClick={() => {
                    setJobDescription('');
                    setJdAnalysis(null);
                    setAnalyzedJdText('');
                    try {
                      sessionStorage.removeItem('mock_interview_jd_analysis');
                      sessionStorage.removeItem('mock_interview_generated_questions');
                    } catch (e) {}
                  }}
                  disabled={isUpdatingJd || isRetrievingJd || isAnalyzingJd}
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                className="jd-retrieve-btn"
                onClick={() => handleRetrieveSavedJd(selectedRole, true)}
                disabled={isRetrievingJd || isUpdatingJd || isAnalyzingJd}
                title="Reload saved job description from server"
              >
                <RotateCcw size={13} className={isRetrievingJd ? 'spinning' : ''} />
                {isRetrievingJd ? 'Loading...' : 'Reload Saved'}
              </button>
              {currentRole && (
                <button
                  type="button"
                  className="jd-template-btn"
                  onClick={handleLoadRoleTemplate}
                  disabled={isUpdatingJd || isRetrievingJd || isAnalyzingJd}
                >
                  Use Role Template
                </button>
              )}
              <button
                type="button"
                className="jd-analyze-btn"
                onClick={() => handleAnalyzeJobDescription(null, false)}
                disabled={isAnalyzingJd || isUpdatingJd || isRetrievingJd || jobDescription.trim().length < 5}
                title="Analyze job description with AI to extract key skills, focus areas, and tailored questions"
              >
                {isAnalyzingJd ? (
                  <RefreshCw size={13} className="spinning" />
                ) : (
                  <Brain size={13} />
                )}
                {isAnalyzingJd
                  ? 'Analyzing...'
                  : jdAnalysis && analyzedJdText === jobDescription.trim()
                    ? 'Re-analyze JD'
                    : 'Analyze with AI'}
              </button>
              <button
                type="button"
                className="jd-update-btn"
                onClick={handleUpdateJobDescription}
                disabled={isUpdatingJd || isRetrievingJd || isAnalyzingJd || !jobDescription.trim()}
                title="Update and save job description"
              >
                {isUpdatingJd ? (
                  <RefreshCw size={13} className="spinning" />
                ) : (
                  <Save size={13} />
                )}
                {isUpdatingJd ? 'Updating...' : 'Update & Save'}
              </button>
            </div>
          </div>
        </div>

        {/* AI Job Description Analysis Panel */}
        {(isAnalyzingJd || jdAnalysis) && (
          <div className="jd-analysis-panel">
            <div className="jd-analysis-header">
              <div className="jd-analysis-title-group">
                <div className="jd-analysis-icon-box">
                  <Brain size={18} />
                </div>
                <div>
                  <div className="jd-analysis-heading-row">
                    <h3>AI Job Description Analysis</h3>
                    {jdAnalysis && (
                      <span className={`jd-source-pill ${jdAnalysis.analysisSource === 'gemini' ? 'gemini' : 'fallback'}`}>
                        {jdAnalysis.analysisSource === 'gemini' ? 'Gemini AI' : 'Smart Analysis'}
                      </span>
                    )}
                    {jdAnalysis && analyzedJdText && analyzedJdText !== jobDescription.trim() && (
                      <span className="jd-stale-pill">JD edited — click Re-analyze JD</span>
                    )}
                  </div>
                  {jdAnalysis && (
                    <p className="jd-analysis-meta">
                      Detected Role: <strong>{jdAnalysis.detectedRole}</strong> &bull; Seniority:{' '}
                      <span className="jd-seniority-badge">{jdAnalysis.seniorityLevel}</span>
                      {jdAnalysis.yearsOfExperience && (
                        <>
                          {' '}&bull; Experience:{' '}
                          <span className="jd-seniority-badge">{jdAnalysis.yearsOfExperience}</span>
                        </>
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {isAnalyzingJd ? (
              <div className="jd-analysis-loading">
                <RefreshCw size={18} className="spinning" />
                <span>Analyzing job requirements, competencies, and interview focus areas...</span>
              </div>
            ) : jdAnalysis && (
              <div className="jd-analysis-body">
                {jdAnalysis.summary && (
                  <p className="jd-analysis-summary">{jdAnalysis.summary}</p>
                )}

                <div className="jd-analysis-grid">
                  {/* Extracted Technical Skills */}
                  {Array.isArray(jdAnalysis.technicalSkills) && jdAnalysis.technicalSkills.length > 0 && (
                    <div className="jd-analysis-card">
                      <div className="jd-analysis-card-title">
                        <Sparkles size={14} />
                        <span>Extracted Technical Skills</span>
                      </div>
                      <div className="jd-analysis-chips">
                        {jdAnalysis.technicalSkills.map((skill) => {
                          const inJd = jobDescription.toLowerCase().includes(skill.toLowerCase());
                          return (
                            <button
                              key={skill}
                              type="button"
                              className={`jd-extracted-chip ${inJd ? 'in-jd' : ''}`}
                              onClick={() => handleAddSkillToJd(skill)}
                              title={inJd ? `"${skill}" is in your job description` : `Click to add "${skill}" to job description`}
                            >
                              {inJd && <Check size={11} />}
                              <span>{skill}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Soft Skills & Competencies */}
                  {Array.isArray(jdAnalysis.softSkills) && jdAnalysis.softSkills.length > 0 && (
                    <div className="jd-analysis-card">
                      <div className="jd-analysis-card-title">
                        <Target size={14} />
                        <span>Behavioral &amp; Soft Competencies</span>
                      </div>
                      <div className="jd-analysis-chips">
                        {jdAnalysis.softSkills.map((skill) => (
                          <span key={skill} className="jd-soft-chip">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Extracted Responsibilities & Experience Requirements */}
                <div className="jd-analysis-grid">
                  {Array.isArray(jdAnalysis.responsibilities) && jdAnalysis.responsibilities.length > 0 && (
                    <div className="jd-analysis-card">
                      <div className="jd-analysis-card-title">
                        <Briefcase size={14} />
                        <span>Key Responsibilities</span>
                      </div>
                      <ul className="jd-analysis-list">
                        {jdAnalysis.responsibilities.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {Array.isArray(jdAnalysis.experienceRequirements) && jdAnalysis.experienceRequirements.length > 0 && (
                    <div className="jd-analysis-card">
                      <div className="jd-analysis-card-title jd-analysis-card-title--between">
                        <span className="jd-card-title-left">
                          <Award size={14} />
                          <span>Experience Requirements</span>
                        </span>
                        {jdAnalysis.yearsOfExperience && (
                          <span className="jd-experience-pill">{jdAnalysis.yearsOfExperience}</span>
                        )}
                      </div>
                      <ul className="jd-analysis-list">
                        {jdAnalysis.experienceRequirements.map((reqItem, idx) => (
                          <li key={idx}>{reqItem}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Interview Focus Areas */}
                {Array.isArray(jdAnalysis.focusAreas) && jdAnalysis.focusAreas.length > 0 && (
                  <div className="jd-analysis-section">
                    <div className="jd-analysis-card-title">
                      <Target size={14} />
                      <span>Key Interview Focus Areas</span>
                    </div>
                    <div className="jd-focus-list">
                      {jdAnalysis.focusAreas.map((area, idx) => (
                        <div key={`${area.topic}-${idx}`} className="jd-focus-item">
                          <div className="jd-focus-top">
                            <span className="jd-focus-topic">{area.topic}</span>
                            <span className={`jd-priority-badge ${String(area.priority || 'High').toLowerCase()}`}>
                              {area.priority || 'High'} Priority
                            </span>
                          </div>
                          {area.reason && <p className="jd-focus-reason">{area.reason}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="jd-analysis-grid">
                  {/* Watch-outs */}
                  {Array.isArray(jdAnalysis.skillGapsToWatch) && jdAnalysis.skillGapsToWatch.length > 0 && (
                    <div className="jd-analysis-card">
                      <div className="jd-analysis-card-title">
                        <AlertTriangle size={14} />
                        <span>Areas to Watch</span>
                      </div>
                      <ul className="jd-analysis-list">
                        {jdAnalysis.skillGapsToWatch.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Preparation Tips */}
                  {Array.isArray(jdAnalysis.preparationTips) && jdAnalysis.preparationTips.length > 0 && (
                    <div className="jd-analysis-card">
                      <div className="jd-analysis-card-title">
                        <Lightbulb size={14} />
                        <span>AI Preparation Tips</span>
                      </div>
                      <ul className="jd-analysis-list">
                        {jdAnalysis.preparationTips.map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
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
            disabled={isSubmittingJd || isAnalyzingJd}
          >
            {isSubmittingJd
              ? isAnalyzingJd
                ? 'Analyzing & Generating...'
                : 'Saving...'
              : step === 2
                ? 'Continue & Generate >'
                : 'Continue >'}
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
