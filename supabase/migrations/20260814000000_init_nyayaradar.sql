-- NyayaRadar Initial Database Schema Migration
-- Matches PROJECT_OVERVIEW §9

-- Optional geometric index extensions if available in PostgreSQL
CREATE EXTENSION IF NOT EXISTS "cube";
CREATE EXTENSION IF NOT EXISTS "earthdistance";

-- Court registry (SC + HCs + benches + district courts)
CREATE TABLE IF NOT EXISTS courts (
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
CREATE TABLE IF NOT EXISTS snapshots (
  id           SERIAL PRIMARY KEY,
  as_of        DATE NOT NULL UNIQUE,
  source       TEXT NOT NULL,              -- 'njdg' | 'manual' | 'scdg' | 'sample'
  status       TEXT NOT NULL DEFAULT 'approved'
               CHECK (status IN ('approved','quarantined')),
  notes        TEXT
);

-- Core fact table: pendency per court per snapshot
CREATE TABLE IF NOT EXISTS pendency (
  snapshot_id  INT REFERENCES snapshots(id) ON DELETE CASCADE,
  court_id     INT REFERENCES courts(id) ON DELETE CASCADE,
  total        INT NOT NULL,
  civil        INT,
  criminal     INT,
  age_bucket   JSONB,                      -- {"<1y":0,"1-3y":0,"3-5y":0,"5-10y":0,">10y":0}
  PRIMARY KEY (snapshot_id, court_id)
);

-- Phase 3: individual SC cases
CREATE TABLE IF NOT EXISTS sc_cases (
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
CREATE TABLE IF NOT EXISTS crawl_runs (
  id              SERIAL PRIMARY KEY,
  started_at      TIMESTAMPTZ DEFAULT now(),
  finished_at     TIMESTAMPTZ,
  source          TEXT,
  status          TEXT,                    -- success | failed | quarantined
  records_written INT,
  errors          JSONB
);

-- Population lookup for per-lakh metric
CREATE TABLE IF NOT EXISTS populations (
  region TEXT PRIMARY KEY,                 -- state or district name
  population_2011 BIGINT
);

CREATE INDEX IF NOT EXISTS idx_pendency_court ON pendency(court_id, snapshot_id);
CREATE INDEX IF NOT EXISTS idx_sc_cases_origin ON sc_cases(origin_court_id);
