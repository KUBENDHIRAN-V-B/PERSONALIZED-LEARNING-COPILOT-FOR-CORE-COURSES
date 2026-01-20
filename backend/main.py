from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

from db.database import engine, Base
from routes import files, chat, plan, quiz, profile

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Learning Copilot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(files.router)
app.include_router(chat.router)
app.include_router(plan.router)
app.include_router(quiz.router)
app.include_router(profile.router)

@app.get("/")
async def root():
    return {"message": "Learning Copilot API Running - Modular Version"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
