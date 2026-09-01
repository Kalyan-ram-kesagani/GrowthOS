import httpx
from datetime import datetime, timezone

from .base import BaseConnector, SolvedProblem

CODEFORCES_API = "https://codeforces.com/api"


class CodeforcesConnector(BaseConnector):
    platform = "codeforces"
    display_name = "Codeforces"

    def get_profile_url(self, username: str) -> str:
        return f"https://codeforces.com/profile/{username}"

    async def fetch_solved_problems(self, username: str) -> list[SolvedProblem]:
        problems = []

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(
                f"{CODEFORCES_API}/user.status",
                params={"handle": username},
            )
            resp.raise_for_status()
            data = resp.json()

            if data.get("status") != "OK":
                return problems

            seen = set()
            for submission in data.get("result", []):
                if submission.get("verdict") != "OK":
                    continue

                problem = submission.get("problem", {})
                contest_id = problem.get("contestId", "")
                index = problem.get("index", "")
                problem_id = f"{contest_id}{index}"

                if problem_id in seen:
                    continue
                seen.add(problem_id)

                creation = submission.get("creationTimeSeconds")
                solved_at = None
                if creation:
                    try:
                        solved_at = datetime.fromtimestamp(int(creation), tz=timezone.utc)
                    except (ValueError, TypeError):
                        pass

                rating = problem.get("rating")
                difficulty = None
                if rating:
                    if rating < 1200:
                        difficulty = "Easy"
                    elif rating < 1600:
                        difficulty = "Medium"
                    else:
                        difficulty = "Hard"

                lang = submission.get("programmingLanguage")

                problems.append(SolvedProblem(
                    external_problem_id=problem_id,
                    title=problem.get("name", problem_id),
                    url=f"https://codeforces.com/problemset/problem/{contest_id}/{index}",
                    difficulty=difficulty,
                    language=lang,
                    solved_at=solved_at,
                    platform=self.platform,
                ))

        return problems
