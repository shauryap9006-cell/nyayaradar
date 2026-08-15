# NyayaRadar — India Judicial Pendency Map

> **"A live map of where India's justice is stuck."**

NyayaRadar is a public, free-tier-native web platform that visualizes judicial pendency across India on an interactive map. It tracks official pendency statistics across the Supreme Court of India, 25 High Courts, and district courts, with automated monthly snapshots, non-negotiable data sanity validation, and spatial analytics.

---

## 🏛️ Architecture & Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Geospatial & Visualizations:** MapLibre GL JS, Recharts
- **Database & Storage:** PostgreSQL + PostGIS (Supabase / Neon free tiers)
- **Data Pipeline:** Python 3.11 (`httpx`, `beautifulsoup4`, `rapidfuzz`, `pdfplumber`, `psycopg`)
- **Automation & CI/CD:** GitHub Actions (Monthly on 1st @ 06:00 IST / Daily @ 05:00 IST)
- **Hosting:** Vercel (Hobby Tier — ₹0/mo)

---

## 📁 Repository Structure

```
nyayaradar/
├── app/                        # Next.js App Router pages & API routes
│   ├── page.tsx                # National map dashboard
│   ├── court/[id]/page.tsx     # Court detail page
│   ├── methodology/page.tsx    # Trust & methodology
│   ├── about/page.tsx          # Mission & legal attribution
│   ├── trends/page.tsx         # Longitudinal trends
│   └── api/                    # JSON REST API routes (/api/courts, /api/pendency, /api/meta)
├── components/                 # MapView, Navbar, Legend, LayerToggles, CourtDrawer
├── data/
│   └── seeds/                  # SC + 25 High Courts with geocoordinates, Census 2011 populations
├── lib/                        # Supabase client, database access layer, formatters
├── pipeline/                   # Python ETL pipeline
│   ├── fetchers/               # Polite scrapers (SCDG, NJDG HC, NJDG District)
│   ├── parsers/                # Payload normalizers
│   ├── gates/sanity.py         # Sanity validation gate (5 non-negotiable rules)
│   ├── extract/origin.py       # Phase-3 NLP origin extraction
│   ├── db.py                   # Postgres/SQLite persistence layer
│   └── seed.py                 # Registry seeding script
├── supabase/migrations/        # DDL migration scripts (tables, relations, indexes)
├── tests/                      # Unit test suites for parsers and sanity gate
├── .github/workflows/          # crawl-monthly.yml & crawl-daily.yml
├── DECISIONS.md                # Architectural decisions & conflict logs
├── PRD.md                      # Product Requirements Document
└── PROJECT_OVERVIEW.md         # Architecture, schema, and algorithmic blueprint
```

---

## 🚀 Quickstart

### 1. Web Application (Next.js)
```bash
# Install dependencies
npm install

# Run seed verification
npm run seed

# Start development server
npm run dev
# Open http://localhost:3000
```

### 2. Python Pipeline & Unit Tests
```bash
# Install pipeline dependencies
pip install -r pipeline/requirements.txt

# Run parser & sanity gate unit tests
pytest tests/

# Seed local database
python pipeline/seed.py
```

---

## 🛡️ Sanity Gate Rules (PRD FR-3.2)
1. Any value deviates >25% from previous snapshot &rarr; Quarantine
2. Civil + Criminal differs from Total by >2% &rarr; Quarantine
3. Missing courts count (<26) &rarr; Quarantine
4. Null or zero total for any court &rarr; Quarantine
5. HTTP errors on >10% of endpoints &rarr; Abort run
