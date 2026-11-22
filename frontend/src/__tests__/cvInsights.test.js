import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import CVInsights from '../pages/candidate/CVInsights/CVInsights';
import { CandidatePageContext } from '../pages/candidate/CandidateDashboard/CandidateDashboard';
import { chatWithCVApi, getCandidateCVs, getCVInsightsApi } from '../api/authApi';

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
    expect(screen.getByText(/Google Gemini/)).toBeTruthy();
    expect(screen.getByText(/personal details may remain/)).toBeTruthy();
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

  test('requires a CV before chatting instead of returning a mock reply', async () => {
    getCandidateCVs.mockResolvedValue({ cvs: [] });
    renderPage();
    await screen.findByText('No CV selected');
    fireEvent.change(screen.getByPlaceholderText('Ask about your CV...'), { target: { value: 'Improve my summary' } });
    fireEvent.click(screen.getByLabelText('Send message'));
    expect(screen.getByText('Select or upload a CV before using the assistant.')).toBeTruthy();
    expect(chatWithCVApi).not.toHaveBeenCalled();
  });

  test('shows a chat error rather than a mock response', async () => {
    getCandidateCVs.mockResolvedValue({ cvs: [{ id: 5, cv_name: 'Resume.pdf', is_active: true }] });
    getCVInsightsApi.mockResolvedValue({ insights: { strengths: [], weaknesses: [], suggestions: [], presentKeywords: [], missingKeywords: [] } });
    chatWithCVApi.mockRejectedValue(new Error('Unavailable'));
    const log = jest.spyOn(console, 'error').mockImplementation(() => {});
    renderPage();
    await screen.findByText('Resume.pdf');
    fireEvent.change(screen.getByPlaceholderText('Ask about your CV...'), { target: { value: 'Improve my summary' } });
    fireEvent.click(screen.getByLabelText('Send message'));
    expect(await screen.findByText('The CV assistant is unavailable. Please try again.')).toBeTruthy();
    expect(screen.queryByText(/Focus on 2-3 sentences/)).toBeNull();
    log.mockRestore();
  });

  test('keeps long replies visible while limiting the history sent with the next question', async () => {
    getCandidateCVs.mockResolvedValue({ cvs: [{ id: 5, cv_name: 'Resume.pdf', is_active: true }] });
    getCVInsightsApi.mockResolvedValue({ insights: { strengths: [], weaknesses: [], suggestions: [], presentKeywords: [], missingKeywords: [] } });
    const longReply = 'a'.repeat(2001);
    chatWithCVApi.mockResolvedValueOnce({ reply: longReply }).mockResolvedValueOnce({ reply: 'Follow-up response' });
    renderPage();
    await screen.findByText('Resume.pdf');
    const input = screen.getByPlaceholderText('Ask about your CV...');
    fireEvent.change(input, { target: { value: 'Review my CV' } });
    fireEvent.click(screen.getByLabelText('Send message'));
    await screen.findByText(longReply);

    fireEvent.change(input, { target: { value: 'What should I improve first?' } });
    fireEvent.click(screen.getByLabelText('Send message'));
    await screen.findByText('Follow-up response');

    const history = chatWithCVApi.mock.calls[1][2];
    expect(history[history.length - 1]).toEqual({
      role: 'ai',
      text: `${'a'.repeat(1988)}\n[truncated]`,
    });
    expect(history.every(({ text }) => text.length <= 2000)).toBe(true);
    expect(screen.getByText(longReply)).toBeTruthy();
  });

  test('clears chat and ignores late replies when switching CVs', async () => {
    getCandidateCVs.mockResolvedValue({ cvs: [
      { id: 5, cv_name: 'First.pdf', is_active: true },
      { id: 6, cv_name: 'Second.pdf', is_active: false },
    ] });
    getCVInsightsApi.mockResolvedValue({ insights: { strengths: [], weaknesses: [], suggestions: [], presentKeywords: [], missingKeywords: [] } });
    let resolveChat;
    chatWithCVApi.mockReturnValue(new Promise((resolve) => { resolveChat = resolve; }));
    renderPage();
    await screen.findByText('First.pdf');
    expect(screen.getByText('Chatting about: First.pdf')).toBeTruthy();
    fireEvent.change(screen.getByPlaceholderText('Ask about your CV...'), { target: { value: 'First CV question' } });
    fireEvent.click(screen.getByLabelText('Send message'));
    fireEvent.click(screen.getByText('First.pdf'));
    fireEvent.click(screen.getByText('Second.pdf'));
    expect(screen.getByText('Chatting about: Second.pdf')).toBeTruthy();
    expect(screen.queryByText('First CV question')).toBeNull();
    await act(async () => { resolveChat({ reply: 'Old CV reply' }); });
    await waitFor(() => expect(screen.queryByText('Old CV reply')).toBeNull());
    chatWithCVApi.mockResolvedValueOnce({ reply: 'Second CV reply' });
    fireEvent.change(screen.getByPlaceholderText('Ask about your CV...'), { target: { value: 'Second CV question' } });
    fireEvent.click(screen.getByLabelText('Send message'));
    await screen.findByText('Second CV reply');
    const history = chatWithCVApi.mock.calls[1][2];
    expect(JSON.stringify(history)).not.toContain('First CV question');
    expect(chatWithCVApi.mock.calls[1][0]).toBe(6);
  });
});
