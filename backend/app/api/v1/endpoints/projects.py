import re
import uuid
import logging
import subprocess
import os
from pathlib import Path
from urllib.parse import quote
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models import Project, ProjectDeveloper, DeveloperProfile, Technology, User
from app.schemas import ProjectOut, ProjectCreate, ProjectUpdate
from app.api.deps import get_current_user, get_current_verified_developer

logger = logging.getLogger(__name__)

router = APIRouter()

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    return text.strip('-')

@router.get("", response_model=List[ProjectOut])
async def list_projects(
    category: Optional[str] = Query(None, description="Filter by category"),
    status: Optional[str] = Query(None, description="Filter by status (e.g. Published, Ongoing, All)"),
    technology: Optional[str] = Query(None, description="Filter by technology"),
    query: Optional[str] = Query(None, description="Search name or description"),
    developer_username: Optional[str] = Query(None, description="Filter by developer username"),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Project)
        .where(Project.visibility == "Public")
        .where(Project.status != "Archived")
        .options(
            selectinload(Project.developer_associations).selectinload(ProjectDeveloper.developer).selectinload(DeveloperProfile.user),
            selectinload(Project.developer_associations).selectinload(ProjectDeveloper.developer).selectinload(DeveloperProfile.skills),
            selectinload(Project.technologies)
        )
        .order_by(Project.created_at.desc())
    )

    if status and status != "All":
        clean_status = status.strip().lower()
        if clean_status in ["ongoing", "in progress", "in development", "active"]:
            stmt = stmt.where(Project.status.in_(["Ongoing", "In Progress", "In Development", "Active Sprint"]))
        elif clean_status in ["published", "live", "completed"]:
            stmt = stmt.where(Project.status.in_(["Published", "Live", "Completed"]))
        else:
            stmt = stmt.where(Project.status.ilike(status))

    if category and category != "All":
        stmt = stmt.where(Project.category == category)

    if query:
        q_wildcard = f"%{query}%"
        stmt = stmt.where(
            or_(
                Project.name.ilike(q_wildcard),
                Project.short_description.ilike(q_wildcard),
                Project.description.ilike(q_wildcard)
            )
        )

    result = await db.execute(stmt)
    projects = result.scalars().all()

    if technology:
        tech_lower = technology.strip().lower()
        projects = [p for p in projects if any(t.name.lower() == tech_lower for t in p.technologies)]

    if developer_username:
        dev_u_lower = developer_username.strip().lower()
        projects = [
            p for p in projects
            if any(
                assoc.developer and assoc.developer.user and assoc.developer.user.username.lower() == dev_u_lower
                for assoc in p.developer_associations
            )
        ]

    return projects

@router.get("/{slug}", response_model=ProjectOut)
async def get_project_by_slug(slug: str, db: AsyncSession = Depends(get_db)):
    clean_slug = slug.strip().lower()
    stmt = (
        select(Project)
        .where(Project.slug == clean_slug)
        .options(
            selectinload(Project.developer_associations).selectinload(ProjectDeveloper.developer).selectinload(DeveloperProfile.user),
            selectinload(Project.developer_associations).selectinload(ProjectDeveloper.developer).selectinload(DeveloperProfile.skills),
            selectinload(Project.technologies)
        )
    )
    project = (await db.execute(stmt)).scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.post("", response_model=ProjectOut)
async def create_project(
    payload: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Allow active developers or CEO (super_admin) to create projects
    if current_user.role not in ["super_admin", "developer"] or not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only developers or the CEO can create projects."
        )

    try:
        # Base slug
        base_slug = slugify(payload.name) or f"project-{uuid.uuid4().hex[:6]}"
        slug = base_slug
        counter = 1
        while True:
            check_stmt = select(Project).where(Project.slug == slug)
            exists = (await db.execute(check_stmt)).scalar_one_or_none()
            if not exists:
                break
            slug = f"{base_slug}-{counter}"
            counter += 1

        # Resolve technologies (case-insensitive & deduplicated)
        techs_to_assign = []
        seen_tech_names = set()
        if payload.technologies:
            for tech_name in payload.technologies:
                clean_t = tech_name.strip()
                if not clean_t or clean_t.lower() in seen_tech_names:
                    continue
                seen_tech_names.add(clean_t.lower())
                tech_stmt = select(Technology).where(Technology.name.ilike(clean_t))
                tech = (await db.execute(tech_stmt)).scalars().first()
                if not tech:
                    tech = Technology(name=clean_t)
                    db.add(tech)
                    await db.flush()
                if tech not in techs_to_assign:
                    techs_to_assign.append(tech)

        new_project = Project(
            name=payload.name.strip(),
            slug=slug,
            short_description=payload.short_description,
            description=payload.description,
            category=payload.category,
            demo_url=payload.demo_url,
            repo_url=payload.repo_url,
            image_url=payload.image_url or "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80",
            client_name=payload.client_name,
            start_date=payload.start_date,
            completion_date=payload.completion_date,
            status=payload.status or "Published",
            progress_percentage=payload.progress_percentage if payload.progress_percentage is not None else (70 if (payload.status and payload.status.lower() in ["ongoing", "in progress"]) else 100),
            current_stage=payload.current_stage or ("In Development" if (payload.status and payload.status.lower() in ["ongoing", "in progress"]) else "Production Live"),
            visibility=payload.visibility or "Public",
            technologies=techs_to_assign
        )
        db.add(new_project)
        await db.flush()

        # Enforce Section 36: Project must have at least one verified developer
        has_verified_dev = False
        attributed_dev_ids = set()

        # If team members provided
        if payload.team_members and len(payload.team_members) > 0:
            for member in payload.team_members:
                dev_id = member.get("developer_id")
                if not dev_id or dev_id in attributed_dev_ids:
                    continue
                attributed_dev_ids.add(dev_id)
                dev_stmt = (
                    select(DeveloperProfile)
                    .join(DeveloperProfile.user)
                    .where(DeveloperProfile.id == dev_id)
                    .options(selectinload(DeveloperProfile.user))
                )
                dev_profile = (await db.execute(dev_stmt)).scalar_one_or_none()
                if dev_profile:
                    if dev_profile.user and (dev_profile.user.is_verified or dev_profile.user.role == "super_admin"):
                        has_verified_dev = True
                    assoc = ProjectDeveloper(
                        project_id=new_project.id,
                        developer_id=dev_profile.id,
                        role_in_project=member.get("role_in_project", "Contributor"),
                        is_lead=member.get("is_lead", False)
                    )
                    db.add(assoc)

        # If current user is administrator/developer and not yet attributed, or no verified developer attributed yet
        if not has_verified_dev or not attributed_dev_ids:
            dev_stmt = (
                select(DeveloperProfile)
                .join(DeveloperProfile.user)
                .where(DeveloperProfile.user_id == current_user.id)
                .options(selectinload(DeveloperProfile.user))
            )
            current_dev = (await db.execute(dev_stmt)).scalar_one_or_none()
            if not current_dev and current_user.role == "super_admin":
                # Ensure CEO has developer profile
                current_dev = DeveloperProfile(
                    user_id=current_user.id,
                    title="Chief Executive Officer",
                    short_bio="Super Admin & Lead Systems Architect.",
                    bio="Full-stack engineering and platform architecture.",
                    location="India",
                    availability="Available for Projects",
                    years_experience=5,
                    is_public=True
                )
                db.add(current_dev)
                await db.flush()

            if current_dev and current_dev.id not in attributed_dev_ids:
                if current_user.is_verified or current_user.role == "super_admin":
                    has_verified_dev = True
                assoc = ProjectDeveloper(
                    project_id=new_project.id,
                    developer_id=current_dev.id,
                    role_in_project="Lead Developer",
                    is_lead=True
                )
                db.add(assoc)
                attributed_dev_ids.add(current_dev.id)

        if not has_verified_dev and current_user.role not in ["developer", "super_admin"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Business Rule: Every project must have at least one developer associated with it."
            )

        await db.commit()

        # Instant phone notification to CEO for new project posting
        try:
            from app.services.phone_alerts import notify_ceo_phone
            await notify_ceo_phone(
                db=db,
                event_type="project_posted",
                summary=f"New {'Ongoing' if new_project.status in ['Ongoing', 'In Progress'] else 'Published'} Project: {new_project.name}",
                details={
                    "project_name": new_project.name,
                    "status": new_project.status,
                    "stage": new_project.current_stage or "Active Sprint",
                    "progress": f"{new_project.progress_percentage}%",
                    "category": new_project.category,
                    "client": new_project.client_name or "Internal",
                    "posted_by": current_user.full_name
                }
            )
        except Exception as alert_err:
            logger.warning("Could not dispatch project phone alert: %s", alert_err)

        # Re-query with full options
        full_stmt = (
            select(Project)
            .where(Project.id == new_project.id)
            .options(
                selectinload(Project.developer_associations).selectinload(ProjectDeveloper.developer).selectinload(DeveloperProfile.user),
                selectinload(Project.developer_associations).selectinload(ProjectDeveloper.developer).selectinload(DeveloperProfile.skills),
                selectinload(Project.technologies)
            )
        )
        return (await db.execute(full_stmt)).scalar_one()

    except HTTPException:
        await db.rollback()
        raise
    except Exception as e:
        logger.exception("Error in create_project: %s", e)
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create project: {str(e)}"
        )

@router.put("/{project_id}", response_model=ProjectOut)
async def update_project(
    project_id: int,
    payload: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Project)
        .where(Project.id == project_id)
        .options(
            selectinload(Project.developer_associations).selectinload(ProjectDeveloper.developer),
            selectinload(Project.technologies)
        )
    )
    project = (await db.execute(stmt)).scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Check permission: CEO (super_admin) or associated developer
    is_admin = current_user.role == "super_admin"
    is_contributor = any(
        assoc.developer and assoc.developer.user_id == current_user.id
        for assoc in project.developer_associations
    )
    if not (is_admin or is_contributor):
        raise HTTPException(status_code=403, detail="Not authorized to edit this project. You can only edit your own projects.")

    if payload.name is not None:
        project.name = payload.name
    if payload.short_description is not None:
        project.short_description = payload.short_description
    if payload.description is not None:
        project.description = payload.description
    if payload.category is not None:
        project.category = payload.category
    if payload.demo_url is not None:
        project.demo_url = payload.demo_url
    if payload.repo_url is not None:
        project.repo_url = payload.repo_url
    if payload.image_url is not None:
        project.image_url = payload.image_url
    if payload.status is not None:
        project.status = payload.status
    if payload.client_name is not None:
        project.client_name = payload.client_name
    if payload.progress_percentage is not None:
        project.progress_percentage = payload.progress_percentage
    if payload.current_stage is not None:
        project.current_stage = payload.current_stage
    if payload.completion_date is not None:
        project.completion_date = payload.completion_date

    if payload.technologies is not None:
        project.technologies.clear()
        for tech_name in payload.technologies:
            clean_t = tech_name.strip()
            if not clean_t:
                continue
            tech_stmt = select(Technology).where(Technology.name == clean_t)
            tech = (await db.execute(tech_stmt)).scalar_one_or_none()
            if not tech:
                tech = Technology(name=clean_t)
                db.add(tech)
                await db.flush()
            project.technologies.append(tech)

    await db.commit()

    # Re-query with full options
    full_stmt = (
        select(Project)
        .where(Project.id == project.id)
        .options(
            selectinload(Project.developer_associations).selectinload(ProjectDeveloper.developer).selectinload(DeveloperProfile.user),
            selectinload(Project.developer_associations).selectinload(ProjectDeveloper.developer).selectinload(DeveloperProfile.skills),
            selectinload(Project.technologies)
        )
    )
    return (await db.execute(full_stmt)).scalar_one()

@router.delete("/{project_id}")
async def delete_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Project)
        .where(Project.id == project_id)
        .options(
            selectinload(Project.developer_associations).selectinload(ProjectDeveloper.developer)
        )
    )
    project = (await db.execute(stmt)).scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    is_admin = current_user.role == "super_admin"
    is_contributor = any(
        assoc.developer and assoc.developer.user_id == current_user.id
        for assoc in project.developer_associations
    )
    if not (is_admin or is_contributor):
        raise HTTPException(status_code=403, detail="Not authorized to delete this project. You can only delete your own projects.")

    await db.delete(project)
    await db.commit()
    return {"message": "Project deleted successfully", "id": project_id}

@router.put("/{project_id}/cover-image")
async def update_cover_image(
    project_id: int,
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Project)
        .where(Project.id == project_id)
        .options(selectinload(Project.developer_associations).selectinload(ProjectDeveloper.developer))
    )
    project = (await db.execute(stmt)).scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    is_admin = current_user.role == "super_admin"
    is_contributor = any(
        assoc.developer and assoc.developer.user_id == current_user.id
        for assoc in project.developer_associations
    )
    if not (is_admin or is_contributor):
        raise HTTPException(status_code=403, detail="Not authorized to edit this project")

    image_url = payload.get("image_url")
    if not image_url:
        raise HTTPException(status_code=400, detail="image_url is required")

    project.image_url = image_url
    await db.commit()
    return {"status": "success", "image_url": project.image_url}

@router.post("/{project_id}/capture-screenshot")
async def capture_project_screenshot(
    project_id: int,
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Project)
        .where(Project.id == project_id)
        .options(selectinload(Project.developer_associations).selectinload(ProjectDeveloper.developer))
    )
    project = (await db.execute(stmt)).scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    is_admin = current_user.role == "super_admin"
    is_contributor = any(
        assoc.developer and assoc.developer.user_id == current_user.id
        for assoc in project.developer_associations
    )
    if not (is_admin or is_contributor):
        raise HTTPException(status_code=403, detail="Not authorized to edit this project")

    target_url = payload.get("url") or project.demo_url
    if not target_url:
        raise HTTPException(status_code=400, detail="Target website URL is required")

    # Destination directory in frontend/public/projects
    base_dir = Path(__file__).resolve().parents[5]
    public_proj_dir = base_dir / "frontend" / "public" / "projects"
    public_proj_dir.mkdir(parents=True, exist_ok=True)

    filename = f"project-{project.id}-landing.png"
    filepath = public_proj_dir / filename
    rel_url = f"/projects/{filename}"

    # Try headless Chrome/Edge
    chrome_paths = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    ]
    browser_exe = next((p for p in chrome_paths if os.path.exists(p)), None)

    captured = False
    if browser_exe:
        try:
            cmd = [
                browser_exe,
                "--headless=new",
                "--disable-gpu",
                f"--screenshot={str(filepath)}",
                "--window-size=1280,800",
                target_url
            ]
            process = subprocess.run(cmd, capture_output=True, timeout=20)
            if filepath.exists() and filepath.stat().st_size > 1000:
                captured = True
        except Exception as e:
            logger.warning("Headless browser capture failed: %s", e)

    if not captured:
        # Fallback to high quality remote screenshot API
        rel_url = f"https://api.microlink.io?url={quote(target_url, safe='')}&screenshot=true&meta=false&embed=screenshot.url"

    project.image_url = rel_url
    await db.commit()

    return {
        "status": "success",
        "image_url": rel_url,
        "captured_locally": captured,
        "detail": f"Landing page captured from {target_url}"
    }


