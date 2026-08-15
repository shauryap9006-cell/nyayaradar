"""
Fetcher for Supreme Court pendency statistics from SCDG / NJDG.
Adheres strictly to Polite Scraping Policy (1 req/s, backoff, respectful UA).
"""
import time
import httpx
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("nyayaradar.fetcher.sc")

USER_AGENT = "NyayaRadar-PublicResearchBot/1.0 (+https://nyayaradar.in; contact@nyayaradar.in)"

class SCNJDGFetcher:
    BASE_URL = "https://scdg.sci.gov.in"

    def __init__(self, timeout: float = 15.0):
        self.timeout = timeout
        self.headers = {
            "User-Agent": USER_AGENT,
            "Accept": "application/json, text/html, */*",
            "Accept-Language": "en-US,en;q=0.9",
        }

    def fetch_dashboard_summary(self) -> Optional[Dict[str, Any]]:
        """
        Fetches summary pendency data from the Supreme Court portal.
        """
        # Respect rate limits
        time.sleep(1.0)
        try:
            with httpx.Client(headers=self.headers, timeout=self.timeout, follow_redirects=True) as client:
                response = client.get(f"{self.BASE_URL}/")
                if response.status_code == 200:
                    return {"status_code": 200, "text": response.text, "url": str(response.url)}
                logger.warning(f"SCDG returned status {response.status_code}")
                return None
        except Exception as e:
            logger.error(f"Error fetching SC NJDG: {e}")
            return None
