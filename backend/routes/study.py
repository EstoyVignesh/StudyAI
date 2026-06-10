from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel
from typing import Optional
from database import get_db
from models import TopicProgress
from auth_utils import get_current_user
from ai.lessons import stream_lesson
from exam_content import EXAM_CONTENT

router = APIRouter()


@router.get("/{exam_type}/{subject}/topics")
def get_topics(
    exam_type: str,
    subject: str,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    exam = EXAM_CONTENT.get(exam_type.upper())
    if not exam:
        return {"topics": []}

    topics = exam["subjects"].get(subject, [])
    completed = db.query(TopicProgress).filter(
        TopicProgress.user_id == user_id,
        TopicProgress.exam_type == exam_type.upper(),
        TopicProgress.subject == subject,
    ).all()
    completed_map = {p.topic: p.quiz_score for p in completed}

    return {
        "topics": [
            {"name": t, "completed": t in completed_map, "score": completed_map.get(t)}
            for t in topics
        ]
    }


@router.get("/{exam_type}/{subject}/{topic}/lesson")
async def get_lesson(
    exam_type: str,
    subject: str,
    topic: str,
    language: str = Query("english"),
    user_id: int = Depends(get_current_user),
):
    async def generate():
        async for chunk in stream_lesson(exam_type, subject, topic, language):
            yield chunk

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


class CompleteTopicRequest(BaseModel):
    exam_type: str
    subject: str
    topic: str
    quiz_score: Optional[int] = None


@router.post("/complete")
def complete_topic(
    req: CompleteTopicRequest,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing = db.query(TopicProgress).filter(
        TopicProgress.user_id == user_id,
        TopicProgress.exam_type == req.exam_type.upper(),
        TopicProgress.subject == req.subject,
        TopicProgress.topic == req.topic,
    ).first()

    if existing:
        if req.quiz_score is not None:
            existing.quiz_score = req.quiz_score
        existing.completed_at = datetime.utcnow()
    else:
        db.add(TopicProgress(
            user_id=user_id,
            exam_type=req.exam_type.upper(),
            subject=req.subject,
            topic=req.topic,
            quiz_score=req.quiz_score,
        ))
    db.commit()
    return {"ok": True}


@router.get("/progress/{exam_type}")
def get_progress(
    exam_type: str,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = db.query(TopicProgress).filter(
        TopicProgress.user_id == user_id,
        TopicProgress.exam_type == exam_type.upper(),
    ).all()
    return [
        {"subject": r.subject, "topic": r.topic, "score": r.quiz_score}
        for r in rows
    ]
