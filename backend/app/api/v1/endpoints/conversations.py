from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models import Conversation, ConversationMember, Message, User
from app.schemas import MessageCreate, MessageOut, UserBrief
from app.api.deps import get_current_user
from app.services.phone_alerts import notify_ceo_phone

router = APIRouter()

@router.get("")
async def list_user_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Find all conversation IDs where current user is a member
    member_stmt = select(ConversationMember.conversation_id).where(ConversationMember.user_id == current_user.id)
    conv_ids = (await db.execute(member_stmt)).scalars().all()

    if not conv_ids:
        return []

    stmt = (
        select(Conversation)
        .where(Conversation.id.in_(conv_ids))
        .options(
            selectinload(Conversation.members).selectinload(ConversationMember.user),
            selectinload(Conversation.messages).selectinload(Message.sender)
        )
        .order_by(Conversation.updated_at.desc())
    )
    result = await db.execute(stmt)
    conversations = result.scalars().all()

    resp = []
    for c in conversations:
        other_members = [
            UserBrief.model_validate(m.user) for m in c.members if m.user_id != current_user.id
        ]
        last_msg = c.messages[-1] if c.messages else None
        resp.append({
            "id": c.id,
            "inquiry_id": c.inquiry_id,
            "created_at": c.created_at,
            "updated_at": c.updated_at,
            "other_members": other_members,
            "last_message": MessageOut.model_validate(last_msg) if last_msg else None
        })
    return resp

@router.post("/start/{target_user_id}")
async def start_or_get_conversation(
    target_user_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if target_user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot start a conversation with yourself")

    target_user = (await db.execute(select(User).where(User.id == target_user_id))).scalar_one_or_none()
    if not target_user:
        raise HTTPException(status_code=404, detail="Target user not found")

    # Find existing conversation between both
    stmt1 = select(ConversationMember.conversation_id).where(ConversationMember.user_id == current_user.id)
    ids1 = set((await db.execute(stmt1)).scalars().all())

    stmt2 = select(ConversationMember.conversation_id).where(ConversationMember.user_id == target_user_id)
    ids2 = set((await db.execute(stmt2)).scalars().all())

    common = ids1.intersection(ids2)
    if common:
        conv_id = list(common)[0]
        return {"id": conv_id, "is_new": False}

    # Create new
    conv = Conversation()
    db.add(conv)
    await db.flush()

    m1 = ConversationMember(conversation_id=conv.id, user_id=current_user.id)
    m2 = ConversationMember(conversation_id=conv.id, user_id=target_user_id)
    db.add_all([m1, m2])
    await db.commit()

    return {"id": conv.id, "is_new": True}

@router.get("/{conversation_id}/messages", response_model=List[MessageOut])
async def get_messages(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Check membership
    mem_stmt = select(ConversationMember).where(
        ConversationMember.conversation_id == conversation_id,
        ConversationMember.user_id == current_user.id
    )
    membership = (await db.execute(mem_stmt)).scalar_one_or_none()
    if not membership and current_user.role != "super_admin":
        raise HTTPException(status_code=403, detail="Not authorized to view this conversation")

    stmt = (
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .options(selectinload(Message.sender))
        .order_by(Message.created_at.asc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("/{conversation_id}/messages", response_model=MessageOut)
async def send_message(
    conversation_id: int,
    payload: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    mem_stmt = select(ConversationMember).where(
        ConversationMember.conversation_id == conversation_id,
        ConversationMember.user_id == current_user.id
    )
    membership = (await db.execute(mem_stmt)).scalar_one_or_none()
    if not membership:
        raise HTTPException(status_code=403, detail="Not a member of this conversation")

    new_msg = Message(
        conversation_id=conversation_id,
        sender_id=current_user.id,
        content=payload.content.strip()
    )
    db.add(new_msg)

    # Touch conversation updated_at
    conv = (await db.execute(select(Conversation).where(Conversation.id == conversation_id))).scalar_one()
    conv.updated_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(new_msg)

    # Automatic alert to CEO's phone if sender is not super_admin
    if current_user.role != "super_admin":
        await notify_ceo_phone(
            db=db,
            event_type="direct_message",
            title="New Direct Message Received",
            details=f"From {current_user.full_name} (@{current_user.username}): {payload.content.strip()[:180]}",
            customer_name=current_user.full_name,
            customer_phone=current_user.phone,
            customer_email=current_user.email,
            action_url="https://rmvswebservices.onrender.com/messages"
        )

    full_stmt = select(Message).where(Message.id == new_msg.id).options(selectinload(Message.sender))
    return (await db.execute(full_stmt)).scalar_one()
