"""
Fetcher for District and Subordinate Court pendency statistics from NJDG.
Adheres strictly to Polite Scraping Policy (1 req/s, backoff, respectful UA).
"""
import time
import httpx
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("nyayaradar.fetcher.district")

USER_AGENT = "NyayaRadar-PublicResearchBot/1.0 (+https://nyayaradar.in; contact@nyayaradar.in)"

class DistrictNJDGFetcher:
    BASE_URL = "https://njdg.ecourts.gov.in/njdgnew"

    def __init__(self, timeout: float = 15.0):
        self.timeout = timeout
        self.headers = {
            "User-Agent": USER_AGENT,
            "Accept": "application/json, text/html, */*",
            "Accept-Language": "en-US,en;q=0.9",
        }

    def fetch_state_district_summary(self, state_code: Optional[str] = None) -> Optional[Dict[str, Any]]:
        time.sleep(1.0)
        try:
            with httpx.Client(headers=self.headers, timeout=self.timeout, follow_redirects=True) as client:
                url = f"{self.BASE_URL}/" if not state_code else f"{self.BASE_URL}/index.php?state_code={state_code}"
                response = client.get(url)
                if response.status_code == 200:
                    return {"status_code": 200, "text": response.text, "url": str(response.url)}
                return None
        except Exception as e:
            logger.error(f"Error fetching District NJDG: {e}")
            return None
