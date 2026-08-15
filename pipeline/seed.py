"""
Seeding script for NyayaRadar database.
Seeds courts (SC + 25 High Courts) and populations (Census 2011).
"""
import json
import sys
from pathlib import Path

# Ensure root directory is in sys.path
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from pipeline.db import Database


def main():
    root = Path(__file__).resolve().parent.parent
    courts_path = root / "data" / "seeds" / "courts.json"
    populations_path = root / "data" / "seeds" / "populations.json"

    with open(courts_path, "r", encoding="utf-8") as f:
        courts_data = json.load(f)

    with open(populations_path, "r", encoding="utf-8") as f:
        populations_data = json.load(f)

    db = Database()
    courts_seeded = db.seed_courts(courts_data)
    populations_seeded = db.seed_populations(populations_data)

    print(f"[OK] Successfully seeded {courts_seeded} courts into database.")
    print(f"[OK] Successfully seeded {populations_seeded} population records into database.")
    print(f"[INFO] Current totals in DB: {db.get_courts_count()} courts, {db.get_populations_count()} population regions.")


if __name__ == "__main__":
    main()
