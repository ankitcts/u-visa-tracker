import { render, screen, fireEvent } from '@testing-library/react';

// ShareButtons reaches for navigator.share which jsdom doesn't have. Stub it.
jest.mock('@/components/ShareButtons', () => ({
  __esModule: true,
  default: () => <div data-testid="share-buttons" />,
}));

import Navbar from '@/components/Navbar';

describe('<Navbar /> (integration)', () => {
  it('renders the brand and the desktop nav links', () => {
    render(<Navbar />);
    expect(screen.getByText(/U Visa Tracker|UVT/)).toBeInTheDocument();
    for (const label of [
      'History',
      'U Visa',
      'Live News',
      'Dashboard',
      'Analyze',
      'Backlog',
      'Geography',
      'Integrity',
      'Litigation',
    ]) {
      // Some labels are duplicated (desktop list + mobile drawer template).
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
  });

  it('opens the mobile drawer when the menu button is clicked', () => {
    render(<Navbar />);
    const menuBtn = screen.getByRole('button', { name: /open menu/i });
    fireEvent.click(menuBtn);
    expect(screen.getByRole('dialog', { name: /mobile navigation/i })).toBeInTheDocument();
    // Drawer surfaces secondary "More" links.
    expect(screen.getByText(/Archive Search/)).toBeInTheDocument();
  });
});
