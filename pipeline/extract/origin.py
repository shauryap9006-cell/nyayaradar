"""
Phase 3: Origin-District Extraction Pipeline (Skeleton)
Regex -> Fuzzy registry match -> LLM fallback -> Confidence Tagging
"""
import re
from typing import Dict, Any, Optional
from rapidfuzz import fuzz, process

class OriginExtractor:
    REGEX_PATTERNS = [
        re.compile(r"(?:District\s*(?:&|and)\s*Sessions\s+Court|Sessions\s+Court)[, ]+([A-Za-z .]{3,40})", re.IGNORECASE),
        re.compile(r"High\s+Court\s+of\s+([A-Za-z .]{3,40})", re.IGNORECASE),
        re.compile(r"Court\s+of\s+(?:the\s+)?(?:Additional\s+)?(?:District|Civil|Sessions)\s+Judge[, ]+([A-Za-z .]{3,40})", re.IGNORECASE),
        re.compile(r"(?:arising\s+from|in)\s+.*?(?:Trial|Suit|Case)\s+No[. ]+[\d/]+\s+of\s+(\d{4})", re.IGNORECASE),
    ]

    def __init__(self, court_registry: Optional[Dict[str, int]] = None):
        self.court_registry = court_registry or {}

    def extract_from_text(self, text: str) -> Dict[str, Any]:
        """
        Runs stage 2 regex and stage 3 fuzzy matching.
        """
        for pattern in self.REGEX_PATTERNS:
            match = pattern.search(text)
            if match:
                candidate = match.group(1).strip()
                if self.court_registry:
                    # Fuzzy match against court registry
                    best_match = process.extractOne(
                        candidate,
                        self.court_registry.keys(),
                        scorer=fuzz.token_set_ratio
                    )
                    if best_match and best_match[1] >= 87:
                        matched_name = best_match[0]
                        return {
                            "candidate": candidate,
                            "matched_court": matched_name,
                            "court_id": self.court_registry[matched_name],
                            "score": best_match[1],
                            "confidence": "district",
                            "method": "regex+fuzzy"
                        }
                return {
                    "candidate": candidate,
                    "matched_court": None,
                    "confidence": "unknown",
                    "method": "regex"
                }
        return {
            "candidate": None,
            "matched_court": None,
            "confidence": "unknown",
            "method": "none"
        }
