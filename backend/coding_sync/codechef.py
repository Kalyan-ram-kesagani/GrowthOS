import httpx
import re
from datetime import datetime, timezone

from .base import BaseConnector, SolvedProblem

CODECHEF_API = "https://www.codechef.com/api"
CODECHEF_PROFILE = "https://www.codechef.com/users/"


class CodeChefConnector(BaseConnector):
    platform = "codechef"
    display_name = "CodeChef"

    def get_profile_url(self, username: str) -> str:
        return f"{CODECHEF_PROFILE}{username}"

    async def fetch_solved_problems(self, username: str) -> list[SolvedProblem]:
        problems = []

        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            try:
                resp = await client.get(
                    f"{CODECHEF_API}/users/{username}",
                    headers={"User-Agent": "GrowthOS/1.0"},
                )
                resp.raise_for_status()
                data = resp.json()
            except Exception:
                return problems

            user_data = data.get("data", {})
            solved = user_data.get("solved", [])

            if not solved:
                return problems

            for item in solved:
                problem_code = item.get("code", "")
                title = item.get("name", problem_code)
                if not problem_code:
                    continue

                difficulty = item.get("difficulty")
                if isinstance(difficulty, str):
                    difficulty = difficulty.capitalize()
                else:
                    difficulty = None

                problems.append(SolvedProblem(
                    external_problem_id=problem_code,
                    title=title,
                    url=f"https://www.codechef.com/problems/{problem_code}",
                    difficulty=difficulty,
                    language=None,
                    solved_at=None,
                    platform=self.platform,
                ))

        return problems
