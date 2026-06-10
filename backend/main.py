from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import engine, Base
from routes import auth, quiz, tutor, progress, materials, insights, study


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    from seed_materials import seed
    seed()
    yield


app = FastAPI(
    title="StudyAI - AI Exam Tutor",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(quiz.router, prefix="/api/quiz", tags=["quiz"])
app.include_router(tutor.router, prefix="/api/tutor", tags=["tutor"])
app.include_router(progress.router, prefix="/api/progress", tags=["progress"])
app.include_router(materials.router, prefix="/api/materials", tags=["materials"])
app.include_router(insights.router, prefix="/api/insights", tags=["insights"])
app.include_router(study.router, prefix="/api/study", tags=["study"])


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "StudyAI"}
