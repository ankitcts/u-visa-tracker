# U Visa Tracker

[![Live](https://img.shields.io/badge/live-uvisatracker.com-22c55e?style=for-the-badge)](https://uvisatracker.com)
[![Latest release](https://img.shields.io/github/v/release/ankitcts/u-visa-tracker?style=for-the-badge&color=2563eb)](https://github.com/ankitcts/u-visa-tracker/releases/latest)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vercel](https://img.shields.io/badge/deployed-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)
[![Tests](https://img.shields.io/badge/tests-108%20passing-22c55e?style=for-the-badge)](#quality)

A public-data dashboard for the **U nonimmigrant visa (USCIS Form I-918)** — aggregate filings, approvals, denials, the multi-decade backlog, history, qualifying crimes, landmark litigation, and a live news feed.

🌐 **Live:** https://uvisatracker.com

> **Individual petitioner information is protected by 8 U.S.C. § 1367 and is never displayed.** This site only ever shows aggregate, publicly-published statistics.

## 📐 Architecture & showcase

Full system design, architecture diagrams, use cases, data flow, release pipeline, and tech stack — all rendered as interactive Mermaid diagrams:

➡ **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)**

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript 5**
- **Tailwind CSS** + **shadcn/ui** (Radix primitives) + **lucide-react**
- **Chart.js** for trends/backlog charts, **react-simple-maps** for the choropleth, **@react-three/fiber + drei** for the 3D history gallery, **Remotion** for the intro video
- **Groq** LLM for the chat + news classifier; **msedge-tts** for narration
- **Vercel** edge + serverless + cron + analytics
- **Jest** (64 tests) + **Playwright** (44 e2e tests on chromium-desktop + mobile-iphone)

## Routes

| Path | Purpose |
|---|---|
| `/` | Landing — timeline, history reel, "Read the history aloud" narrator |
| `/u-visa` | What the U visa is, 5 classifications, qualifying crimes, the 10K cap |
| `/news` | Live news fan-out (Google News + Reddit + GDELT + HN + YouTube), 5-min auto-refresh |
| `/dashboard` | KPIs + filings/approvals/denials trend chart |
| `/analyze` | Interactive Overview / By-State / By-Year tabs with FY presets |
| `/backlog` | Pending-cases deep-dive |
| `/geography` | State-level certification choropleth |
| `/integrity` | Program integrity feed |
| `/litigation` | Landmark litigation + live CourtListener feed |
| `/history` | Curated history timeline |
| `/archives` | Archive search across 17 historical sources |
| `/sources` | Authoritative government data sources |
| `/about` | Project mission + § 1367 explainer |
| `/privacy`, `/terms`, `/disclaimer` | Legal |

## Local dev

```bash
npm install
cp .env.example .env.local
# add GROQ_API_KEY (free from console.groq.com) for the chat feature
npm run dev
```

## Refresh data

The auto-sync workflow (`.github/workflows/sync-uscis.yml`) checks the upstream USCIS XLSX nightly and **opens an auto-PR** if the file SHA has changed. To do it manually:

```bash
npm run fetch          # download latest USCIS xlsx into data/raw/
node scripts/sync-uscis.mjs --dry-run --file data/raw/<file>.xlsx
```

After downloading, hand-review the diff and update `src/lib/data.ts` (the script can also rewrite it for you, but every change still goes through PR review).

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Dev server on :3000 |
| `npm run build` | Production build + next-sitemap |
| `npm run start` | Serve the production build |
| `npm run lint` / `lint:fix` | ESLint |
| `npm run typecheck` | TypeScript, no emit |
| `npm run test` | Jest |
| `npm run test:e2e` | Playwright |
| `npm run fetch` | Pull latest USCIS data files |

## Release pipeline

Branch-based workflow with three layers of `main` protection (GitHub Ruleset + local pre-push hook + CI guard). Release tags drive deploys:

- **RC tag** (`v1.x.y-rc.N`) → `.github/workflows/deploy-rc.yml` → Vercel **PREVIEW** at https://u-visa-tracker.vercel.app
- **Final tag** (`v1.x.y`) → `.github/workflows/deploy-release.yml` → Vercel **PRODUCTION** at https://uvisatracker.com

`main` pushes and feature branches **do not** auto-deploy. Full flow + diagrams in [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md#5-release-pipeline).

## Data scope

What **is** here (all public aggregate):

- Annual I-918 principal and I-918A derivative receipts, approvals, denials, end-of-year pending (FY2009–latest)
- Quarterly rolling window for the most recent quarters
- The 10,000 U-1 statutory annual cap
- The 28 statutory qualifying crimes (INA § 101(a)(15)(U)(iii))
- State-level certification shares
- Live news from public sources, geo-tagged + LLM-classified

What is **not** here and cannot be obtained:

- Petitioner names or any identifying information
- Specific crime details of any individual petition
- Geographic location of the qualifying crime
- Nationality of individual petitioners
- I-918B certifying agency for any specific case

All of the above are sealed under 8 U.S.C. § 1367.

## Quality

- 64/64 jest unit + integration tests passing
- 44/44 playwright e2e on chromium-desktop + mobile-iphone passing
- Clean Next 16 + Turbopack production build
- TypeScript strict, ESLint 9 clean

## License

Source code: see [LICENSE](./LICENSE) (if present). Data is public-domain USCIS reporting.
