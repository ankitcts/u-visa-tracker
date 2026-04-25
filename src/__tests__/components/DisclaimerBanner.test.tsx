import { render, screen } from '@testing-library/react';
import DisclaimerBanner from '@/components/DisclaimerBanner';

describe('<DisclaimerBanner />', () => {
  it('renders the "not legal advice" headline', () => {
    render(<DisclaimerBanner />);
    expect(screen.getByText(/Not legal advice/i)).toBeInTheDocument();
  });

  it('links to the three legal pages', () => {
    render(<DisclaimerBanner />);
    expect(screen.getByRole('link', { name: /disclaimer/i })).toHaveAttribute(
      'href',
      '/disclaimer',
    );
    expect(screen.getByRole('link', { name: /privacy/i })).toHaveAttribute(
      'href',
      '/privacy',
    );
    expect(screen.getByRole('link', { name: /terms/i })).toHaveAttribute(
      'href',
      '/terms',
    );
  });

  it('uses role="note" so it announces correctly to assistive tech', () => {
    render(<DisclaimerBanner />);
    expect(screen.getByRole('note')).toBeInTheDocument();
  });
});
