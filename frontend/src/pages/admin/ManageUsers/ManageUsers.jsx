import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  Activity,
  Shield,
  Settings,
  Plus,
  Search,
  ChevronDown,
  Edit2,
  UserPlus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  AlertTriangle,
  Eye,
  CheckCircle,
  XCircle
} from 'lucide-react';
import AdminSidebar from '../../../components/common/AdminSidebar';
import TopBar from '../../../components/TopBar/TopBar';
import AdminToast from '../../../components/common/AdminToast';
import { getUsers, saveUsers, appendAuditLog } from '../../../services/adminStorage';
import { fetchUsers, updateRecruiterStatus } from '../../../api/userApi';
import './ManageUsers.css';

// Initial Mock Users data matching mockup + some pagination filler
const INITIAL_USERS = [
  { id: 1, name: 'Alexander Sterling', email: 'a.sterling@nexuscorp.com', role: 'Super Admin', status: 'Active', createdDate: '2023-10-12', avatarColor: '#6B8CFF' },
  { id: 2, name: 'Elena Varkov', email: 'e.varkov@nexuscorp.com', role: 'Moderator', status: 'Active', createdDate: '2023-11-05', avatarColor: '#22C55E' },
  { id: 3, name: 'Marcus Thorne', email: 'm.thorne@recruits.io', role: 'Recruiter', status: 'Inactive', createdDate: '2023-11-20', avatarColor: '#F0B90B' },
  { id: 4, name: 'Sarah Jenkins', email: 's.jenkins@system.net', role: 'Analyst', status: 'Pending', createdDate: '2023-12-01', avatarColor: '#E63946' },
  { id: 5, name: 'Julian Rossi', email: 'j.rossi@nexuscorp.com', role: 'Moderator', status: 'Active', createdDate: '2023-12-15', avatarColor: '#A79E8C' },
  { id: 6, name: 'Amelia Chen', email: 'a.chen@recruiters.org', role: 'Recruiter', status: 'Active', createdDate: '2024-01-10', avatarColor: '#6B8CFF' },
  { id: 7, name: 'David Vance', email: 'd.vance@nexuscorp.com', role: 'Analyst', status: 'Inactive', createdDate: '2024-02-18', avatarColor: '#22C55E' },
  { id: 8, name: 'Sophia Martinez', email: 's.martinez@recruits.io', role: 'Recruiter', status: 'Pending', createdDate: '2024-03-05', avatarColor: '#F0B90B' },
];

function ManageUsers() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Initialize from localStorage; seeds with INITIAL_USERS on first visit
  const [users, setUsers] = useState(() => getUsers(INITIAL_USERS));
  const [toast, setToast] = useState(null);

  // Real users loaded from the backend (admin endpoint)
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState('');

  // Load registered users from the database on mount
  useEffect(() => {
    let cancelled = false;
    const loadUsers = async () => {
      try {
        const data = await fetchUsers();
        if (cancelled) return;
        if (Array.isArray(data.users)) {
          const colors = ['#6B8CFF', '#22C55E', '#F0B90B', '#E63946', '#A79E8C'];
          const mapped = data.users.map((u, i) => ({
            id: u.id,
            name: u.full_name,
            email: u.email,
            role: u.role.charAt(0).toUpperCase() + u.role.slice(1),
            status: u.role === 'recruiter' && u.recruiter_status 
              ? (u.recruiter_status === 'approved' ? 'Active' : u.recruiter_status === 'rejected' ? 'Inactive' : 'Pending')
              : 'Active',
            createdDate: u.created_at ? String(u.created_at).slice(0, 10) : '',
            avatarColor: colors[i % colors.length],
            companyName: u.company_name || 'N/A',
            industry: u.industry || 'N/A',
          }));
          setUsers(mapped);
          setUsersError('');
        }
      } catch (error) {
        if (!cancelled) {
          setUsersError('Could not load users from server. Showing local data instead.');
        }
      } finally {
        if (!cancelled) setUsersLoading(false);
      }
    };
    loadUsers();
    return () => {
      cancelled = true;
    };
  }, []);
  
  // Search, Filter, Sort and Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Add/Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'assign'
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Recruiter',
    status: 'Active',
  });
  const [formErrors, setFormErrors] = useState({});

  // Delete Dialog State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // View Modal State
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewUser, setViewUser] = useState(null);

  // Confirm Modal States
  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false);
  const [rejectConfirmOpen, setRejectConfirmOpen] = useState(false);
  const [actionUser, setActionUser] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Handlers for Recruiter Verification
  const handleViewRecruiter = (user) => {
    setViewUser(user);
    setViewModalOpen(true);
  };

  const handleOpenApproveConfirm = (user) => {
    setActionUser(user);
    setApproveConfirmOpen(true);
    setViewModalOpen(false);
  };

  const confirmApproveRecruiter = async () => {
    if (!actionUser) return;
    try {
      await updateRecruiterStatus(actionUser.id, 'approved');
      
      // Optmistic update
      const updatedUsers = users.map((u) =>
        u.id === actionUser.id ? { ...u, status: 'Active' } : u
      );
      setUsers(updatedUsers);
      saveUsers(updatedUsers);
      setToast({ type: 'success', message: `Recruiter "${actionUser.name}" approved successfully.` });
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to approve recruiter.' });
    } finally {
      setApproveConfirmOpen(false);
      setActionUser(null);
    }
  };

  const handleOpenRejectConfirm = (user) => {
    setActionUser(user);
    setRejectReason('');
    setRejectConfirmOpen(true);
    setViewModalOpen(false);
  };

  const confirmRejectRecruiter = async () => {
    if (!actionUser) return;
    try {
      await updateRecruiterStatus(actionUser.id, 'rejected');

      // Optmistic update
      const updatedUsers = users.map((u) =>
        u.id === actionUser.id ? { ...u, status: 'Inactive' } : u
      );
      setUsers(updatedUsers);
      saveUsers(updatedUsers);
      setToast({ type: 'warning', message: `Recruiter "${actionUser.name}" rejected. Reason: ${rejectReason}` });
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to reject recruiter.' });
    } finally {
      setRejectConfirmOpen(false);
      setActionUser(null);
      setRejectReason('');
    }
  };

  // Status Filter options
  const statusOptions = ['All Status', 'Active', 'Inactive', 'Pending'];

  // Handle Input Changes in Add/Edit Form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error when typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Open Modal for Adding User
  const handleOpenAddModal = () => {
    setModalMode('add');
    setFormData({
      name: '',
      email: '',
      role: 'Recruiter',
      status: 'Active',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  // Open Modal for Editing User
  const handleOpenEditModal = (user) => {
    setModalMode('edit');
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  // Open Modal for Quick Role Assignment
  const handleOpenAssignModal = (user) => {
    setModalMode('assign');
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required.';
    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please provide a valid email address.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Form Submission (Add/Edit)
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (modalMode === 'add') {
      const colors = ['#6B8CFF', '#22C55E', '#F0B90B', '#E63946', '#A79E8C'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const newUser = {
        id: Date.now(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        status: formData.status,
        createdDate: new Date().toISOString().split('T')[0],
        avatarColor: randomColor,
      };
      const updatedUsers = [newUser, ...users];
      setUsers(updatedUsers);
      saveUsers(updatedUsers);
      appendAuditLog({ actionType: 'User Created', module: 'USER_MGMT' });
      setToast({ type: 'success', message: `User "${newUser.name}" added successfully.` });
    } else {
      // Edit mode or quick role assign mode
      const updatedUsers = users.map((u) =>
        u.id === selectedUser.id
          ? { ...u, name: formData.name.trim(), email: formData.email.trim(), role: formData.role, status: formData.status }
          : u
      );
      setUsers(updatedUsers);
      saveUsers(updatedUsers);
      if (modalMode === 'assign') {
        appendAuditLog({ actionType: 'Role Assigned', module: 'USER_MGMT' });
        setToast({ type: 'info', message: `Role updated to "${formData.role}" for ${formData.name}.` });
      } else {
        appendAuditLog({ actionType: 'User Updated', module: 'USER_MGMT' });
        setToast({ type: 'success', message: `User "${formData.name.trim()}" updated successfully.` });
      }
    }
    setModalOpen(false);
  };

  // Trigger Delete confirmation
  const handleOpenDeleteConfirm = (user) => {
    setUserToDelete(user);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      const updatedUsers = users.filter((u) => u.id !== userToDelete.id);
      setUsers(updatedUsers);
      saveUsers(updatedUsers);
      appendAuditLog({ actionType: 'User Deleted', module: 'USER_MGMT', status: 'success' });
      setToast({ type: 'warning', message: `Access revoked for "${userToDelete.name}".` });
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
      // Reset page if it exceeds total pages
      const totalPagesAfterDelete = Math.ceil((updatedUsers.length) / itemsPerPage);
      if (currentPage > totalPagesAfterDelete && totalPagesAfterDelete > 0) {
        setCurrentPage(totalPagesAfterDelete);
      }
    }
  };

  // Handle Column Header Sorting Click
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Filtered & Sorted Users
  const filteredUsers = useMemo(() => {
    return users
      .filter((user) => {
        const matchesSearch =
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
          statusFilter === 'All Status' || user.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        let valueA = a[sortField]?.toString().toLowerCase() || '';
        let valueB = b[sortField]?.toString().toLowerCase() || '';
        if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [users, searchQuery, statusFilter, sortField, sortDirection]);

  // Paginated Users
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));

  const pendingUsers = useMemo(() => {
    return users.filter(u => u.status === 'Pending');
  }, [users]);

  // Initials for avatar
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="admin-theme admin-dashboard">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItem="Users"
      />

      <div className="admin-dashboard__main">
        <TopBar
          user={{ name: 'Admin User', role: 'System Controller' }}
          notificationsCount={5}
          searchPlaceholder="Search across system..."
          onSearch={(q) => console.log('Global search:', q)}
          onHamburgerClick={() => setSidebarOpen(true)}
        />

        <main className="admin-content">
          {/* Header */}
          <div className="admin-content__header">
            <div>
              <h1 className="admin-content__title">User Management</h1>
              <p className="admin-content__subtitle">
                Manage global access control and user lifecycle across the organization.
              </p>
            </div>
            <button className="admin-btn admin-btn--primary" onClick={handleOpenAddModal}>
              <Plus size={18} />
              <span>Add New User</span>
            </button>
          </div>

          {/* Stat Cards */}
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <div className="admin-stat-card__info">
                <span className="admin-stat-card__label">Total Users</span>
                <span className="admin-stat-card__value">2,543</span>
                <span className="admin-stat-card__trend admin-stat-card__trend--up">+12% from last month</span>
              </div>
              <div className="admin-stat-card__icon-box admin-stat-card__icon-box--yellow">
                <Users size={20} />
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-card__info">
                <span className="admin-stat-card__label">Active Now</span>
                <span className="admin-stat-card__value">184</span>
                <span className="admin-stat-card__trend">Live connection pulse</span>
              </div>
              <div className="admin-stat-card__icon-box admin-stat-card__icon-box--yellow">
                <Activity size={20} className="pulse-icon" />
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-card__info">
                <span className="admin-stat-card__label">Moderators</span>
                <span className="admin-stat-card__value">12</span>
                <span className="admin-stat-card__trend">Access console auth</span>
              </div>
              <div className="admin-stat-card__icon-box admin-stat-card__icon-box--yellow">
                <Shield size={20} />
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-card__info">
                <span className="admin-stat-card__label">System Load</span>
                <span className="admin-stat-card__value">24%</span>
                <span className="admin-stat-card__trend">Balanced cluster node</span>
              </div>
              <div className="admin-stat-card__icon-box admin-stat-card__icon-box--yellow">
                <Settings size={20} />
              </div>
            </div>
          </div>

          {/* Pending Users Panel */}
          {pendingUsers.length > 0 && (
            <div className="admin-registry-card" style={{ marginBottom: '2rem', border: '1px solid var(--admin-warning-bg)' }}>
              <div className="admin-registry-card__header" style={{ borderBottom: '1px solid var(--admin-border-light)' }}>
                <div className="admin-registry-card__title-row">
                  <Shield size={18} className="admin-registry-card__title-icon" style={{ color: 'var(--admin-warning-text)' }} />
                  <h2 className="admin-registry-card__title">Pending Approvals ({pendingUsers.length})</h2>
                </div>
              </div>
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>NAME</th>
                      <th>EMAIL ADDRESS</th>
                      <th>ROLE</th>
                      <th>STATUS</th>
                      <th>CREATED DATE</th>
                      <th className="text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingUsers.map(user => (
                      <tr key={user.id} style={{ backgroundColor: 'var(--admin-bg-light)' }}>
                        <td>
                          <div className="admin-table__name-cell">
                            <div className="admin-table__avatar" style={{ backgroundColor: user.avatarColor || '#F0B90B' }}>
                              {getInitials(user.name)}
                            </div>
                            <span className="admin-table__name-text">{user.name}</span>
                          </div>
                        </td>
                        <td className="admin-table__email-text">{user.email}</td>
                        <td><span className="admin-table__role-badge">{user.role}</span></td>
                        <td>
                          <span className={`admin-table__status-badge admin-table__status-badge--pending`}>
                            Pending
                          </span>
                        </td>
                        <td className="admin-table__date-text">{user.createdDate}</td>
                        <td className="admin-table__actions-cell text-right" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button
                            className="admin-table__action-btn"
                            onClick={() => handleViewRecruiter(user)}
                            title="View Recruiter Info"
                            style={{ color: '#6B8CFF' }}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="admin-table__action-btn"
                            onClick={() => handleOpenApproveConfirm(user)}
                            title="Approve Recruiter"
                            style={{ color: '#22C55E' }}
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            className="admin-table__action-btn"
                            onClick={() => handleOpenRejectConfirm(user)}
                            title="Reject Recruiter"
                            style={{ color: '#E63946' }}
                          >
                            <XCircle size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* User Registry Panel */}
          <div className="admin-registry-card">
            <div className="admin-registry-card__header">
              <div className="admin-registry-card__title-row">
                <Users size={18} className="admin-registry-card__title-icon" />
                <h2 className="admin-registry-card__title">User Registry</h2>
              </div>
              
              <div className="admin-registry-card__actions">
                {/* Search */}
                <div className="admin-table-search">
                  <Search className="admin-table-search__icon" size={16} />
                  <input
                    type="text"
                    className="admin-table-search__input"
                    placeholder="Filter by name or email..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>

                {/* Dropdown Filter */}
                <div className="admin-dropdown-filter">
                  <select
                    className="admin-dropdown-filter__select"
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt === 'All Status' ? 'All Status' : opt}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="admin-dropdown-filter__chevron" size={14} />
                </div>
              </div>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('name')} className="sortable-header">
                      NAME {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('email')} className="sortable-header">
                      EMAIL ADDRESS {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('role')} className="sortable-header">
                      ROLE {sortField === 'role' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('status')} className="sortable-header">
                      STATUS {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('createdDate')} className="sortable-header">
                      CREATED DATE {sortField === 'createdDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.length > 0 ? (
                    paginatedUsers.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <div className="admin-table__name-cell">
                            <div
                              className="admin-table__avatar"
                              style={{ backgroundColor: user.avatarColor || '#6B8CFF' }}
                            >
                              {getInitials(user.name)}
                            </div>
                            <span className="admin-table__name-text">{user.name}</span>
                          </div>
                        </td>
                        <td className="admin-table__email-text">{user.email}</td>
                        <td>
                          <span className="admin-table__role-badge">{user.role}</span>
                        </td>
                        <td>
                          <span className={`admin-table__status-badge admin-table__status-badge--${user.status.toLowerCase()}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="admin-table__date-text">{user.createdDate}</td>
                        <td className="admin-table__actions-cell text-right">
                          <button
                            className="admin-table__action-btn"
                            onClick={() => handleOpenEditModal(user)}
                            title="Edit User"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className="admin-table__action-btn"
                            onClick={() => handleOpenAssignModal(user)}
                            title="Assign Role"
                          >
                            <UserPlus size={16} />
                          </button>
                          <button
                            className="admin-table__action-btn admin-table__action-btn--danger"
                            onClick={() => handleOpenDeleteConfirm(user)}
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="admin-table__empty-state">
                        {usersLoading
                          ? 'Loading users...'
                          : usersError || 'No users match the search criteria.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer / Pagination */}
            <div className="admin-registry-card__footer">
              <div className="admin-registry-card__footer-info">
                Showing{' '}
                <span className="bold-count">
                  {filteredUsers.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
                </span>{' '}
                to{' '}
                <span className="bold-count">
                  {Math.min(currentPage * itemsPerPage, filteredUsers.length)}
                </span>{' '}
                of <span className="bold-count">{filteredUsers.length}</span> users
              </div>

              <div className="admin-pagination">
                <button
                  className="admin-pagination__btn"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>

                <div className="admin-pagination__pages">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        className={`admin-pagination__page-num ${
                          currentPage === pageNum ? 'is-active' : ''
                        }`}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  className="admin-pagination__btn"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Global Footer */}
        <footer className="admin-footer-bar">
          <div className="admin-footer-bar__left">
            © 2024 Nexus Intelligence Systems. All rights reserved.
          </div>
          <div className="admin-footer-bar__right">
            <span>System Status</span>
            <span className="footer-dot">•</span>
            <span>Security Protocols</span>
            <span className="footer-dot">•</span>
            <span>Admin Support</span>
          </div>
        </footer>
        {/* Toast Notifications */}
        <AdminToast toast={toast} onDismiss={() => setToast(null)} />
      </div>

      {/* Form Dialog Modal (Add/Edit/Assign Role) */}
      {modalOpen && (
        <div className="admin-modal-overlay" onClick={() => setModalOpen(false)}>
          <div
            className="admin-modal-container"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {modalMode === 'add' && 'Create System User'}
                {modalMode === 'edit' && 'Modify System User'}
                {modalMode === 'assign' && 'Assign Security Role'}
              </h3>
              <button className="admin-modal-close" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="admin-modal-body">
                {modalMode !== 'assign' && (
                  <>
                    {/* Full Name */}
                    <div className="admin-form-group">
                      <label className="admin-form-label" htmlFor="form-name">
                        Full Name
                      </label>
                      <input
                        id="form-name"
                        type="text"
                        name="name"
                        className={`admin-form-input ${formErrors.name ? 'is-invalid' : ''}`}
                        placeholder="e.g. Alexander Sterling"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={modalMode === 'assign'}
                      />
                      {formErrors.name && (
                        <p className="admin-form-error">{formErrors.name}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="admin-form-group">
                      <label className="admin-form-label" htmlFor="form-email">
                        Email Address
                      </label>
                      <input
                        id="form-email"
                        type="email"
                        name="email"
                        className={`admin-form-input ${formErrors.email ? 'is-invalid' : ''}`}
                        placeholder="username@nexuscorp.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={modalMode === 'assign'}
                      />
                      {formErrors.email && (
                        <p className="admin-form-error">{formErrors.email}</p>
                      )}
                    </div>
                  </>
                )}

                {/* Role */}
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="form-role">
                    Role Category
                  </label>
                  <div className="admin-form-select-wrapper">
                    <select
                      id="form-role"
                      name="role"
                      className="admin-form-select"
                      value={formData.role}
                      onChange={handleInputChange}
                    >
                      <option value="Super Admin">Super Admin</option>
                      <option value="Moderator">Moderator</option>
                      <option value="Recruiter">Recruiter</option>
                      <option value="Analyst">Analyst</option>
                    </select>
                    <ChevronDown className="select-chevron" size={16} />
                  </div>
                </div>

                {/* Status */}
                {modalMode !== 'assign' && (
                  <div className="admin-form-group">
                    <label className="admin-form-label" htmlFor="form-status">
                      Account Status
                    </label>
                    <div className="admin-form-select-wrapper">
                      <select
                        id="form-status"
                        name="status"
                        className="admin-form-select"
                        value={formData.status}
                        onChange={handleInputChange}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Pending">Pending</option>
                      </select>
                      <ChevronDown className="select-chevron" size={16} />
                    </div>
                  </div>
                )}
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn--secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn--primary">
                  {modalMode === 'add' ? 'Confirm Addition' : 'Apply Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Alert Modal */}
      {deleteConfirmOpen && (
        <div className="admin-modal-overlay" onClick={() => setDeleteConfirmOpen(false)}>
          <div
            className="admin-modal-container admin-modal-container--alert"
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
          >
            <div className="admin-modal-header">
              <div className="alert-title-row">
                <AlertTriangle className="alert-icon" size={20} />
                <h3 className="admin-modal-title">Revoke Access Permission?</h3>
              </div>
              <button className="admin-modal-close" onClick={() => setDeleteConfirmOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="admin-modal-body alert-body">
              <p>
                Are you sure you want to permanently delete the administrator account for{' '}
                <strong className="alert-strong">{userToDelete?.name}</strong>?
              </p>
              <p className="alert-warning-sub">
                This action is irreversible. The user will immediately lose access credentials to the system console.
              </p>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn--secondary"
                onClick={() => setDeleteConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn admin-btn--danger"
                onClick={handleConfirmDelete}
              >
                Confirm Revocation
              </button>
            </div>
          </div>
        </div>
      )}
      {/* View Recruiter Modal */}
      {viewModalOpen && viewUser && (
        <div className="admin-modal-overlay" onClick={() => setViewModalOpen(false)}>
          <div
            className="admin-modal-container"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Recruiter Details</h3>
              <button className="admin-modal-close" onClick={() => setViewModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="admin-modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--admin-border-light)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--admin-text-light)' }}>Full Name</span>
                  <strong style={{ color: 'var(--admin-text-main)' }}>{viewUser.name}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--admin-border-light)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--admin-text-light)' }}>Email Address</span>
                  <strong style={{ color: 'var(--admin-text-main)' }}>{viewUser.email}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--admin-border-light)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--admin-text-light)' }}>Company Name</span>
                  <strong style={{ color: 'var(--admin-text-main)' }}>{viewUser.companyName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--admin-border-light)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--admin-text-light)' }}>Industry</span>
                  <strong style={{ color: 'var(--admin-text-main)' }}>{viewUser.industry}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--admin-text-light)' }}>Created Date</span>
                  <strong style={{ color: 'var(--admin-text-main)' }}>{viewUser.createdDate}</strong>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn--secondary"
                onClick={() => setViewModalOpen(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="admin-btn"
                onClick={() => handleOpenApproveConfirm(viewUser)}
                style={{ backgroundColor: '#22C55E', color: '#fff', border: 'none' }}
              >
                Approve
              </button>
              <button
                type="button"
                className="admin-btn"
                onClick={() => handleOpenRejectConfirm(viewUser)}
                style={{ backgroundColor: '#E63946', color: '#fff', border: 'none' }}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Approve Confirm Modal */}
      {approveConfirmOpen && (
        <div className="admin-modal-overlay" onClick={() => setApproveConfirmOpen(false)}>
          <div
            className="admin-modal-container"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Confirm Approval</h3>
              <button className="admin-modal-close" onClick={() => setApproveConfirmOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="admin-modal-body">
              <p>Are you sure you want to approve recruiter <strong>{actionUser?.name}</strong>?</p>
              <p style={{ marginTop: '0.5rem', color: 'var(--admin-text-light)' }}>
                This will grant them full access to the system.
              </p>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn--secondary"
                onClick={() => setApproveConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn"
                onClick={confirmApproveRecruiter}
                style={{ backgroundColor: '#22C55E', color: '#fff', border: 'none' }}
              >
                Confirm Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirm Modal */}
      {rejectConfirmOpen && (
        <div className="admin-modal-overlay" onClick={() => setRejectConfirmOpen(false)}>
          <div
            className="admin-modal-container"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Confirm Rejection</h3>
              <button className="admin-modal-close" onClick={() => setRejectConfirmOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="admin-modal-body">
              <p>Are you sure you want to reject recruiter <strong>{actionUser?.name}</strong>?</p>
              <div className="admin-form-group" style={{ marginTop: '1rem' }}>
                <label className="admin-form-label" htmlFor="reject-reason">
                  Reason for Rejection (Optional)
                </label>
                <textarea
                  id="reject-reason"
                  className="admin-form-input"
                  rows="3"
                  placeholder="Enter reason for rejection..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  style={{ resize: 'vertical' }}
                ></textarea>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn--secondary"
                onClick={() => setRejectConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn"
                onClick={confirmRejectRecruiter}
                style={{ backgroundColor: '#E63946', color: '#fff', border: 'none' }}
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageUsers;
