import React from 'react';
import { render, screen } from '@testing-library/react';
import CVInsights from '../pages/candidate/CVInsights/CVInsights';
import { CandidatePageContext } from '../pages/candidate/CandidateDashboard/CandidateDashboard';
import { getCandidateCVs, getCVInsightsApi } from '../api/authApi';

jest.mock('../pages/candidate/CandidateDashboard/CandidateDashboard', () => ({
  CandidatePageContext: require('react').createContext(),
}));
jest.mock('../api/authApi', () => ({
  getCandidateCVs: jest.fn(),
  getCVInsightsApi: jest.fn(),
  uploadCandidateCV: jest.fn(),
  setActiveCandidateCV: jest.fn(),
  chatWithCVApi: jest.fn(),
}));

describe('CV insights', () => {
  beforeAll(() => {
    Element.prototype.scrollIntoView = jest.fn();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderPage = () => render(
    <CandidatePageContext.Provider value={{ setPageLabel: jest.fn() }}>
      <CVInsights />
    </CandidatePageContext.Provider>
  );

  test('shows an empty state instead of sample CVs when none exist', async () => {
    getCandidateCVs.mockResolvedValue({ cvs: [] });
    renderPage();
    expect(await screen.findByText('No CV selected')).toBeTruthy();
    expect(screen.getByText('Select or upload a CV to generate insights.')).toBeTruthy();
    expect(getCVInsightsApi).not.toHaveBeenCalled();
  });

  test('shows an error instead of fabricated insights when analysis fails', async () => {
    getCandidateCVs.mockResolvedValue({ cvs: [{ id: 5, cv_name: 'Resume.pdf', is_active: true }] });
    getCVInsightsApi.mockRejectedValue(new Error('Unavailable'));
    const log = jest.spyOn(console, 'error').mockImplementation(() => {});
    renderPage();
    expect(await screen.findByText('Could not generate CV insights. Please try again.')).toBeTruthy();
    expect(screen.getByText('Select or upload a CV to generate insights.')).toBeTruthy();
    log.mockRestore();
  });
});
