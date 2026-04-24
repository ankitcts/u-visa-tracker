import { ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { QualifyingCrime } from '@/lib/types';

const STATUTE_LINK =
  'https://www.law.cornell.edu/uscode/text/8/1101#a_15_U_iii';

/**
 * External references per crime where one canonical federal/uniform
 * statute or authoritative resource applies. Most of the 28 categories
 * have no single federal counterpart (they are state-law driven), so
 * most items fall through to the umbrella statute link above.
 */
const EXTRA_REFS: Record<string, { label: string; href: string }> = {
  Trafficking: {
    label: '22 U.S.C. § 7102',
    href: 'https://www.law.cornell.edu/uscode/text/22/7102',
  },
  'Involuntary Servitude': {
    label: '18 U.S.C. § 1584',
    href: 'https://www.law.cornell.edu/uscode/text/18/1584',
  },
  Peonage: {
    label: '18 U.S.C. § 1581',
    href: 'https://www.law.cornell.edu/uscode/text/18/1581',
  },
  'Slave Trade': {
    label: '18 U.S.C. §§ 1581–1597',
    href: 'https://www.law.cornell.edu/uscode/text/18/chapter-77',
  },
  'Female Genital Mutilation': {
    label: '18 U.S.C. § 116',
    href: 'https://www.law.cornell.edu/uscode/text/18/116',
  },
  'Hostage Taking': {
    label: '18 U.S.C. § 1203',
    href: 'https://www.law.cornell.edu/uscode/text/18/1203',
  },
  'Obstruction of Justice': {
    label: '18 U.S.C. Ch. 73',
    href: 'https://www.law.cornell.edu/uscode/text/18/chapter-73',
  },
  Perjury: {
    label: '18 U.S.C. § 1621',
    href: 'https://www.law.cornell.edu/uscode/text/18/1621',
  },
  'Witness Tampering': {
    label: '18 U.S.C. § 1512',
    href: 'https://www.law.cornell.edu/uscode/text/18/1512',
  },
  'Fraud in Foreign Labor Contracting': {
    label: '18 U.S.C. § 1351',
    href: 'https://www.law.cornell.edu/uscode/text/18/1351',
  },
  Kidnapping: {
    label: '18 U.S.C. § 1201',
    href: 'https://www.law.cornell.edu/uscode/text/18/1201',
  },
};

export default function CrimeCategoryList({ crimes }: { crimes: QualifyingCrime[] }) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
      {crimes.map((c) => {
        const extra = EXTRA_REFS[c.category];
        return (
          <li key={c.category}>
            <Card className="h-full transition-colors hover:border-primary/40">
              <CardContent className="p-3 flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-foreground">
                    {c.category}
                  </span>
                  {extra && (
                    <Badge variant="outline" className="font-mono text-[10px]">
                      <a
                        href={extra.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-0.5 hover:text-primary"
                      >
                        {extra.label}
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {c.description}
                </span>
                <a
                  href={STATUTE_LINK}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-muted-foreground hover:text-primary inline-flex items-center gap-0.5"
                >
                  INA § 101(a)(15)(U)(iii)
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </CardContent>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
