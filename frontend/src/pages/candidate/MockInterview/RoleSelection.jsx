import React, { useState } from 'react';
import { Search, ChevronDown, Check, Plus, Database, MonitorPlay, Palette, ShieldCheck, BarChart3, DatabaseZap } from 'lucide-react';
import './RoleSelection.css';

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
  const [selectedRole, setSelectedRole] = useState('frontend');
  const [searchQuery, setSearchQuery] = useState('');

  const currentRole = ROLES.find(r => r.id === selectedRole);

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
          <div className="category-dropdown">
            <span>All Categories</span>
            <ChevronDown size={18} />
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
          {ROLES.map((role) => {
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
          
          <div className="role-card custom-role-card">
            <div className="role-icon-wrapper custom">
              <Plus size={24} />
            </div>
            <h3>Custom Role</h3>
            <p>Can't find your role? Define a custom one.</p>
          </div>
        </div>
      </div>

      <div className="bottom-action-bar">
        <button className="back-btn">&larr; Back</button>
        <div className="right-actions">
          {currentRole && (
            <div className="currently-selected">
              <span className="label">CURRENTLY SELECTED</span>
              <span className="value">{currentRole.title}</span>
            </div>
          )}
          <button className="continue-btn">Continue &gt;</button>
        </div>
      </div>
    </div>
  );
}
