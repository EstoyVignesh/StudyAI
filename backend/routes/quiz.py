from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from database import get_db
from models import QuizSession, QuizAnswer
from auth_utils import get_current_user
from ai.question_generator import generate_question
from exam_content import EXAM_CONTENT

router = APIRouter()

CORRECT_STREAK_UP = 3
WRONG_STREAK_DOWN = 3


class StartSessionRequest(BaseModel):
    exam_type: str
    subject: str
    topic: str


class SubmitAnswerRequest(BaseModel):
    session_id: int
    question_text: str
    options: dict
    correct_answer: str
    user_answer: str
    difficulty: int
    topic: str
    explanation: str = ""


class SessionResponse(BaseModel):
    id: int
    exam_type: str
    subject: str
    topic: str
    current_difficulty: int
    questions_answered: int
    correct_answers: int

    class Config:
        from_attributes = True


@router.get("/exams")
def get_exams():
    return {
        exam: {
            "name": data["name"],
            "description": data["description"],
            "color": data["color"],
            "subjects": list(data["subjects"].keys()),
        }
        for exam, data in EXAM_CONTENT.items()
    }


@router.get("/exams/{exam_type}/subjects")
def get_subjects(exam_type: str):
    exam = EXAM_CONTENT.get(exam_type.upper())
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    return {
        "exam_type": exam_type,
        "subjects": {
            subject: topics
            for subject, topics in exam["subjects"].items()
        },
    }


@router.post("/session/start", response_model=SessionResponse)
def start_session(
    req: StartSessionRequest,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    exam_type = req.exam_type.upper()
    if exam_type not in EXAM_CONTENT:
        raise HTTPException(status_code=400, detail="Invalid exam type")

    session = QuizSession(
        user_id=user_id,
        exam_type=exam_type,
        subject=req.subject,
        topic=req.topic,
        current_difficulty=3,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return SessionResponse.model_validate(session)


@router.get("/session/{session_id}/question")
async def get_question(
    session_id: int,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = db.query(QuizSession).filter(
        QuizSession.id == session_id,
        QuizSession.user_id == user_id,
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    try:
        question = await generate_question(
            exam_type=session.exam_type,
            subject=session.subject,
            topic=session.topic,
            difficulty=session.current_difficulty,
        )
        question["session_id"] = session_id
        question["current_difficulty"] = session.current_difficulty
        question["questions_answered"] = session.questions_answered
        question["correct_answers"] = session.correct_answers
        question["accuracy"] = (
            round(session.correct_answers / session.questions_answered * 100)
            if session.questions_answered > 0
            else 0
        )
        return question
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate question: {str(e)}")


@router.post("/session/answer")
def submit_answer(
    req: SubmitAnswerRequest,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = db.query(QuizSession).filter(
        QuizSession.id == req.session_id,
        QuizSession.user_id == user_id,
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    is_correct = req.user_answer.upper() == req.correct_answer.upper()

    answer = QuizAnswer(
        session_id=req.session_id,
        question_text=req.question_text,
        correct_answer=req.correct_answer,
        user_answer=req.user_answer,
        is_correct=is_correct,
        difficulty=req.difficulty,
        topic=req.topic,
        explanation=req.explanation,
    )
    db.add(answer)

    session.questions_answered += 1
    if is_correct:
        session.correct_answers += 1
        session.streak += 1
        if session.streak >= CORRECT_STREAK_UP and session.current_difficulty < 5:
            session.current_difficulty += 1
            session.streak = 0
    else:
        session.streak = max(0, session.streak - 1)
        wrong_streak = session.questions_answered - session.correct_answers
        recent_answers = (
            db.query(QuizAnswer)
            .filter(QuizAnswer.session_id == req.session_id)
            .order_by(QuizAnswer.id.desc())
            .limit(WRONG_STREAK_DOWN)
            .all()
        )
        if (
            len(recent_answers) >= WRONG_STREAK_DOWN
            and all(not a.is_correct for a in recent_answers)
            and session.current_difficulty > 1
        ):
            session.current_difficulty -= 1

    db.commit()

    return {
        "is_correct": is_correct,
        "correct_answer": req.correct_answer,
        "explanation": req.explanation,
        "new_difficulty": session.current_difficulty,
        "questions_answered": session.questions_answered,
        "correct_answers": session.correct_answers,
        "accuracy": round(session.correct_answers / session.questions_answered * 100),
    }


@router.post("/session/{session_id}/end")
def end_session(
    session_id: int,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = db.query(QuizSession).filter(
        QuizSession.id == session_id,
        QuizSession.user_id == user_id,
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    session.ended_at = datetime.utcnow()
    db.commit()

    return {
        "session_id": session_id,
        "questions_answered": session.questions_answered,
        "correct_answers": session.correct_answers,
        "accuracy": (
            round(session.correct_answers / session.questions_answered * 100)
            if session.questions_answered > 0
            else 0
        ),
        "final_difficulty": session.current_difficulty,
    }
