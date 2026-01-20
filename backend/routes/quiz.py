from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from quiz.agent import quiz_agent
from services.mastery import mastery_service
from db.database import get_db
from db.models import Topic
from typing import Optional

router = APIRouter()

class QuizRequest(BaseModel):
    topic: str
    difficulty: str

class SubmitQuizRequest(BaseModel):
    topic_name: str
    score: float
    total_questions: int
    difficulty: str

class ValidateAnswerRequest(BaseModel):
    question: str
    correct_answer: str
    student_answer: str

@router.post("/quiz")
async def generate_quiz(request: QuizRequest):
    quiz = quiz_agent.generate_quiz(request.topic, request.difficulty)
    return quiz

@router.post("/submit")
async def submit_quiz(request: SubmitQuizRequest, db: Session = Depends(get_db)):
    # Find topic ID first
    topic = db.query(Topic).filter(Topic.name == request.topic_name).first()
    if not topic:
        # Should mostly exist from generation step, but safe fallback
        topic = Topic(name=request.topic_name)
        db.add(topic)
        db.commit()
        db.refresh(topic)

    result = mastery_service.update_topic_mastery(
        db, 
        topic.id, 
        request.score, 
        request.total_questions, 
        request.difficulty
    )
    return result

@router.post("/validate-answer")
async def validate_short_answer(request: ValidateAnswerRequest):
    """Use AI to validate if a short answer is correct."""
    from rag.retrieval import get_llm
    from langchain_core.prompts import ChatPromptTemplate
    from langchain_core.output_parsers import JsonOutputParser
    from pydantic import BaseModel as PydanticModel, Field
    
    llm = get_llm()
    if not llm:
        # Fallback: simple string matching
        is_correct = request.student_answer.lower().strip() in request.correct_answer.lower()
        return {
            "is_correct": is_correct,
            "score": 1.0 if is_correct else 0.0,
            "feedback": "Answer validated using basic matching."
        }
    
    class AnswerValidation(PydanticModel):
        is_correct: bool = Field(description="Whether the student's answer is essentially correct")
        score: float = Field(description="Score from 0.0 to 1.0 based on answer quality")
        feedback: str = Field(description="Brief feedback explaining why the answer is correct or incorrect")
    
    parser = JsonOutputParser(pydantic_object=AnswerValidation)
    
    system_prompt = (
        "You are a strict but fair academic evaluator. Compare the student's answer to the correct answer.\n\n"
        "EVALUATION RULES:\n"
        "- The answer doesn't need to be word-for-word identical\n"
        "- Focus on whether the student demonstrates understanding of the core concept\n"
        "- Partial credit (0.5) is acceptable for partially correct answers\n"
        "- Be encouraging but honest in feedback\n\n"
        "Return JSON with: is_correct (bool), score (0.0-1.0), feedback (brief explanation)"
    )
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "Question: {question}\n\nCorrect Answer: {correct_answer}\n\nStudent's Answer: {student_answer}\n\n{format_instructions}")
    ])
    
    chain = prompt | llm | parser
    
    try:
        result = chain.invoke({
            "question": request.question,
            "correct_answer": request.correct_answer,
            "student_answer": request.student_answer,
            "format_instructions": parser.get_format_instructions()
        })
        return result
    except Exception as e:
        # Fallback on error
        print(f"Validation error: {e}")
        is_correct = request.student_answer.lower().strip() in request.correct_answer.lower()
        return {
            "is_correct": is_correct,
            "score": 1.0 if is_correct else 0.0,
            "feedback": "Answer validated using basic matching."
        }
