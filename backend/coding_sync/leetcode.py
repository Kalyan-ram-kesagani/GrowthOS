import httpx
import asyncio
from datetime import datetime

from .base import BaseConnector, SolvedProblem

LEETCODE_GRAPHQL = "https://leetcode.com/graphql"

HEADERS = {
    "Content-Type": "application/json",
    "Referer": "https://leetcode.com",
    "User-Agent": "GrowthOS/1.0",
}

USER_STATS_QUERY = """
query userProblemsSolved($username: String!) {
  matchedUser(username: $username) {
    submitStats {
      acSubmissionNum {
        difficulty
        count
      }
    }
  }
}
"""

RECENT_AC_QUERY = """
query recentAcSubmissions($username: String!, $limit: Int!) {
  recentAcSubmissionList(username: $username, limit: $limit) {
    id
    title
    titleSlug
    timestamp
  }
}
"""

PROBLEM_QUERY = """
query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionFrontendId
    title
    difficulty
  }
}
"""


class LeetCodeConnector(BaseConnector):
    platform = "leetcode"
    display_name = "LeetCode"

    def get_profile_url(self, username: str) -> str:
        return f"https://leetcode.com/{username}/"

    async def fetch_solved_problems(self, username: str) -> list[SolvedProblem]:
        async with httpx.AsyncClient(timeout=20.0) as client:
            stats = await self._fetch_stats(client, username)
            recent = await self._fetch_recent_ac(client, username)

            seen_slugs = set()
            raw = []
            for sub in recent:
                slug = sub.get("titleSlug", "")
                if not slug or slug in seen_slugs:
                    continue
                seen_slugs.add(slug)
                raw.append(sub)

            slugs = [s["titleSlug"] for s in raw]
            difficulty_map = await self._fetch_difficulties_batch(client, slugs)

            problems = []
            for sub in raw:
                slug = sub["titleSlug"]
                ts = sub.get("timestamp")
                solved_at = None
                if ts:
                    try:
                        solved_at = datetime.fromtimestamp(int(ts))
                    except (ValueError, TypeError):
                        pass

                problems.append(SolvedProblem(
                    external_problem_id=slug,
                    title=sub.get("title", slug),
                    url=f"https://leetcode.com/problems/{slug}/",
                    difficulty=difficulty_map.get(slug),
                    language=None,
                    solved_at=solved_at,
                    platform=self.platform,
                ))

            return problems

    async def fetch_user_stats(self, username: str) -> dict | None:
        async with httpx.AsyncClient(timeout=15.0) as client:
            return await self._fetch_stats(client, username)

    async def _fetch_stats(self, client: httpx.AsyncClient, username: str) -> dict | None:
        try:
            resp = await client.post(
                LEETCODE_GRAPHQL,
                json={"query": USER_STATS_QUERY, "variables": {"username": username}},
                headers=HEADERS,
            )
            resp.raise_for_status()
            matched = resp.json().get("data", {}).get("matchedUser")
            if not matched:
                return None
            stats = matched.get("submitStats", {}).get("acSubmissionNum", [])
            result = {}
            for item in stats:
                result[item["difficulty"]] = item["count"]
            return result
        except Exception:
            return None

    async def _fetch_recent_ac(self, client: httpx.AsyncClient, username: str) -> list:
        try:
            resp = await client.post(
                LEETCODE_GRAPHQL,
                json={
                    "query": RECENT_AC_QUERY,
                    "variables": {"username": username, "limit": 100},
                },
                headers=HEADERS,
            )
            resp.raise_for_status()
            return resp.json().get("data", {}).get("recentAcSubmissionList", [])
        except Exception:
            return []

    async def _fetch_difficulties_batch(self, client: httpx.AsyncClient, slugs: list[str]) -> dict[str, str]:
        difficulty_map = {}

        async def fetch_one(slug: str):
            try:
                resp = await client.post(
                    LEETCODE_GRAPHQL,
                    json={"query": PROBLEM_QUERY, "variables": {"titleSlug": slug}},
                    headers=HEADERS,
                )
                resp.raise_for_status()
                q = resp.json().get("data", {}).get("question", {})
                if q and q.get("difficulty"):
                    difficulty_map[slug] = q["difficulty"]
            except Exception:
                pass

        for i in range(0, len(slugs), 8):
            batch = slugs[i : i + 8]
            await asyncio.gather(*(fetch_one(s) for s in batch))

        return difficulty_map
