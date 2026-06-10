from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import QuizSession, QuizAnswer
from auth_utils import get_current_user

router = APIRouter()


@router.get("/overview")
def get_overview(
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sessions = (
        db.query(QuizSession)
        .filter(QuizSession.user_id == user_id)
        .all()
    )

    total_questions = sum(s.questions_answered for s in sessions)
    total_correct = sum(s.correct_answers for s in sessions)

    by_exam = {}
    for s in sessions:
        exam = s.exam_type
        if exam not in by_exam:
            by_exam[exam] = {"sessions": 0, "questions": 0, "correct": 0, "subjects": {}}
        by_exam[exam]["sessions"] += 1
        by_exam[exam]["questions"] += s.questions_answered
        by_exam[exam]["correct"] += s.correct_answers

        subj = s.subject
        if subj not in by_exam[exam]["subjects"]:
            by_exam[exam]["subjects"][subj] = {"questions": 0, "correct": 0}
        by_exam[exam]["subjects"][subj]["questions"] += s.questions_answered
        by_exam[exam]["subjects"][subj]["correct"] += s.correct_answers

    for exam in by_exam:
        q = by_exam[exam]["questions"]
        c = by_exam[exam]["correct"]
        by_exam[exam]["accuracy"] = round(c / q * 100) if q > 0 else 0
        for subj in by_exam[exam]["subjects"]:
            sq = by_exam[exam]["subjects"][subj]["questions"]
            sc = by_exam[exam]["subjects"][subj]["correct"]
            by_exam[exam]["subjects"][subj]["accuracy"] = round(sc / sq * 100) if sq > 0 else 0

    return {
        "total_sessions": len(sessions),
        "total_questions": total_questions,
        "total_correct": total_correct,
        "overall_accuracy": round(total_correct / total_questions * 100) if total_questions > 0 else 0,
        "by_exam": by_exam,
    }


@router.get("/recent")
def get_recent_sessions(
    limit: int = 10,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sessions = (
        db.query(QuizSession)
        .filter(QuizSession.user_id == user_id)
        .order_by(QuizSession.started_at.desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "id": s.id,
            "exam_type": s.exam_type,
            "subject": s.subject,
            "topic": s.topic,
            "questions_answered": s.questions_answered,
            "correct_answers": s.correct_answers,
            "accuracy": (
                round(s.correct_answers / s.questions_answered * 100)
                if s.questions_answered > 0
                else 0
            ),
            "final_difficulty": s.current_difficulty,
            "started_at": s.started_at.isoformat(),
        }
        for s in sessions
    ]


@router.get("/weak-areas")
def get_weak_areas(
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    answers = (
        db.query(QuizAnswer)
        .join(QuizSession)
        .filter(QuizSession.user_id == user_id)
        .all()
    )

    topic_stats = {}
    for ans in answers:
        t = ans.topic
        if t not in topic_stats:
            topic_stats[t] = {"total": 0, "correct": 0}
        topic_stats[t]["total"] += 1
        if ans.is_correct:
            topic_stats[t]["correct"] += 1

    weak = []
    for topic, stats in topic_stats.items():
        if stats["total"] >= 3:
            acc = round(stats["correct"] / stats["total"] * 100)
            if acc < 60:
                weak.append({
                    "topic": topic,
                    "accuracy": acc,
                    "questions_attempted": stats["total"],
                })

    weak.sort(key=lambda x: x["accuracy"])
    return {"weak_areas": weak[:10]}
