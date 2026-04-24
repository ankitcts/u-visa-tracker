import { ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Step {
  id: string;
  title: string;
  description: string;
  typicalDuration: string;
  badge?: 'info' | 'warning' | 'destructive' | 'success';
  outcome?: string;
}

const STEPS: Step[] = [
  {
    id: 'qca',
    title: 'Qualifying Criminal Activity',
    description:
      'The petitioner is a victim of one of 28 statutory crimes (domestic violence, felonious assault, sexual assault, etc.) and suffers substantial physical or mental abuse.',
    typicalDuration: 'T = 0',
    badge: 'info',
  },
  {
    id: 'report',
    title: 'Report to law enforcement',
    description:
      'The victim reports the crime to police, a prosecutor, or another qualifying certifying agency, and provides credible helpful information.',
    typicalDuration: 'Days – weeks',
    badge: 'info',
  },
  {
    id: 'cert',
    title: 'I-918B certification signed',
    description:
      'A qualifying official (police, DA, judge, child protective services, EEOC, DOL) signs Form I-918 Supplement B confirming the crime and helpfulness.',
    typicalDuration: 'Weeks – months',
    badge: 'info',
  },
  {
    id: 'file',
    title: 'File Form I-918 with USCIS',
    description:
      'Principal files Form I-918 (+ I-918A for derivatives, I-192 waiver if inadmissible). 46% of filings cite felonious assault; 41% domestic violence.',
    typicalDuration: 'Within 6 months of certification typical',
    badge: 'info',
    outcome: '~35k principals filed/FY',
  },
  {
    id: 'bfd',
    title: 'Bona Fide Determination (BFD)',
    description:
      'Since June 2021 USCIS issues BFDs to prima facie cases, granting 4-year deferred action and work authorization. BFD queue age is itself multi-year as of 2025.',
    typicalDuration: '~51 months wait (2025)',
    badge: 'warning',
  },
  {
    id: 'adjudicate',
    title: 'Full adjudication',
    description:
      'USCIS fully adjudicates the petition. Approved principals are placed on the U-1 waiting list if the 10k cap is exhausted for the FY. Derivatives (U-2/3/4/5) are adjudicated alongside.',
    typicalDuration: 'Multi-year from filing',
    badge: 'warning',
  },
  {
    id: 'approve',
    title: 'U-1 approval',
    description:
      'Approved principals receive U-1 status, work authorization, and protection from removal. Only 10,000 U-1 approvals are issued per FY (statutory cap).',
    typicalDuration: 'T + many years',
    badge: 'success',
    outcome: '10k approvals/FY (cap)',
  },
  {
    id: 'adjust',
    title: 'Adjust to LPR',
    description:
      'After holding U status for 3 continuous years, the petitioner may file Form I-485 to adjust status to lawful permanent resident.',
    typicalDuration: '3+ years after approval',
    badge: 'success',
  },
];

export default function ProcessFlowchart() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {STEPS.map((step, i) => (
        <div key={step.id} className="relative">
          <Card className="h-full">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {i + 1}
                  </div>
                  <h3 className="font-semibold">{step.title}</h3>
                </div>
                {step.badge && (
                  <Badge
                    variant={
                      step.badge === 'success'
                        ? 'success'
                        : step.badge === 'warning'
                          ? 'warning'
                          : step.badge === 'destructive'
                            ? 'destructive'
                            : 'secondary'
                    }
                  >
                    {step.typicalDuration}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{step.description}</p>
              {step.outcome && (
                <p className="text-xs font-medium text-foreground">
                  {step.outcome}
                </p>
              )}
            </CardContent>
          </Card>
          {i < STEPS.length - 1 && (
            <ChevronRight className="absolute -right-3 top-1/2 hidden md:block h-6 w-6 -translate-y-1/2 text-muted-foreground/50" />
          )}
        </div>
      ))}
    </div>
  );
}
