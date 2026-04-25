import { render, screen } from '@testing-library/react';

// The Footer is an async server component; we render the resolved JSX.
jest.mock('@/lib/news', () => ({
  getNewsLastUpdated: () => Promise.resolve('2026-04-25T00:00:00Z'),
}));

import Footer from '@/components/Footer';

describe('<Footer /> (integration)', () => {
  it('renders the four nav columns + amber legal callout + ©', async () => {
    const tree = await Footer();
    render(tree);

    // Sections
    expect(screen.getByText('Explore')).toBeInTheDocument();
    expect(screen.getByText('Data')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Legal')).toBeInTheDocument();

    // Disclaimer block
    expect(screen.getByText(/not legal advice/i)).toBeInTheDocument();

    // Legal links
    expect(screen.getAllByRole('link', { name: /disclaimer/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /privacy/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /terms/i }).length).toBeGreaterThan(0);

    // 8 USC 1367 reference present
    expect(screen.getByText(/8 U\.S\.C\. § 1367/)).toBeInTheDocument();

    // Live news + USCIS data dates rendered
    expect(screen.getByText(/News feed last refreshed/)).toBeInTheDocument();
    expect(screen.getByText(/USCIS aggregate data last updated/)).toBeInTheDocument();
  });

  it('points the GitHub link at the public repo', async () => {
    const tree = await Footer();
    render(tree);
    const gh = screen.getByRole('link', { name: /github/i });
    expect(gh).toHaveAttribute('href', expect.stringMatching(/github\.com/));
  });
});
