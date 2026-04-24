'use client';

import { useState } from 'react';
import FilingsTrendChart from './FilingsTrendChart';
import BacklogChart from './BacklogChart';
import CategoryBarChart from './CategoryBarChart';
import StatCard from './StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import type { AnnualStat, StateCertShare, YearlyCrimeShare } from '@/lib/types';
import {
  computeFraudLean,
  fraudLeanLabel,
  NATIONAL_FA_LEAN,
} from '@/lib/integrity';

interface Props {
  principal: AnnualStat[];
  derivative: AnnualStat[];
  states: StateCertShare[];
  yearlyCrimes: YearlyCrimeShare[];
}

type Tab = 'overview' | 'state' | 'year';

export default function Explorer({
  principal,
  derivative,
  states,
  yearlyCrimes,
}: Props) {
  const allYears = principal
    .map((s) => s.fiscalYear)
    .sort((a, b) => a - b);
  const minYear = allYears[0];
  const maxYear = allYears[allYears.length - 1];

  const [tab, setTab] = useState<Tab>('overview');
  const [fromYear, setFromYear] = useState<number>(minYear);
  const [toYear, setToYear] = useState<number>(maxYear);
  const [selectedState, setSelectedState] = useState<string>(states[0].state);
  const [focusYear, setFocusYear] = useState<number>(maxYear);

  const openStateTab = (stateName: string) => {
    setSelectedState(stateName);
    setTab('state');
  };
  const openYearTab = (year: number) => {
    setFocusYear(year);
    setTab('year');
  };

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="state">By State</TabsTrigger>
        <TabsTrigger value="year">By Year</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <OverviewTab
          principal={principal}
          derivative={derivative}
          states={states}
          yearlyCrimes={yearlyCrimes}
          allYears={allYears}
          fromYear={fromYear}
          toYear={toYear}
          setFromYear={setFromYear}
          setToYear={setToYear}
          minYear={minYear}
          maxYear={maxYear}
          onOpenState={openStateTab}
          onOpenYear={openYearTab}
        />
      </TabsContent>

      <TabsContent value="state" className="space-y-6">
        <StateTab
          principal={principal}
          derivative={derivative}
          states={states}
          selectedState={selectedState}
          setSelectedState={setSelectedState}
          onOpenYear={openYearTab}
        />
      </TabsContent>

      <TabsContent value="year" className="space-y-6">
        <YearTab
          principal={principal}
          derivative={derivative}
          states={states}
          yearlyCrimes={yearlyCrimes}
          focusYear={focusYear}
          setFocusYear={setFocusYear}
          onOpenState={openStateTab}
        />
      </TabsContent>
    </Tabs>
  );
}

// ---------------------------------------------------------------- Overview ---

function OverviewTab({
  principal,
  derivative,
  states,
  yearlyCrimes,
  allYears,
  fromYear,
  toYear,
  setFromYear,
  setToYear,
  minYear,
  maxYear,
  onOpenState,
  onOpenYear,
}: {
  principal: AnnualStat[];
  derivative: AnnualStat[];
  states: StateCertShare[];
  yearlyCrimes: YearlyCrimeShare[];
  allYears: number[];
  fromYear: number;
  toYear: number;
  setFromYear: (y: number) => void;
  setToYear: (y: number) => void;
  minYear: number;
  maxYear: number;
  onOpenState: (s: string) => void;
  onOpenYear: (y: number) => void;
}) {
  const filteredPrincipal = principal.filter(
    (s) => s.fiscalYear >= fromYear && s.fiscalYear <= toYear,
  );
  const filteredDerivative = derivative.filter(
    (s) => s.fiscalYear >= fromYear && s.fiscalYear <= toYear,
  );

  const rangeTotals = filteredPrincipal.reduce(
    (a, s) => ({
      received: a.received + s.received,
      approved: a.approved + s.approved,
      denied: a.denied + s.denied,
    }),
    { received: 0, approved: 0, denied: 0 },
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <p className="text-xs text-muted-foreground">
            Per-year filtering applies to{' '}
            <strong>USCIS quarterly volumes</strong> (receipts, approvals,
            denials, pending). Per-state certification data is only published
            as an aggregate for FY2012–FY2018 in the 2020 Trends Report —
            USCIS does not publish true state × year cross-tabs, so the
            By-State and By-Year tabs will clearly mark estimates.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <YearPicker
              label="From fiscal year"
              value={fromYear}
              setValue={(v) => {
                setFromYear(v);
                if (v > toYear) setToYear(v);
              }}
              options={allYears}
            />
            <YearPicker
              label="To fiscal year"
              value={toYear}
              setValue={(v) => {
                setToYear(v);
                if (v < fromYear) setFromYear(v);
              }}
              options={allYears}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setFromYear(minYear);
                setToYear(maxYear);
              }}
            >
              Reset
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setFromYear(2012);
                setToYear(2018);
              }}
            >
              Trends window (FY12–18)
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setFromYear(maxYear - 4);
                setToYear(maxYear);
              }}
            >
              Last 5 FYs
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Years" value={`FY${fromYear}–FY${toYear}`} />
        <StatCard label="Receipts (range)" value={rangeTotals.received} />
        <StatCard label="Approvals (range)" value={rangeTotals.approved} />
        <StatCard label="Denials (range)" value={rangeTotals.denied} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Filings in FY{fromYear}–FY{toYear}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPrincipal.length === 0 ? (
            <p className="text-sm text-muted-foreground">No years in range.</p>
          ) : (
            <FilingsTrendChart stats={filteredPrincipal} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Pending in FY{fromYear}–FY{toYear}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPrincipal.length === 0 ? (
            <p className="text-sm text-muted-foreground">No years in range.</p>
          ) : (
            <BacklogChart
              principal={filteredPrincipal}
              derivative={filteredDerivative}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Drill into a state (click to open By-State tab)
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Aggregate share of national I-918B certifications, FY2012–FY2018.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
            {states.map((s) => (
              <button
                key={s.abbr}
                type="button"
                onClick={() => onOpenState(s.state)}
                className="rounded-xl border bg-card p-3 text-left shadow-sm transition-colors hover:border-primary hover:bg-accent"
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-medium text-foreground">
                    {s.state}
                  </span>
                  <Badge variant="secondary">{s.share}%</Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  Top: {s.topCrimes[0].crime} (
                  {s.topCrimes[0].share.toFixed(1)}%)
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Drill into a year (click to open By-Year tab)
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Select a fiscal year to see its national volumes plus an
            estimated per-state breakdown.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {principal
              .slice()
              .sort((a, b) => b.fiscalYear - a.fiscalYear)
              .map((s) => (
                <Button
                  key={s.fiscalYear}
                  size="sm"
                  variant="outline"
                  className="tabular-nums"
                  onClick={() => onOpenYear(s.fiscalYear)}
                >
                  FY{s.fiscalYear}
                </Button>
              ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Crime mix trend (FY2012–FY2018)
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Percentage of Form I-918Bs that checked each crime category.
            Totals per year exceed 100% because ~31% of forms check multiple
            categories.
          </p>
        </CardHeader>
        <CardContent>
          <CrimeTrendTable years={yearlyCrimes} />
        </CardContent>
      </Card>
    </>
  );
}

// ---------------------------------------------------------------- State tab ---

function StateTab({
  principal,
  derivative,
  states,
  selectedState,
  setSelectedState,
  onOpenYear,
}: {
  principal: AnnualStat[];
  derivative: AnnualStat[];
  states: StateCertShare[];
  selectedState: string;
  setSelectedState: (s: string) => void;
  onOpenYear: (y: number) => void;
}) {
  const current = states.find((s) => s.state === selectedState) ?? states[0];
  const sorted = [...states].sort((a, b) => b.share - a.share);
  const rank = sorted.findIndex((s) => s.state === current.state) + 1;

  const estimated = principal
    .slice()
    .sort((a, b) => a.fiscalYear - b.fiscalYear)
    .map((s) => ({
      fiscalYear: s.fiscalYear,
      nationalReceipts: s.received,
      estimatedStateCerts: Math.round((current.share / 100) * s.received),
    }));

  const totalEstimated = estimated.reduce(
    (a, e) => a + e.estimatedStateCerts,
    0,
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>State drill-down</CardTitle>
          <p className="text-xs text-muted-foreground">
            The only published per-state figure is an <em>aggregate</em> share
            across FY2012–FY2018. Per-year numbers below are{' '}
            <strong>estimates</strong> computed as (state share %) × (national
            I-918 receipts that FY). Treat them as rough order-of-magnitude.
          </p>
        </CardHeader>
        <CardContent>
          <div className="md:max-w-sm space-y-1.5">
            <Label>State</Label>
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {states.map((s) => (
                  <SelectItem key={s.abbr} value={s.state}>
                    {s.state} ({s.share}%)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="State share"
          value={`${current.share}%`}
          sublabel="Of national certs, FY12–18"
        />
        <StatCard
          label="National rank"
          value={`#${rank}`}
          sublabel={`Among top ${states.length} states`}
        />
        <StatCard
          label="Top certified crime"
          value={current.topCrimes[0].crime}
          sublabel={`${current.topCrimes[0].share.toFixed(1)}% in ${current.state}`}
        />
        <StatCard
          label="Est. certs (cumulative)"
          value={totalEstimated}
          sublabel={`Share × receipts · EST`}
        />
      </div>

      {/* Fraud-angle panel — derived FA lean per state vs national average */}
      {(() => {
        const lean = computeFraudLean(current);
        if (lean === null) return null;
        const pct = lean * 100;
        const delta = pct - NATIONAL_FA_LEAN * 100;
        const variant =
          pct >= 60 ? 'destructive' : pct >= 50 ? 'warning' : 'secondary';
        return (
          <Card className="border-l-4 border-l-destructive/60">
            <CardHeader>
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <CardTitle className="text-lg">
                    Fraud-angle: felonious-assault lean
                  </CardTitle>
                  <p className="text-xs text-muted-foreground max-w-2xl">
                    Share of {current.state}&apos;s top two certified crimes
                    that fall into <strong>felonious assault</strong>, the
                    category USCIS identified as having rising
                    likely-ineligible filings (9% → 21%, FY2012–FY2018).
                  </p>
                </div>
                <Badge variant={variant}>{fraudLeanLabel(lean)}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-4 flex-wrap">
                <div>
                  <div className="text-3xl font-semibold tabular-nums">
                    {pct.toFixed(0)}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {current.state} FA lean
                  </div>
                </div>
                <div className="text-muted-foreground">vs.</div>
                <div>
                  <div className="text-2xl font-semibold tabular-nums text-muted-foreground">
                    {(NATIONAL_FA_LEAN * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    National average
                  </div>
                </div>
                <div
                  className={
                    delta > 0
                      ? 'text-destructive text-sm font-medium'
                      : 'text-emerald-600 dark:text-emerald-400 text-sm font-medium'
                  }
                >
                  {delta >= 0 ? '+' : ''}
                  {delta.toFixed(1)} pp vs national
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground max-w-3xl">
                A higher lean does not mean more fraud — it means a larger
                share of {current.state}&apos;s certifications sit in the
                USCIS-flagged category, so scrutiny would disproportionately
                land there. Differences reflect state criminal-code variance
                and certifying practices.
              </p>
            </CardContent>
          </Card>
        );
      })()}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {current.state} — top certified crimes (FY2012–FY2018)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryBarChart
            items={current.topCrimes.map((c) => ({
              label: c.crime,
              share: c.share,
            }))}
            color="rgba(59, 130, 246, 0.8)"
            max={
              Math.ceil(
                Math.max(...current.topCrimes.map((c) => c.share)) / 10,
              ) * 10
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {current.state} — estimated certifications per FY
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Computed as {current.share}% × national I-918 receipts for that FY.
            Rows within FY2012–FY2018 are directly supported by the USCIS
            Trends Report; others are extrapolated. Click a row to switch to
            the By-Year tab.
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>FY</TableHead>
                <TableHead className="text-right">National receipts</TableHead>
                <TableHead className="text-right">
                  Estimated {current.state} certs
                </TableHead>
                <TableHead>Source support</TableHead>
                <TableHead className="w-8"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estimated
                .slice()
                .reverse()
                .map((e) => {
                  const direct = e.fiscalYear >= 2012 && e.fiscalYear <= 2018;
                  return (
                    <TableRow
                      key={e.fiscalYear}
                      className="cursor-pointer tabular-nums"
                      onClick={() => onOpenYear(e.fiscalYear)}
                    >
                      <TableCell>FY{e.fiscalYear}</TableCell>
                      <TableCell className="text-right">
                        {e.nationalReceipts.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-primary">
                        {e.estimatedStateCerts.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {direct ? (
                          <Badge variant="success">FY12–18 window</Badge>
                        ) : (
                          <Badge variant="warning">Extrapolated</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            National filings during {current.state}&apos;s reporting window
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FilingsTrendChart
            stats={principal.filter(
              (s) => s.fiscalYear >= 2012 && s.fiscalYear <= 2018,
            )}
          />
          <BacklogChart
            principal={principal.filter(
              (s) => s.fiscalYear >= 2012 && s.fiscalYear <= 2018,
            )}
            derivative={derivative.filter(
              (s) => s.fiscalYear >= 2012 && s.fiscalYear <= 2018,
            )}
          />
        </CardContent>
      </Card>
    </>
  );
}

// ----------------------------------------------------------------- Year tab ---

function YearTab({
  principal,
  derivative: _derivative,
  states,
  yearlyCrimes,
  focusYear,
  setFocusYear,
  onOpenState,
}: {
  principal: AnnualStat[];
  derivative: AnnualStat[];
  states: StateCertShare[];
  yearlyCrimes: YearlyCrimeShare[];
  focusYear: number;
  setFocusYear: (y: number) => void;
  onOpenState: (s: string) => void;
}) {
  const p = principal.find((s) => s.fiscalYear === focusYear);
  const crimes = yearlyCrimes.find((y) => y.fiscalYear === focusYear);
  const years = principal.map((s) => s.fiscalYear).sort((a, b) => b - a);
  const directWindow = focusYear >= 2012 && focusYear <= 2018;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Year drill-down</CardTitle>
          <p className="text-xs text-muted-foreground">
            Pick a fiscal year to see its national volumes plus an{' '}
            <strong>estimated</strong> per-state breakdown. State shares are
            applied uniformly across years because USCIS has not published
            state × year cross-tabs outside the FY12–18 aggregate.
          </p>
        </CardHeader>
        <CardContent>
          <div className="md:max-w-sm space-y-1.5">
            <Label>Fiscal year</Label>
            <Select
              value={String(focusYear)}
              onValueChange={(v) => setFocusYear(Number(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    FY{y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {p && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            label="Principal received"
            value={p.received}
            sublabel={`FY${focusYear}`}
          />
          <StatCard
            label="Principal approved"
            value={p.approved}
            sublabel={`FY${focusYear}`}
          />
          <StatCard
            label="Principal denied"
            value={p.denied}
            sublabel={`FY${focusYear}`}
          />
          <StatCard
            label="Principal pending (EOY)"
            value={p.pendingEndOfYear}
            sublabel={`FY${focusYear}`}
          />
        </div>
      )}

      {crimes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Crime mix in FY{focusYear}</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryBarChart
              items={[
                { label: 'Felonious Assault', share: crimes.feloniousAssault },
                { label: 'Domestic Violence', share: crimes.domesticViolence },
                { label: 'Sexual Assault', share: crimes.sexualAssault },
              ]}
              color="rgba(239, 68, 68, 0.8)"
              max={60}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">
              Per-state breakdown for FY{focusYear}
            </CardTitle>
            {directWindow ? (
              <Badge variant="success">Trends window</Badge>
            ) : (
              <Badge variant="warning">Extrapolated</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {p
              ? `Estimated by applying each state's FY12–18 share to FY${focusYear}'s national receipts (${p.received.toLocaleString()}). Click a row to switch to the By-State tab.`
              : 'No data for this year.'}
          </p>
        </CardHeader>
        <CardContent>
          {p && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>State</TableHead>
                  <TableHead className="text-right">Share</TableHead>
                  <TableHead className="text-right">
                    Est. certs FY{focusYear}
                  </TableHead>
                  <TableHead>Top crime</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...states]
                  .sort((a, b) => b.share - a.share)
                  .map((s) => {
                    const est = Math.round((s.share / 100) * p.received);
                    return (
                      <TableRow
                        key={s.abbr}
                        onClick={() => onOpenState(s.state)}
                        className="cursor-pointer tabular-nums"
                      >
                        <TableCell className="font-medium">{s.state}</TableCell>
                        <TableCell className="text-right">{s.share}%</TableCell>
                        <TableCell className="text-right text-primary">
                          {est.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {s.topCrimes[0].crime}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                <TableRow className="text-muted-foreground tabular-nums">
                  <TableCell className="italic">All other states</TableCell>
                  <TableCell className="text-right">
                    {Math.max(
                      0,
                      100 - states.reduce((x, s) => x + s.share, 0),
                    )}
                    %
                  </TableCell>
                  <TableCell className="text-right">
                    {Math.round(
                      ((100 - states.reduce((x, s) => x + s.share, 0)) / 100) *
                        p.received,
                    ).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-xs italic">
                    Not individually published
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}

// ----------------------------------------------------------------- utilities ---

function YearPicker({
  label,
  value,
  setValue,
  options,
}: {
  label: string;
  value: number;
  setValue: (v: number) => void;
  options: number[];
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Select
        value={String(value)}
        onValueChange={(v) => setValue(Number(v))}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((y) => (
            <SelectItem key={y} value={String(y)}>
              FY{y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function CrimeTrendTable({ years }: { years: YearlyCrimeShare[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>FY</TableHead>
          <TableHead className="text-right">Felonious Assault</TableHead>
          <TableHead className="text-right">Domestic Violence</TableHead>
          <TableHead className="text-right">Sexual Assault</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {years.map((y) => (
          <TableRow key={y.fiscalYear} className="tabular-nums">
            <TableCell>FY{y.fiscalYear}</TableCell>
            <TableCell className="text-right">{y.feloniousAssault}%</TableCell>
            <TableCell className="text-right">{y.domesticViolence}%</TableCell>
            <TableCell className="text-right">{y.sexualAssault}%</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
