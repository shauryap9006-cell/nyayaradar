"""
Parsers for NJDG JSON / HTML payloads.
Normalizes raw inputs into CourtRecord structures.
"""
from typing import Dict, Any, List, Optional
from pipeline.gates.sanity import CourtRecord

class NJDGParser:
    @staticmethod
    def parse_sc_dashboard(data: Dict[str, Any], court_id: int = 1) -> Optional[CourtRecord]:
        """
        Parses SCDG response JSON/dict into a CourtRecord.
        """
        if not data:
            return None
        total = data.get("total") or data.get("pending_cases") or data.get("total_pending")
        if total is None:
            return None
        
        return CourtRecord(
            court_id=court_id,
            name="Supreme Court of India",
            tier="SC",
            total=int(total),
            civil=int(data["civil"]) if "civil" in data and data["civil"] is not None else None,
            criminal=int(data["criminal"]) if "criminal" in data and data["criminal"] is not None else None,
            age_bucket=data.get("age_bucket", {})
        )

    @staticmethod
    def parse_hc_summary(items: List[Dict[str, Any]], court_mapping: Dict[str, int]) -> List[CourtRecord]:
        """
        Parses HC NJDG response list into CourtRecords mapped by court_id.
        """
        records: List[CourtRecord] = []
        for item in items:
            name = item.get("court_name") or item.get("high_court_name")
            if not name:
                continue
            court_id = court_mapping.get(name)
            if not court_id:
                continue
            total = item.get("total") or item.get("pending_cases") or item.get("total_pending")
            if total is None:
                continue
            records.append(
                CourtRecord(
                    court_id=court_id,
                    name=name,
                    tier="HC",
                    total=int(total),
                    civil=int(item["civil"]) if "civil" in item and item["civil"] is not None else None,
                    criminal=int(item["criminal"]) if "criminal" in item and item["criminal"] is not None else None,
                    age_bucket=item.get("age_bucket", {})
                )
            )
        return records
