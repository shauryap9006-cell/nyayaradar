# Product Requirements Document (PRD)
## India Judicial Pendency Map — working title: "NyayaRadar"

| Field | Value |
|---|---|
| Version | 1.0 |
| Status | Draft → Ready for build |
| Date | August 2026 |
| Platform | Web (mobile-first responsive) |
| Data refresh policy | v1.0: monthly snapshots · v1.1+: automated daily |

---

## 1. Problem Statement
India has 56M+ pending court cases across three tiers of judiciary (Supreme Court ~93k, High Courts ~6.5M, district courts ~49M). This data exists on government portals (NJDG) but is presented as dashboards and tables — not geographically, not comparatively, not historically. Citizens, journalists, researchers and lawyers cannot easily answer: *"Where is pendency worst? Is it getting better or worse? How does my state/district compare?"*

## 2. Product Vision
A free, public, map-first website that visualizes judicial pendency across India — from national view down to district level — with monthly-refreshed official data, trend history, and (in later phases) case-level origin mapping for Supreme Court cases.

**One-line pitch:** *"A live map of where India's justice is stuck."*

## 3. Goals & Non-Goals

### Goals
- G1: Show pendency geographically (national → state → district drill-down)
- G2: Show pendency over time (trends, monthly deltas)
- G3: Be a trustworthy data source (methodology page, source attribution, data-quality gates)
- G4: Zero-cost operation (free tiers only)
- G5: Phase 3 — map individual pending SC cases to their origin district courts

### Non-Goals (v1)
- ❌ Case-level search for HC/district cases (eCourts already does this)
- ❌ Legal advice / lawyer discovery
- ❌ Real-time (< daily) streaming
- ❌ Tribunals, consumer courts, military courts (future scope)
- ❌ Native mobile apps

## 4. Target Users & Personas

| Persona | Need | Primary feature |
|---|---|---|
| **Citizen** (curious voter) | "How bad is it in my state?" | Map + state page |
| **Journalist** | Story-ready numbers + trends + export | Trends page, CSV download, API |
| **Researcher / student** | Structured historical data | Public API + snapshots |
| **Lawyer / legal professional** | Court-specific workload insight | Court detail page |

## 5. Success Metrics

| Metric | Target |
|---|---|
| Data coverage | 100% states + UTs by M1; 80%+ districts by M2 |
| Data freshness compliance | Snapshot published within 5 days of month start, every month |
| Data-quality gate false-publish rate | 0 (quarantine must fire on >25% deviation) |
| Performance | First meaningful paint < 3s on 4G; map interactive < 2s |
| Adoption (6 months post-launch) | 10k visitors/mo; 5 citations by journalists/researchers |
| Phase-3 extraction quality | ≥60% of SC cases mapped to district level, ≥90% to state level |

## 6. User Stories

1. As a citizen, I want to open the site and immediately see India's pendency on a map, so I grasp the scale in seconds.
2. As a citizen, I want to click my state and see district-level pendency, so I understand local reality.
3. As a user, I want to click any court marker and see total/civil/criminal pendency and age buckets.
4. As a journalist, I want a trend chart and CSV export of pendency by month, so I can report changes.
5. As a researcher, I want a documented JSON API with snapshots, so I can build on the data.
6. As a user, I want a visible "Data as of: {month}" badge, so I know freshness.
7. As a skeptical user, I want a methodology page listing every source, so I can trust the numbers.
8. (Phase 3) As a user, I want to see where pending SC cases originated, so I see which districts feed the Supreme Court.

## 7. Functional Requirements

### 7.1 Map (P0)
| ID | Requirement | Acceptance criteria |
|---|---|---|
| FR-1.1 | India base map with zoom/pan | MapLibre GL; OSM/MapTiler tiles; India-centered |
| FR-1.2 | Court markers (SC + 25 HCs) sized by pendency | Radius ∝ √pending; tooltip shows name + count |
| FR-1.3 | Marker click → popup | Shows total, civil, criminal, age buckets, link to court page |
| FR-1.4 | Tier toggle | SC / HC / District layers switchable |
| FR-1.5 | District choropleth (Phase 2) | Color = quintile of pendency per lakh population |
| FR-1.6 | Legend + "as of" badge | Always visible; updates from data |
| FR-1.7 | Clustering for district markers | supercluster; expands on zoom |

### 7.2 Court & State Pages (P0/P1)
| ID | Requirement | Acceptance criteria |
|---|---|---|
| FR-2.1 | `/court/[id]` detail page | Pendency cards, trend chart (≥6 months once available), age-bucket bars |
| FR-2.2 | `/states/[state]` page | District choropleth + ranked district table |
| FR-2.3 | `/trends` national page | All-India + top-10 states trend lines, monthly delta callouts |
| FR-2.4 | CSV export | One-click download of any table/chart dataset |

### 7.3 Data Pipeline (P0)
| ID | Requirement | Acceptance criteria |
|---|---|---|
| FR-3.1 | NJDG scrapers (SC, HC, district) | Fetch totals+civil/criminal+age buckets per court |
| FR-3.2 | Sanity gate | If any value deviates >25% vs previous snapshot → quarantine + alert, do not publish |
| FR-3.3 | Snapshot persistence | Every run stored immutably keyed by `as_of` date |
| FR-3.4 | Monthly schedule (v1.0) | Runs 1st of month; manual fallback procedure documented |
| FR-3.5 | Daily schedule (v1.1) | Same pipeline, daily, with caching and rate limits (1 req/s) |
| FR-3.6 | Crawl logging | Every run records status, counts, errors in `crawl_runs` |

### 7.4 Public API (P1)
| ID | Requirement | Acceptance criteria |
|---|---|---|
| FR-4.1 | `GET /api/pendency?tier=&state=&date=` | JSON, documented, rate-limited |
| FR-4.2 | `GET /api/trends?court_id=` | Monthly series JSON |
| FR-4.3 | API docs page | OpenAPI/Swagger or written docs |

### 7.5 Phase 3 — Case-level SC mapping (P2)
| ID | Requirement | Acceptance criteria |
|---|---|---|
| FR-5.1 | SC pending case enumeration | ≥95% of NJDG-reported pending SC cases captured |
| FR-5.2 | Origin extraction pipeline | Regex → fuzzy registry match → LLM fallback; confidence-tagged |
| FR-5.3 | District markers by case origin | Marker size = # of pending SC cases from district; popup lists case numbers |
| FR-5.4 | Privacy rules | No personal addresses; sensitive case categories excluded; counts + case numbers only |

### 7.6 Trust & Content (P0)
| ID | Requirement |
|---|---|
| FR-6.1 | `/methodology` page: sources, refresh cadence, known limitations |
| FR-6.2 | Footer disclaimer: unofficial visualization, data © NJDG/e-Committee |
| FR-6.3 | About page with contact |

## 8. Non-Functional Requirements
| Category | Requirement |
|---|---|
| Performance | Lighthouse ≥ 85; map usable on mid-range Android |
| Availability | ≥99% monthly (static-ish site; Vercel) |
| Accessibility | WCAG 2.1 AA for non-map content; keyboard navigation; alt descriptions for map data via tables |
| Mobile | Fully responsive; map gestures touch-friendly |
| Security | No user accounts in v1; API rate limiting; secrets in env vars |
| Legal | Attribute sources; respect robots.txt; polite scraping; no PII display |
| Cost | ₹0/month (free tiers: Vercel, Supabase/Neon, GitHub Actions) |

## 9. Scope by Milestone
| Milestone | Scope | Target |
|---|---|---|
| M0 — Foundation | Next.js + MapLibre skeleton, schema, courts table, deploy | Week 1 |
| M1 — Live map | SC+HC scrapers, monthly snapshots, bubble map, court pages, methodology | Week 4 |
| M2 — Depth | District choropleth, trends, per-lakh metric, CSV, public API | Week 6–7 |
| M3 — Case pilot | Extraction pilot on 1–3k SC cases; measure hit-rate | Week 8–10 |
| M4 — Full case layer | Full SC enumeration + origin markers | Week 14 |

## 10. Risks & Mitigations
| Risk | Impact | Mitigation |
|---|---|---|
| NJDG/SCI site structure changes | Scraper breaks | Modular parsers, alerts on failure, manual fallback month |
| CAPTCHA/anti-bot escalation | Case-level crawl blocked | bharat-courts solvers; slow rates; manual monthly mode always available |
| IP blocking | No data | Low volume, respectful cadence, distributed runs |
| Wrong numbers published | Trust destroyed | Sanity gate (FR-3.2) is non-negotiable; human review first 3 months |
| Legal/ToS ambiguity | Takedown risk | Read-only polite access, attribution, non-commercial public-interest framing, no PII |
| Extraction low hit-rate | Phase-3 weakens | Ship state-level first; pilot before scaling |

## 11. Open Questions
1. Domain name & final branding (working title: NyayaRadar)
2. Should v1.1 daily refresh start immediately or after 3 stable monthly cycles?
3. Include HC bench-level markers (Lucknow, Nagpur benches) at M2 or later?
4. Language support (Hindi UI) — Phase 2 or 3?

## 12. Future Roadmap (post-v2)
- Tribunal and consumer court data
- Case age heatmap (cases pending 30+ years)
- "Right to speedy trial" advocacy dashboards
- Comparisons: pendency vs judge vacancies (open data exists)
- Mobile PWA