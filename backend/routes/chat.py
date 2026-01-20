from fastapi import APIRouter
from pydantic import BaseModel
from rag.retrieval import rag_pipeline

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
async def chat(request: ChatRequest):
    response = rag_pipeline.answer_question(request.message)
    return response
