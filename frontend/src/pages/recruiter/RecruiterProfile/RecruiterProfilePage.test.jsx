import { render, screen } from '@testing-library/react';
import RecruiterProfilePage from './RecruiterProfilePage';

describe('RecruiterProfilePage', () => {
  it('renders the recruiter profile sections and actions', () => {
    render(<RecruiterProfilePage />);

    expect(screen.getByText('Sarah Parker')).toBeInTheDocument();
    expect(screen.getByText('Talent Acquisition Partner')).toBeInTheDocument();
    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByText('Recruiter Statistics')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
  });
});
