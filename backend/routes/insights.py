from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
from database import get_db
from models import InsightCache, User
from auth_utils import get_current_user
from ai.insights import stream_recurring_questions, stream_high_yield_topics
from exam_content import EXAM_CONTENT

router = APIRouter()

CACHE_TTL_DAYS = 7


def _cache_key(exam_type: str, subject: str, insight_type: str, language: str) -> str:
    return f"{exam_type.upper()}|{subject}|{insight_type}|{language}"


def _get_cached(db: Session, key: str) -> Optional[str]:
    row = db.query(InsightCache).filter(InsightCache.cache_key == key).first()
    if row and row.expires_at > datetime.utcnow():
        return row.content
    return None


def _set_cache(db: Session, key: str, content: str):
    existing = db.query(InsightCache).filter(InsightCache.cache_key == key).first()
    expires = datetime.utcnow() + timedelta(days=CACHE_TTL_DAYS)
    if existing:
        existing.content = content
        existing.expires_at = expires
    else:
        db.add(InsightCache(cache_key=key, content=content, expires_at=expires))
    db.commit()


@router.get("/{exam_type}/subjects")
def get_subjects(exam_type: str, user_id: int = Depends(get_current_user)):
    exam = EXAM_CONTENT.get(exam_type.upper())
    if not exam:
        return []
    return list(exam["subjects"].keys())


@router.get("/{exam_type}/recurring")
async def recurring_questions(
    exam_type: str,
    subject: str = Query(...),
    language: str = Query("english"),
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    key = _cache_key(exam_type, subject, "recurring", language)
    cached = _get_cached(db, key)

    if cached:
        async def serve_cache():
            chunk_size = 200
            for i in range(0, len(cached), chunk_size):
                yield f"data: {cached[i:i+chunk_size]}\n\n"
            yield "data: [DONE]\n\n"
        return StreamingResponse(
            serve_cache(),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
        )

    collected = []

    async def generate():
        async for chunk in stream_recurring_questions(exam_type, subject, language):
            if chunk != "data: [DONE]\n\n":
                collected.append(chunk[6:])
            yield chunk
        if collected:
            _set_cache(db, key, "".join(collected))

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.get("/{exam_type}/high-yield")
async def high_yield_topics(
    exam_type: str,
    subject: str = Query(...),
    language: str = Query("english"),
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    key = _cache_key(exam_type, subject, "high_yield", language)
    cached = _get_cached(db, key)

    if cached:
        async def serve_cache():
            chunk_size = 200
            for i in range(0, len(cached), chunk_size):
                yield f"data: {cached[i:i+chunk_size]}\n\n"
            yield "data: [DONE]\n\n"
        return StreamingResponse(
            serve_cache(),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
        )

    collected = []

    async def generate():
        async for chunk in stream_high_yield_topics(exam_type, subject, language):
            if chunk != "data: [DONE]\n\n":
                collected.append(chunk[6:])
            yield chunk
        if collected:
            _set_cache(db, key, "".join(collected))

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.delete("/{exam_type}/cache")
def clear_cache(
    exam_type: str,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    deleted = (
        db.query(InsightCache)
        .filter(InsightCache.cache_key.like(f"{exam_type.upper()}|%"))
        .delete(synchronize_session=False)
    )
    db.commit()
    return {"deleted": deleted}
