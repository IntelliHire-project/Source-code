import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, Check, Plus, X, Database, MonitorPlay, Palette, ShieldCheck, BarChart3, Sparkles } from 'lucide-react';
import { CandidatePageContext } from '../CandidateDashboard/CandidateDashboard';
import './RoleSelection.css';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [customRoles, setCustomRoles] = useState([]);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const categoryDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target)) {
        setShowCategoryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const allRoles = [...ROLES, ...customRoles];

  const filteredRoles = allRoles.filter((role) => {
    const matchesSearch =
      role.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' ||
      role.isCustom ||
      ROLE_CATEGORY_MAP[role.id] === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const currentRole = allRoles.find(r => r.id === selectedRole);
  const activeCategoryLabel = CATEGORIES.find(c => c.id === selectedCategory)?.label || 'All Categories';

  const handleAddCustomRole = () => {
    if (!customInput.trim()) return;
    const id = `custom-${Date.now()}`;
    setCustomRoles(prev => [...prev, {
      id,
      title: customInput.trim(),
      description: 'Custom role defined by you for a personalised mock interview experience.',
      icon: Sparkles,
      isCustom: true,
    }]);
    setSelectedRole(id);
    setCustomInput('');
    setShowCustomModal(false);
  };

  const handleContinue = () => {
    navigate('/candidate/mock-interviews/questions', {
      state: { roleId: selectedRole, roleTitle: currentRole?.title }
    });
  };

  const handleBack = () => {
    navigate('/candidate/dashboard');
  };

  return (
    <div className="role-selection-container">
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
                {CATEGORIES.map((cat) => (
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
            <span className="available-badge">5 Available</span>
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
