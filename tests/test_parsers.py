import pytest
from pipeline.parsers.njdg_parser import NJDGParser

def test_parse_sc_dashboard():
    sample_sc_payload = {
        "total_pending": 92828,
        "civil": 71200,
        "criminal": 21628,
        "age_bucket": {
            "<1y": 15000,
            "1-3y": 25000,
            "3-5y": 20000,
            "5-10y": 18000,
            ">10y": 14828
        }
    }
    record = NJDGParser.parse_sc_dashboard(sample_sc_payload, court_id=1)
    assert record is not None
    assert record.court_id == 1
    assert record.tier == "SC"
    assert record.total == 92828
    assert record.civil == 71200
    assert record.criminal == 21628
    assert record.age_bucket[">10y"] == 14828

def test_parse_hc_summary():
    sample_hc_payload = [
        {
            "court_name": "High Court of Judicature at Allahabad",
            "total_pending": 1050000,
            "civil": 550000,
            "criminal": 500000,
            "age_bucket": {"<1y": 100000}
        },
        {
            "court_name": "High Court of Bombay",
            "total_pending": 720000,
            "civil": 450000,
            "criminal": 270000,
            "age_bucket": {"<1y": 80000}
        }
    ]
    mapping = {
        "High Court of Judicature at Allahabad": 2,
        "High Court of Bombay": 4
    }
    records = NJDGParser.parse_hc_summary(sample_hc_payload, mapping)
    assert len(records) == 2
    assert records[0].court_id == 2
    assert records[0].total == 1050000
    assert records[1].court_id == 4
    assert records[1].total == 720000
