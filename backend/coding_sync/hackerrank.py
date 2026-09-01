import httpx
import re
from datetime import datetime, timezone

from .base import BaseConnector, SolvedProblem

HACKERRANK_API = "https://www.hackerrank.com/rest/contents"


class HackerRankConnector(BaseConnector):
    platform = "hackerrank"
    display_name = "HackerRank"

    def get_profile_url(self, username: str) -> str:
        return f"https://www.hackerrank.com/{username}"

    async def fetch_solved_problems(self, username: str) -> list[SolvedProblem]:
        problems = []

        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            try:
                resp = await client.get(
                    f"https://www.hackerrank.com/rest/contests/master/tracks",
                    params={"username": username, "limit": 50},
                    headers={"User-Agent": "GrowthOS/1.0"},
                )
                resp.raise_for_status()
                data = resp.json()
            except Exception:
                return problems

            models = data.get("models", [])

            for track in models:
                track_slug = track.get("slug", "")
                challenges = track.get("challenges", [])

                for challenge in challenges:
                    if not challenge.get("solved", False):
                        continue

                    slug = challenge.get("slug", "")
                    name = challenge.get("name", slug)
                    difficulty = challenge.get("difficulty_name")
                    if difficulty:
                        difficulty = difficulty.capitalize()

                    problems.append(SolvedProblem(
                        external_problem_id=f"{track_slug}/{slug}",
                        title=name,
                        url=f"https://www.hackerrank.com/challenges/{slug}/problem",
                        difficulty=difficulty,
                        language=None,
                        solved_at=None,
                        platform=self.platform,
                    ))

        return problems
