# U Visa Tracker

Public aggregate statistics for Form I-918 (U nonimmigrant status) and Form I-918A (derivative) — drawn entirely from USCIS and DHS OHSS public reports.

**Individual petitioner information is protected by 8 U.S.C. § 1367 and is never displayed.**

## Stack

- Next.js 14 (App Router, TypeScript)
- Tailwind CSS
- Chart.js via react-chartjs-2
- Deployed on Vercel

## Local dev

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Refresh data

```bash
npm run fetch          # download latest USCIS I-918 xlsx/csv into data/raw/
npm run fetch -- --list   # list available files without downloading
```

After downloading, open the xlsx and update the `ANNUAL_PRINCIPAL`, `ANNUAL_DERIVATIVE`, and `QUARTERLY_PRINCIPAL` arrays in `src/lib/data.ts`. The data file deliberately requires a human pass because USCIS occasionally changes sheet names/column headers between quarters.

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Dev server on :3000 |
| `npm run build` | Production build + next-sitemap |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |
| `npm run fetch` | Pull latest USCIS data files |

## Routes

| Path | Purpose |
|---|---|
| `/` | Dashboard with KPIs, receipts vs approvals bar chart, backlog chart, tables |
| `/backlog` | Backlog-focused page |
| `/about` | What the U visa is, qualifying crimes, § 1367 explainer |
| `/sources` | Authoritative government data sources |

## Data scope

What **is** here (all public aggregate):

- Annual I-918 principal and I-918A derivative receipts, approvals, denials, and end-of-year pending (FY2009 – latest)
- Quarterly rolling window for the most recent 8 quarters
- The 10,000 U-1 statutory annual cap
- The 28 statutory qualifying crimes (INA § 101(a)(15)(U)(iii))

What is **not** here and cannot be obtained:

- Petitioner names or any identifying information
- Specific crime details of any individual petition
- Geographic location of the qualifying crime
- Nationality of individual petitioners
- I-918B certifying agency for any specific case

All of the above are sealed under 8 U.S.C. § 1367.
