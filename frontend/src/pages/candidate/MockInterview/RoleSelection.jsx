import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, Check, Plus, X, Database, MonitorPlay, Palette, ShieldCheck, BarChart3, Sparkles } from 'lucide-react';
import { CandidatePageContext } from '../CandidateDashboard/CandidateDashboard';
import { fetchAvailableRoles, createCustomJobRole, storeSelectedRole } from '../../../api/mockInterviewApi';
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
    icon: Database
  },
  {
    id: 'frontend',
    title: 'Frontend Developer',
    description: 'Building responsive user interfaces, state management, and seamless UX implementation.',
    icon: MonitorPlay
  },
  {
    id: 'uiux',
    title: 'UI/UX Designer',
    description: 'Visual storytelling, user research, wireframing, and creating high-fidelity prototypes.',
    icon: Palette
  },
  {
    id: 'qa',
    title: 'QA Engineer',
    description: 'Automated testing, quality assurance frameworks, and ensuring bug-free product delivery.',
    icon: ShieldCheck
  },
  {
    id: 'data',
    title: 'Data Analyst',
    description: 'Statistical modeling, data visualization, and extracting actionable business insights.',
    icon: BarChart3
  }
];

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
      try {
        storeSelectedRole({
          roleId: selectedRole,
          roleTitle: currentRole?.title,
          category: currentRole?.category,
        }).catch(() => {});
      } catch (err) {
        // Continue even if network is offline
      }
      setStep(2);
    } else {
      try {
        await storeSelectedRole({
          roleId: selectedRole,
          roleTitle: currentRole?.title,
          category: currentRole?.category,
          jobDescription,
        });
      } catch (err) {
        console.warn('Could not store selected role in backend:', err.message);
      }
      navigate('/candidate/mock-interviews/questions', {
        state: { 
          roleId: selectedRole, 
          roleTitle: currentRole?.title,
          jobDescription: jobDescription
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
          Paste a specific job description below. Our AI will analyze it to generate highly relevant, targeted interview questions.
        </p>
        <div className="jd-textarea-container">
          <textarea
            className="jd-textarea"
            placeholder="Paste job description here (Optional)..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>
      </div>
      )}

      <div className="bottom-action-bar">
        <button type="button" className="back-btn" onClick={handleBack}>&larr; Back</button>
        <div className="right-actions">
          {currentRole && (
            <div className="currently-selected">
              <span className="label">CURRENTLY SELECTED</span>
              <span className="value">{currentRole.title}</span>
            </div>
          )}
          <button type="button" className="continue-btn" onClick={handleContinue}>Continue &gt;</button>
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
