from .base import BaseConnector

PLATFORM_DISPLAY = {
    "leetcode": "LeetCode",
    "codeforces": "Codeforces",
    "codechef": "CodeChef",
    "hackerrank": "HackerRank",
    "geeksforgeeks": "GeeksforGeeks",
}

_CONNECTOR_CLASSES: dict[str, type[BaseConnector]] = {}
_loaded = False


def _ensure_loaded():
    global _loaded
    if _loaded:
        return
    _loaded = True
    try:
        from .leetcode import LeetCodeConnector
        from .codeforces import CodeforcesConnector
        from .codechef import CodeChefConnector
        from .hackerrank import HackerRankConnector
        from .geeksforgeeks import GeeksforGeeksConnector

        _CONNECTOR_CLASSES.update({
            "leetcode": LeetCodeConnector,
            "codeforces": CodeforcesConnector,
            "codechef": CodeChefConnector,
            "hackerrank": HackerRankConnector,
            "geeksforgeeks": GeeksforGeeksConnector,
        })
    except ImportError:
        pass


def get_connector(platform: str) -> BaseConnector | None:
    _ensure_loaded()
    cls = _CONNECTOR_CLASSES.get(platform.lower())
    return cls() if cls else None


def get_all_platforms() -> list[str]:
    _ensure_loaded()
    return list(_CONNECTOR_CLASSES.keys())


def get_platform_display_name(platform: str) -> str:
    return PLATFORM_DISPLAY.get(platform.lower(), platform)
