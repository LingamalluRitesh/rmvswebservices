from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, File, UploadFile, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, desc
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models import User, DeveloperProfile, Skill, ProjectDeveloper, Project
from app.schemas import DeveloperProfileOut, DeveloperProfileUpdate, ProjectOut, UserOut
from app.api.deps import get_current_user
from app.services.image_service import optimize_avatar_image

router = APIRouter()

@router.get("", response_model=List[DeveloperProfileOut])
async def list_developers(
    query: Optional[str] = Query(None, description="Search by name, title, or bio"),
    skill: Optional[str] = Query(None, description="Filter by skill"),
    availability: Optional[str] = Query(None, description="Filter by availability"),
    location: Optional[str] = Query(None, description="Filter by location"),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(DeveloperProfile)
        .join(DeveloperProfile.user)
        .where(
            User.is_active == True,
            User.status == "approved",
            User.is_verified == True,
            DeveloperProfile.is_public == True
        )
        .options(
            selectinload(DeveloperProfile.user),
            selectinload(DeveloperProfile.skills)
        )
        .order_by(
            User.is_verified.desc(),
            DeveloperProfile.views_count.desc(),
            DeveloperProfile.id.asc()
        )
    )

    if query:
        q_wildcard = f"%{query}%"
        stmt = stmt.where(
            or_(
                User.full_name.ilike(q_wildcard),
                User.username.ilike(q_wildcard),
                DeveloperProfile.title.ilike(q_wildcard),
                DeveloperProfile.short_bio.ilike(q_wildcard),
            )
        )
    
    if availability:
        stmt = stmt.where(DeveloperProfile.availability == availability)

    if location:
        stmt = stmt.where(DeveloperProfile.location.ilike(f"%{location}%"))

    result = await db.execute(stmt)
    profiles = result.scalars().all()

    if skill:
        skill_lower = skill.strip().lower()
        profiles = [p for p in profiles if any(s.name.lower() == skill_lower for s in p.skills)]

    return profiles

@router.get("/{username}")
async def get_developer_by_username(username: str, db: AsyncSession = Depends(get_db)):
    clean_username = username.strip().lower()
    stmt = (
        select(DeveloperProfile)
        .join(DeveloperProfile.user)
        .where(
            User.username == clean_username,
            User.is_active == True
        )
        .options(
            selectinload(DeveloperProfile.user),
            selectinload(DeveloperProfile.skills),
            selectinload(DeveloperProfile.project_associations).selectinload(ProjectDeveloper.project)
        )
    )
    result = await db.execute(stmt)
    profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(status_code=404, detail="Developer not found")

    # Increment view count
    profile.views_count += 1
    await db.commit()
    await db.refresh(profile)

    # Fetch projects this developer worked on
    proj_stmt = (
        select(Project)
        .join(Project.developer_associations)
        .where(
            ProjectDeveloper.developer_id == profile.id,
            Project.status == "Published"
        )
        .options(
            selectinload(Project.developer_associations).selectinload(ProjectDeveloper.developer).selectinload(DeveloperProfile.user),
            selectinload(Project.technologies)
        )
    )
    proj_result = await db.execute(proj_stmt)
    projects = proj_result.scalars().all()

    return {
        "profile": DeveloperProfileOut.model_validate(profile),
        "projects": [ProjectOut.model_validate(p) for p in projects]
    }

@router.put("/me", response_model=DeveloperProfileOut)
async def update_my_developer_profile(
    payload: DeveloperProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(DeveloperProfile)
        .where(DeveloperProfile.user_id == current_user.id)
        .options(
            selectinload(DeveloperProfile.user),
            selectinload(DeveloperProfile.skills)
        )
    )
    profile = (await db.execute(stmt)).scalar_one_or_none()

    if not profile:
        profile = DeveloperProfile(user_id=current_user.id)
        db.add(profile)
        await db.flush()

    # Update User fields if provided
    if payload.avatar_url is not None:
        profile.user.avatar_url = payload.avatar_url.strip() if payload.avatar_url.strip() else None
    if payload.full_name is not None and payload.full_name.strip():
        profile.user.full_name = payload.full_name.strip()
    if payload.phone is not None:
        profile.user.phone = payload.phone.strip() if payload.phone.strip() else None

    if payload.title is not None:
        profile.title = payload.title
    if payload.short_bio is not None:
        profile.short_bio = payload.short_bio
    if payload.bio is not None:
        profile.bio = payload.bio
    if payload.location is not None:
        profile.location = payload.location
    if payload.availability is not None:
        profile.availability = payload.availability
    if payload.years_experience is not None:
        profile.years_experience = payload.years_experience
    if payload.github_url is not None:
        profile.github_url = payload.github_url
    if payload.linkedin_url is not None:
        profile.linkedin_url = payload.linkedin_url
    if payload.portfolio_url is not None:
        profile.portfolio_url = payload.portfolio_url
    if payload.resume_url is not None:
        profile.resume_url = payload.resume_url
    if payload.is_public is not None:
        profile.is_public = payload.is_public

    if payload.skills is not None:
        profile.skills.clear()
        for skill_name in payload.skills:
            clean_s = skill_name.strip()
            if not clean_s:
                continue
            skill_stmt = select(Skill).where(Skill.name == clean_s)
            skill = (await db.execute(skill_stmt)).scalar_one_or_none()
            if not skill:
                skill = Skill(name=clean_s)
                db.add(skill)
                await db.flush()
            profile.skills.append(skill)

    await db.commit()
    reloaded_stmt = (
        select(DeveloperProfile)
        .where(DeveloperProfile.id == profile.id)
        .options(
            selectinload(DeveloperProfile.user),
            selectinload(DeveloperProfile.skills)
        )
    )
    return (await db.execute(reloaded_stmt)).scalar_one()

@router.post("/me/avatar")
async def upload_developer_avatar(
    file: Optional[UploadFile] = File(None),
    avatar_data: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload and optimize developer profile photo from device or web.
    Auto-resizes to square, encodes as high-efficiency WebP, and auto-syncs across all devices.
    """
    stmt = (
        select(DeveloperProfile)
        .where(DeveloperProfile.user_id == current_user.id)
        .options(selectinload(DeveloperProfile.user))
    )
    profile = (await db.execute(stmt)).scalar_one_or_none()
    if not profile:
        profile = DeveloperProfile(user_id=current_user.id)
        db.add(profile)
        await db.flush()

    new_avatar_url: Optional[str] = None

    if file and file.filename:
        file_bytes = await file.read()
        try:
            new_avatar_url = optimize_avatar_image(file_bytes)
        except ValueError as ve:
            raise HTTPException(status_code=400, detail=str(ve))
    elif avatar_data and avatar_data.strip():
        val = avatar_data.strip()
        if val.startswith("data:image/"):
            new_avatar_url = val
        elif val.startswith("http://") or val.startswith("https://"):
            new_avatar_url = val
        else:
            raise HTTPException(status_code=400, detail="Invalid image format. Expected file upload or valid image URL.")
    else:
        raise HTTPException(status_code=400, detail="No image file or image data provided")

    # Update in both user model and profile relationship
    current_user.avatar_url = new_avatar_url
    if profile.user:
        profile.user.avatar_url = new_avatar_url

    await db.commit()

    return {
        "success": True,
        "avatar_url": new_avatar_url,
        "message": "Developer profile picture updated and synchronized across all devices successfully"
    }

@router.delete("/me/avatar")
async def delete_developer_avatar(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Remove profile photo and revert to initials.
    """
    stmt = (
        select(DeveloperProfile)
        .where(DeveloperProfile.user_id == current_user.id)
        .options(selectinload(DeveloperProfile.user))
    )
    profile = (await db.execute(stmt)).scalar_one_or_none()
    current_user.avatar_url = None
    if profile and profile.user:
        profile.user.avatar_url = None

    await db.commit()
    return {
        "success": True,
        "avatar_url": None,
        "message": "Developer profile picture removed successfully"
    }
