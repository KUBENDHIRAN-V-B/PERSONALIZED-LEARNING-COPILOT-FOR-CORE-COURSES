from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.database import get_db
from services.memory import learning_memory

router = APIRouter()

@router.get("/profile")
async def get_profile(db: Session = Depends(get_db)):
    return learning_memory.get_learning_profile(db)
