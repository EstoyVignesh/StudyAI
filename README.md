# StudyAI — AI-Powered Exam Prep

Personalized exam preparation for **UPSC, JEE, and NEET** with adaptive quizzes and an AI tutor powered by Claude.

## Features

- **Adaptive Quizzes** — Difficulty auto-adjusts based on your performance (1–5 levels)
- **AI Tutor Chat** — Real-time streaming responses from Claude (`claude-opus-4-8`)
- **Exam Coverage** — UPSC (7 subjects), JEE (3 subjects, 40+ topics), NEET (3 subjects, 50+ topics)
- **Progress Analytics** — Track accuracy by exam, subject, and topic; surfaces weak areas
- **Mobile-First** — Fully responsive design, bottom navigation on mobile

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Backend   | Python + FastAPI + SQLAlchemy (SQLite)  |
| AI        | Anthropic Claude API (`claude-opus-4-8`) |
| Frontend  | React + TypeScript + Tailwind CSS       |
| Auth      | JWT (python-jose + passlib/bcrypt)      |
| Build     | Vite                                    |

## Quick Start

### 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Copy and fill in your API key
cp .env.example .env
# Edit .env: set ANTHROPIC_API_KEY=sk-ant-...

uvicorn main:app --reload
# Backend runs at http://localhost:8000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
# Frontend runs at http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Environment Variables

Create `backend/.env`:

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
SECRET_KEY=generate-a-long-random-string
DATABASE_URL=sqlite:///./studyai.db
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

## Project Structure

```
StudyAI/
├── backend/
│   ├── main.py              # FastAPI app entry
│   ├── models.py            # SQLAlchemy models
│   ├── database.py          # DB setup
│   ├── auth_utils.py        # JWT + password utils
│   ├── exam_content.py      # UPSC/JEE/NEET curriculum
│   ├── routes/
│   │   ├── auth.py          # Register, login, me
│   │   ├── quiz.py          # Sessions, questions, answers
│   │   ├── tutor.py         # Chat sessions + streaming
│   │   └── progress.py      # Analytics endpoints
│   ├── ai/
│   │   ├── question_generator.py  # Claude question gen
│   │   └── tutor.py               # Claude streaming tutor
│   └── requirements.txt
└── frontend/
    └── src/
        ├── pages/           # Landing, Login, Register, Dashboard, Quiz, Tutor, Progress
        ├── components/      # Layout, Navbar
        ├── api/             # auth, quiz, tutor, progress clients
        ├── store/           # Zustand auth store
        └── types/           # TypeScript types
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login (returns JWT) |
| GET | `/api/auth/me` | Current user |
| GET | `/api/quiz/exams` | List exams |
| GET | `/api/quiz/exams/:exam/subjects` | Subjects + topics |
| POST | `/api/quiz/session/start` | Start quiz session |
| GET | `/api/quiz/session/:id/question` | Get AI question |
| POST | `/api/quiz/session/answer` | Submit answer |
| POST | `/api/tutor/session` | Create chat session |
| POST | `/api/tutor/chat` | Stream AI response (SSE) |
| GET | `/api/progress/overview` | Progress stats |
| GET | `/api/progress/weak-areas` | Weak topics |
