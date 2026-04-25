import { render, screen } from '@testing-library/react';
import AnnualTable from '@/components/AnnualTable';
import type { AnnualStat } from '@/lib/types';

const FIXTURE: AnnualStat[] = [
  { fiscalYear: 2023, form: 'I-918', received: 1, approved: 2, denied: 3, pendingEndOfYear: 4 },
  { fiscalYear: 2024, form: 'I-918', received: 5, approved: 6, denied: 7, pendingEndOfYear: 8 },
];

describe('<AnnualTable />', () => {
  it('renders one row per fiscal year', () => {
    const { container } = render(<AnnualTable stats={FIXTURE} form="I-918 Principal" />);
    expect(container.querySelectorAll('tbody tr')).toHaveLength(FIXTURE.length);
  });

  it('sorts rows by descending fiscal year', () => {
    const { container } = render(<AnnualTable stats={FIXTURE} form="I-918 Principal" />);
    const rows = container.querySelectorAll('tbody tr');
    expect(rows[0].textContent).toContain('FY2024');
    expect(rows[1].textContent).toContain('FY2023');
  });

  it('renders the caption with the form name', () => {
    render(<AnnualTable stats={FIXTURE} form="I-918 Principal" />);
    expect(screen.getByText(/I-918 Principal/i)).toBeInTheDocument();
  });
});
