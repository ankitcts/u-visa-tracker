# U Visa Tracker — Architecture & Showcase

> A public-data dashboard for the U nonimmigrant visa (USCIS Form I-918). Aggregate filings, approvals, denials, multi-decade backlog, and live news — all from publicly published sources, with individual petitioner data legally protected and never shown.

🌐 **Live:** https://uvisatracker.com  ·  📦 **Source:** https://github.com/ankitcts/u-visa-tracker  ·  🚀 **Latest:** [v1.5.0](https://github.com/ankitcts/u-visa-tracker/releases/latest)

---

## Table of contents

1. [System design (C4 context)](#1-system-design--c4-context)
2. [Architecture (component layers)](#2-architecture--component-layers)
3. [Use case diagram](#3-use-case-diagram)
4. [Data flow — request to render](#4-data-flow--request-to-render)
5. [Release pipeline](#5-release-pipeline)
6. [Tech stack](#6-tech-stack)
7. [Key design decisions](#7-key-design-decisions)
8. [Quality bar](#8-quality-bar)

---

## 1. System design — C4 context

High-level view of who talks to what. Browser → Vercel edge → Next.js → external sources. All diagrams are Mermaid; GitHub renders them natively, click-pan-zoom in the rendered view.

```mermaid
flowchart LR
  visitor(["👤 Visitor<br/>browser / mobile"])
  bot(["🤖 USCIS sync bot<br/>(GitHub Action, nightly)"])
  maintainer(["🧑‍💻 Maintainer<br/>(Ankit)"])

  subgraph Edge["⚡ Vercel Edge"]
    cdn[["CDN<br/>(static + ISR cache)"]]
    fns[["Serverless functions<br/>(Next.js routes)"]]
  end

  subgraph App["🟦 Next.js 16 app (uvisatracker.com)"]
    pages[["App Router pages<br/>13 routes"]]
    api[["API routes<br/>/api/chat • /api/news/* • /api/cron • /api/narrate-timeline"]]
    sse[["SSE stream<br/>/api/news/stream"]]
  end

  subgraph Sources["🌐 Upstream sources"]
    uscis["USCIS.gov<br/>I-918 quarterly XLSX"]
    gnews["Google News RSS"]
    reddit["Reddit"]
    gdelt["GDELT"]
    hn["Hacker News"]
    yt["YouTube"]
    courts["CourtListener<br/>(litigation feed)"]
    groq["Groq LLM<br/>(news classifier + chat)"]
    tts["msedge-tts<br/>(history narration)"]
  end

  subgraph CI["🔧 CI / control plane"]
    gh[["GitHub<br/>(repo + Actions + Rulesets)"]]
    vdash[["Vercel dashboard"]]
  end

  visitor -->|HTTPS| cdn
  cdn -->|cache miss| fns
  fns --> pages
  fns --> api
  fns --> sse

  pages -->|fetch + cache| uscis
  api -->|fetch + cache| gnews & reddit & gdelt & hn & yt
  api -->|chat + classify| groq
  api -->|TTS| tts
  pages -->|fetch + cache| courts

  bot -->|nightly cron| uscis
  bot -->|opens PR on diff| gh
  maintainer -->|review + merge| gh
  gh -->|RC tag| vdash
  gh -->|final tag| vdash
  vdash -->|deploy| Edge

  classDef visitor fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
  classDef sources fill:#fef3c7,stroke:#f59e0b,color:#78350f
  classDef ci fill:#ddd6fe,stroke:#7c3aed,color:#4c1d95
  class visitor visitor
  class uscis,gnews,reddit,gdelt,hn,yt,courts,groq,tts sources
  class gh,vdash ci
```

---

## 2. Architecture — component layers

Inside the Next.js app: how routes, server components, client components, libraries, and external dependencies are wired.

```mermaid
flowchart TB
  subgraph Client["🌐 Browser (client components)"]
    ChatBot
    HistoryNarrator
    HistoryGallery3D["HistoryGallery3D<br/>(@react-three/fiber + drei)"]
    LiveNewsSection["LiveNewsSection<br/>(5-min auto-poll)"]
    NewsFetchProgress["NewsFetchProgress<br/>(SSE)"]
    USNewsMap["USNewsMap<br/>(react-simple-maps)"]
    Charts["Charts<br/>(Chart.js)"]
    Navbar["Navbar / FloatingSideNav"]
    LastUpdatedPill["LastUpdatedPill<br/>+ LocalTimestamp"]
  end

  subgraph Server["🟦 Next.js server"]
    direction TB
    subgraph Pages["App Router pages"]
      home["/<br/>history"]
      uvisa["/u-visa"]
      news["/news"]
      dash["/dashboard"]
      analyze["/analyze"]
      backlog["/backlog"]
      geo["/geography"]
      integ["/integrity"]
      lit["/litigation"]
      arch["/archives"]
      legal["/privacy /terms /disclaimer"]
    end

    subgraph APIRoutes["API routes (route.ts)"]
      apiChat["/api/chat<br/>Groq LLM"]
      apiFeed["/api/news/feed<br/>JSON snapshot"]
      apiStream["/api/news/stream<br/>SSE progress"]
      apiCron["/api/cron/refresh<br/>cache-bust"]
      apiTTS["/api/narrate-timeline/[i]<br/>msedge-tts"]
    end

    subgraph Lib["lib/ (data + helpers)"]
      libData["data.ts<br/>USCIS aggregates"]
      libRefresh["refresh.ts<br/>LAST_UPDATED"]
      libNews["news.ts<br/>RSS aggregator"]
      libCls["news-classifier.ts<br/>Groq tagging"]
      libLit["litigation.ts<br/>CourtListener"]
      libHist["u-visa-history.ts<br/>timeline events"]
    end
  end

  subgraph Cache["⏱ Caching layers"]
    unstable["unstable_cache<br/>(per-call, 5-min)"]
    isr["ISR<br/>(per-page revalidate)"]
    cdn["Vercel CDN<br/>(s-maxage)"]
  end

  ChatBot -->|POST| apiChat
  LiveNewsSection -->|poll| apiFeed
  NewsFetchProgress -.SSE.-> apiStream
  HistoryNarrator -->|GET| apiTTS

  Pages --> Lib
  apiFeed --> libNews & libCls
  apiStream --> libNews & libCls
  apiChat --> libData
  apiTTS --> libHist

  libData -.-> isr
  libNews -.-> unstable
  libCls -.-> unstable
  libLit -.-> unstable
  apiFeed -.->|no-store| cdn
  apiCron -.->|invalidates| unstable

  classDef client fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
  classDef server fill:#dcfce7,stroke:#16a34a,color:#14532d
  classDef cache fill:#fef9c3,stroke:#ca8a04,color:#713f12
  class ChatBot,HistoryNarrator,HistoryGallery3D,LiveNewsSection,NewsFetchProgress,USNewsMap,Charts,Navbar,LastUpdatedPill client
  class home,uvisa,news,dash,analyze,backlog,geo,integ,lit,arch,legal,apiChat,apiFeed,apiStream,apiCron,apiTTS,libData,libRefresh,libNews,libCls,libLit,libHist server
  class unstable,isr,cdn cache
```

---

## 3. Use case diagram

Actors and what they can do. UML-style use cases mapped to actual features.

```mermaid
flowchart LR
  visitor(["👤 Visitor"])
  maintainer(["🧑‍💻 Maintainer"])
  bot(["🤖 USCIS sync bot"])
  cron(["⏱ Vercel Cron"])

  subgraph PublicUseCases["🌐 Public-visitor use cases"]
    direction TB
    uc1(("Browse aggregate stats<br/>(dashboard / backlog / geography)"))
    uc2(("Read U-visa history aloud<br/>(narrator + Remotion video)"))
    uc3(("Filter cases by FY / state<br/>(/analyze)"))
    uc4(("Read live news<br/>(/news, 5-min refresh)"))
    uc5(("Chat about the U-visa<br/>(Groq-powered)"))
    uc6(("Search archives<br/>(/archives)"))
    uc7(("View qualifying crimes<br/>(/u-visa)"))
    uc8(("View landmark litigation<br/>(/litigation)"))
  end

  subgraph MaintainerUseCases["🛠 Maintainer use cases"]
    direction TB
    mc1(("Open PR via feature/bug/hotfix branch"))
    mc2(("Review auto-data-sync PR"))
    mc3(("Cut RC → preview deploy"))
    mc4(("Promote RC → production"))
    mc5(("Audit branch-protection"))
  end

  subgraph AutomatedUseCases["⚙️ Automated use cases"]
    direction TB
    ac1(("Detect new USCIS XLSX<br/>(SHA diff)"))
    ac2(("Auto-PR fresh data.ts"))
    ac3(("Bust daily-refresh cache"))
    ac4(("Deploy on RC tag"))
    ac5(("Deploy on final tag"))
  end

  visitor --- uc1 & uc2 & uc3 & uc4 & uc5 & uc6 & uc7 & uc8
  maintainer --- mc1 & mc2 & mc3 & mc4 & mc5
  bot --- ac1 & ac2
  cron --- ac3
  maintainer -.triggers.-> ac4 & ac5

  classDef visitor fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
  classDef maint fill:#fce7f3,stroke:#db2777,color:#831843
  classDef auto fill:#fef9c3,stroke:#ca8a04,color:#713f12
  class visitor visitor
  class maintainer maint
  class bot,cron auto
```

---

## 4. Data flow — request to render

What happens when a visitor opens `/dashboard`. Sequence diagram covering the cache layers.

```mermaid
sequenceDiagram
  autonumber
  participant V as 👤 Visitor
  participant E as ⚡ Vercel Edge
  participant N as 🟦 Next.js (serverless)
  participant L as 📚 lib/data.ts
  participant C as ⏱ unstable_cache

  V->>E: GET /dashboard
  alt cached page (within ISR window)
    E-->>V: HTML from cache (instant)
  else cache miss / regeneration
    E->>N: render page
    N->>L: import { ANNUAL_PRINCIPAL, totals(), latestPending() }
    L-->>N: hand-curated data + LAST_UPDATED constant
    N->>L: getRouteLastUpdated('dashboard')
    L-->>N: LAST_UPDATED ISO string
    N-->>E: rendered HTML
    E-->>V: HTML + cached for next request
  end
  V->>E: hydrate, run client JS
  Note over V,E: <LocalTimestamp /> reformats LAST_UPDATED in visitor's TZ
```

For `/news`, the flow includes auto-refresh polling:

```mermaid
sequenceDiagram
  autonumber
  participant V as 👤 Visitor
  participant E as ⚡ Vercel Edge
  participant F as /api/news/feed
  participant LN as lib/news.ts
  participant Ext as Google News + Reddit + GDELT + HN + YouTube
  participant G as Groq LLM

  V->>E: GET /news (force-dynamic, always fresh shell)
  E->>F: render page → fetchUVisaNews + classifyNews
  F->>LN: cached aggregator
  alt 5-min cache hit
    LN-->>F: cached items
  else cache miss
    LN->>Ext: parallel RSS / API fetches (~9 sources)
    Ext-->>LN: news items
    LN->>G: classify by tag + state
    G-->>LN: classified items
    LN-->>F: items
  end
  F-->>V: SSR HTML with initial items
  Note over V: <LiveNewsSection /> hydrates, starts 5-min poll loop

  loop every 5 min
    V->>F: fetch /api/news/feed (no-store)
    F->>LN: cached aggregator (cheap re-read)
    LN-->>F: items + fresh ISO timestamp
    F-->>V: JSON snapshot
    Note over V: fade items, show "Refreshing live news…" overlay,<br/>then update items + lastUpdated, reset countdown
  end
```

---

## 5. Release pipeline

Branch → PR → merge → RC → preview → final → production. Enforced by GitHub Rulesets + a tracked pre-push hook + a CI guard.

```mermaid
flowchart LR
  start([Code change]) --> branch{"Branch type?"}
  branch -->|new feature| feat["feature/&lt;slug&gt;"]
  branch -->|defect| bug["bug/&lt;slug&gt;"]
  branch -->|prod fix| hot["hotfix/&lt;slug&gt;"]

  feat & bug & hot --> commit[Commit]
  commit --> push["git push origin &lt;branch&gt;"]
  push --> pr["Open PR via gh pr create"]
  pr --> review{Review}
  review -->|approved| merge["gh pr merge --squash<br/>(branch retained)"]
  merge --> main["main"]

  main --> ask["Ask user:<br/>cut RC?"]
  ask -->|yes| rc["git tag v1.x.y-rc.N"]
  rc --> rcWf[".github/workflows/deploy-rc.yml"]
  rcWf --> preview["Vercel preview<br/>https://u-visa-tracker.vercel.app"]
  preview --> verify{User verifies}
  verify -->|approved| final["git tag v1.x.y"]
  final --> relWf[".github/workflows/deploy-release.yml"]
  relWf --> prod["Vercel production<br/>https://uvisatracker.com"]

  subgraph Guards["🛡 main-branch protection (3 layers)"]
    direction TB
    g1["GitHub Ruleset<br/>(server-side, no bypass)"]
    g2[".githooks/pre-push<br/>(local block, opt-in)"]
    g3[".github/workflows/no-direct-push-to-main.yml<br/>(CI guard)"]
  end

  push -.checked by.-> g2
  main -.protected by.-> g1 & g3

  classDef branch fill:#dbeafe,stroke:#2563eb
  classDef tag fill:#fef9c3,stroke:#ca8a04
  classDef env fill:#dcfce7,stroke:#16a34a
  classDef guard fill:#fce7f3,stroke:#db2777
  class feat,bug,hot,main branch
  class rc,final tag
  class preview,prod env
  class g1,g2,g3 guard
```

---

## 6. Tech stack

Click any badge to jump to its docs.

### Framework & language

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Turbopack](https://img.shields.io/badge/Turbopack-bundler-000000?style=for-the-badge)](https://turbo.build/pack)

### Styling & UI

[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-Radix%20primitives-000000?style=for-the-badge)](https://ui.shadcn.com)
[![Radix UI](https://img.shields.io/badge/Radix-UI%20primitives-161618?style=for-the-badge)](https://www.radix-ui.com)
[![lucide-react](https://img.shields.io/badge/Lucide-icons-F56565?style=for-the-badge)](https://lucide.dev)
[![motion](https://img.shields.io/badge/motion-(framer)-0055FF?style=for-the-badge)](https://motion.dev)

### Data viz

[![Chart.js](https://img.shields.io/badge/Chart.js-trends%20+%20backlog-FF6384?style=for-the-badge&logo=chart.js&logoColor=white)](https://www.chartjs.org)
[![react-simple-maps](https://img.shields.io/badge/react--simple--maps-choropleth-1A202C?style=for-the-badge)](https://www.react-simple-maps.io)
[![@react-three/fiber](https://img.shields.io/badge/R3F-3D%20gallery-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://docs.pmnd.rs/react-three-fiber)
[![Remotion](https://img.shields.io/badge/Remotion-history%20video-1F2937?style=for-the-badge)](https://www.remotion.dev)

### Backend services

[![Vercel](https://img.shields.io/badge/Vercel-edge%20+%20serverless-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)
[![Vercel Cron](https://img.shields.io/badge/Vercel-Cron%20Jobs-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/docs/cron-jobs)
[![Groq](https://img.shields.io/badge/Groq-LLM%20(chat%20+%20classifier)-FF6E37?style=for-the-badge)](https://console.groq.com)
[![msedge-tts](https://img.shields.io/badge/msedge--tts-Aria%20voice-0078D4?style=for-the-badge&logo=microsoftedge&logoColor=white)](https://github.com/Migushthe2nd/MsEdgeTTS)
[![@vercel/analytics](https://img.shields.io/badge/Vercel-Analytics-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/docs/analytics)

### Data sources

[![USCIS](https://img.shields.io/badge/USCIS-I--918%20XLSX-1A4480?style=for-the-badge)](https://www.uscis.gov/tools/reports-and-studies/immigration-and-citizenship-data)
[![Google News](https://img.shields.io/badge/Google%20News-RSS-4285F4?style=for-the-badge&logo=google-news&logoColor=white)](https://news.google.com)
[![Reddit](https://img.shields.io/badge/Reddit-feed-FF4500?style=for-the-badge&logo=reddit&logoColor=white)](https://reddit.com)
[![GDELT](https://img.shields.io/badge/GDELT-event%20feed-10B981?style=for-the-badge)](https://www.gdeltproject.org)
[![Hacker News](https://img.shields.io/badge/Hacker%20News-Algolia%20API-FF6600?style=for-the-badge&logo=ycombinator&logoColor=white)](https://hn.algolia.com)
[![YouTube](https://img.shields.io/badge/YouTube-search-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://www.youtube.com)
[![CourtListener](https://img.shields.io/badge/CourtListener-litigation%20feed-1E40AF?style=for-the-badge)](https://www.courtlistener.com)

### Testing & quality

[![Jest](https://img.shields.io/badge/Jest-unit%20+%20integration-C21325?style=for-the-badge&logo=jest&logoColor=white)](https://jestjs.io)
[![Playwright](https://img.shields.io/badge/Playwright-e2e-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)](https://playwright.dev)
[![Testing Library](https://img.shields.io/badge/Testing--Library-React%20+%20DOM-E33332?style=for-the-badge&logo=testing-library&logoColor=white)](https://testing-library.com)
[![ESLint 9](https://img.shields.io/badge/ESLint-9-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)](https://eslint.org)
[![Prettier](https://img.shields.io/badge/Prettier-3-F7B93E?style=for-the-badge&logo=prettier&logoColor=black)](https://prettier.io)

### CI / CD

[![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-CI-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)](https://github.com/features/actions)
[![GitHub Rulesets](https://img.shields.io/badge/GitHub-Rulesets%20on%20main-181717?style=for-the-badge&logo=github&logoColor=white)](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets-for-a-repository)
[![Vercel CLI](https://img.shields.io/badge/Vercel%20CLI-deploy--rc%20+%20deploy--release-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/docs/cli)

### Counts at a glance

| | |
| --- | --- |
| **Routes** | 13 pages + 5 API routes |
| **Components** | 40+ React components |
| **Tests** | 64 jest + 44 playwright = 108 passing |
| **Workflows** | `deploy-rc.yml` · `deploy-release.yml` · `sync-uscis.yml` · `no-direct-push-to-main.yml` |
| **Releases shipped** | 8 (v0.2.0 → v1.5.0) since project went public |

---

## 7. Key design decisions

<details>
<summary><strong>Why hand-curated data.ts (with auto-PR sync) instead of a database?</strong></summary>

The dashboard renders aggregate USCIS statistics that update at most once per quarter. A database would be operational overhead with ~zero benefit. Instead:

- `src/lib/data.ts` is hand-edited from the latest USCIS XLSX
- `USCIS_FILE_VERIFIED.sha256` anchors the data to a specific file
- `scripts/sync-uscis.mjs` runs nightly via GitHub Action — fetches the canonical XLSX, compares SHA, and **opens an auto-PR with regenerated arrays** if anything changed
- The maintainer reviews + merges, then cuts a release

This gives provenance (every data change goes through a reviewed PR), zero infrastructure (no DB), and high integrity (SHA-pinned source files).

</details>

<details>
<summary><strong>Why split RC tags → preview vs final tags → production?</strong></summary>

Earlier the same workflow deployed RC tags directly to production. That left no chance to verify a release candidate on a real Vercel environment before users saw it.

Now:
- `v*-rc.*` → `deploy-rc.yml` → Vercel **preview** → aliased to `https://u-visa-tracker.vercel.app`
- `v[0-9]+.[0-9]+.[0-9]+` → `deploy-release.yml` → Vercel **production** → `https://uvisatracker.com`

Maintainer verifies on the stable preview alias, then cuts the matching final tag to ship.

</details>

<details>
<summary><strong>Why three layers of main-branch protection?</strong></summary>

GitHub Rulesets (server-side) require Pro on private repos. To get real prevention without paying, three free defenses run in parallel:

1. **GitHub Ruleset** (added after the repo went public) — server-side, no bypass
2. **`.githooks/pre-push`** — local block, opt-in via `git config core.hooksPath .githooks`
3. **`.github/workflows/no-direct-push-to-main.yml`** — CI guard that fails any push to main whose head commit isn't a PR squash-merge

Defense in depth. Even if one layer is bypassed (e.g. local hook from a fresh clone), the others catch it.

</details>

<details>
<summary><strong>Why force-dynamic on /news instead of ISR?</strong></summary>

`/news` was previously cached for 5 min via `revalidate = 300`. Visitors got the same HTML the whole window — the `<NewsFetchProgress />` Suspense loader never showed except on the very first cold render.

Switching to `dynamic = 'force-dynamic'` lets Suspense stream the loader on every visit. Upstream feed fetches in `lib/news.ts` are still cached via `unstable_cache` (5-min TTL), so per-request rendering does NOT translate to per-request upstream hits.

</details>

<details>
<summary><strong>Why pill timestamp = data vintage, not cache-bust time?</strong></summary>

The Last-updated pill on every data page used to show `new Date()` cached per-route. After a deploy, the cache was cold and regenerated to "now" — so the pill effectively showed the deploy time, not the data vintage.

Now the pill sources from `LAST_UPDATED` in `data.ts` directly. That's bumped (a) by hand when a USCIS reconciliation is committed, or (b) automatically by the auto-sync workflow. Honest signal of "when did the underlying numbers last change".

</details>

<details>
<summary><strong>Why msedge-tts for narration instead of OpenAI / ElevenLabs?</strong></summary>

The "Read the history aloud" button synthesises 14 timeline events end-to-end. msedge-tts uses Microsoft Edge's TTS endpoint via WebSocket — free, no API key, the same Aria voice the Remotion intro video uses. CDN caches the resulting MP3 per event, so first-listener-per-region pays the synthesis cost once, everyone after gets bytes.

</details>

---

## 8. Quality bar

- **Compliance:** site only ever shows aggregate, publicly-published statistics — individual petitioner info is protected under 8 U.S.C. § 1367. Encoded in `CLAUDE.md` and enforced at the data layer.
- **Tests:** 64 jest (data, history, litigation, integrity, archive sources, AnnualTable, StatCard, DisclaimerBanner, Footer, Navbar, narrate-timeline route) + 44 playwright (chromium-desktop + mobile-iphone, all 16 routes return 200 + assert h1) = 108 passing.
- **Build:** clean on Next 16 + Turbopack, TypeScript strict, no ESLint errors.
- **Pipeline:** every push to main goes through a reviewed PR; every production deploy is gated behind preview verification at a stable URL.
- **Source provenance:** every aggregate cell in `data.ts` traces back to a SHA-pinned USCIS XLSX whose URL is documented in `USCIS_FILE_VERIFIED`.

---

<sub>Generated as part of the v1.6.0 release. See [release notes](https://github.com/ankitcts/u-visa-tracker/releases) for the full changelog.</sub>
