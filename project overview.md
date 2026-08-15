# PROJECT OVERVIEW
## NyayaRadar — India Judicial Pendency Map
**A public, map-first platform visualizing pending court cases across India**

| | |
|---|---|
| Version | 2.0 (detailed) |
| Status | Approved for build |
| Working title | NyayaRadar (rename anytime) |
| Companion doc | `PRD.md` (requirements & acceptance criteria) |

---

## 1. Executive Summary

NyayaRadar is a free public website that answers one question visually: **"Where is justice stuck in India?"**

It collects official pendency data from the National Judicial Data Grid (NJDG) and Supreme Court portals, stores it as timestamped snapshots, and renders it on an interactive map of India — national bubbles for the Supreme Court and 25 High Courts, district-level choropleth for subordinate courts, trend history across months, and (in Phase 3) individual pending Supreme Court cases mapped back to the district courts they originated from.

The entire platform runs on **free-tier infrastructure** (≈ ₹0/month), refreshes **monthly at launch** (upgrading to daily), and is built for four audiences: citizens, journalists, researchers, and legal professionals.

**One-line pitch:** *"A live map of where India's justice is stuck."*

---

## 2. Problem Background

### 2.1 The scale of pendency (as of mid-2026)
| Tier | Pending cases | Source |
|---|---|---|
| Supreme Court | ~92,828 (record high, Jan 2026) | SC NJDG |
| High Courts (25) | ~64.8 lakh | HC NJDG |
| District & subordinate courts (18,700+ courts) | ~4.9 crore | NJDG |
| **Total** | **~5.6 crore (56M+)** | All-India judicial statistics |

Pendency has grown roughly **80% in a decade**. Over 1.8 lakh cases have been pending for more than 30 years.

### 2.2 The data exists — but is unusable for the public
- NJDG (`njdg.ecourts.gov.in`) publishes live totals, state/district breakdowns, age buckets, delay reasons — but only as **portals and tables**
- Supreme Court data (`scdg.sci.gov.in`) similarly portal-only
- There is **no official API**, no geographic view, no trend comparison, no export

### 2.3 The gap this project fills
| Missing today | NyayaRadar provides |
|---|---|
| Geographic view | Map-first visualization (nation → state → district) |
| History | Monthly snapshots → trend lines, deltas |
| Comparison | State-vs-state, per-lakh-population fairness metric |
| Accessibility | Plain-language pages, mobile-first, CSV + JSON API |
| Trust | Methodology page, source attribution, data-quality gate |

---

## 3. Vision & Design Principles

1. **Map first** — the map IS the homepage; everything else supports it
2. **Official data only** — we visualize government data; we never invent numbers
3. **Trust by transparency** — methodology, sources, confidence levels, "as of" stamps everywhere
4. **Never publish garbage** — a sanity gate blocks anomalous data automatically
5. **Zero cost** — free tiers everywhere; sustainability without donations/ads
6. **Privacy-respecting** — aggregate to court/district level; case views show counts + case numbers (public record), never personal locations

---

## 4. Product Overview (what users experience)

### 4.1 User journey
1. User lands on `/` → sees India map with sized/colored court bubbles and an *"Data as of: {Month Year}"* badge
2. Toggles layers: **Supreme Court / High Courts / District courts**
3. Hovers a bubble → tooltip with name + pending count
4. Clicks a bubble → popup with total/civil/criminal/age-buckets + link to court page
5. Zooms into a state → districts shade by **pendency per lakh population**
6. Opens `/trends` → national + state trend lines, "biggest risers/fallers" this month
7. Downloads CSV or hits the public JSON API
8. Reads `/methodology` to understand sources and limitations

### 4.2 Page inventory
| Route | Purpose | Phase |
|---|---|---|
| `/` | National map dashboard | M1 |
| `/court/[id]` | Court detail: cards, trend chart, age buckets | M1 |
| `/states/[state]` | State drill-down: district choropleth + ranked table | M2 |
| `/trends` | All-India + state trends, monthly deltas | M2 |
| `/methodology` | Sources, cadence, confidence, limitations | M1 |
| `/about` | Mission, contact, attribution | M1 |
| `/api/*` | Public JSON API (documented) | M2 |
| `/cases` | SC case-origin map (district markers) | M4 |

---

## 5. System Architecture

### 5.1 High-level diagram
```
┌──────────────────────────────────────────────────────────────────┐
│                    DATA SOURCES (official)                        │
│  scdg.sci.gov.in · njdg.ecourts.gov.in (HC + national)           │
│  sci.gov.in (case status, cause lists) · eCourts services        │
│  AWS Open Data S3 (SC+HC judgments) · data.gov.in (CSV checks)   │
└───────────────┬──────────────────────────────────────────────────┘
                │ polite scraping (1 req/s, retries, off-peak)
                ▼
┌──────────────────────────────────────────────────────────────────┐
│            PYTHON PIPELINE (GitHub Actions cron)                  │
│  fetchers/ → parsers/ → SANITY GATE → writer                     │
│  (reject & alert if deviation > 25% or civil+criminal ≠ total)   │
└───────────────┬──────────────────────────────────────────────────┘
                ▼
┌──────────────────────────────────────────────────────────────────┐
│        PostgreSQL + PostGIS (Supabase/Neon free tier)             │
│  courts · snapshots · pendency · sc_cases · crawl_runs            │
└───────────────┬──────────────────────────────────────────────────┘
                ▼
┌──────────────────────────────────────────────────────────────────┐
│          Next.js 14 on Vercel (frontend + API routes)             │
│  MapLibre GL map · Recharts · Tailwind/shadcn-ui                  │
│  /api/pendency · /api/trends · /api/courts · /api/meta            │
└───────────────┬──────────────────────────────────────────────────┘
                ▼
        Citizens · Journalists · Researchers · Lawyers
```

### 5.2 Component responsibilities
| Component | Responsibility |
|---|---|
| Fetchers | One module per source; raw HTML/JSON capture with caching |
| Parsers | Normalize raw data into schema objects |
| Sanity gate | Validation rules; quarantine failures; alert |
| Writer | Immutable snapshot insert into Postgres |
| API layer | Read-only JSON endpoints with caching headers |
| Map layer | MapLibre styles: circle layer (courts), fill layer (districts), cluster layer (cases) |
| Monitor | Sentry (errors) + UptimeRobot (availability) + crawl-status badge |

---

## 6. Technology Stack (with rationale)

| Layer | Choice | Why | Rejected alternatives |
|---|---|---|---|
| Frontend | Next.js 14 + TypeScript | SEO, API routes, Vercel-native, TS safety | Plain HTML (doesn't scale), CRA (stagnant) |
| Map | MapLibre GL JS | Open-source, vector tiles, fast clustering | Leaflet (weaker at scale), Mapbox (paid, closed) |
| Clustering | supercluster (built into MapLibre) | Handles 700+ district markers smoothly | Manual binning |
| UI | Tailwind + shadcn/ui | Fast, consistent, accessible | MUI (heavy) |
| Charts | Recharts | Simple API for trend + bar charts | D3 (too low-level) |
| DB | PostgreSQL + PostGIS (Supabase/Neon) | Relational snapshots + spatial queries, free | SQLite (no hosted free), Mongo (relational fit) |
| Pipeline | Python 3.11 + httpx + BeautifulSoup + Playwright | Best scraping ecosystem | Node (fine, but Python NLP later) |
| Court SDK | bharat-courts (MIT) | Handles eCourts CAPTCHAs, rotating tokens, 700+ district courts, AWS archive | Writing from scratch |
| Fuzzy matching | RapidFuzz | Fast court-name matching | fuzzywuzzy (unmaintained) |
| Scheduling | GitHub Actions cron | Free, logged, versioned | Self-hosted cron, cloud schedulers (paid) |
| Hosting | Vercel | Zero-ops, free hobby tier | Railway/Render (also fine) |
| Boundaries | udit-001/india-maps-data GeoJSON | Clean state+district boundaries | DataMeet (also good, larger) |

---

## 7. Data Strategy (the heart of the project)

### 7.1 Source inventory
| # | Source | Content | Access method | Refresh |
|---|---|---|---|---|
| 1 | `scdg.sci.gov.in` | SC pendency: total, civil/criminal, age buckets, monthly instituted/disposed | Scrape dashboard JSON endpoints (discover via DevTools → Network tab) | Monthly → daily |
| 2 | `njdg.ecourts.gov.in/hcnjdg_v2/` | Per-HC pendency, age-wise, delay reasons, women/senior-citizen filings | Same | Monthly → daily |
| 3 | `njdg.ecourts.gov.in` | State-wise and district-wise pendency (all India) | Same | Monthly → daily |
| 4 | `sci.gov.in` | Case-level: status search (case no/diary/CNR/party), daily cause lists, order PDFs | Scrape with CAPTCHA solving (bharat-courts solvers) | Phase 3 |
| 5 | eCourts Services | Case-level HC/district data | bharat-courts SDK | Phase 3+ |
| 6 | AWS Open Data: `indian-supreme-court-judgments` | All SC judgments 1950–2025, JSON metadata + PDFs, CC-BY-4.0 | Public S3 (no CAPTCHA) | Bi-monthly sync |
| 7 | AWS Open Data: `indian-high-court-judgments` | 25 HC judgments | Public S3 | Quarterly sync |
| 8 | Development Data Lab | 81.2M case-level district court records (2010–2018): dates, parties (anonymized), acts/sections, disposition, judges | Bulk download | Static (historical) |
| 9 | Open Justice India / ILDC | 81M eCourts case records; 35k SC cases annotated with **original court decisions** | Dataset download | Static |
| 10 | data.gov.in | Official NJDG pendency CSV snapshots | Direct download | Cross-validation |
| 11 | Kaggle | Pending-cases aggregates, HC state-wise counts, OpenNyaya judgments | Download | Cross-validation |

### 7.2 Refresh policy
| Version | Cadence | Mechanism |
|---|---|---|
| v1.0 (launch) | **Monthly**, 1st of month | Semi-automated script + human review first 3 cycles |
| v1.1 | **Daily**, 5 AM IST | GitHub Actions cron, full sanity gate, alerts on quarantine |

Rationale: court statistics move on monthly rhythms (official instituted/disposed reporting is monthly). Monthly eliminates scraping risk entirely; daily adds freshness once the pipeline is proven.

### 7.3 Pipeline stages (per run)
```
1. FETCH    → raw responses cached with URL + timestamp
2. PARSE    → normalize to {court, total, civil, criminal, age_bucket}
3. VALIDATE → sanity gate (rules below)
4. STORE    → immutable snapshot row (as_of = run date)
5. SERVE    → API reads latest approved snapshot
6. LOG      → crawl_runs row: status, counts, errors
```

### 7.4 Sanity gate rules (non-negotiable)
| Rule | Action on failure |
|---|---|
| Any value deviates >25% from previous snapshot | Quarantine + alert; do not publish |
| civil + criminal differs from total by >2% | Quarantine |
| Missing courts vs expected count (26 at M1) | Quarantine |
| Null/zero total for any court | Quarantine |
| HTTP errors on >10% of endpoints | Abort run |

**Quarantine** = data written with `status='quarantined'`; site keeps serving last approved snapshot; maintainer reviews manually.

### 7.5 Retention
Every snapshot retained forever (rows are tiny) → trend history is automatic and the public API can serve any past month.

---

## 8. Core Algorithms

### 8.1 Marker sizing & coloring
```
radius  = max(6px, k · √pending)          # area-proportional (perceptually honest)
color   = quintile class of metric         # 5 classes, not raw values
metric  = pending (absolute view)
        | pending / (population/100000)    # "per lakh" fairness view (toggle)
```
Population basis: Census 2011 state/district populations (static lookup table).

### 8.2 District clustering
MapLibre's supercluster: `radius=60, maxZoom=16`; clusters expand on zoom; cluster label = sum of pending in cluster.

### 8.3 Origin-district extraction (Phase 3 — the hard one)
Goal: for each pending SC case, find the district court it originated from.

```
STAGE 1 — text acquisition
  Fetch first order/judgment PDF of the case → extract text (pdfplumber)

STAGE 2 — regex extraction (fast path)
  Patterns:
    r"(?:District\s*(?:&|and)\s*Sessions\s+Court|Sessions\s+Court)[, ]+([A-Za-z .]{3,40})"
    r"High\s+Court\s+of\s+([A-Za-z .]{3,40})"
    r"Court\s+of\s+(?:the\s+)?(?:Additional\s+)?(?:District|Civil|Sessions)\s+Judge[, ]+([A-Za-z .]{3,40})"
    r"(?:arising\s+from|in)\s+.*?(?:Trial|Suit|Case)\s+No[. ]+[\d/]+\s+of\s+(\d{4})"

STAGE 3 — fuzzy registry match
  Candidate → normalize (strip "the/of", expand abbreviations)
  → RapidFuzz token_set_ratio vs court registry (~700 district/session court names)
  → score ≥ 87: ACCEPT · 75–86: flag for review · <75: reject

STAGE 4 — LLM fallback (batched, cheap model)
  Prompt: "Given this order excerpt, return JSON {district_court, high_court, state, confidence}"
  Accept only if confidence = high

STAGE 5 — confidence tagging
  district-level (exact match) → marker on district
  state-level only             → marker on state capital (labeled as such)
  unknown                      → excluded from map, counted in totals

Expected: 50–70% district-level, ~90% state-level.
```

**Court registry source:** eCourts establishment hierarchy (state → district → court complex → establishment) via `bharat-courts DistrictCourtClient.list_districts/list_complexes` — gives canonical names for all 700+ districts; geocode each once (city-level coordinates) into the `courts` table.

### 8.4 SC pending-case enumeration (Phase 3)
```
1. Enumerate: for each case type (SLP(C), SLP(Crl), CA, Crl.A., WP, …)
              × year × serial number → query case status
2. Filter: status == pending
3. Store: case_no, parties, filing date, status
4. Incremental maintenance:
   - Daily/weekly re-check known pending cases for disposal
   - Cause lists (published daily) add newly-listed cases
   - Detect new filings via serial-number gap scans
```

### 8.5 Anomaly detection for trends
Month-over-month delta computed in API; |Δ| > 15% automatically annotated on trend charts with "verify" flag until human confirms.

---

## 9. Database Design

```sql
-- Court registry (SC + HCs + benches + district courts)
CREATE TABLE courts (
  id                 SERIAL PRIMARY KEY,
  name               TEXT NOT NULL,
  tier               TEXT NOT NULL CHECK (tier IN ('SC','HC','DISTRICT')),
  state              TEXT,
  district           TEXT,
  lat                DOUBLE PRECISION,
  lon                DOUBLE PRECISION,
  establishment_code TEXT UNIQUE,          -- eCourts code (joins to case data)
  is_bench           BOOLEAN DEFAULT FALSE
);

-- One row per crawl run (monthly → daily)
CREATE TABLE snapshots (
  id           SERIAL PRIMARY KEY,
  as_of        DATE NOT NULL UNIQUE,
  source       TEXT NOT NULL,              -- 'njdg' | 'manual' | 'scdg'
  status       TEXT NOT NULL DEFAULT 'approved'
               CHECK (status IN ('approved','quarantined')),
  notes        TEXT
);

-- Core fact table: pendency per court per snapshot
CREATE TABLE pendency (
  snapshot_id  INT REFERENCES snapshots(id),
  court_id     INT REFERENCES courts(id),
  total        INT NOT NULL,
  civil        INT,
  criminal     INT,
  age_bucket   JSONB,                      -- {"<1y":0,"1-3y":0,"3-5y":0,"5-10y":0,">10y":0}
  PRIMARY KEY (snapshot_id, court_id)
);

-- Phase 3: individual SC cases
CREATE TABLE sc_cases (
  case_no            TEXT PRIMARY KEY,     -- e.g. 'SLP(C) 12345/2025'
  case_type          TEXT,
  year               INT,
  petitioner         TEXT,
  respondent         TEXT,
  filing_date        DATE,
  status             TEXT,                 -- pending | disposed
  next_hearing       DATE,
  origin_court_id    INT REFERENCES courts(id),
  origin_confidence  TEXT CHECK (origin_confidence IN
                       ('district','state','unknown')),
  extraction_method  TEXT,                 -- regex | fuzzy | llm | manual
  last_checked       DATE
);

-- Operational log
CREATE TABLE crawl_runs (
  id              SERIAL PRIMARY KEY,
  started_at      TIMESTAMPTZ DEFAULT now(),
  finished_at     TIMESTAMPTZ,
  source          TEXT,
  status          TEXT,                    -- success | failed | quarantined
  records_written INT,
  errors          JSONB
);

-- Population lookup for per-lakh metric
CREATE TABLE populations (
  region TEXT PRIMARY KEY,                 -- state or district name
  population_2011 BIGINT
);

CREATE INDEX idx_pendency_court ON pendency(court_id, snapshot_id);
CREATE INDEX idx_sc_cases_origin ON sc_cases(origin_court_id);
CREATE INDEX idx_courts_geo ON courts USING GIST (ll_to_earth(lat, lon));  -- PostGIS
```

---

## 10. API Design

| Endpoint | Params | Returns |
|---|---|---|
| `GET /api/pendency` | `tier`, `state`, `date` | Latest (or dated) pendency per court |
| `GET /api/trends` | `court_id` or `state` | Monthly series `[{month, total, civil, criminal}]` |
| `GET /api/courts` | `tier`, `state` | Court registry (geo + metadata) |
| `GET /api/meta` | — | `as_of`, snapshot status, source list |
| `GET /api/cases/origin` (Phase 4) | `state`, `district` | SC-case counts per origin district |

All responses: JSON, CORS-enabled, `Cache-Control: public, max-age=3600`, rate-limited, documented on `/api` page.

---

## 11. Frontend Design

### 11.1 Map layers
| Layer | Type | Phase |
|---|---|---|
| Court bubbles (SC + 25 HCs) | circle layer | M1 |
| State boundaries | line layer (GeoJSON) | M1 |
| District choropleth | fill layer (quintile colors) | M2 |
| Case-origin clusters | supercluster layer | M4 |
| Heatmap toggle | heatmap layer | M2+ |

### 11.2 Interactions
- Hover → tooltip (name, pending)
- Click bubble → popup (breakdown + "View details" link)
- Click district → state page
- Toggles: tier · absolute/per-lakh · heatmap
- Legend + as-of badge always visible; loading + error states handled

### 11.3 Component tree
```
<App>
 ├─ <MapDashboard>
 │   ├─ <MapView> (MapLibre)
 │   │   ├─ <CourtBubbles/> <DistrictChoropleth/> <CaseClusters/>
 │   ├─ <LayerToggles/> <Legend/> <AsOfBadge/>
 ├─ <CourtDetail> <StateDetail> <Trends> <Methodology> <About>
 └─ <shared>: <StatCard/> <TrendChart/> <AgeBucketBars/> <DataTable/> <CsvExportButton/>
```

---

## 12. Repository Structure

```
nyayaradar/
├── app/                        # Next.js App Router
│   ├── page.tsx                # map dashboard
│   ├── court/[id]/page.tsx
│   ├── states/[state]/page.tsx
│   ├── trends/page.tsx
│   ├── methodology/page.tsx
│   └── api/
│       ├── pendency/route.ts
│       ├── trends/route.ts
│       ├── courts/route.ts
│       └── meta/route.ts
├── components/                 # MapView, CourtDetail, TrendChart, Legend, Badge…
├── lib/                        # maplibre init, colors, formatters, api client
├── data/
│   ├── boundaries/             # states.geojson, districts.geojson
│   └── seeds/                  # courts seed (26 courts w/ coordinates), populations
├── pipeline/                   # Python
│   ├── fetchers/               # njdg_sc.py, njdg_hc.py, njdg_district.py, sci_case.py
│   ├── parsers/
│   ├── gates/sanity.py
│   ├── extract/origin.py       # Phase-3 NLP pipeline
│   ├── db.py                   # Postgres writer
│   └── requirements.txt
├── supabase/migrations/        # schema above
├── .github/workflows/
│   ├── crawl-monthly.yml       # v1.0
│   └── crawl-daily.yml         # v1.1
├── tests/                      # parser + gate unit tests
├── PRD.md
└── PROJECT_OVERVIEW.md         # this file
```

---

## 13. Development Roadmap

### M0 — Foundation (Week 1)
- [ ] Next.js + Tailwind + shadcn/ui scaffold
- [ ] MapLibre renders India with OSM tiles
- [ ] Supabase project + schema migration
- [ ] Seed `courts` table: SC + 25 HCs with coordinates
- [ ] Deploy empty map to Vercel with custom subdomain
- **Exit:** public URL shows India map + 26 sample markers

### M1 — Live Map (Weeks 2–4)
- [ ] Discover NJDG JSON endpoints (DevTools)
- [ ] Fetchers + parsers for SC NJDG and HC NJDG
- [ ] Sanity gate + snapshot writer
- [ ] First manual + semi-auto monthly snapshot
- [ ] Map: real bubbles, popups, legend, as-of badge, tier toggle
- [ ] `/court/[id]` pages with stat cards
- [ ] `/methodology` + `/about`
- **Exit:** real-data snapshot published end-to-end; all 26 courts live

### M2 — Depth (Weeks 5–7)
- [ ] District-wise pendency fetcher (NJDG national portal)
- [ ] District choropleth + state pages + per-lakh toggle
- [ ] `/trends` page (snapshots accumulate month by month)
- [ ] CSV export + public API + docs
- [ ] Sentry + UptimeRobot wired
- **Exit:** all states/UTs covered; journalist-ready exports

### M3 — Case Pilot (Weeks 8–10)
- [ ] SC cause-list ingestion (daily listings)
- [ ] Origin-extraction pipeline built
- [ ] Pilot on 1,000–3,000 cases → measure district/state/unknown rates
- **Exit:** hit-rate report; decision on full-scale threshold (≥50% district)

### M4 — Case Layer (Weeks 11–14)
- [ ] Full SC pending enumeration (brute-force + incremental diff)
- [ ] Origin mapping at scale (regex → fuzzy → LLM batch)
- [ ] `/cases` map: district markers sized by SC-case origin counts
- **Exit:** ≥90% of pending SC cases mapped to at least state level

### Post-v2 ideas
Tribunals/consumer courts · 30-year-pending heatmap · judge-vacancy correlation · Hindi UI · PWA · embeddable map widget for news sites

---

## 14. Deployment & Operations

### 14.1 Environments
| Env | Purpose | URL |
|---|---|---|
| Local | Development (`npm run dev`) | localhost:3000 |
| Preview | Vercel branch previews | auto per PR |
| Production | main branch | custom domain |

### 14.2 CI/CD
- Push to `main` → Vercel auto-deploys
- GitHub Actions: `crawl-monthly.yml` (1st of month, 6 AM IST) → runs pipeline → commits crawl report → alerts on quarantine
- Tests (parsers + gate rules) run on every PR

### 14.3 Monthly operations runbook (v1.0, ~30 min)
1. Cron fires → check crawl report
2. If approved → verify map badge updated
3. If quarantined → inspect diff → fix parser or manually enter numbers (documented fallback) → approve
4. Spot-check 3 courts against live NJDG dashboard
5. Done

### 14.4 Monitoring & alerts
| Signal | Tool | Threshold |
|---|---|---|
| Site down | UptimeRobot | >5 min |
| JS/API errors | Sentry | any spike |
| Crawl failure/quarantine | GitHub Actions → email | immediate |

---

## 15. Cost Estimate

| Item | Monthly |
|---|---|
| Vercel Hobby | ₹0 |
| Supabase/Neon free tier | ₹0 |
| GitHub Actions (public repo) | ₹0 |
| OSM/MapTiler free tiles | ₹0 |
| Sentry/UptimeRobot free tiers | ₹0 |
| LLM calls (Phase 3, batched) | ~₹200–500 one-time |
| Domain (optional) | ~₹800/year |
| **Total** | **≈ ₹0/month** |

---

## 16. Skills Required

| Skill | Level | Where used |
|---|---|---|
| React + TypeScript | Intermediate | Frontend |
| MapLibre/Leaflet basics | Beginner+ (learn as you go) | Map layers |
| Python (httpx, BeautifulSoup) | Intermediate | Pipeline |
| SQL | Beginner+ | Schema, queries |
| Regex + basic NLP | Intermediate | Phase-3 extraction |
| Git + GitHub Actions | Beginner+ | CI/CD |

Solo-buildable in the stated timeline; every skill above has free learning paths.

---

## 17. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Portal structure changes break scrapers | High (over months) | Medium | Modular parsers, failure alerts, manual fallback mode always available |
| CAPTCHA/anti-bot escalation | Medium | Medium | bharat-courts solvers; monthly low volume; graceful degradation |
| IP blocking | Low at monthly volume | Medium | 1 req/s, off-peak runs, respectful UA |
| Publishing wrong numbers | Low | **High** | Sanity gate is mandatory; human review for first 3 cycles |
| Legal/ToS ambiguity | Low | Medium | Read-only polite access, full attribution, public-interest framing, no PII |
| Extraction accuracy too low | Medium | Medium | Pilot before scale (M3 gate); state-level shipping is acceptable fallback |
| Single-maintainer bus factor | Medium | Medium | Everything documented (these files), standard stack, no exotic tech |

---

## 18. Legal & Ethics Position

- Data sourced exclusively from **public government portals**; access is read-only, low-volume, and polite (rate limits, off-peak, respectful User-Agent)
- **Attribution** on every page: NJDG / e-Committee, Supreme Court of India, eCourts, AWS Open Data (Dattam Labs, CC-BY-4.0), Development Data Lab
- **Disclaimer:** unofficial visualization; original portals remain authoritative; figures may differ from portals due to timing
- **Privacy:** no personal locations ever displayed; case-level views show counts + case numbers (which are public record); sensitive case categories excluded from case-level features
- **Open source intent:** publish code publicly post-stabilization to invite community maintenance

---

## 19. Success Metrics (tracked from launch)

| Metric | Target |
|---|---|
| Coverage | 100% states/UTs by M2; ≥80% districts |
| Freshness | Snapshot published ≤5 days after month start, every month |
| Quality gate | 0 false publishes; quarantine fires correctly in tests |
| Performance | First meaningful paint <3s on 4G; Lighthouse ≥85 |
| Adoption (6 mo) | 10k monthly visitors; ≥5 external citations |
| Phase-3 accuracy | ≥60% district-level, ≥90% state-level origin mapping |

---

## 20. Reference Inventory

### Code & toolkits
| Repo | What |
|---|---|
| `iamshouvikmitra/bharat-courts` | Python SDK: eCourts case search/orders/cause lists, CAPTCHA solvers, AWS judgment archive access |
| `openjustice-in/ecourts` | eCourts scraping toolkit for journalists/researchers |
| `vanga/indian-supreme-court-judgments` | Scraper + dataset code for SC judgments |
| `vanga/indian-high-court-judgments` | Same for 25 HCs (daily sync) |
| `udit-001/india-maps-data` | India states/districts GeoJSON |
| DataMeet community maps | Alternative boundary data |
| `openlegaldata/awesome-legal-data` | Index of more legal datasets |

### Datasets
| Dataset | Content |
|---|---|
| AWS Open Data — Indian SC Judgments | SC judgments 1950–2025, JSON+PDF, CC-BY-4.0 |
| AWS Open Data — Indian HC Judgments | 25 HC judgments, updated regularly |
| Development Data Lab Judicial Data | 81.2M district court case records (2010–18) |
| Open Justice India | 81M eCourts case records; ILDC: 35k SC cases with original-court annotation |
| Kaggle: Pending Court Cases in India | Aggregate pendency snapshots |
| Kaggle: High Court Cases in India | State-wise HC counts |
| Kaggle: OpenNyaya SC Judgments (clean) | 33k OCR-cleaned judgment texts |
| data.gov.in NJDG snapshots | Official CSV cross-checks |
| AIKosh: DAKSH Bail Cases in HCs | Structured HC bail-case data |

### Official portals
`njdg.ecourts.gov.in` · `njdg.ecourts.gov.in/hcnjdg_v2/` · `scdg.sci.gov.in` · `sci.gov.in` · `services.ecourts.gov.in` · `ecommitteesci.gov.in`

---

## 21. Glossary

| Term | Meaning |
|---|---|
| NJDG | National Judicial Data Grid — official pendency dashboards |
| Pendency | Cases filed but not yet disposed |
| CNR | 16-character unique case ID across eCourts |
| Choropleth | Map with regions colored by a metric |
| Age bucket | Pendency classified by case age (<1y … >30y) |
| Origin court | Lower court whose decision was challenged up to the Supreme Court |
| Quarantine | Snapshot blocked from publishing due to sanity-gate failure |
| Establishment code | eCourts numeric ID for a specific court |
| supercluster | Fast point-clustering algorithm used by MapLibre |

---

## 22. Immediate Next Steps

1. Install: VS Code, Git, Node.js LTS, Python 3.11
2. Accounts: GitHub, Vercel, Supabase (all free)
3. `npx create-next-app@latest nyayaradar`
4. `pip install "bharat-courts[all]" httpx rapidfuzz pdfplumber`
5. Open `scdg.sci.gov.in` → F12 → Network tab → locate the JSON endpoints feeding the dashboard → note them down
6. Begin **M0 checklist** (Section 13)

*End of document.*