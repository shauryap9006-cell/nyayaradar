# Architectural & Implementation Decisions Log (DECISIONS.md)

This document tracks all non-trivial decisions made during the design and development of **NyayaRadar**, including rationale and rejected alternatives.

---

### DECISION-001: Baseline Structure and Next.js 14 Setup
- **Date:** August 2026
- **Context:** Project initialization requires Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui, MapLibre GL JS, and Python 3.11 pipeline.
- **Decision:** Scaffold standard Next.js 14 app directly in root workspace with App Router, TypeScript, and Tailwind CSS.
- **Rationale:** Aligns strictly with PROJECT_OVERVIEW §12 repository structure and PRD specifications.
- **Alternatives Considered:** Monorepo with turbo/pnpm (rejected to keep repository simple and compatible with direct Vercel & GitHub Actions deployment on free tier).

---

### DECISION-002: Document Conflict Resolution Protocol
- **Date:** August 2026
- **Context:** Ensuring alignment between PRD.md and PROJECT_OVERVIEW.md.
- **Decision:** In accordance with Step 0 rules:
  1. PROJECT_OVERVIEW.md is authoritative for Architecture, Technology Stack, Schema, and Algorithms.
  2. PRD.md is authoritative for User Personas, Acceptance Criteria, and Feature Scope.
- **Notes on Minor Variances:**
  - PRD lists v1.0 as monthly snapshots and v1.1 as daily. OVERVIEW §7.2 sets monthly snapshots on the 1st of the month at 6 AM IST for v1.0 and daily at 5 AM IST for v1.1. Both documents align.
  - Coordinate locations for 26 courts (1 Supreme Court + 25 High Courts) will use official principal bench coordinates with standard WGS84 (lat/lon).

---

### DECISION-003: Database Adapter & Local SQLite/Mock Mode for Offline & Standalone CI
- **Date:** August 2026
- **Context:** Database design requires PostgreSQL with PostGIS on Supabase/Neon. Local development and unit testing may run with or without live remote DB credentials.
- **Decision:** Create full PostgreSQL / PostGIS DDL migration files in `supabase/migrations/` per OVERVIEW §9, and implement database client abstractions with environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`) with fallback/mock handling for testing pipelines offline.
- **Rationale:** Ensures clean CI testing and rock-solid local tests without blocking on live network services during initial bootstrap.
- **Alternatives Considered:** Requiring live Supabase credentials for basic unit tests (rejected as it breaks automated CI test reproducibility).

---

### DECISION-004: MapLibre Tile Source and Map Rendering
- **Date:** August 2026
- **Context:** M0 requires an interactive map centered on India (zoom 5) with zero recurring costs.
- **Decision:** Use MapLibre GL JS with CARTO Dark Matter tiles (`https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}@2x.png`) with dynamic client-side rendering (`ssr: false`) and automatic resize listeners.
- **Rationale:** High-performance, zero cost, completely monochrome dark aesthetic matching Apple design guidelines.
- **Alternatives Considered:** OpenStreetMap default raster (rejected as it is multi-colored and breaks the pure black & white design requirement).

---

### DECISION-005: Strict Apple Monochrome Design Language (/apple-design)
- **Date:** August 2026
- **Context:** User requested strict black & white monochrome palette only (`/apple-design`), with no saturated accent colors.
- **Decision:** Restrict entire UI color palette to `#000000` (true black), `#09090b` (zinc-950), `#18181b` (zinc-900), `#27272a` (zinc-800), `#71717a` (zinc-500), and `#ffffff` (pure white). Marker radius and opacity encode pendency scale rather than multi-colored hues. Frosted glass (`backdrop-blur-xl bg-black/70 border-white/10`) utilized across all surfaces.
- **Rationale:** Delivers an ultra-premium, tactile, distraction-free Apple aesthetic.

