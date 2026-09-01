import httpx
import re
from datetime import datetime, timezone

from .base import BaseConnector, SolvedProblem

GFG_API = "https://practiceapi.geeksforgeeks.org"


class GeeksforGeeksConnector(BaseConnector):
    platform = "geeksforgeeks"
    display_name = "GeeksforGeeks"

    def get_profile_url(self, username: str) -> str:
        return f"https://auth.geeksforgeeks.org/user/{username}/"

    async def fetch_solved_problems(self, username: str) -> list[SolvedProblem]:
        problems = []

        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            try:
                resp = await client.get(
                    f"{GFG_API}/api/vr/content_page/profile/",
                    params={"username": username},
                    headers={"User-Agent": "GrowthOS/1.0"},
                )
                resp.raise_for_status()
                data = resp.json()
            except Exception:
                return problems

            solved_problems = data.get("solved", [])

            for item in solved_problems:
                problem_slug = item.get("problem_slug", "")
                title = item.get("problem_name", problem_slug)
                difficulty = item.get("difficulty")
                if difficulty:
                    difficulty = difficulty.capitalize()

                if not problem_slug:
                    continue

                problems.append(SolvedProblem(
                    external_problem_id=problem_slug,
                    title=title,
                    url=f"https://practice.geeksforgeeks.org/problems/{problem_slug}",
                    difficulty=difficulty,
                    language=None,
                    solved_at=None,
                    platform=self.platform,
                ))

        return problems
