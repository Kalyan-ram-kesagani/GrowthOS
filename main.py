from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import models
from database import engine, SessionLocal

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


models.Base.metadata.create_all(bind=engine)


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


@app.get("/")
def home():
    return {"message": "GrowthOS Backend is running!"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.get("/projects")
def get_projects():
    db = SessionLocal()
    projects = db.query(models.Project).all()
    db.close()
    return projects


@app.get("/projects/{project_id}")
def get_project(project_id: int):
    db = SessionLocal()

    project = (
        db.query(models.Project)
        .filter(models.Project.id == project_id)
        .first()
    )

    db.close()

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    return project


@app.post("/projects")
def create_project(project: ProjectCreate):
    db = SessionLocal()

    new_project = models.Project(
        title=project.title,
        description=project.description,
        status=project.status
    )

    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    db.close()

    return new_project


@app.put("/projects/{project_id}")
def update_project(
    project_id: int,
    updated_project: ProjectUpdate
):
    db = SessionLocal()

    project = (
        db.query(models.Project)
        .filter(models.Project.id == project_id)
        .first()
    )

    if project is None:
        db.close()

        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    project.title = updated_project.title
    project.description = updated_project.description
    project.status = updated_project.status

    db.commit()
    db.refresh(project)
    db.close()

    return project


@app.delete("/projects/{project_id}")
def delete_project(project_id: int):
    db = SessionLocal()

    project = (
        db.query(models.Project)
        .filter(models.Project.id == project_id)
        .first()
    )

    if project is None:
        db.close()

        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    db.delete(project)
    db.commit()
    db.close()

    return {
        "message": "Project deleted successfully"
    }


# =========================
# SKILLS
# =========================

class SkillCreate(BaseModel):
    name: str
    level: str = "Beginner"
    progress: int = 0


@app.get("/skills")
def get_skills():
    db = SessionLocal()
    skills = db.query(models.Skill).all()
    db.close()
    return skills


@app.post("/skills")
def create_skill(skill: SkillCreate):
    db = SessionLocal()

    new_skill = models.Skill(
        name=skill.name,
        level=skill.level,
        progress=skill.progress
    )

    db.add(new_skill)
    db.commit()
    db.refresh(new_skill)
    db.close()

    return new_skill


@app.delete("/skills/{skill_id}")
def delete_skill(skill_id: int):
    db = SessionLocal()

    skill = (
        db.query(models.Skill)
        .filter(models.Skill.id == skill_id)
        .first()
    )

    if skill is None:
        db.close()

        raise HTTPException(
            status_code=404,
            detail="Skill not found"
        )

    db.delete(skill)
    db.commit()
    db.close()

    return {
        "message": "Skill deleted successfully"
    }


# =========================
# CERTIFICATIONS
# =========================

class CertificationCreate(BaseModel):
    name: str
    organization: str | None = None
    status: str = "Completed"


@app.get("/certifications")
def get_certifications():
    db = SessionLocal()

    certifications = db.query(
        models.Certification
    ).all()

    db.close()

    return certifications


@app.post("/certifications")
def create_certification(
    certification: CertificationCreate
):
    db = SessionLocal()

    new_certification = models.Certification(
        name=certification.name,
        organization=certification.organization,
        status=certification.status
    )

    db.add(new_certification)
    db.commit()
    db.refresh(new_certification)
    db.close()

    return new_certification


@app.delete("/certifications/{certification_id}")
def delete_certification(certification_id: int):
    db = SessionLocal()

    certification = (
        db.query(models.Certification)
        .filter(
            models.Certification.id == certification_id
        )
        .first()
    )

    if certification is None:
        db.close()

        raise HTTPException(
            status_code=404,
            detail="Certification not found"
        )

    db.delete(certification)
    db.commit()
    db.close()

    return {
        "message": "Certification deleted successfully"
    }


# =========================
# GOALS
# =========================

class GoalCreate(BaseModel):
    title: str
    description: str | None = None
    status: str = "Active"


@app.get("/goals")
def get_goals():
    db = SessionLocal()
    goals = db.query(models.Goal).all()
    db.close()
    return goals


@app.post("/goals")
def create_goal(goal: GoalCreate):
    db = SessionLocal()

    new_goal = models.Goal(
        title=goal.title,
        description=goal.description,
        status=goal.status
    )

    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)
    db.close()

    return new_goal


@app.delete("/goals/{goal_id}")
def delete_goal(goal_id: int):
    db = SessionLocal()

    goal = (
        db.query(models.Goal)
        .filter(models.Goal.id == goal_id)
        .first()
    )

    if goal is None:
        db.close()

        raise HTTPException(
            status_code=404,
            detail="Goal not found"
        )

    db.delete(goal)
    db.commit()
    db.close()

    return {
        "message": "Goal deleted successfully"
    }


# =========================
# PROFESSIONAL JOURNAL
# =========================

class JournalCreate(BaseModel):
    title: str
    content: str
    category: str = "General"


@app.get("/journal")
def get_journal_entries():
    db = SessionLocal()

    entries = (
        db.query(models.JournalEntry)
        .order_by(
            models.JournalEntry.created_at.desc()
        )
        .all()
    )

    db.close()

    return entries


@app.get("/journal/{entry_id}")
def get_journal_entry(entry_id: int):
    db = SessionLocal()

    entry = (
        db.query(models.JournalEntry)
        .filter(
            models.JournalEntry.id == entry_id
        )
        .first()
    )

    db.close()

    if entry is None:
        raise HTTPException(
            status_code=404,
            detail="Journal entry not found"
        )

    return entry


@app.post("/journal")
def create_journal_entry(
    entry: JournalCreate
):
    db = SessionLocal()

    new_entry = models.JournalEntry(
        title=entry.title,
        content=entry.content,
        category=entry.category
    )

    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    db.close()

    return new_entry


@app.delete("/journal/{entry_id}")
def delete_journal_entry(entry_id: int):
    db = SessionLocal()

    entry = (
        db.query(models.JournalEntry)
        .filter(
            models.JournalEntry.id == entry_id
        )
        .first()
    )

    if entry is None:
        db.close()

        raise HTTPException(
            status_code=404,
            detail="Journal entry not found"
        )

    db.delete(entry)
    db.commit()
    db.close()

    return {
        "message": "Journal entry deleted successfully"
    }


# =========================
# LEETCODE / CODING PROGRESS
# =========================

class CodingProgressCreate(BaseModel):
    title: str
    platform: str = "LeetCode"
    difficulty: str = "Easy"
    status: str = "Solved"
    notes: str | None = None


@app.get("/coding-progress")
def get_coding_progress():
    db = SessionLocal()

    problems = (
        db.query(models.CodingProgress)
        .order_by(
            models.CodingProgress.created_at.desc()
        )
        .all()
    )

    db.close()

    return problems


@app.get("/coding-progress/{problem_id}")
def get_coding_problem(problem_id: int):
    db = SessionLocal()

    problem = (
        db.query(models.CodingProgress)
        .filter(
            models.CodingProgress.id == problem_id
        )
        .first()
    )

    db.close()

    if problem is None:
        raise HTTPException(
            status_code=404,
            detail="Coding problem not found"
        )

    return problem


@app.post("/coding-progress")
def create_coding_progress(
    problem: CodingProgressCreate
):
    db = SessionLocal()

    new_problem = models.CodingProgress(
        title=problem.title,
        platform=problem.platform,
        difficulty=problem.difficulty,
        status=problem.status,
        notes=problem.notes
    )

    db.add(new_problem)
    db.commit()
    db.refresh(new_problem)
    db.close()

    return new_problem


@app.delete("/coding-progress/{problem_id}")
def delete_coding_progress(problem_id: int):
    db = SessionLocal()

    problem = (
        db.query(models.CodingProgress)
        .filter(
            models.CodingProgress.id == problem_id
        )
        .first()
    )

    if problem is None:
        db.close()

        raise HTTPException(
            status_code=404,
            detail="Coding problem not found"
        )

    db.delete(problem)
    db.commit()
    db.close()

    return {
        "message": "Coding progress deleted successfully"
    }


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


@app.get("/applications")
def get_applications():
    db = SessionLocal()

    applications = (
        db.query(models.Application)
        .order_by(
            models.Application.created_at.desc()
        )
        .all()
    )

    db.close()

    return applications


@app.get("/applications/{application_id}")
def get_application(application_id: int):
    db = SessionLocal()

    application = (
        db.query(models.Application)
        .filter(
            models.Application.id == application_id
        )
        .first()
    )

    db.close()

    if application is None:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    return application


@app.post("/applications")
def create_application(
    application: ApplicationCreate
):
    db = SessionLocal()

    new_application = models.Application(
        company=application.company,
        role=application.role,
        application_type=application.application_type,
        status=application.status,
        application_date=application.application_date,
        notes=application.notes
    )

    db.add(new_application)
    db.commit()
    db.refresh(new_application)
    db.close()

    return new_application


@app.delete("/applications/{application_id}")
def delete_application(application_id: int):
    db = SessionLocal()

    application = (
        db.query(models.Application)
        .filter(
            models.Application.id == application_id
        )
        .first()
    )

    if application is None:
        db.close()

        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    db.delete(application)
    db.commit()
    db.close()

    return {
        "message": "Application deleted successfully"
    }


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


@app.get("/academic-info")
def get_academic_info():
    db = SessionLocal()

    records = (
        db.query(models.AcademicInfo)
        .order_by(
            models.AcademicInfo.created_at.desc()
        )
        .all()
    )

    db.close()

    return records


@app.get("/academic-info/{record_id}")
def get_academic_record(record_id: int):
    db = SessionLocal()

    record = (
        db.query(models.AcademicInfo)
        .filter(
            models.AcademicInfo.id == record_id
        )
        .first()
    )

    db.close()

    if record is None:
        raise HTTPException(
            status_code=404,
            detail="Academic record not found"
        )

    return record


@app.post("/academic-info")
def create_academic_record(
    record: AcademicInfoCreate
):
    db = SessionLocal()

    new_record = models.AcademicInfo(
        institution=record.institution,
        degree=record.degree,
        branch=record.branch,
        semester=record.semester,
        cgpa=record.cgpa,
        status=record.status,
        notes=record.notes
    )

    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    db.close()

    return new_record


@app.delete("/academic-info/{record_id}")
def delete_academic_record(record_id: int):
    db = SessionLocal()

    record = (
        db.query(models.AcademicInfo)
        .filter(
            models.AcademicInfo.id == record_id
        )
        .first()
    )

    if record is None:
        db.close()

        raise HTTPException(
            status_code=404,
            detail="Academic record not found"
        )

    db.delete(record)
    db.commit()
    db.close()

    return {
        "message": "Academic record deleted successfully"
    }

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


@app.get("/profile")
def get_profiles():
    db = SessionLocal()

    profiles = (
        db.query(models.Profile)
        .order_by(
            models.Profile.created_at.desc()
        )
        .all()
    )

    db.close()

    return profiles


@app.get("/profile/{profile_id}")
def get_profile(profile_id: int):
    db = SessionLocal()

    profile = (
        db.query(models.Profile)
        .filter(
            models.Profile.id == profile_id
        )
        .first()
    )

    db.close()

    if profile is None:
        raise HTTPException(
            status_code=404,
            detail="Profile not found"
        )

    return profile


@app.post("/profile")
def create_profile(profile: ProfileCreate):
    db = SessionLocal()

    new_profile = models.Profile(
        full_name=profile.full_name,
        professional_title=profile.professional_title,
        email=profile.email,
        phone=profile.phone,
        location=profile.location,
        linkedin=profile.linkedin,
        github=profile.github,
        bio=profile.bio
    )

    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)
    db.close()

    return new_profile


@app.delete("/profile/{profile_id}")
def delete_profile(profile_id: int):
    db = SessionLocal()

    profile = (
        db.query(models.Profile)
        .filter(
            models.Profile.id == profile_id
        )
        .first()
    )

    if profile is None:
        db.close()

        raise HTTPException(
            status_code=404,
            detail="Profile not found"
        )

    db.delete(profile)
    db.commit()
    db.close()

    return {
        "message": "Profile deleted successfully"
    }
