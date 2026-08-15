import pytest
from pipeline.gates.sanity import SanityGate, CourtRecord, SanityGateError

def make_sample_records(count=26, total=100000, civil=60000, criminal=40000):
    return [
        CourtRecord(
            court_id=i + 1,
            name=f"Court {i + 1}",
            tier="SC" if i == 0 else "HC",
            total=total,
            civil=civil,
            criminal=criminal,
            age_bucket={"<1y": 10000, "1-3y": 30000, "3-5y": 20000, "5-10y": 20000, ">10y": 20000}
        )
        for i in range(count)
    ]

def test_sanity_gate_all_valid():
    gate = SanityGate(expected_courts_count=26)
    records = make_sample_records(26)
    result = gate.validate_snapshot(records)
    assert result.is_valid is True
    assert result.status == "approved"
    assert len(result.reasons) == 0
    assert result.total_records == 26

def test_sanity_gate_rule1_deviation_failure():
    gate = SanityGate(expected_courts_count=26, max_deviation_ratio=0.25)
    prev = {r.court_id: r for r in make_sample_records(26, total=100000, civil=60000, criminal=40000)}
    
    # 30% jump on Court 1 (100000 -> 130000)
    current = make_sample_records(26, total=100000, civil=60000, criminal=40000)
    current[0].total = 130000
    current[0].civil = 78000
    current[0].criminal = 52000
    
    result = gate.validate_snapshot(current, previous_records=prev)
    assert result.is_valid is False
    assert result.status == "quarantined"
    assert any("exceeding max permitted deviation" in r for r in result.reasons)

def test_sanity_gate_rule2_breakdown_mismatch_failure():
    gate = SanityGate(expected_courts_count=26, max_breakdown_diff_ratio=0.02)
    records = make_sample_records(26, total=100000, civil=50000, criminal=40000) # sum is 90k, 10% diff
    result = gate.validate_snapshot(records)
    assert result.is_valid is False
    assert result.status == "quarantined"
    assert any("differs from total" in r for r in result.reasons)

def test_sanity_gate_rule3_missing_courts_failure():
    gate = SanityGate(expected_courts_count=26)
    records = make_sample_records(20) # Only 20 courts instead of 26
    result = gate.validate_snapshot(records)
    assert result.is_valid is False
    assert result.status == "quarantined"
    assert any("Missing courts count" in r for r in result.reasons)

def test_sanity_gate_rule4_zero_or_null_total_failure():
    gate = SanityGate(expected_courts_count=26)
    records = make_sample_records(26)
    records[5].total = 0
    result = gate.validate_snapshot(records)
    assert result.is_valid is False
    assert result.status == "quarantined"
    assert any("invalid total pendency" in r for r in result.reasons)

def test_sanity_gate_rule5_http_error_rate_abort():
    gate = SanityGate(max_http_error_ratio=0.10)
    # 2 failed out of 10 = 20% > 10% -> must raise SanityGateError
    with pytest.raises(SanityGateError):
        gate.check_http_error_rate(total_endpoints=10, failed_endpoints=2)
        
    # 1 failed out of 20 = 5% <= 10% -> pass
    gate.check_http_error_rate(total_endpoints=20, failed_endpoints=1)
