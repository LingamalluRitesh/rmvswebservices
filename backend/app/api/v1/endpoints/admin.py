from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.core.security import get_password_hash
from app.models import (
    User, DeveloperProfile, ClientProfile, Project, ProjectDeveloper, ClientInquiry,
    CommunityChannel, Notification, Skill, ActivityLog
)
from app.schemas import (
    DashboardStatsOut, DeveloperProfileOut, DeveloperApprovalRequest,
    ClientInquiryOut, ProjectOut, AdminUserOut, AdminUserUpdate,
    DeveloperCreateByAdmin, ActivityLogOut
)
from app.api.deps import get_current_admin

router = APIRouter()

@router.get("/stats", response_model=DashboardStatsOut)
async def get_admin_dashboard_stats(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    total_devs = await db.scalar(select(func.count(User.id)).where(User.role == "developer")) or 0
    active_devs = await db.scalar(select(func.count(User.id)).where(User.role == "developer", User.is_active == True, User.status == "approved")) or 0
    total_projects = await db.scalar(select(func.count(Project.id))) or 0
    completed_projects = await db.scalar(select(func.count(Project.id)).where(Project.status.in_(["Completed", "Live"]))) or 0
    total_clients = await db.scalar(select(func.count(User.id)).where(User.role == "client")) or 0
    open_inquiries = await db.scalar(select(func.count(ClientInquiry.id)).where(ClientInquiry.status.notin_(["Completed", "Closed"]))) or 0
    
    # Real views count directly from database
    developer_views = await db.scalar(select(func.sum(DeveloperProfile.views_count))) or 0
    project_views = developer_views # Or trackable metric

    # 10 recent activity logs
    recent_logs = (
        await db.execute(
            select(ActivityLog)
            .options(selectinload(ActivityLog.user))
            .order_by(ActivityLog.created_at.desc())
            .limit(10)
        )
    ).scalars().all()

    return DashboardStatsOut(
        total_developers=total_devs,
        active_developers=active_devs,
        total_projects=total_projects,
        completed_projects=completed_projects,
        total_clients=total_clients,
        open_inquiries=open_inquiries,
        project_views=project_views,
        developer_views=developer_views,
        recent_activity=[ActivityLogOut.model_validate(l) for l in recent_logs]
    )

@router.get("/developers")
async def list_all_developers_for_ceo(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(User)
        .where(User.role == "developer")
        .options(
            selectinload(User.developer_profile).selectinload(DeveloperProfile.skills)
        )
        .order_by(User.id.asc())
    )
    devs = (await db.execute(stmt)).scalars().all()
    output = []
    for d in devs:
        prof = d.developer_profile
        skills_list = [{"id": s.id, "name": s.name} for s in prof.skills] if prof and prof.skills else []
        output.append({
            # Top-level user fields
            "id": d.id,
            "user_id": d.id,
            "username": d.username,
            "full_name": d.full_name,
            "email": d.email,
            "phone": d.phone,
            "role": d.role,
            "status": d.status,
            "is_active": d.is_active,
            "is_verified": d.is_verified,
            "avatar_url": d.avatar_url,
            "created_at": d.created_at.isoformat() if d.created_at else None,

            # Top-level developer profile fields
            "profile_id": prof.id if prof else None,
            "title": prof.title if prof and prof.title else "Software Engineer",
            "department": prof.department if prof and prof.department else "Core Engineering",
            "short_bio": prof.short_bio if prof else None,
            "bio": prof.bio if prof else None,
            "location": prof.location if prof else None,
            "availability": prof.availability if prof and prof.availability else "Available for Projects",
            "years_experience": prof.years_experience if prof and prof.years_experience is not None else 1,
            "github_url": prof.github_url if prof else None,
            "linkedin_url": prof.linkedin_url if prof else None,
            "portfolio_url": prof.portfolio_url if prof else None,
            "resume_url": prof.resume_url if prof else None,
            "skills": skills_list,

            # Nested developer_profile object
            "developer_profile": {
                "id": prof.id if prof else None,
                "user_id": d.id,
                "title": prof.title if prof and prof.title else "Software Engineer",
                "department": prof.department if prof and prof.department else "Core Engineering",
                "short_bio": prof.short_bio if prof else None,
                "bio": prof.bio if prof else None,
                "location": prof.location if prof else None,
                "availability": prof.availability if prof and prof.availability else "Available for Projects",
                "years_experience": prof.years_experience if prof and prof.years_experience is not None else 1,
                "github_url": prof.github_url if prof else None,
                "linkedin_url": prof.linkedin_url if prof else None,
                "portfolio_url": prof.portfolio_url if prof else None,
                "resume_url": prof.resume_url if prof else None,
                "skills": skills_list,
            } if prof else {
                "id": None,
                "user_id": d.id,
                "title": "Software Engineer",
                "department": "Core Engineering",
                "years_experience": 1,
                "skills": []
            },

            # Nested user object
            "user": {
                "id": d.id,
                "username": d.username,
                "full_name": d.full_name,
                "email": d.email,
                "phone": d.phone,
                "role": d.role,
                "status": d.status,
                "is_active": d.is_active,
                "is_verified": d.is_verified,
                "avatar_url": d.avatar_url,
            }
        })
    return output

@router.post("/developers", response_model=DeveloperProfileOut)
async def create_developer_by_ceo(
    payload: DeveloperCreateByAdmin,
    request: Request,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    # Check uniqueness
    existing = await db.execute(
        select(User).where(or_(User.email == payload.email, User.username == payload.username.strip().lower()))
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="A user with this email or username already exists")

    new_user = User(
        email=payload.email,
        username=payload.username.strip().lower(),
        full_name=payload.full_name,
        phone=payload.phone,
        hashed_password=get_password_hash(payload.password),
        role="developer",
        status="approved",
        is_active=True,
        is_verified=payload.is_verified
    )
    db.add(new_user)
    await db.flush()

    # Skills resolution
    skills_list = []
    if payload.skills:
        for s in payload.skills:
            clean_s = s.strip()
            if not clean_s: continue
            sk = (await db.execute(select(Skill).where(Skill.name.ilike(clean_s)))).scalar_one_or_none()
            if not sk:
                sk = Skill(name=clean_s, category="Engineering")
                db.add(sk)
                await db.flush()
            skills_list.append(sk)

    dev_profile = DeveloperProfile(
        user_id=new_user.id,
        title=payload.title,
        department=payload.department,
        short_bio=payload.short_bio,
        bio=payload.bio,
        location=payload.location,
        availability=payload.availability,
        years_experience=payload.years_experience,
        github_url=payload.github_url,
        linkedin_url=payload.linkedin_url,
        portfolio_url=payload.portfolio_url,
        is_public=True,
        skills=skills_list
    )
    db.add(dev_profile)

    # Activity log
    log = ActivityLog(
        user_id=admin.id,
        action="DEVELOPER_CREATED",
        entity_type="developer",
        entity_id=new_user.id,
        details=f"Developer {payload.full_name} (@{payload.username}) created by CEO with designation '{payload.title}'",
        ip_address=request.client.host if request.client else None
    )
    db.add(log)

    await db.commit()

    # Reload with relations
    reloaded = (
        await db.execute(
            select(DeveloperProfile)
            .where(DeveloperProfile.id == dev_profile.id)
            .options(selectinload(DeveloperProfile.user), selectinload(DeveloperProfile.skills))
        )
    ).scalar_one()

    return reloaded

@router.get("/users", response_model=List[AdminUserOut])
async def list_all_users_for_admin(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(User)
        .options(
            selectinload(User.developer_profile).selectinload(DeveloperProfile.skills),
            selectinload(User.client_profile)
        )
        .order_by(User.id.asc())
    )
    users = (await db.execute(stmt)).scalars().all()

    counts_stmt = (
        select(ProjectDeveloper.developer_id, func.count(ProjectDeveloper.project_id))
        .group_by(ProjectDeveloper.developer_id)
    )
    counts_res = await db.execute(counts_stmt)
    proj_counts = {r[0]: r[1] for r in counts_res.all()}

    output = []
    for u in users:
        dev_p_id = u.developer_profile.id if u.developer_profile else None
        p_count = proj_counts.get(dev_p_id, 0) if dev_p_id else 0
        u_out = AdminUserOut.model_validate(u)
        u_out.projects_count = p_count
        output.append(u_out)

    return output

@router.get("/users/{user_id}", response_model=AdminUserOut)
async def get_user_detail_for_admin(
    user_id: int,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(User)
        .where(User.id == user_id)
        .options(
            selectinload(User.developer_profile).selectinload(DeveloperProfile.skills),
            selectinload(User.client_profile)
        )
    )
    user = (await db.execute(stmt)).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    p_count = 0
    if user.developer_profile:
        cnt_stmt = select(func.count(ProjectDeveloper.project_id)).where(ProjectDeveloper.developer_id == user.developer_profile.id)
        p_count = (await db.scalar(cnt_stmt)) or 0

    u_out = AdminUserOut.model_validate(user)
    u_out.projects_count = p_count
    return u_out

@router.put("/users/{user_id}", response_model=AdminUserOut)
async def update_user_by_admin(
    user_id: int,
    payload: AdminUserUpdate,
    request: Request,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(User)
        .where(User.id == user_id)
        .options(
            selectinload(User.developer_profile).selectinload(DeveloperProfile.skills),
            selectinload(User.client_profile)
        )
    )
    user = (await db.execute(stmt)).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    changes = []
    # Update User core properties
    if payload.full_name is not None and payload.full_name.strip():
        user.full_name = payload.full_name.strip()
        changes.append("full_name")
    if payload.phone is not None:
        user.phone = payload.phone.strip() if payload.phone.strip() else None
    if payload.avatar_url is not None:
        user.avatar_url = payload.avatar_url.strip() if payload.avatar_url.strip() else None
        changes.append("avatar_url")
    if payload.password is not None and len(payload.password) >= 6:
        user.hashed_password = get_password_hash(payload.password)
        changes.append("password_reset")
    if payload.role is not None and payload.role in ["super_admin", "developer", "client"]:
        user.role = payload.role
        changes.append(f"role={payload.role}")
    if payload.status is not None and payload.status in ["approved", "pending", "rejected", "suspended"]:
        user.status = payload.status
        changes.append(f"status={payload.status}")
    if payload.is_verified is not None:
        user.is_verified = payload.is_verified
        changes.append(f"is_verified={payload.is_verified}")
    if payload.is_active is not None:
        user.is_active = payload.is_active
        changes.append(f"is_active={payload.is_active}")

    # Update or create DeveloperProfile
    has_dev_fields = any([
        payload.title is not None,
        payload.department is not None,
        payload.short_bio is not None,
        payload.bio is not None,
        payload.location is not None,
        payload.availability is not None,
        payload.years_experience is not None,
        payload.skills is not None,
        payload.github_url is not None,
        payload.linkedin_url is not None,
        payload.portfolio_url is not None,
        payload.resume_url is not None,
        payload.cover_image_url is not None,
        payload.certificates is not None,
        payload.achievements is not None
    ])

    if has_dev_fields or user.role in ["developer", "super_admin"]:
        if not user.developer_profile:
            user.developer_profile = DeveloperProfile(user_id=user.id)
            db.add(user.developer_profile)
            await db.flush()

        dev_p = user.developer_profile
        if payload.title is not None:
            dev_p.title = payload.title
            changes.append(f"designation={payload.title}")
        if payload.department is not None:
            dev_p.department = payload.department
            changes.append(f"department={payload.department}")
        if payload.short_bio is not None:
            dev_p.short_bio = payload.short_bio
        if payload.bio is not None:
            dev_p.bio = payload.bio
        if payload.location is not None:
            dev_p.location = payload.location
        if payload.availability is not None:
            dev_p.availability = payload.availability
        if payload.years_experience is not None:
            dev_p.years_experience = payload.years_experience
        if payload.github_url is not None:
            dev_p.github_url = payload.github_url
        if payload.linkedin_url is not None:
            dev_p.linkedin_url = payload.linkedin_url
        if payload.portfolio_url is not None:
            dev_p.portfolio_url = payload.portfolio_url
        if payload.resume_url is not None:
            dev_p.resume_url = payload.resume_url
        if payload.cover_image_url is not None:
            dev_p.cover_image_url = payload.cover_image_url
        if payload.certificates is not None:
            dev_p.certificates = payload.certificates
        if payload.achievements is not None:
            dev_p.achievements = payload.achievements

        if payload.skills is not None:
            dev_p.skills.clear()
            for s_name in payload.skills:
                clean_s = s_name.strip()
                if not clean_s: continue
                skill_stmt = select(Skill).where(Skill.name.ilike(clean_s))
                skill = (await db.execute(skill_stmt)).scalar_one_or_none()
                if not skill:
                    skill = Skill(name=clean_s, category="Engineering")
                    db.add(skill)
                    await db.flush()
                dev_p.skills.append(skill)
            changes.append("skills")

    # Update or create ClientProfile
    if payload.company_name is not None or payload.website is not None or payload.industry is not None:
        if not user.client_profile:
            user.client_profile = ClientProfile(user_id=user.id)
            db.add(user.client_profile)
            await db.flush()
        if payload.company_name is not None:
            user.client_profile.company_name = payload.company_name
        if payload.website is not None:
            user.client_profile.website = payload.website
        if payload.industry is not None:
            user.client_profile.industry = payload.industry

    # Activity Log
    log = ActivityLog(
        user_id=admin.id,
        action="DEVELOPER_UPDATED" if user.role == "developer" else "USER_UPDATED",
        entity_type="user",
        entity_id=user.id,
        details=f"User {user.username} modified by CEO: {', '.join(changes) if changes else 'General update'}",
        ip_address=request.client.host if request.client else None
    )
    db.add(log)

    await db.commit()

    reloaded_stmt = (
        select(User)
        .where(User.id == user_id)
        .options(
            selectinload(User.developer_profile).selectinload(DeveloperProfile.skills),
            selectinload(User.client_profile)
        )
    )
    user_reloaded = (await db.execute(reloaded_stmt)).scalar_one()

    p_count = 0
    if user_reloaded.developer_profile:
        cnt_stmt = select(func.count(ProjectDeveloper.project_id)).where(ProjectDeveloper.developer_id == user_reloaded.developer_profile.id)
        p_count = (await db.scalar(cnt_stmt)) or 0

    u_out = AdminUserOut.model_validate(user_reloaded)
    u_out.projects_count = p_count
    return u_out

@router.delete("/users/{user_id}")
async def delete_user_by_admin(
    user_id: int,
    request: Request,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    if admin.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Security rule: The CEO cannot delete their own active account."
        )

    stmt = select(User).where(User.id == user_id)
    user = (await db.execute(stmt)).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    deleted_username = user.username
    deleted_fullname = user.full_name

    await db.delete(user)

    log = ActivityLog(
        user_id=admin.id,
        action="USER_DELETED",
        entity_type="user",
        entity_id=user_id,
        details=f"User {deleted_fullname} (@{deleted_username}) permanently deleted by CEO",
        ip_address=request.client.host if request.client else None
    )
    db.add(log)

    await db.commit()
    return {"status": "success", "message": f"User {deleted_username} deleted successfully", "user_id": user_id}

@router.get("/projects", response_model=List[ProjectOut])
async def list_all_projects_for_admin(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Project)
        .options(
            selectinload(Project.developer_associations).selectinload(ProjectDeveloper.developer).selectinload(DeveloperProfile.user),
            selectinload(Project.developer_associations).selectinload(ProjectDeveloper.developer).selectinload(DeveloperProfile.skills),
            selectinload(Project.technologies)
        )
        .order_by(Project.created_at.desc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/pending-developers", response_model=List[DeveloperProfileOut])
async def list_pending_developer_applications(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(DeveloperProfile)
        .join(DeveloperProfile.user)
        .where(User.role == "developer", User.status == "pending")
        .options(
            selectinload(DeveloperProfile.user),
            selectinload(DeveloperProfile.skills)
        )
    )
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("/developers/{developer_profile_id}/action")
async def review_developer_application(
    developer_profile_id: int,
    payload: DeveloperApprovalRequest,
    request: Request,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(DeveloperProfile)
        .join(DeveloperProfile.user)
        .where(DeveloperProfile.id == developer_profile_id)
        .options(selectinload(DeveloperProfile.user))
    )
    dev_profile = (await db.execute(stmt)).scalar_one_or_none()
    if not dev_profile or not dev_profile.user:
        raise HTTPException(status_code=404, detail="Developer application not found")

    user = dev_profile.user
    action_text = payload.action
    if payload.action == "approve":
        user.status = "approved"
        user.is_verified = True
        user.is_active = True
        notif = Notification(
            user_id=user.id,
            title="Profile Verified!",
            message=f"Congratulations {user.full_name}! Your developer profile has been approved and verified by CEO {admin.full_name}. You can now showcase projects and receive client inquiries.",
            type="approval",
            link=f"/developers/{user.username}"
        )
        db.add(notif)
    elif payload.action == "reject":
        user.status = "rejected"
        user.is_verified = False
        notif = Notification(
            user_id=user.id,
            title="Application Status",
            message=f"Thank you for applying. Your developer profile was not verified at this time. {payload.reason or ''}",
            type="rejection",
            link="/developer/dashboard"
        )
        db.add(notif)
    elif payload.action == "suspend":
        user.status = "suspended"
        user.is_active = False
    elif payload.action == "restore":
        user.status = "approved"
        user.is_active = True

    # Activity Log
    log = ActivityLog(
        user_id=admin.id,
        action=f"DEVELOPER_{payload.action.upper()}",
        entity_type="developer",
        entity_id=user.id,
        details=f"Developer {user.full_name} (@{user.username}) marked as '{payload.action}' by CEO",
        ip_address=request.client.host if request.client else None
    )
    db.add(log)

    await db.commit()
    return {"status": "success", "action": payload.action, "user_id": user.id}

@router.get("/inquiries", response_model=List[ClientInquiryOut])
async def list_all_inquiries(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(ClientInquiry)
        .options(
            selectinload(ClientInquiry.client),
            selectinload(ClientInquiry.developer).selectinload(DeveloperProfile.user),
            selectinload(ClientInquiry.developer).selectinload(DeveloperProfile.skills)
        )
        .order_by(ClientInquiry.created_at.desc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()


@router.put("/developers/{dev_id}/designation")
async def update_developer_designation(
    dev_id: int,
    payload: dict,
    request: Request,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    # dev_id can be developer_profile.id or user.id
    dev = (await db.execute(
        select(DeveloperProfile).where(DeveloperProfile.id == dev_id).options(selectinload(DeveloperProfile.user))
    )).scalar_one_or_none()
    if not dev:
        dev = (await db.execute(
            select(DeveloperProfile).where(DeveloperProfile.user_id == dev_id).options(selectinload(DeveloperProfile.user))
        )).scalar_one_or_none()
    if not dev:
        raise HTTPException(status_code=404, detail="Developer profile not found")

    new_title = payload.get("title")
    new_dept = payload.get("department")
    if new_title:
        dev.title = new_title
    if new_dept:
        dev.department = new_dept
    if "avatar_url" in payload:
        new_avatar = payload.get("avatar_url")
        if dev.user:
            dev.user.avatar_url = new_avatar.strip() if new_avatar and new_avatar.strip() else None

    log = ActivityLog(
        user_id=admin.id,
        action="DESIGNATION_UPDATED",
        entity_type="developer",
        entity_id=dev.id,
        details=f"CEO updated developer {dev.user.full_name if dev.user else dev.id} designation to '{new_title}' in '{new_dept}'",
        ip_address=request.client.host if request.client else None
    )
    db.add(log)
    await db.commit()
    await db.refresh(dev)

    return {
        "status": "success",
        "id": dev.id,
        "title": dev.title,
        "department": dev.department
    }

@router.put("/developers/{dev_id}/status")
async def update_developer_status(
    dev_id: int,
    payload: dict,
    request: Request,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    dev = (await db.execute(select(DeveloperProfile).where(DeveloperProfile.id == dev_id))).scalar_one_or_none()
    if dev:
        user = (await db.execute(select(User).where(User.id == dev.user_id))).scalar_one_or_none()
    else:
        user = (await db.execute(select(User).where(User.id == dev_id))).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if "status" in payload:
        user.status = payload["status"]
    if "is_active" in payload:
        user.is_active = payload["is_active"]
    if "is_verified" in payload:
        user.is_verified = payload["is_verified"]

    log = ActivityLog(
        user_id=admin.id,
        action="DEVELOPER_STATUS_UPDATED",
        entity_type="developer",
        entity_id=user.id,
        details=f"CEO updated status of {user.full_name} to '{user.status}' (active={user.is_active}, verified={user.is_verified})",
        ip_address=request.client.host if request.client else None
    )
    db.add(log)
    await db.commit()
    return {"status": "success", "user_status": user.status, "is_active": user.is_active, "is_verified": user.is_verified}

@router.put("/developers/{dev_id}/verify")
async def toggle_developer_verify(
    dev_id: int,
    request: Request,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    dev = (await db.execute(select(DeveloperProfile).where(DeveloperProfile.id == dev_id))).scalar_one_or_none()
    if dev:
        user = (await db.execute(select(User).where(User.id == dev.user_id))).scalar_one_or_none()
    else:
        user = (await db.execute(select(User).where(User.id == dev_id))).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Developer not found")

    user.is_verified = not user.is_verified
    action_str = "verified" if user.is_verified else "unverified"
    log = ActivityLog(
        user_id=admin.id,
        action="DEVELOPER_VERIFIED" if user.is_verified else "DEVELOPER_UNVERIFIED",
        entity_type="developer",
        entity_id=user.id,
        details=f"CEO {action_str} developer {user.full_name} (@{user.username})",
        ip_address=request.client.host if request.client else None
    )
    db.add(log)
    await db.commit()
    return {"status": "success", "is_verified": user.is_verified, "user_id": user.id}

@router.post("/developers/{dev_id}/approve")
async def approve_registered_developer(
    dev_id: int,
    request: Request,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    dev = (await db.execute(select(DeveloperProfile).where(DeveloperProfile.id == dev_id).options(selectinload(DeveloperProfile.user)))).scalar_one_or_none()
    if dev:
        user = dev.user
    else:
        user = (await db.execute(select(User).where(User.id == dev_id).options(selectinload(User.developer_profile)))).scalar_one_or_none()
        dev = user.developer_profile if user else None

    if not user:
        raise HTTPException(status_code=404, detail="Developer not found")

    user.status = "approved"
    user.is_verified = True
    user.is_active = True
    if dev:
        dev.is_public = True

    notif = Notification(
        user_id=user.id,
        title="Account Approved & Verified!",
        message=f"Congratulations {user.full_name}! Your developer application has been approved by CEO {admin.full_name}. Your profile is now live in the verified roster.",
        type="approval",
        link=f"/developers/{user.username}"
    )
    db.add(notif)

    log = ActivityLog(
        user_id=admin.id,
        action="DEVELOPER_APPROVED",
        entity_type="developer",
        entity_id=user.id,
        details=f"CEO approved and verified developer {user.full_name} (@{user.username}). Profile is now live.",
        ip_address=request.client.host if request.client else None
    )
    db.add(log)
    await db.commit()

    return {"status": "success", "message": f"{user.full_name} is now approved and verified on the public roster."}

@router.post("/developers/{dev_id}/reject")
async def reject_registered_developer(
    dev_id: int,
    request: Request,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    dev = (await db.execute(select(DeveloperProfile).where(DeveloperProfile.id == dev_id).options(selectinload(DeveloperProfile.user)))).scalar_one_or_none()
    if dev:
        user = dev.user
    else:
        user = (await db.execute(select(User).where(User.id == dev_id))).scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="Developer not found")

    user.status = "rejected"
    user.is_verified = False

    log = ActivityLog(
        user_id=admin.id,
        action="DEVELOPER_REJECTED",
        entity_type="developer",
        entity_id=user.id,
        details=f"CEO rejected developer application for {user.full_name} (@{user.username}).",
        ip_address=request.client.host if request.client else None
    )
    db.add(log)
    await db.commit()

    return {"status": "success", "message": f"Developer application for {user.full_name} has been rejected."}

@router.delete("/developers/{dev_id}")
async def delete_developer_direct(
    dev_id: int,
    request: Request,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    dev = (await db.execute(select(DeveloperProfile).where(DeveloperProfile.id == dev_id))).scalar_one_or_none()
    if dev:
        user = (await db.execute(select(User).where(User.id == dev.user_id))).scalar_one_or_none()
    else:
        user = (await db.execute(select(User).where(User.id == dev_id))).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Developer not found")

    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="CEO cannot delete own account")

    name = user.full_name
    await db.delete(user)
    log = ActivityLog(
        user_id=admin.id,
        action="DEVELOPER_DELETED",
        entity_type="developer",
        entity_id=dev_id,
        details=f"CEO permanently deleted developer {name}",
        ip_address=request.client.host if request.client else None
    )
    db.add(log)
    await db.commit()
    return {"status": "success", "detail": f"Developer {name} deleted"}

@router.post("/users/{user_id}/reset-password")
async def reset_user_password(
    user_id: int,
    payload: dict,
    request: Request,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    new_password = payload.get("new_password")
    if not new_password or len(new_password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 6 characters long."
        )

    user = (await db.execute(select(User).where(User.id == user_id))).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.hashed_password = get_password_hash(new_password)

    log = ActivityLog(
        user_id=admin.id,
        action="PASSWORD_RESET",
        entity_type="user",
        entity_id=user.id,
        details=f"CEO reset password for user {user.full_name} (@{user.username})",
        ip_address=request.client.host if request.client else None
    )
    db.add(log)
    await db.commit()

    return {
        "status": "success",
        "detail": f"Password for {user.full_name} has been reset successfully."
    }


