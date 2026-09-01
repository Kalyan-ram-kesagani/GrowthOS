import json
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy.orm import Session

import models
from database import SessionLocal
from auth import get_current_user, get_db
from coding_sync import get_connector, get_all_platforms, get_platform_display_name
from coding_sync.base import SolvedProblem

router = APIRouter(prefix="/coding", tags=["coding"])


# ── Pydantic models ──


class CodingAccountCreate(BaseModel):
    platform: str
    username: str


class CodingAccountResponse(BaseModel):
    id: int
    platform: str
    username: str
    profile_url: str | None
    connected_at: datetime | None
    last_synced_at: datetime | None
    sync_status: str

    class Config:
        from_attributes = True


class SyncRequest(BaseModel):
    platform: Optional[str] = None


# ── Accounts ──


@router.get("/accounts")
def list_accounts(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    accounts = (
        db.query(models.CodingAccount)
        .filter(models.CodingAccount.user_id == current_user.id)
        .all()
    )
    return [
        CodingAccountResponse(
            id=a.id,
            platform=a.platform,
            username=a.username,
            profile_url=a.profile_url,
            connected_at=a.connected_at,
            last_synced_at=a.last_synced_at,
            sync_status=a.sync_status,
        )
        for a in accounts
    ]


@router.post("/accounts", status_code=201)
def connect_account(
    data: CodingAccountCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    platform = data.platform.lower().strip()
    supported = get_all_platforms()
    if platform not in supported:
        raise HTTPException(status_code=400, detail=f"Unsupported platform. Supported: {', '.join(supported)}")

    existing = (
        db.query(models.CodingAccount)
        .filter(
            models.CodingAccount.user_id == current_user.id,
            models.CodingAccount.platform == platform,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail=f"Account for {get_platform_display_name(platform)} already connected.")

    connector = get_connector(platform)
    profile_url = connector.get_profile_url(data.username) if connector else None

    account = models.CodingAccount(
        user_id=current_user.id,
        platform=platform,
        username=data.username.strip(),
        profile_url=profile_url,
        sync_status="idle",
    )
    db.add(account)
    db.commit()
    db.refresh(account)

    return CodingAccountResponse(
        id=account.id,
        platform=account.platform,
        username=account.username,
        profile_url=account.profile_url,
        connected_at=account.connected_at,
        last_synced_at=account.last_synced_at,
        sync_status=account.sync_status,
    )


@router.delete("/accounts/{account_id}")
def disconnect_account(
    account_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    account = (
        db.query(models.CodingAccount)
        .filter(
            models.CodingAccount.id == account_id,
            models.CodingAccount.user_id == current_user.id,
        )
        .first()
    )
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    db.delete(account)
    db.commit()
    return {"message": "Account disconnected"}


# ── Sync ──


def _sync_account(account_id: int, platform: str, username: str, user_id: int):
    """Background sync for a single account."""
    db = SessionLocal()
    try:
        account = (
            db.query(models.CodingAccount)
            .filter(models.CodingAccount.id == account_id)
            .first()
        )
        if not account:
            return

        account.sync_status = "syncing"
        db.commit()

        connector = get_connector(platform)
        if not connector:
            account.sync_status = "error"
            db.commit()
            return

        import asyncio

        try:
            solved = asyncio.run(connector.fetch_solved_problems(username))
            stats = asyncio.run(connector.fetch_user_stats(username))
            if stats:
                account.stats_data = json.dumps(stats)
        except Exception:
            account.sync_status = "error"
            db.commit()
            return

        existing_ids = {
            row[0]
            for row in db.query(models.CodingProblem.external_problem_id)
            .filter(
                models.CodingProblem.user_id == user_id,
                models.CodingProblem.platform == platform,
            )
            .all()
        }

        new_count = 0
        for problem in solved:
            if problem.external_problem_id in existing_ids:
                continue
            record = models.CodingProblem(
                user_id=user_id,
                platform=platform,
                external_problem_id=problem.external_problem_id,
                title=problem.title,
                url=problem.url,
                difficulty=problem.difficulty,
                language=problem.language,
                solved_at=problem.solved_at,
            )
            db.add(record)
            existing_ids.add(problem.external_problem_id)
            new_count += 1

        account.last_synced_at = datetime.now(timezone.utc)
        account.sync_status = "idle"
        db.commit()
    except Exception:
        try:
            account = db.query(models.CodingAccount).filter(models.CodingAccount.id == account_id).first()
            if account:
                account.sync_status = "error"
                db.commit()
        except Exception:
            pass
    finally:
        db.close()


@router.post("/sync")
def sync_coding(
    data: SyncRequest = SyncRequest(),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    query = db.query(models.CodingAccount).filter(
        models.CodingAccount.user_id == current_user.id,
    )
    if data.platform:
        query = query.filter(models.CodingAccount.platform == data.platform.lower())

    accounts = query.all()
    if not accounts:
        raise HTTPException(status_code=404, detail="No connected accounts to sync")

    synced = []
    for acc in accounts:
        background_tasks.add_task(_sync_account, acc.id, acc.platform, acc.username, current_user.id)
        synced.append({"platform": acc.platform, "username": acc.username, "status": "queued"})

    return {"message": "Sync started", "accounts": synced}


# ── Problems ──


@router.get("/problems")
def list_problems(
    platform: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    query = db.query(models.CodingProblem).filter(
        models.CodingProblem.user_id == current_user.id,
    )
    if platform:
        query = query.filter(models.CodingProblem.platform == platform.lower())

    problems = query.order_by(models.CodingProblem.solved_at.desc().nullslast()).all()

    return [
        {
            "id": p.id,
            "platform": p.platform,
            "external_problem_id": p.external_problem_id,
            "title": p.title,
            "url": p.url,
            "difficulty": p.difficulty,
            "language": p.language,
            "solved_at": p.solved_at.isoformat() if p.solved_at else None,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        }
        for p in problems
    ]


# ── Stats ──


@router.get("/stats")
def coding_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    uid = current_user.id

    accounts = (
        db.query(models.CodingAccount)
        .filter(models.CodingAccount.user_id == uid)
        .all()
    )

    platform_stats = {}
    for acc in accounts:
        if acc.stats_data:
            try:
                platform_stats[acc.platform] = json.loads(acc.stats_data)
            except Exception:
                pass

    auto_problems = (
        db.query(models.CodingProblem)
        .filter(models.CodingProblem.user_id == uid)
        .all()
    )

    manual_problems = (
        db.query(models.CodingProgress)
        .filter(
            models.CodingProgress.user_id == uid,
            models.CodingProgress.deleted_at == None,
            models.CodingProgress.status == "Solved",
        )
        .all()
    )

    total_solved = 0
    difficulty_counts = {"Easy": 0, "Medium": 0, "Hard": 0}
    platform_counts = {}
    recent = []

    for acc in accounts:
        stats = platform_stats.get(acc.platform, {})
        platform_total = stats.get("All", 0)
        total_solved += platform_total
        for diff in ["Easy", "Medium", "Hard"]:
            difficulty_counts[diff] += stats.get(diff, 0)
        platform_counts[acc.platform] = platform_total

    manual_total = 0
    manual_diff = {"Easy": 0, "Medium": 0, "Hard": 0}
    for p in manual_problems:
        manual_total += 1
        d = p.difficulty
        if d in manual_diff:
            manual_diff[d] += 1

    total_solved += manual_total
    for d in ["Easy", "Medium", "Hard"]:
        difficulty_counts[d] += manual_diff[d]

    for p in auto_problems:
        if p.solved_at:
            recent.append({
                "title": p.title,
                "platform": p.platform,
                "difficulty": p.difficulty,
                "url": p.url,
                "solved_at": p.solved_at.isoformat(),
            })

    for p in manual_problems:
        recent.append({
            "title": p.title,
            "platform": p.platform,
            "difficulty": p.difficulty,
            "url": None,
            "solved_at": p.created_at.isoformat() if p.created_at else None,
        })

    recent.sort(key=lambda x: x.get("solved_at") or "", reverse=True)
    recent = recent[:10]

    now = datetime.utcnow()
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)

    problems_this_week = 0
    problems_this_month = 0
    streak_days = 0
    solve_dates = set()

    for p in auto_problems:
        if not p.solved_at:
            continue
        solved = p.solved_at.replace(tzinfo=None) if p.solved_at.tzinfo else p.solved_at
        if solved >= week_ago:
            problems_this_week += 1
        if solved >= month_ago:
            problems_this_month += 1
        solve_dates.add(solved.date())

    for p in manual_problems:
        if p.created_at:
            created = p.created_at.replace(tzinfo=None) if p.created_at.tzinfo else p.created_at
            if created >= week_ago:
                problems_this_week += 1
            if created >= month_ago:
                problems_this_month += 1
            solve_dates.add(created.date())

    if solve_dates:
        streak_days = 1
        check_date = now.date() - timedelta(days=1)
        while check_date in solve_dates:
            streak_days += 1
            check_date -= timedelta(days=1)

    weekly_data = []
    for i in range(6, -1, -1):
        day = now.date() - timedelta(days=i)
        day_start = datetime(day.year, day.month, day.day)
        day_end = day_start + timedelta(days=1)
        count = sum(
            1 for p in auto_problems
            if p.solved_at
            and (p.solved_at.replace(tzinfo=None) if p.solved_at.tzinfo else p.solved_at) >= day_start
            and (p.solved_at.replace(tzinfo=None) if p.solved_at.tzinfo else p.solved_at) < day_end
        ) + sum(
            1 for p in manual_problems
            if p.created_at
            and (p.created_at.replace(tzinfo=None) if p.created_at.tzinfo else p.created_at) >= day_start
            and (p.created_at.replace(tzinfo=None) if p.created_at.tzinfo else p.created_at) < day_end
        )
        weekly_data.append({"day": day.strftime("%a"), "count": count})

    return {
        "total_solved": total_solved,
        "difficulty": difficulty_counts,
        "platforms": platform_counts,
        "recent": recent,
        "problems_this_week": problems_this_week,
        "problems_this_month": problems_this_month,
        "coding_streak": streak_days,
        "weekly_activity": weekly_data,
    }
