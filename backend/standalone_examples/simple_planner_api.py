import os
import json
from datetime import datetime, date
from typing import List, Optional
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

app = FastAPI(title="AI Study Planner API")
load_dotenv()

# --- Data Models ---
class PlannerRequest(BaseModel):
    syllabus_topics: List[str]
    exam_date: str  # YYYY-MM-DD
    hours_per_day: int
    weak_topics: Optional[List[str]] = None  # Topics to prioritize

class DailyTask(BaseModel):
    day: str
    focus_topic: str
    activities: List[str]
    hours: float

class WeekPlan(BaseModel):
    week_number: int
    theme: str
    goals: List[str]
    daily_plan: List[DailyTask]
    revision_focus: str

class StudyPlanResponse(BaseModel):
    total_weeks: int
    strategy_summary: str
    schedule: List[WeekPlan]
    study_tips: List[str]

# --- Logic ---

def get_llm():
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise ValueError("OPENROUTER_API_KEY not found")
    
    return ChatOpenAI(
        model="google/gemini-2.0-flash-001",
        api_key=api_key,
        base_url="https://openrouter.ai/api/v1",
        temperature=0.2, # Low temp for structured adherence
        default_headers={"HTTP-Referer": "http://localhost:8002"}
    )

@app.post("/generate-plan", response_model=StudyPlanResponse)
async def generate_study_plan(request: PlannerRequest):
    try:
        # Calculate timeline
        today = date.today()
        exam_dt = datetime.strptime(request.exam_date, "%Y-%m-%d").date()
        days_left = (exam_dt - today).days
        
        if days_left <= 0:
            raise HTTPException(status_code=400, detail="Exam date must be in the future")
        
        weeks_available = max(1, days_left // 7)

        # Output Parser
        parser = JsonOutputParser(pydantic_object=StudyPlanResponse)

        # System Prompt
        system_prompt = (
            "You are an expert academic strategist. Create a highly detailed study roadmap.\n"
            "RULES:\n"
            "1. Plan Structure: Organize by Weeks -> Days.\n"
            "2. Prioritization: Front-load 'Weak Topics' and heavy syllabus items early.\n"
            "3. Revision: Every week MUST have a dedicated revision slot or day.\n"
            "4. Reality Check: Respect the 'hours_per_day' limit. Don't overload.\n"
            "5. Activity Variety: Mix 'Reading', 'Practice Problems', 'Video Lectures', and 'Active Recall'.\n"
            "6. Output: Strictly JSON matching the requested schema.\n"
        )

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", 
             "Syllabus: {topics}\n"
             "Weak Areas (Prioritize these): {weak_topics}\n"
             "Exam Date: {exam_date} ({weeks} weeks remaining)\n"
             "Daily Budget: {hours} hours/day\n\n"
             "Generate the full JSON execution plan.\n"
             "{format_instructions}"
            )
        ])

        llm = get_llm()
        chain = prompt | llm | parser

        # Format inputs
        topics_str = ", ".join(request.syllabus_topics)
        weak_str = ", ".join(request.weak_topics) if request.weak_topics else "None"

        result = chain.invoke({
            "topics": topics_str,
            "weak_topics": weak_str,
            "exam_date": request.exam_date,
            "weeks": weeks_available,
            "hours": request.hours_per_day,
            "format_instructions": parser.get_format_instructions()
        })
        
        return result

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    print("Starting Planner API on http://127.0.0.1:8002")
    uvicorn.run(app, host="127.0.0.1", port=8002)
