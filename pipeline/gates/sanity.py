"""
Sanity Gate Module (Non-negotiable validation before DB persistence)
Implements all rules from PROJECT_OVERVIEW §7.4 and PRD FR-3.2.
"""
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
import logging

logger = logging.getLogger("nyayaradar.sanity")

@dataclass
class CourtRecord:
    court_id: int
    name: str
    tier: str
    total: int
    civil: Optional[int] = None
    criminal: Optional[int] = None
    age_bucket: Optional[Dict[str, int]] = None

@dataclass
class SanityGateResult:
    is_valid: bool
    status: str  # 'approved' or 'quarantined'
    reasons: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    total_records: int = 0
    approved_records: int = 0

class SanityGateError(Exception):
    """Critical failure requiring crawl abort"""
    pass

class SanityGate:
    def __init__(
        self,
        expected_courts_count: int = 26,
        max_deviation_ratio: float = 0.25,
        max_breakdown_diff_ratio: float = 0.02,
        max_http_error_ratio: float = 0.10,
    ):
        self.expected_courts_count = expected_courts_count
        self.max_deviation_ratio = max_deviation_ratio
        self.max_breakdown_diff_ratio = max_breakdown_diff_ratio
        self.max_http_error_ratio = max_http_error_ratio

    def check_http_error_rate(self, total_endpoints: int, failed_endpoints: int) -> None:
        """Rule 5: HTTP errors on >10% of endpoints -> Abort run"""
        if total_endpoints == 0:
            return
        error_ratio = failed_endpoints / total_endpoints
        if error_ratio > self.max_http_error_ratio:
            raise SanityGateError(
                f"Crawl aborted: HTTP error rate ({error_ratio:.1%}) exceeds threshold ({self.max_http_error_ratio:.1%}). "
                f"{failed_endpoints}/{total_endpoints} endpoints failed."
            )

    def validate_snapshot(
        self,
        current_records: List[CourtRecord],
        previous_records: Optional[Dict[int, CourtRecord]] = None
    ) -> SanityGateResult:
        """
        Validates the entire snapshot against the 5 sanity rules.
        """
        reasons: List[str] = []
        warnings: List[str] = []
        
        # Rule 3: Missing courts vs expected count (26 at M1)
        court_ids = set(r.court_id for r in current_records)
        if len(court_ids) < self.expected_courts_count:
            reasons.append(
                f"Missing courts count: Expected at least {self.expected_courts_count} courts, got {len(court_ids)}"
            )

        for record in current_records:
            # Rule 4: Null/zero total for any court
            if record.total is None or record.total <= 0:
                reasons.append(
                    f"Court ID {record.court_id} ({record.name}): invalid total pendency ({record.total})"
                )
                continue

            # Rule 2: civil + criminal differs from total by >2%
            if record.civil is not None and record.criminal is not None:
                sum_parts = record.civil + record.criminal
                diff = abs(sum_parts - record.total)
                diff_ratio = diff / record.total if record.total > 0 else 0
                if diff_ratio > self.max_breakdown_diff_ratio:
                    reasons.append(
                        f"Court ID {record.court_id} ({record.name}): Civil ({record.civil}) + Criminal ({record.criminal}) = "
                        f"{sum_parts}, which differs from total ({record.total}) by {diff_ratio:.2%} (> {self.max_breakdown_diff_ratio:.1%})"
                    )

            # Rule 1: Any value deviates >25% from previous snapshot
            if previous_records and record.court_id in previous_records:
                prev = previous_records[record.court_id]
                if prev.total and prev.total > 0:
                    delta = abs(record.total - prev.total)
                    dev_ratio = delta / prev.total
                    if dev_ratio > self.max_deviation_ratio:
                        reasons.append(
                            f"Court ID {record.court_id} ({record.name}): Total pendency changed from {prev.total} to {record.total} "
                            f"({dev_ratio:+.1%}), exceeding max permitted deviation {self.max_deviation_ratio:.1%}"
                        )

        is_valid = len(reasons) == 0
        status = "approved" if is_valid else "quarantined"
        
        return SanityGateResult(
            is_valid=is_valid,
            status=status,
            reasons=reasons,
            warnings=warnings,
            total_records=len(current_records),
            approved_records=len(current_records) if is_valid else 0
        )
