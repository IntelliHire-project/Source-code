import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ── Mock react-router-dom ─────────────────────────────────────────────────────
// MyApplications uses useNavigate(), so we mock it to avoid needing a real Router
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// ── Mock CandidatePageContext ─────────────────────────────────────────────────
// MyApplications calls setPageLabel() from context — provide a mock context value
const mockSetPageLabel = jest.fn();
jest.mock('../CandidateDashboard/CandidateDashboard', () => ({
  CandidatePageContext: require('react').createContext({
    setPageLabel: jest.fn(),
  }),
}));

import MyApplications from './MyApplications';

// ─────────────────────────────────────────────────────────────────────────────
// Helper: render MyApplications with a mock context value
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react';
import { CandidatePageContext } from '../CandidateDashboard/CandidateDashboard';

function renderMyApplications() {
  return render(
    <CandidatePageContext.Provider value={{ setPageLabel: mockSetPageLabel }}>
      <MyApplications />
    </CandidatePageContext.Provider>
  );
}

// =============================================================================
// TC-APP-001 to TC-APP-014 — My Applications List Page
// =============================================================================

describe('MyApplications — Application List Page', () => {

  beforeEach(() => {
    mockNavigate.mockClear();
    mockSetPageLabel.mockClear();
  });

  // ── TC-APP-001 ──────────────────────────────────────────────────────────────
  test('TC-APP-001: renders all 4 application cards and count badge', () => {
    renderMyApplications();

    // All 4 job titles from MOCK_APPLICATIONS must appear
    expect(screen.getByText('Senior Frontend Engineer')).toBeInTheDocument();
    expect(screen.getByText('Product Designer')).toBeInTheDocument();
    expect(screen.getByText('Full Stack Developer')).toBeInTheDocument();
    expect(screen.getByText('Cloud Architect')).toBeInTheDocument();

    // Count badge shows "4"
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText(/applications/i)).toBeInTheDocument();
  });

  // ── TC-APP-002 ──────────────────────────────────────────────────────────────
  test('TC-APP-002: "Under Review" tab filters — shows no mock results (none have this status)', () => {
    renderMyApplications();

    fireEvent.click(screen.getByRole('button', { name: /under review/i }));

    // None of the 4 mock applications have "Under Review" status
    expect(screen.queryByText('Senior Frontend Engineer')).not.toBeInTheDocument();
    expect(screen.queryByText('Product Designer')).not.toBeInTheDocument();
    // Empty state should appear
    expect(screen.getByText(/no applications found/i)).toBeInTheDocument();
  });

  // ── TC-APP-003 ──────────────────────────────────────────────────────────────
  test('TC-APP-003: "Interview" tab shows only Interview Scheduled application', () => {
    renderMyApplications();

    fireEvent.click(screen.getByRole('button', { name: /^interview/i }));

    // Product Designer has status "Interview Scheduled"
    expect(screen.getByText('Product Designer')).toBeInTheDocument();
    // Others should be hidden
    expect(screen.queryByText('Senior Frontend Engineer')).not.toBeInTheDocument();
    expect(screen.queryByText('Full Stack Developer')).not.toBeInTheDocument();
    expect(screen.queryByText('Cloud Architect')).not.toBeInTheDocument();
  });

  // ── TC-APP-004 ──────────────────────────────────────────────────────────────
  test('TC-APP-004: "Rejected" tab shows only rejected application', () => {
    renderMyApplications();

    fireEvent.click(screen.getByRole('button', { name: /^rejected/i }));

    // Full Stack Developer at Financier AI = "Rejected"
    expect(screen.getByText('Full Stack Developer')).toBeInTheDocument();
    expect(screen.queryByText('Senior Frontend Engineer')).not.toBeInTheDocument();
    expect(screen.queryByText('Product Designer')).not.toBeInTheDocument();
    expect(screen.queryByText('Cloud Architect')).not.toBeInTheDocument();
  });

  // ── TC-APP-005 ──────────────────────────────────────────────────────────────
  test('TC-APP-005: "Withdrawn" tab shows only withdrawn application', () => {
    renderMyApplications();

    fireEvent.click(screen.getByRole('button', { name: /^withdrawn/i }));

    // Cloud Architect at SkyScale Solutions = "Withdrawn"
    expect(screen.getByText('Cloud Architect')).toBeInTheDocument();
    expect(screen.queryByText('Senior Frontend Engineer')).not.toBeInTheDocument();
    expect(screen.queryByText('Product Designer')).not.toBeInTheDocument();
    expect(screen.queryByText('Full Stack Developer')).not.toBeInTheDocument();
  });

  // ── TC-APP-006 ──────────────────────────────────────────────────────────────
  test('TC-APP-006: search by job title "Frontend" filters results correctly', async () => {
    renderMyApplications();

    await userEvent.type(
      screen.getByPlaceholderText(/search applications/i),
      'Frontend'
    );

    expect(screen.getByText('Senior Frontend Engineer')).toBeInTheDocument();
    expect(screen.queryByText('Product Designer')).not.toBeInTheDocument();
    expect(screen.queryByText('Full Stack Developer')).not.toBeInTheDocument();
    expect(screen.queryByText('Cloud Architect')).not.toBeInTheDocument();
  });

  // ── TC-APP-007 ──────────────────────────────────────────────────────────────
  test('TC-APP-007: search by company name "Nexus" filters results correctly', async () => {
    renderMyApplications();

    await userEvent.type(
      screen.getByPlaceholderText(/search applications/i),
      'Nexus'
    );

    expect(screen.getByText('Product Designer')).toBeInTheDocument();
    expect(screen.queryByText('Senior Frontend Engineer')).not.toBeInTheDocument();
    expect(screen.queryByText('Cloud Architect')).not.toBeInTheDocument();
  });

  // ── TC-APP-008 ──────────────────────────────────────────────────────────────
  test('TC-APP-008: search by Application ID "APP-99281-X" shows only that application', async () => {
    renderMyApplications();

    await userEvent.type(
      screen.getByPlaceholderText(/search applications/i),
      'APP-99281-X'
    );

    expect(screen.getByText('Senior Frontend Engineer')).toBeInTheDocument();
    expect(screen.queryByText('Product Designer')).not.toBeInTheDocument();
    expect(screen.queryByText('Full Stack Developer')).not.toBeInTheDocument();
  });

  // ── TC-APP-009 ──────────────────────────────────────────────────────────────
  test('TC-APP-009: search with no match shows empty state message', async () => {
    renderMyApplications();

    await userEvent.type(
      screen.getByPlaceholderText(/search applications/i),
      'ZZZNonExistentJobXYZ'
    );

    expect(screen.getByText(/no applications found/i)).toBeInTheDocument();
    expect(
      screen.getByText(/try adjusting your search or filter/i)
    ).toBeInTheDocument();
    // Browse Jobs button should appear
    expect(screen.getByRole('button', { name: /browse jobs/i })).toBeInTheDocument();
  });

  // ── TC-APP-010 ──────────────────────────────────────────────────────────────
  test('TC-APP-010: sort dropdown default value is "Most Recent" (newest)', () => {
    renderMyApplications();

    const sortSelect = screen.getByRole('combobox');
    expect(sortSelect).toHaveValue('newest');
  });

  // ── TC-APP-011 ──────────────────────────────────────────────────────────────
  test('TC-APP-011: sort by "Oldest" can be selected', () => {
    renderMyApplications();

    const sortSelect = screen.getByRole('combobox');
    fireEvent.change(sortSelect, { target: { value: 'oldest' } });

    expect(sortSelect).toHaveValue('oldest');
    // All 4 applications still visible (just different order)
    expect(screen.getByText('Senior Frontend Engineer')).toBeInTheDocument();
    expect(screen.getByText('Cloud Architect')).toBeInTheDocument();
  });

  // ── TC-APP-012 ──────────────────────────────────────────────────────────────
  test('TC-APP-012: sort by "Company A-Z" can be selected', () => {
    renderMyApplications();

    const sortSelect = screen.getByRole('combobox');
    fireEvent.change(sortSelect, { target: { value: 'company' } });

    expect(sortSelect).toHaveValue('company');
    // All 4 applications still visible (just alphabetically sorted)
    expect(screen.getByText('Financier AI')).toBeInTheDocument();
    expect(screen.getByText('TechFlow Systems')).toBeInTheDocument();
  });

  // ── TC-APP-013 ──────────────────────────────────────────────────────────────
  test('TC-APP-013: "All" tab returns all 4 applications after filtering', () => {
    renderMyApplications();

    // First filter to Rejected
    fireEvent.click(screen.getByRole('button', { name: /^rejected/i }));
    expect(screen.queryByText('Cloud Architect')).not.toBeInTheDocument();

    // Then click All tab — all should return
    fireEvent.click(screen.getByRole('button', { name: /^all/i }));
    expect(screen.getByText('Senior Frontend Engineer')).toBeInTheDocument();
    expect(screen.getByText('Product Designer')).toBeInTheDocument();
    expect(screen.getByText('Full Stack Developer')).toBeInTheDocument();
    expect(screen.getByText('Cloud Architect')).toBeInTheDocument();
  });

  // ── TC-APP-014 ──────────────────────────────────────────────────────────────
  test('TC-APP-014: clicking "View Details" navigates to /candidate/applications/:id', () => {
    renderMyApplications();

    // Click the first "View Details" button
    const viewDetailsButtons = screen.getAllByRole('button', { name: /view details/i });
    expect(viewDetailsButtons.length).toBeGreaterThan(0);

    fireEvent.click(viewDetailsButtons[0]);

    // Should navigate to an application details URL
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringMatching(/\/candidate\/applications\/\d+/)
    );
  });

});
