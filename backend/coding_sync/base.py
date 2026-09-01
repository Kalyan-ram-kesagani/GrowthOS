from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional


@dataclass
class SolvedProblem:
    external_problem_id: str
    title: str
    url: Optional[str] = None
    difficulty: Optional[str] = None
    language: Optional[str] = None
    solved_at: Optional[datetime] = None
    platform: str = ""


class BaseConnector(ABC):
    platform: str = ""
    display_name: str = ""

    @abstractmethod
    async def fetch_solved_problems(self, username: str) -> list[SolvedProblem]:
        ...

    async def fetch_user_stats(self, username: str) -> dict | None:
        return None

    def get_profile_url(self, username: str) -> str:
        return ""
