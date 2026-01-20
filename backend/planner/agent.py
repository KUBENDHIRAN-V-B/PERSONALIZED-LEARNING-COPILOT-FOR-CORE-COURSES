from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, Field

from db.database import SessionLocal
from services.mastery import mastery_service

# --- Data Models ---
class DailyTask(BaseModel):
    day: str = Field(description="Day of the week (e.g., 'Monday')")
    focus_topic: str
    activities: List[str] = Field(description="Specific study activities, e.g., 'Read Chapter 4', 'Solve 5 problems'")
    time_allocation: str = Field(description="Time to spend (e.g. '2 hours')")

class WeeklySchedule(BaseModel):
    week_number: int
    theme: str = Field(description="Main focus of the week")
    total_hours: str = Field(description="Total estimated hours for this week", default="14")
    daily_plan: List[DailyTask]
    revision_focus: str = Field(description="What to review from previous weeks")

class StudyPlanResponse(BaseModel):
    reasoning: str = Field(description="Step-by-step logic used to create this plan, explaining prioritization choices.")
    total_weeks: int
    strategy_summary: str = Field(description="Overall strategy: e.g., 'Front-loading difficult concepts', 'Spaced repetition'")
    schedule: List[WeeklySchedule]

# --- Agent ---
from services.memory import learning_memory

# --- Agent ---
class PlannerAgent:
    def __init__(self):
        self.llm = None

    def _get_course_context(self):
        from services.ingestion import ingestion_manager
        if ingestion_manager.vector_db:
             docs = ingestion_manager.similarity_search("Course syllabus overview and main topics", k=3)
             return "\n".join([d['content'] for d in docs])
        return "No syllabus uploaded." # Fallback

    def _get_profile_context(self) -> str:
        """Fetch full learning profile."""
        db = SessionLocal()
        try:
            profile = learning_memory.get_learning_profile(db)
            return profile
        except Exception as e:
            print(f"Error fetching profile: {e}")
            return {}
        finally:
            db.close()

    def generate_plan(
        self, 
        goal: str, 
        exam_date: str, 
        hours_per_day: int, 
        weak_topics: Optional[str] = None
    ):
        from rag.retrieval import get_llm
        self.llm = get_llm()
        if not self.llm:
            return {"error": "API Key missing"}

        # 1. Gather Context
        syllabus_context = self._get_course_context()
        today = datetime.now().strftime("%Y-%m-%d")
        
        # 2. Get Learning Profile
        profile = self._get_profile_context()

        # Format Profile for Prompt
        profile_str = ""
        if profile.get("weak_topics"):
            profile_str += f"- WEAK TOPICS (PRIORITY REVISION): {', '.join(profile['weak_topics'])}\n"
        if profile.get("mastered_topics"):
            profile_str += f"- MASTERED TOPICS (Maintain via light review): {', '.join(profile['mastered_topics'])}\n"
        if profile.get("recent_activity"):
             recent_strs = [f"{a['topic']} ({a['score']})" for a in profile['recent_activity']]
             profile_str += f"- RECENT ACTIVITY: {'; '.join(recent_strs[:3])}\n"
        
        user_weak_str = f"- User Identified: {weak_topics}" if weak_topics else ""
        
        if not profile_str and not user_weak_str:
            profile_str = "No prior learning history available (New Student)."

        # 3. Setup Parser
        from langchain_core.output_parsers import JsonOutputParser
        parser = JsonOutputParser(pydantic_object=StudyPlanResponse)

        # 4. Construct Prompt
        system_prompt = (
            "You are an expert academic strategist. Your goal is to create a DYNAMIC, high-performance study plan.\n"
            "Analyze the syllabus and the student's unique learning profile.\n\n"
            "STRATEGY RULES:\n"
            "1. AGGRESSIVELY TARGET WEAK TOPICS: Schedule them for immediate, deep study sessions.\n"
            "2. MAINTAIN STRENGTHS: Schedule widely spaced, light review for 'Mastered Topics'.\n"
            "3. ADAPT TO GOAL: Ensure the schedule fits the time budget and covers outstanding syllabus items.\n"
            "Output the plan as strictly formatted JSON."
        )

        user_message = (
            f"Current Date: {today}\n"
            f"Exam Date: {exam_date}\n"
            f"Goal: {goal}\n"
            f"Daily Study Budget: {hours_per_day} hours\n\n"
            f"STUDENT LEARNING PROFILE:\n{profile_str}\n{user_weak_str}\n\n"
            f"Syllabus Context:\n{syllabus_context[:2000]}...\n\n"
            "{format_instructions}"
        )

        from langchain_core.prompts import ChatPromptTemplate
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", user_message)
        ])

        chain = prompt | self.llm | parser
        
        try:
            result = chain.invoke({
                "format_instructions": parser.get_format_instructions()
            })
            return result
        except Exception as e:
            print(f"Plan generation error: {e}")
            return {"error": f"Failed to generate plan: {str(e)}"}

planner_agent = PlannerAgent()
