import os
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
import bcrypt
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from pydantic import BaseModel
from sqlalchemy.orm import Session

import models
from database import engine, SessionLocal, Base

load_dotenv()

# =========================
# CONFIG
# =========================

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
if not JWT_SECRET_KEY:
    raise RuntimeError("JWT_SECRET_KEY environment variable is not set")

JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "60"))

CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,https://growthos-liard.vercel.app",
    ).split(",")
    if origin.strip()
]

# =========================
# APP
# =========================

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

# =========================
# AUTH HELPERS
# =========================

pwd_context = None  # removed, using bcrypt directly
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8"),
    )


def hash_password(password: str) -> str:
    return bcrypt.hashpw(
        password.encode("utf-8"), bcrypt.gensalt()
    ).decode("utf-8")


def create_access_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRE_MINUTES)
    payload = {"sub": str(user_id), "exp": expire}
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM]
        )
        user_id_str: str | None = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
        user_id = int(user_id_str)
    except (JWTError, ValueError, TypeError):
        raise credentials_exception

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user


# =========================
# AUTH ENDPOINTS
# =========================


class UserRegister(BaseModel):
    username: str
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str


@app.post("/auth/register", response_model=TokenResponse)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    existing = (
        db.query(models.User)
        .filter(
            (models.User.email == user_data.email)
            | (models.User.username == user_data.username)
        )
        .first()
    )
    if existing:
        if existing.email == user_data.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken",
        )

    new_user = models.User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(new_user.id)
    return TokenResponse(access_token=token, token_type="bearer")


@app.post("/auth/login", response_model=TokenResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = (
        db.query(models.User)
        .filter(models.User.email == form_data.username)
        .first()
    )
    if user is None or not verify_password(
        form_data.password, user.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(user.id)
    return TokenResponse(access_token=token, token_type="bearer")


@app.get("/auth/me")
def get_me(current_user: models.User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
    }


# =========================
# PROJECTS
# =========================


class ProjectCreate(BaseModel):
    title: str
    description: str | None = None
    status: str = "In Progress"


class ProjectUpdate(BaseModel):
    title: str
    description: str | None = None
    status: str


@app.get("/projects")
def get_projects(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.Project)
        .filter(models.Project.user_id == current_user.id)
        .all()
    )


@app.get("/projects/{project_id}")
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    project = (
        db.query(models.Project)
        .filter(
            models.Project.id == project_id,
            models.Project.user_id == current_user.id,
        )
        .first()
    )
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@app.post("/projects", status_code=status.HTTP_201_CREATED)
def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    new_project = models.Project(
        user_id=current_user.id,
        title=project.title,
        description=project.description,
        status=project.status,
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project


@app.put("/projects/{project_id}")
def update_project(
    project_id: int,
    updated_project: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    project = (
        db.query(models.Project)
        .filter(
            models.Project.id == project_id,
            models.Project.user_id == current_user.id,
        )
        .first()
    )
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    project.title = updated_project.title
    project.description = updated_project.description
    project.status = updated_project.status

    db.commit()
    db.refresh(project)
    return project


@app.delete("/projects/{project_id}")
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    project = (
        db.query(models.Project)
        .filter(
            models.Project.id == project_id,
            models.Project.user_id == current_user.id,
        )
        .first()
    )
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    db.delete(project)
    db.commit()
    return {"message": "Project deleted successfully"}


# =========================
# SKILLS
# =========================


class SkillCreate(BaseModel):
    name: str
    level: str = "Beginner"
    progress: int = 0


class SkillUpdate(BaseModel):
    name: str
    level: str
    progress: int


@app.get("/skills")
def get_skills(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.Skill)
        .filter(models.Skill.user_id == current_user.id)
        .all()
    )


@app.post("/skills", status_code=status.HTTP_201_CREATED)
def create_skill(
    skill: SkillCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    new_skill = models.Skill(
        user_id=current_user.id,
        name=skill.name,
        level=skill.level,
        progress=skill.progress,
    )
    db.add(new_skill)
    db.commit()
    db.refresh(new_skill)
    return new_skill


@app.put("/skills/{skill_id}")
def update_skill(
    skill_id: int,
    updated_skill: SkillUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    skill = (
        db.query(models.Skill)
        .filter(
            models.Skill.id == skill_id,
            models.Skill.user_id == current_user.id,
        )
        .first()
    )
    if skill is None:
        raise HTTPException(status_code=404, detail="Skill not found")

    skill.name = updated_skill.name
    skill.level = updated_skill.level
    skill.progress = updated_skill.progress

    db.commit()
    db.refresh(skill)
    return skill


@app.delete("/skills/{skill_id}")
def delete_skill(
    skill_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    skill = (
        db.query(models.Skill)
        .filter(
            models.Skill.id == skill_id,
            models.Skill.user_id == current_user.id,
        )
        .first()
    )
    if skill is None:
        raise HTTPException(status_code=404, detail="Skill not found")

    db.delete(skill)
    db.commit()
    return {"message": "Skill deleted successfully"}


# =========================
# CERTIFICATIONS
# =========================


class CertificationCreate(BaseModel):
    name: str
    organization: str | None = None
    status: str = "Completed"


class CertificationUpdate(BaseModel):
    name: str
    organization: str | None = None
    status: str


@app.get("/certifications")
def get_certifications(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.Certification)
        .filter(models.Certification.user_id == current_user.id)
        .all()
    )


@app.post("/certifications", status_code=status.HTTP_201_CREATED)
def create_certification(
    certification: CertificationCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    new_certification = models.Certification(
        user_id=current_user.id,
        name=certification.name,
        organization=certification.organization,
        status=certification.status,
    )
    db.add(new_certification)
    db.commit()
    db.refresh(new_certification)
    return new_certification


@app.put("/certifications/{certification_id}")
def update_certification(
    certification_id: int,
    updated_certification: CertificationUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    certification = (
        db.query(models.Certification)
        .filter(
            models.Certification.id == certification_id,
            models.Certification.user_id == current_user.id,
        )
        .first()
    )
    if certification is None:
        raise HTTPException(status_code=404, detail="Certification not found")

    certification.name = updated_certification.name
    certification.organization = updated_certification.organization
    certification.status = updated_certification.status

    db.commit()
    db.refresh(certification)
    return certification


@app.delete("/certifications/{certification_id}")
def delete_certification(
    certification_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    certification = (
        db.query(models.Certification)
        .filter(
            models.Certification.id == certification_id,
            models.Certification.user_id == current_user.id,
        )
        .first()
    )
    if certification is None:
        raise HTTPException(status_code=404, detail="Certification not found")

    db.delete(certification)
    db.commit()
    return {"message": "Certification deleted successfully"}


# =========================
# GOALS
# =========================


class GoalCreate(BaseModel):
    title: str
    description: str | None = None
    status: str = "Active"


class GoalUpdate(BaseModel):
    title: str
    description: str | None = None
    status: str


@app.get("/goals")
def get_goals(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.Goal)
        .filter(models.Goal.user_id == current_user.id)
        .all()
    )


@app.post("/goals", status_code=status.HTTP_201_CREATED)
def create_goal(
    goal: GoalCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    new_goal = models.Goal(
        user_id=current_user.id,
        title=goal.title,
        description=goal.description,
        status=goal.status,
    )
    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)
    return new_goal


@app.put("/goals/{goal_id}")
def update_goal(
    goal_id: int,
    updated_goal: GoalUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    goal = (
        db.query(models.Goal)
        .filter(
            models.Goal.id == goal_id,
            models.Goal.user_id == current_user.id,
        )
        .first()
    )
    if goal is None:
        raise HTTPException(status_code=404, detail="Goal not found")

    goal.title = updated_goal.title
    goal.description = updated_goal.description
    goal.status = updated_goal.status

    db.commit()
    db.refresh(goal)
    return goal


@app.delete("/goals/{goal_id}")
def delete_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    goal = (
        db.query(models.Goal)
        .filter(
            models.Goal.id == goal_id,
            models.Goal.user_id == current_user.id,
        )
        .first()
    )
    if goal is None:
        raise HTTPException(status_code=404, detail="Goal not found")

    db.delete(goal)
    db.commit()
    return {"message": "Goal deleted successfully"}


# =========================
# PROFESSIONAL JOURNAL
# =========================


class JournalCreate(BaseModel):
    title: str
    content: str
    category: str = "General"


class JournalUpdate(BaseModel):
    title: str
    content: str
    category: str


@app.get("/journal")
def get_journal_entries(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.JournalEntry)
        .filter(models.JournalEntry.user_id == current_user.id)
        .order_by(models.JournalEntry.created_at.desc())
        .all()
    )


@app.get("/journal/{entry_id}")
def get_journal_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    entry = (
        db.query(models.JournalEntry)
        .filter(
            models.JournalEntry.id == entry_id,
            models.JournalEntry.user_id == current_user.id,
        )
        .first()
    )
    if entry is None:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return entry


@app.post("/journal", status_code=status.HTTP_201_CREATED)
def create_journal_entry(
    entry: JournalCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    new_entry = models.JournalEntry(
        user_id=current_user.id,
        title=entry.title,
        content=entry.content,
        category=entry.category,
    )
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return new_entry


@app.put("/journal/{entry_id}")
def update_journal_entry(
    entry_id: int,
    updated_entry: JournalUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    entry = (
        db.query(models.JournalEntry)
        .filter(
            models.JournalEntry.id == entry_id,
            models.JournalEntry.user_id == current_user.id,
        )
        .first()
    )
    if entry is None:
        raise HTTPException(status_code=404, detail="Journal entry not found")

    entry.title = updated_entry.title
    entry.content = updated_entry.content
    entry.category = updated_entry.category

    db.commit()
    db.refresh(entry)
    return entry


@app.delete("/journal/{entry_id}")
def delete_journal_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    entry = (
        db.query(models.JournalEntry)
        .filter(
            models.JournalEntry.id == entry_id,
            models.JournalEntry.user_id == current_user.id,
        )
        .first()
    )
    if entry is None:
        raise HTTPException(status_code=404, detail="Journal entry not found")

    db.delete(entry)
    db.commit()
    return {"message": "Journal entry deleted successfully"}


# =========================
# LEETCODE / CODING PROGRESS
# =========================


class CodingProgressCreate(BaseModel):
    title: str
    platform: str = "LeetCode"
    difficulty: str = "Easy"
    status: str = "Solved"
    notes: str | None = None


class CodingProgressUpdate(BaseModel):
    title: str
    platform: str
    difficulty: str
    status: str
    notes: str | None = None


@app.get("/coding-progress")
def get_coding_progress(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.CodingProgress)
        .filter(models.CodingProgress.user_id == current_user.id)
        .order_by(models.CodingProgress.created_at.desc())
        .all()
    )


@app.get("/coding-progress/{problem_id}")
def get_coding_problem(
    problem_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    problem = (
        db.query(models.CodingProgress)
        .filter(
            models.CodingProgress.id == problem_id,
            models.CodingProgress.user_id == current_user.id,
        )
        .first()
    )
    if problem is None:
        raise HTTPException(status_code=404, detail="Coding problem not found")
    return problem


@app.post("/coding-progress", status_code=status.HTTP_201_CREATED)
def create_coding_progress(
    problem: CodingProgressCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    new_problem = models.CodingProgress(
        user_id=current_user.id,
        title=problem.title,
        platform=problem.platform,
        difficulty=problem.difficulty,
        status=problem.status,
        notes=problem.notes,
    )
    db.add(new_problem)
    db.commit()
    db.refresh(new_problem)
    return new_problem


@app.put("/coding-progress/{problem_id}")
def update_coding_progress(
    problem_id: int,
    updated_problem: CodingProgressUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    problem = (
        db.query(models.CodingProgress)
        .filter(
            models.CodingProgress.id == problem_id,
            models.CodingProgress.user_id == current_user.id,
        )
        .first()
    )
    if problem is None:
        raise HTTPException(status_code=404, detail="Coding problem not found")

    problem.title = updated_problem.title
    problem.platform = updated_problem.platform
    problem.difficulty = updated_problem.difficulty
    problem.status = updated_problem.status
    problem.notes = updated_problem.notes

    db.commit()
    db.refresh(problem)
    return problem


@app.delete("/coding-progress/{problem_id}")
def delete_coding_progress(
    problem_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    problem = (
        db.query(models.CodingProgress)
        .filter(
            models.CodingProgress.id == problem_id,
            models.CodingProgress.user_id == current_user.id,
        )
        .first()
    )
    if problem is None:
        raise HTTPException(status_code=404, detail="Coding problem not found")

    db.delete(problem)
    db.commit()
    return {"message": "Coding progress deleted successfully"}


# =========================
# JOB & INTERNSHIP APPLICATIONS
# =========================


class ApplicationCreate(BaseModel):
    company: str
    role: str
    application_type: str = "Internship"
    status: str = "Applied"
    application_date: str | None = None
    notes: str | None = None


class ApplicationUpdate(BaseModel):
    company: str
    role: str
    application_type: str
    status: str
    application_date: str | None = None
    notes: str | None = None


@app.get("/applications")
def get_applications(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.Application)
        .filter(models.Application.user_id == current_user.id)
        .order_by(models.Application.created_at.desc())
        .all()
    )


@app.get("/applications/{application_id}")
def get_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    application = (
        db.query(models.Application)
        .filter(
            models.Application.id == application_id,
            models.Application.user_id == current_user.id,
        )
        .first()
    )
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")
    return application


@app.post("/applications", status_code=status.HTTP_201_CREATED)
def create_application(
    application: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    new_application = models.Application(
        user_id=current_user.id,
        company=application.company,
        role=application.role,
        application_type=application.application_type,
        status=application.status,
        application_date=application.application_date,
        notes=application.notes,
    )
    db.add(new_application)
    db.commit()
    db.refresh(new_application)
    return new_application


@app.put("/applications/{application_id}")
def update_application(
    application_id: int,
    updated_application: ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    application = (
        db.query(models.Application)
        .filter(
            models.Application.id == application_id,
            models.Application.user_id == current_user.id,
        )
        .first()
    )
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")

    application.company = updated_application.company
    application.role = updated_application.role
    application.application_type = updated_application.application_type
    application.status = updated_application.status
    application.application_date = updated_application.application_date
    application.notes = updated_application.notes

    db.commit()
    db.refresh(application)
    return application


@app.delete("/applications/{application_id}")
def delete_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    application = (
        db.query(models.Application)
        .filter(
            models.Application.id == application_id,
            models.Application.user_id == current_user.id,
        )
        .first()
    )
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")

    db.delete(application)
    db.commit()
    return {"message": "Application deleted successfully"}


# =========================
# ACADEMIC INFORMATION
# =========================


class AcademicInfoCreate(BaseModel):
    institution: str
    degree: str
    branch: str | None = None
    semester: str | None = None
    cgpa: str | None = None
    status: str = "Ongoing"
    notes: str | None = None


class AcademicInfoUpdate(BaseModel):
    institution: str
    degree: str
    branch: str | None = None
    semester: str | None = None
    cgpa: str | None = None
    status: str
    notes: str | None = None


@app.get("/academic-info")
def get_academic_info(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.AcademicInfo)
        .filter(models.AcademicInfo.user_id == current_user.id)
        .order_by(models.AcademicInfo.created_at.desc())
        .all()
    )


@app.get("/academic-info/{record_id}")
def get_academic_record(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    record = (
        db.query(models.AcademicInfo)
        .filter(
            models.AcademicInfo.id == record_id,
            models.AcademicInfo.user_id == current_user.id,
        )
        .first()
    )
    if record is None:
        raise HTTPException(status_code=404, detail="Academic record not found")
    return record


@app.post("/academic-info", status_code=status.HTTP_201_CREATED)
def create_academic_record(
    record: AcademicInfoCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    new_record = models.AcademicInfo(
        user_id=current_user.id,
        institution=record.institution,
        degree=record.degree,
        branch=record.branch,
        semester=record.semester,
        cgpa=record.cgpa,
        status=record.status,
        notes=record.notes,
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return new_record


@app.put("/academic-info/{record_id}")
def update_academic_record(
    record_id: int,
    updated_record: AcademicInfoUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    record = (
        db.query(models.AcademicInfo)
        .filter(
            models.AcademicInfo.id == record_id,
            models.AcademicInfo.user_id == current_user.id,
        )
        .first()
    )
    if record is None:
        raise HTTPException(status_code=404, detail="Academic record not found")

    record.institution = updated_record.institution
    record.degree = updated_record.degree
    record.branch = updated_record.branch
    record.semester = updated_record.semester
    record.cgpa = updated_record.cgpa
    record.status = updated_record.status
    record.notes = updated_record.notes

    db.commit()
    db.refresh(record)
    return record


@app.delete("/academic-info/{record_id}")
def delete_academic_record(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    record = (
        db.query(models.AcademicInfo)
        .filter(
            models.AcademicInfo.id == record_id,
            models.AcademicInfo.user_id == current_user.id,
        )
        .first()
    )
    if record is None:
        raise HTTPException(status_code=404, detail="Academic record not found")

    db.delete(record)
    db.commit()
    return {"message": "Academic record deleted successfully"}


# =========================
# PROFILE / PROFESSIONAL INFORMATION
# =========================


class ProfileCreate(BaseModel):
    full_name: str
    professional_title: str | None = None
    email: str | None = None
    phone: str | None = None
    location: str | None = None
    linkedin: str | None = None
    github: str | None = None
    bio: str | None = None


class ProfileUpdate(BaseModel):
    full_name: str
    professional_title: str | None = None
    email: str | None = None
    phone: str | None = None
    location: str | None = None
    linkedin: str | None = None
    github: str | None = None
    bio: str | None = None


@app.get("/profile")
def get_profiles(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.Profile)
        .filter(models.Profile.user_id == current_user.id)
        .order_by(models.Profile.created_at.desc())
        .all()
    )


@app.get("/profile/{profile_id}")
def get_profile(
    profile_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    profile = (
        db.query(models.Profile)
        .filter(
            models.Profile.id == profile_id,
            models.Profile.user_id == current_user.id,
        )
        .first()
    )
    if profile is None:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@app.post("/profile", status_code=status.HTTP_201_CREATED)
def create_profile(
    profile: ProfileCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    new_profile = models.Profile(
        user_id=current_user.id,
        full_name=profile.full_name,
        professional_title=profile.professional_title,
        email=profile.email,
        phone=profile.phone,
        location=profile.location,
        linkedin=profile.linkedin,
        github=profile.github,
        bio=profile.bio,
    )
    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)
    return new_profile


@app.put("/profile/{profile_id}")
def update_profile(
    profile_id: int,
    updated_profile: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    profile = (
        db.query(models.Profile)
        .filter(
            models.Profile.id == profile_id,
            models.Profile.user_id == current_user.id,
        )
        .first()
    )
    if profile is None:
        raise HTTPException(status_code=404, detail="Profile not found")

    profile.full_name = updated_profile.full_name
    profile.professional_title = updated_profile.professional_title
    profile.email = updated_profile.email
    profile.phone = updated_profile.phone
    profile.location = updated_profile.location
    profile.linkedin = updated_profile.linkedin
    profile.github = updated_profile.github
    profile.bio = updated_profile.bio

    db.commit()
    db.refresh(profile)
    return profile


@app.delete("/profile/{profile_id}")
def delete_profile(
    profile_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    profile = (
        db.query(models.Profile)
        .filter(
            models.Profile.id == profile_id,
            models.Profile.user_id == current_user.id,
        )
        .first()
    )
    if profile is None:
        raise HTTPException(status_code=404, detail="Profile not found")

    db.delete(profile)
    db.commit()
    return {"message": "Profile deleted successfully"}


# =========================
# DASHBOARD
# =========================


@app.get("/dashboard")
@app.get("/dashboard/stats")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    uid = current_user.id

    total_projects = (
        db.query(models.Project).filter(models.Project.user_id == uid).count()
    )
    completed_projects = (
        db.query(models.Project)
        .filter(
            models.Project.user_id == uid,
            models.Project.status == "Completed",
        )
        .count()
    )
    total_skills = (
        db.query(models.Skill).filter(models.Skill.user_id == uid).count()
    )
    total_goals = (
        db.query(models.Goal).filter(models.Goal.user_id == uid).count()
    )
    completed_goals = (
        db.query(models.Goal)
        .filter(
            models.Goal.user_id == uid,
            models.Goal.status == "Completed",
        )
        .count()
    )
    total_applications = (
        db.query(models.Application)
        .filter(models.Application.user_id == uid)
        .count()
    )
    total_coding = (
        db.query(models.CodingProgress)
        .filter(models.CodingProgress.user_id == uid)
        .count()
    )
    solved_problems = (
        db.query(models.CodingProgress)
        .filter(
            models.CodingProgress.user_id == uid,
            models.CodingProgress.status == "Solved",
        )
        .count()
    )
    total_certifications = (
        db.query(models.Certification)
        .filter(models.Certification.user_id == uid)
        .count()
    )

    return {
        "projects": {"total": total_projects, "completed": completed_projects},
        "skills": {"total": total_skills},
        "goals": {"total": total_goals, "completed": completed_goals},
        "applications": {"total": total_applications},
        "coding": {"total": total_coding, "solved": solved_problems},
        "certifications": {"total": total_certifications},
    }


# =========================
# AI SKILL GAP ANALYSIS
# =========================


@app.get("/ai/skill-gap")
def get_skill_gap(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    skills = (
        db.query(models.Skill)
        .filter(models.Skill.user_id == current_user.id)
        .all()
    )

    recommendations = {
        "Beginner": "Focus on fundamentals and build small projects.",
        "Intermediate": "Build advanced projects and strengthen practical experience.",
        "Advanced": "Focus on specialization, system design, and real-world projects.",
    }

    skill_data = []
    for skill in skills:
        skill_data.append(
            {
                "name": skill.name,
                "level": skill.level,
                "recommendation": recommendations.get(
                    skill.level,
                    "Continue improving this skill with practical projects.",
                ),
            }
        )

    if not skill_data:
        return {
            "message": "No skills found. Add skills to get your analysis.",
            "skills": [],
            "overall_recommendation": "Start by adding your technical and professional skills.",
        }

    beginner_count = sum(1 for s in skill_data if s["level"] == "Beginner")
    intermediate_count = sum(1 for s in skill_data if s["level"] == "Intermediate")
    advanced_count = sum(1 for s in skill_data if s["level"] == "Advanced")

    return {
        "message": "Skill gap analysis completed successfully.",
        "summary": {
            "total_skills": len(skill_data),
            "beginner": beginner_count,
            "intermediate": intermediate_count,
            "advanced": advanced_count,
        },
        "skills": skill_data,
        "overall_recommendation": "Focus on improving your weakest skills first, then build projects that combine your strongest skills.",
    }


# =========================
# AI CAREER READINESS
# =========================


@app.get("/ai/career-readiness")
def get_career_readiness(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    uid = current_user.id

    total_skills = (
        db.query(models.Skill).filter(models.Skill.user_id == uid).count()
    )
    advanced_skills = (
        db.query(models.Skill)
        .filter(models.Skill.user_id == uid, models.Skill.level == "Advanced")
        .count()
    )
    total_projects = (
        db.query(models.Project).filter(models.Project.user_id == uid).count()
    )
    completed_projects = (
        db.query(models.Project)
        .filter(
            models.Project.user_id == uid,
            models.Project.status == "Completed",
        )
        .count()
    )
    solved_problems = (
        db.query(models.CodingProgress)
        .filter(
            models.CodingProgress.user_id == uid,
            models.CodingProgress.status == "Solved",
        )
        .count()
    )
    total_certifications = (
        db.query(models.Certification)
        .filter(models.Certification.user_id == uid)
        .count()
    )
    completed_goals = (
        db.query(models.Goal)
        .filter(models.Goal.user_id == uid, models.Goal.status == "Completed")
        .count()
    )

    score = 0
    score += min(total_skills * 3, 20)
    score += min(advanced_skills * 5, 10)
    score += min(total_projects * 5, 10)
    score += min(completed_projects * 7, 15)
    score += min(solved_problems * 2, 20)
    score += min(total_certifications * 5, 15)
    score += min(completed_goals * 2, 10)
    score = min(score, 100)

    if score >= 80:
        readiness_level = "Excellent"
        recommendation = "You are highly prepared. Focus on applying for opportunities and building advanced projects."
    elif score >= 60:
        readiness_level = "Strong"
        recommendation = "You have a strong foundation. Improve your projects and continue strengthening your technical skills."
    elif score >= 40:
        readiness_level = "Developing"
        recommendation = "You are making progress. Focus on completing projects, solving coding problems, and improving your skills."
    else:
        readiness_level = "Getting Started"
        recommendation = "Build your foundation by adding skills, completing projects, practicing coding, and earning certifications."

    return {
        "score": score,
        "level": readiness_level,
        "recommendation": recommendation,
        "breakdown": {
            "skills": {"total": total_skills, "advanced": advanced_skills},
            "projects": {"total": total_projects, "completed": completed_projects},
            "coding": {"solved": solved_problems},
            "certifications": {"total": total_certifications},
            "goals": {"completed": completed_goals},
        },
    }


# =========================
# PROJECT IDEAS
# =========================


@app.get("/ai/project-ideas")
def get_project_ideas(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    skills = (
        db.query(models.Skill)
        .filter(models.Skill.user_id == current_user.id)
        .all()
    )

    if not skills:
        return {
            "message": "No skills found. Add skills to get project ideas.",
            "projects": [],
        }

    skill_names = [skill.name for skill in skills]
    projects = []

    if any(
        s.lower() in ["python", "fastapi", "django", "flask"] for s in skill_names
    ):
        projects.append(
            {
                "title": "Smart Task Management System",
                "description": "Build a task management application with authentication, progress tracking, and productivity analytics.",
                "difficulty": "Intermediate",
                "skills": [
                    s for s in skill_names
                    if s.lower() in ["python", "fastapi", "django", "flask"]
                ],
            }
        )

    if any(
        s.lower() in ["react", "javascript", "html", "css"] for s in skill_names
    ):
        projects.append(
            {
                "title": "Personal Portfolio Dashboard",
                "description": "Create an interactive portfolio dashboard to showcase projects, skills, achievements, and career progress.",
                "difficulty": "Beginner",
                "skills": [
                    s for s in skill_names
                    if s.lower() in ["react", "javascript", "html", "css"]
                ],
            }
        )

    if any(
        s.lower() in ["sql", "mysql", "postgresql", "database"]
        for s in skill_names
    ):
        projects.append(
            {
                "title": "Student Analytics Platform",
                "description": "Build a system that stores student data and generates useful analytics, reports, and performance insights.",
                "difficulty": "Intermediate",
                "skills": [
                    s for s in skill_names
                    if s.lower() in ["sql", "mysql", "postgresql", "database"]
                ],
            }
        )

    if not projects:
        projects.append(
            {
                "title": "Personal Growth Tracker",
                "description": "Build an application that helps users track skills, goals, projects, and learning progress.",
                "difficulty": "Beginner",
                "skills": skill_names,
            }
        )

    return {
        "message": "Project ideas generated successfully.",
        "based_on_skills": skill_names,
        "projects": projects,
    }


# =========================
# WEEKLY INSIGHTS
# =========================


@app.get("/api/weekly-insights")
def get_weekly_insights(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    uid = current_user.id

    total_projects = (
        db.query(models.Project).filter(models.Project.user_id == uid).count()
    )
    completed_projects = (
        db.query(models.Project)
        .filter(
            models.Project.user_id == uid,
            models.Project.status == "Completed",
        )
        .count()
    )
    total_skills = (
        db.query(models.Skill).filter(models.Skill.user_id == uid).count()
    )
    advanced_skills = (
        db.query(models.Skill)
        .filter(models.Skill.user_id == uid, models.Skill.level == "Advanced")
        .count()
    )
    total_goals = (
        db.query(models.Goal).filter(models.Goal.user_id == uid).count()
    )
    completed_goals = (
        db.query(models.Goal)
        .filter(models.Goal.user_id == uid, models.Goal.status == "Completed")
        .count()
    )
    total_applications = (
        db.query(models.Application)
        .filter(models.Application.user_id == uid)
        .count()
    )
    total_coding = (
        db.query(models.CodingProgress)
        .filter(models.CodingProgress.user_id == uid)
        .count()
    )
    solved_problems = (
        db.query(models.CodingProgress)
        .filter(
            models.CodingProgress.user_id == uid,
            models.CodingProgress.status == "Solved",
        )
        .count()
    )
    total_certifications = (
        db.query(models.Certification)
        .filter(models.Certification.user_id == uid)
        .count()
    )

    activity_score = 0
    activity_score += min(total_skills * 10, 25)
    activity_score += min(completed_projects * 15, 25)
    activity_score += min(completed_goals * 10, 20)
    activity_score += min(solved_problems * 5, 15)
    activity_score += min(total_certifications * 5, 15)

    if activity_score >= 80:
        performance = "Excellent"
        recommendation = "Great progress! Keep building on your current momentum and focus on larger projects and career opportunities."
    elif activity_score >= 60:
        performance = "Good"
        recommendation = "You are making good progress. Focus on completing more projects and strengthening your weaker skills."
    elif activity_score >= 30:
        performance = "Growing"
        recommendation = "You are making progress, but consistency can improve. Set weekly goals and complete small milestones."
    else:
        performance = "Getting Started"
        recommendation = "Start by adding skills, goals, projects, and coding progress to build your GrowthOS profile."

    return {
        "message": "Weekly insights generated successfully.",
        "activity_score": activity_score,
        "performance": performance,
        "recommendation": recommendation,
        "breakdown": {
            "skills": {"total": total_skills, "advanced": advanced_skills},
            "projects": {"total": total_projects, "completed": completed_projects},
            "goals": {"total": total_goals, "completed": completed_goals},
            "coding": {"total": total_coding, "solved": solved_problems},
            "certifications": {"total": total_certifications},
            "applications": {"total": total_applications},
        },
    }


# =========================
# UTILITY
# =========================


@app.get("/")
def home():
    return {"message": "GrowthOS Backend is running!"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
