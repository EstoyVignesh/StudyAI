from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db
from models import ChatSession, ChatMessage, User
from auth_utils import get_current_user
from ai.tutor import stream_tutor_response

router = APIRouter()


class CreateSessionRequest(BaseModel):
    exam_type: str
    subject: Optional[str] = None
    title: Optional[str] = None


class SendMessageRequest(BaseModel):
    session_id: int
    content: str


@router.post("/session")
def create_session(
    req: CreateSessionRequest,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = ChatSession(
        user_id=user_id,
        exam_type=req.exam_type.upper(),
        subject=req.subject,
        title=req.title or f"{req.exam_type} Study Session",
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return {"session_id": session.id, "title": session.title}


@router.get("/sessions")
def list_sessions(
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sessions = (
        db.query(ChatSession)
        .filter(ChatSession.user_id == user_id)
        .order_by(ChatSession.created_at.desc())
        .limit(20)
        .all()
    )
    return [
        {
            "id": s.id,
            "exam_type": s.exam_type,
            "subject": s.subject,
            "title": s.title,
            "created_at": s.created_at.isoformat(),
            "message_count": len(s.messages),
        }
        for s in sessions
    ]


@router.get("/session/{session_id}/messages")
def get_messages(
    session_id: int,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == user_id,
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return [
        {"role": m.role, "content": m.content, "id": m.id}
        for m in session.messages
    ]


@router.post("/chat")
async def chat(
    req: SendMessageRequest,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = db.query(ChatSession).filter(
        ChatSession.id == req.session_id,
        ChatSession.user_id == user_id,
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    user_message = ChatMessage(
        session_id=req.session_id,
        role="user",
        content=req.content,
    )
    db.add(user_message)
    db.commit()

    history = [
        {"role": m.role, "content": m.content}
        for m in session.messages
        if m.id != user_message.id
    ]
    history.append({"role": "user", "content": req.content})

    user = db.query(User).filter(User.id == user_id).first()
    language = user.language_preference if user else "english"

    full_response = []

    async def generate():
        async for chunk in stream_tutor_response(
            exam_type=session.exam_type,
            messages=history,
            subject=session.subject,
            language=language,
        ):
            if chunk != "data: [DONE]\n\n":
                text = chunk[6:]
                full_response.append(text)
            yield chunk

        assistant_content = "".join(full_response).strip()
        if assistant_content:
            assistant_msg = ChatMessage(
                session_id=req.session_id,
                role="assistant",
                content=assistant_content,
            )
            db.add(assistant_msg)
            db.commit()

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
