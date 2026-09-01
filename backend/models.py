from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, UniqueConstraint, Index
from datetime import datetime, timezone

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
    )


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    link = Column(String, nullable=True)
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
    )
    deleted_at = Column(DateTime, nullable=True)


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    deleted_at = Column(DateTime, nullable=True)


class Certification(Base):
    __tablename__ = "certifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    organization = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    deleted_at = Column(DateTime, nullable=True)


class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, default="Active")
    deleted_at = Column(DateTime, nullable=True)


class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String, default="General")
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
    )
    deleted_at = Column(DateTime, nullable=True)


class CodingProgress(Base):
    __tablename__ = "coding_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    platform = Column(String, default="LeetCode")
    difficulty = Column(String, default="Easy")
    status = Column(String, default="Solved")
    notes = Column(Text, nullable=True)
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
    )
    deleted_at = Column(DateTime, nullable=True)


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    company = Column(String, nullable=False)
    role = Column(String, nullable=False)
    application_type = Column(String, default="Internship")
    status = Column(String, default="Applied")
    application_date = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
    )
    deleted_at = Column(DateTime, nullable=True)


class AcademicInfo(Base):
    __tablename__ = "academic_info"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    institution = Column(String, nullable=False)
    degree = Column(String, nullable=False)
    branch = Column(String, nullable=True)
    semester = Column(String, nullable=True)
    cgpa = Column(String, nullable=True)
    status = Column(String, default="Ongoing")
    notes = Column(Text, nullable=True)
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
    )
    deleted_at = Column(DateTime, nullable=True)


class Profile(Base):
    __tablename__ = "profile"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    full_name = Column(String, nullable=False)
    professional_title = Column(String, nullable=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    location = Column(String, nullable=True)
    linkedin = Column(String, nullable=True)
    github = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    avatar_url = Column(String, nullable=True)
    deleted_at = Column(DateTime, nullable=True)
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
    )


class CodingAccount(Base):
    __tablename__ = "coding_accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    platform = Column(String, nullable=False)
    username = Column(String, nullable=False)
    profile_url = Column(String, nullable=True)
    stats_data = Column(Text, nullable=True)
    connected_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
    )
    last_synced_at = Column(DateTime, nullable=True)
    sync_status = Column(String, default="idle")

    __table_args__ = (
        UniqueConstraint("user_id", "platform", name="uq_coding_accounts_user_platform"),
        Index("ix_coding_accounts_user_platform", "user_id", "platform"),
    )


class CodingProblem(Base):
    __tablename__ = "coding_problems"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    platform = Column(String, nullable=False, index=True)
    external_problem_id = Column(String, nullable=False)
    title = Column(String, nullable=False)
    url = Column(String, nullable=True)
    difficulty = Column(String, nullable=True)
    language = Column(String, nullable=True)
    solved_at = Column(DateTime, nullable=True)
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
    )

    __table_args__ = (
        UniqueConstraint("user_id", "platform", "external_problem_id", name="uq_coding_problems_user_platform_problem"),
        Index("ix_coding_problems_user_platform", "user_id", "platform"),
    )
