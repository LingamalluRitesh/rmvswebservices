from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models import CommunityChannel, CommunityMessage, User
from app.schemas import CommunityChannelOut, CommunityMessageCreate, CommunityMessageOut
from app.api.deps import get_current_user
from app.services.phone_alerts import notify_ceo_phone

router = APIRouter()

@router.get("/channels", response_model=List[CommunityChannelOut])
async def list_channels(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(CommunityChannel).order_by(CommunityChannel.id.asc())
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/channels/{channel_id}/messages", response_model=List[CommunityMessageOut])
async def get_channel_messages(
    channel_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify channel exists
    ch_stmt = select(CommunityChannel).where(CommunityChannel.id == channel_id)
    ch = (await db.execute(ch_stmt)).scalar_one_or_none()
    if not ch:
        raise HTTPException(status_code=404, detail="Channel not found")

    stmt = (
        select(CommunityMessage)
        .where(CommunityMessage.channel_id == channel_id)
        .options(selectinload(CommunityMessage.user))
        .order_by(CommunityMessage.created_at.asc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("/channels/{channel_id}/messages", response_model=CommunityMessageOut)
async def post_channel_message(
    channel_id: int,
    payload: CommunityMessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Only developers or CEO/super_admin can post in community channels
    if current_user.role not in ["super_admin", "developer"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Community channels are restricted to developers and leadership."
        )

    ch_stmt = select(CommunityChannel).where(CommunityChannel.id == channel_id)
    ch = (await db.execute(ch_stmt)).scalar_one_or_none()
    if not ch:
        raise HTTPException(status_code=404, detail="Channel not found")

    if ch.is_locked and current_user.role != "super_admin":
        raise HTTPException(status_code=403, detail="Channel is locked for replies.")

    new_msg = CommunityMessage(
        channel_id=channel_id,
        user_id=current_user.id,
        content=payload.content.strip()
    )
    db.add(new_msg)
    await db.commit()
    await db.refresh(new_msg)

    # Automatic alert to CEO's phone if message is from another user
    if current_user.role != "super_admin":
        await notify_ceo_phone(
            db=db,
            event_type="community_message",
            title=f"New Message in #{ch.name}",
            details=f"From {current_user.full_name} (@{current_user.username}): {payload.content.strip()[:180]}",
            customer_name=current_user.full_name,
            customer_phone=current_user.phone,
            customer_email=current_user.email,
            action_url="https://rmvswebservices.onrender.com/community"
        )

    # Re-query with user info
    full_stmt = (
        select(CommunityMessage)
        .where(CommunityMessage.id == new_msg.id)
        .options(selectinload(CommunityMessage.user))
    )
    return (await db.execute(full_stmt)).scalar_one()

@router.delete("/messages/{message_id}")
async def delete_channel_message(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(CommunityMessage).where(CommunityMessage.id == message_id)
    msg = (await db.execute(stmt)).scalar_one_or_none()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")

    # Author or CEO (super_admin) can delete
    if msg.user_id != current_user.id and current_user.role != "super_admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this message")

    await db.delete(msg)
    await db.commit()
    return {"status": "success", "detail": "Message deleted"}
