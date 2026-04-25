import { render, screen } from '@testing-library/react';
import StatCard from '@/components/StatCard';

describe('<StatCard />', () => {
  it('renders the label, value, and sublabel when given strings', () => {
    render(
      <StatCard label="Principal pending" value="276,751" sublabel="End of FY2025" />,
    );
    expect(screen.getByText('Principal pending')).toBeInTheDocument();
    expect(screen.getByText('276,751')).toBeInTheDocument();
    expect(screen.getByText('End of FY2025')).toBeInTheDocument();
  });

  it('renders an animated number when value is numeric', () => {
    render(<StatCard label="Cap" value={10000} />);
    // AnimatedNumber renders some text containing the formatted number.
    expect(screen.getByText('Cap')).toBeInTheDocument();
  });

  it('omits sublabel when not provided', () => {
    render(<StatCard label="Cap" value="10,000" />);
    expect(screen.queryByText(/End of FY/)).not.toBeInTheDocument();
  });
});
