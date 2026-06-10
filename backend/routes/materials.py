from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from database import get_db
from models import StudyMaterial
from auth_utils import get_current_user

router = APIRouter()


@router.get("/")
def list_materials(
    exam_type: Optional[str] = None,
    subject: Optional[str] = None,
    year: Optional[int] = None,
    material_type: Optional[str] = None,
    language: Optional[str] = None,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(StudyMaterial)
    if exam_type:
        q = q.filter(StudyMaterial.exam_type == exam_type.upper())
    if subject:
        q = q.filter(StudyMaterial.subject.ilike(f"%{subject}%"))
    if year:
        q = q.filter(StudyMaterial.year == year)
    if material_type:
        q = q.filter(StudyMaterial.material_type == material_type)
    if language:
        q = q.filter(StudyMaterial.language == language)

    materials = q.order_by(StudyMaterial.exam_type, StudyMaterial.year.desc()).all()
    return [_serialize(m) for m in materials]


@router.get("/by-exam/{exam_type}")
def get_by_exam(
    exam_type: str,
    language: Optional[str] = None,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(StudyMaterial).filter(
        StudyMaterial.exam_type == exam_type.upper()
    )
    if language:
        q = q.filter(StudyMaterial.language == language)

    materials = q.order_by(StudyMaterial.subject, StudyMaterial.year.desc()).all()

    # Group by subject
    grouped: dict = {}
    for m in materials:
        subj = m.subject
        if subj not in grouped:
            grouped[subj] = []
        grouped[subj].append(_serialize(m))

    return {
        "exam_type": exam_type.upper(),
        "total": len(materials),
        "by_subject": grouped,
    }


@router.get("/years/{exam_type}")
def get_years(
    exam_type: str,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from sqlalchemy import distinct
    years = (
        db.query(distinct(StudyMaterial.year))
        .filter(StudyMaterial.exam_type == exam_type.upper())
        .filter(StudyMaterial.year.isnot(None))
        .order_by(StudyMaterial.year.desc())
        .all()
    )
    return [y[0] for y in years]


def _serialize(m: StudyMaterial) -> dict:
    return {
        "id": m.id,
        "exam_type": m.exam_type,
        "subject": m.subject,
        "title": m.title,
        "year": m.year,
        "material_type": m.material_type,
        "url": m.url,
        "language": m.language,
        "tags": m.tags or [],
        "is_official": m.is_official,
    }
