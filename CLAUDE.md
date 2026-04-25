# U Visa Tracker — Claude Code Guide

## Release workflow

This project uses the **`release-pipeline`** skill. Invoke it whenever the user says commit / push / merge / release / deploy. Summary of the rules it enforces:

- Branches: `feature/<slug>`, `bug/<slug>`, or `hotfix/<slug>` — never commit to `main`.
- Before any push, ASK the user whether the change is a feature, bug, or hotfix.
- After push → open PR → merge to `main` → ask the user to cut an RC.
- **Do NOT delete the source branch on merge.** Keep `feature/`, `bug/`, and `hotfix/` branches around after squash-merge so the per-branch history is preserved on the remote (use `gh pr merge --squash`, not `--squash --delete-branch`).
- **RC tags** (e.g. `v1.1.0-rc.1`) deploy to Vercel **PREVIEW** via `.github/workflows/deploy-rc.yml`, then alias to **https://u-visa-tracker.vercel.app** for verification.
- **Final release tags** (e.g. `v1.1.0`) deploy to Vercel **PRODUCTION** via `.github/workflows/deploy-release.yml`, which is what serves **https://uvisatracker.com**.
- `main` pushes and feature branches do NOT auto-deploy.
- See `~/.claude/skills/release-pipeline/SKILL.md` for the full workflow.

## Direct-push protection on `main`

GitHub branch protection requires Pro on private repos, so we run two free guards instead:

1. **Local pre-push hook** at `.githooks/pre-push` blocks `git push origin main` from any clone that opts in. Activate once per clone:
   ```bash
   git config core.hooksPath .githooks
   ```
2. **CI guard** at `.github/workflows/no-direct-push-to-main.yml` runs on every push to `main` and fails the run if the head commit isn't a PR squash-merge (`...(#NN)` subject) or a real merge commit. This catches anything that bypassed the local hook.

Emergency override for the local hook: `PROTECT_MAIN_OVERRIDE=1 git push origin main` (CI guard still fires — that's by design).

## Scope guardrails (READ FIRST)

This project **must only ever display aggregate, publicly-published U-visa statistics**. Individual petitioner information is legally protected under 8 U.S.C. § 1367. If the user asks for any of the following, politely refuse and explain why:

- Names of individual U-visa petitioners
- Specific crime details tied to an individual case
- Location of the crime for any individual case
- Nationality / citizenship of an individual petitioner
- Which law enforcement agency signed an I-918B for any specific case

Even if data like this were leaked or posted to a third-party site, this project does not ingest it.

## Stack

- Next.js 14 (App Router, TypeScript)
- Tailwind CSS
- Chart.js + react-chartjs-2
- Vercel deploy

## Key files

| File | Purpose |
|---|---|
| `src/lib/data.ts` | Single source of truth — all aggregate stats |
| `src/lib/types.ts` | Shared TypeScript interfaces |
| `src/app/page.tsx` | Dashboard homepage |
| `src/app/about/page.tsx` | What the U visa is + qualifying crimes |
| `src/app/backlog/page.tsx` | Backlog deep-dive |
| `src/app/sources/page.tsx` | Data source list |
| `src/components/FilingsTrendChart.tsx` | Bar chart of receipts/approvals/denials by FY |
| `src/components/BacklogChart.tsx` | Line chart of pending over time |
| `src/components/AnnualTable.tsx` | Tabular annual aggregates |
| `src/components/CrimeCategoryList.tsx` | 28 qualifying crimes card grid |
| `src/components/StatCard.tsx` | KPI card |
| `scripts/fetch-uscis.mjs` | Downloads USCIS I-918 data files into data/raw/ |

## Updating data

1. Run `npm run fetch` — downloads latest USCIS xlsx/csv into `data/raw/`
2. Open each file, note the FY + quarter + case-status columns
3. Hand-edit the arrays in `src/lib/data.ts`:
   - `ANNUAL_PRINCIPAL` — I-918 principal, one row per FY
   - `ANNUAL_DERIVATIVE` — I-918A, one row per FY
   - `QUARTERLY_PRINCIPAL` — rolling 8 quarters
4. Update `LAST_UPDATED` timestamp
5. Run `npm run typecheck && npm run build` before committing

## Data model — `src/lib/data.ts`

```ts
AnnualStat = {
  fiscalYear: number;
  form: 'I-918' | 'I-918A';
  received: number;
  approved: number;
  denied: number;
  pendingEndOfYear: number;
}
```

USCIS publishes quarterly totals — sum the four quarters of a given FY for `received`, `approved`, `denied`. `pendingEndOfYear` is the Q4 `pending` value (pending is cumulative, not quarterly).

## Ad placement

AdSense is wired via `NEXT_PUBLIC_ADSENSE_ID` in the root layout script tag (conditionally injected when the env var is present). No `<AdSenseBanner />` components are placed yet — add them only after AdSense approval and only in inline content slots, never adjacent to crime-category visuals (AdSense will reject a site placing ads next to crime/victim content).

## Adding a new page

1. `src/app/<route>/page.tsx` with `export const metadata`
2. Add link to `src/components/Navbar.tsx` if top-level nav
3. `next-sitemap.config.js` auto-generates sitemap from static routes

## Testing

Jest + Testing Library scaffolded. Add tests to `src/__tests__/`. No tests written yet — the data module and pure helpers (`totals`, `latestPending` in `src/lib/data.ts`) are the first things worth unit-testing.
