"""
Database Access Layer for NyayaRadar Python Pipeline
Handles connections to PostgreSQL (Supabase/Neon) or fallback SQLite storage.
"""
import os
import json
import logging
from typing import List, Dict, Optional, Any
from datetime import date, datetime
from dotenv import load_dotenv

load_dotenv(".env.local")
load_dotenv()

logger = logging.getLogger("nyayaradar.db")

class Database:
    def __init__(self, db_url: Optional[str] = None):
        self.db_url = db_url or os.environ.get("DATABASE_URL") or os.environ.get("SUPABASE_DB_URL")
        self._is_postgres = bool(self.db_url and "postgres" in self.db_url)

    def get_connection(self):
        if self._is_postgres:
            import psycopg
            return psycopg.connect(self.db_url)
        else:
            import sqlite3
            # Use local SQLite database file in data/nyayaradar.sqlite for local offline/fallback
            os.makedirs("data", exist_ok=True)
            conn = sqlite3.connect("data/nyayaradar.sqlite")
            conn.row_factory = sqlite3.Row
            return conn

    def init_schema(self):
        """Creates tables if using local SQLite database"""
        if self._is_postgres:
            # PostgreSQL schema is applied via supabase migrations
            return
        
        with self.get_connection() as conn:
            cur = conn.cursor()
            cur.executescript("""
            CREATE TABLE IF NOT EXISTS courts (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              tier TEXT NOT NULL,
              state TEXT,
              district TEXT,
              lat REAL,
              lon REAL,
              establishment_code TEXT UNIQUE,
              is_bench INTEGER DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS snapshots (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              as_of TEXT NOT NULL UNIQUE,
              source TEXT NOT NULL,
              status TEXT NOT NULL DEFAULT 'approved',
              notes TEXT
            );

            CREATE TABLE IF NOT EXISTS pendency (
              snapshot_id INTEGER REFERENCES snapshots(id) ON DELETE CASCADE,
              court_id INTEGER REFERENCES courts(id) ON DELETE CASCADE,
              total INTEGER NOT NULL,
              civil INTEGER,
              criminal INTEGER,
              age_bucket TEXT,
              PRIMARY KEY (snapshot_id, court_id)
            );

            CREATE TABLE IF NOT EXISTS sc_cases (
              case_no TEXT PRIMARY KEY,
              case_type TEXT,
              year INTEGER,
              petitioner TEXT,
              respondent TEXT,
              filing_date TEXT,
              status TEXT,
              next_hearing TEXT,
              origin_court_id INTEGER REFERENCES courts(id),
              origin_confidence TEXT,
              extraction_method TEXT,
              last_checked TEXT
            );

            CREATE TABLE IF NOT EXISTS crawl_runs (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              started_at TEXT DEFAULT (datetime('now')),
              finished_at TEXT,
              source TEXT,
              status TEXT,
              records_written INTEGER,
              errors TEXT
            );

            CREATE TABLE IF NOT EXISTS populations (
              region TEXT PRIMARY KEY,
              population_2011 INTEGER
            );
            """)
            conn.commit()

    def seed_courts(self, courts_data: List[Dict[str, Any]]) -> int:
        """Seeds courts table from json array"""
        self.init_schema()
        count = 0
        with self.get_connection() as conn:
            cur = conn.cursor()
            for c in courts_data:
                if self._is_postgres:
                    cur.execute(
                        """
                        INSERT INTO courts (id, name, tier, state, district, lat, lon, establishment_code, is_bench)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT (id) DO UPDATE SET
                          name=EXCLUDED.name,
                          tier=EXCLUDED.tier,
                          state=EXCLUDED.state,
                          district=EXCLUDED.district,
                          lat=EXCLUDED.lat,
                          lon=EXCLUDED.lon,
                          establishment_code=EXCLUDED.establishment_code,
                          is_bench=EXCLUDED.is_bench;
                        """,
                        (c["id"], c["name"], c["tier"], c.get("state"), c.get("district"),
                         c.get("lat"), c.get("lon"), c.get("establishment_code"), c.get("is_bench", False))
                    )
                else:
                    cur.execute(
                        """
                        INSERT INTO courts (id, name, tier, state, district, lat, lon, establishment_code, is_bench)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT (id) DO UPDATE SET
                          name=excluded.name,
                          tier=excluded.tier,
                          state=excluded.state,
                          district=excluded.district,
                          lat=excluded.lat,
                          lon=excluded.lon,
                          establishment_code=excluded.establishment_code,
                          is_bench=excluded.is_bench;
                        """,
                        (c["id"], c["name"], c["tier"], c.get("state"), c.get("district"),
                         c.get("lat"), c.get("lon"), c.get("establishment_code"), 1 if c.get("is_bench") else 0)
                    )
                count += 1
            conn.commit()
        return count

    def seed_populations(self, populations_data: List[Dict[str, Any]]) -> int:
        """Seeds populations table from json array"""
        self.init_schema()
        count = 0
        with self.get_connection() as conn:
            cur = conn.cursor()
            for p in populations_data:
                if self._is_postgres:
                    cur.execute(
                        """
                        INSERT INTO populations (region, population_2011)
                        VALUES (%s, %s)
                        ON CONFLICT (region) DO UPDATE SET population_2011=EXCLUDED.population_2011;
                        """,
                        (p["region"], p["population_2011"])
                    )
                else:
                    cur.execute(
                        """
                        INSERT INTO populations (region, population_2011)
                        VALUES (?, ?)
                        ON CONFLICT (region) DO UPDATE SET population_2011=excluded.population_2011;
                        """,
                        (p["region"], p["population_2011"])
                    )
                count += 1
            conn.commit()
        return count

    def get_courts_count(self) -> int:
        with self.get_connection() as conn:
            cur = conn.cursor()
            cur.execute("SELECT COUNT(*) FROM courts")
            row = cur.fetchone()
            return row[0] if row else 0

    def get_populations_count(self) -> int:
        with self.get_connection() as conn:
            cur = conn.cursor()
            cur.execute("SELECT COUNT(*) FROM populations")
            row = cur.fetchone()
            return row[0] if row else 0
