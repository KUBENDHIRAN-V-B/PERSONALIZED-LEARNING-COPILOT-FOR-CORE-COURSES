import os
from dotenv import load_dotenv
load_dotenv()

def get_llm():
    if os.getenv("OPENROUTER_API_KEY"):
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            model="google/gemini-2.0-flash-001",
            api_key=os.getenv("OPENROUTER_API_KEY"),
            base_url="https://openrouter.ai/api/v1",
            default_headers={
                "HTTP-Referer": "http://localhost:5173",
                "X-Title": "Learning Copilot"
            }
        )
    elif os.getenv("GOOGLE_API_KEY"):
         from langchain_google_genai import ChatGoogleGenerativeAI
         return ChatGoogleGenerativeAI(model="gemini-1.5-pro")
    elif os.getenv("OPENAI_API_KEY"):
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(model="gpt-4o")
    else:
        print("Warning: No API Key found.")
        return None

def get_active_study_plan():
    """Retrieve the active study plan from the database."""
    import json
    from db.database import SessionLocal
    from db.models import StudyPlan
    
    db = SessionLocal()
    try:
        plan = db.query(StudyPlan).filter(StudyPlan.is_active == True).first()
        if plan and plan.plan_data:
            plan_data = json.loads(plan.plan_data)
            return {
                "goal": plan.goal,
                "exam_date": plan.exam_date,
                "hours_per_day": plan.hours_per_day,
                "total_weeks": plan_data.get("total_weeks"),
                "strategy": plan_data.get("strategy_summary"),
                "schedule": plan_data.get("schedule", [])
            }
        return None
    except Exception as e:
        print(f"Error fetching study plan: {e}")
        return None
    finally:
        db.close()

class RAGPipeline:
    def __init__(self):
        self.llm = None 
    
    def _format_study_plan_context(self, plan):
        """Format the study plan into a readable context string."""
        if not plan:
            return ""
        
        context = f"\n\n--- STUDENT'S ACTIVE STUDY PLAN ---\n"
        context += f"Goal: {plan['goal']}\n"
        context += f"Exam Date: {plan['exam_date']}\n"
        context += f"Daily Study Budget: {plan['hours_per_day']} hours\n"
        context += f"Strategy: {plan['strategy']}\n"
        context += f"Total Weeks: {plan['total_weeks']}\n\n"
        
        # Include first 2-3 weeks of schedule for context
        for week in plan.get('schedule', [])[:3]:
            context += f"Week {week.get('week_number', '?')}: {week.get('theme', 'N/A')}\n"
            for day in week.get('daily_plan', [])[:3]:
                context += f"  - {day.get('day', '?')}: {day.get('focus_topic', 'N/A')}\n"
        
        context += "--- END STUDY PLAN ---\n"
        return context
    
    def answer_question(self, question: str):
        from services.ingestion import ingestion_manager
        if not self.llm:
            self.llm = get_llm()
            if not self.llm:
                return {"answer": "Error: API Key not set.", "sources": []}

        # Try to load vector DB from disk if not already loaded
        ingestion_manager.load_vector_db()
        
        # Get active study plan
        study_plan = get_active_study_plan()
        study_plan_context = self._format_study_plan_context(study_plan)
        
        if ingestion_manager.vector_db is None and not study_plan:
             return {"answer": "No documents have been successfully indexed yet. Please upload a text-based PDF (not a scanned image).", "sources": []}

        # 1. Retrieve from documents
        context_str = ""
        unique_sources = {}
        
        if ingestion_manager.vector_db is not None:
            results = ingestion_manager.vector_db.similarity_search_with_score(question, k=5)
            relevant_docs = [doc for doc, score in results if score < 1.2] 

            # 2. Format Context
            for i, doc in enumerate(relevant_docs):
                src_key = f"{doc.metadata.get('source', 'Unknown')} (Page {doc.metadata.get('page', '?')})"
                context_str += f"Source {i+1} [{src_key}]:\n{doc.page_content}\n\n"
                unique_sources[src_key] = doc.metadata

        # Check if we have any context
        if not context_str and not study_plan_context:
            return {"answer": "Not found in uploaded materials.", "sources": []}

        # 3. Prompt
        from langchain_core.prompts import ChatPromptTemplate
        from langchain_core.output_parsers import StrOutputParser
        
        system_prompt = (
            "You are an expert academic tutor and technical instructor for engineering students.\n\n"
            "YOUR ROLE:\n"
            "- Answer student questions clearly, accurately, and in a structured academic format.\n"
            "- Use ONLY the provided retrieved context (Course Materials).\n"
            "- Do NOT hallucinate or add outside knowledge.\n"
            "- If the answer is not found in the context, clearly say so.\n"
            "- If the student asks about their study plan/schedule, use their ACTIVE STUDY PLAN.\n\n"
            "ANSWER FORMATTING RULES (MANDATORY):\n"
            "1. Start with a short direct explanation (2-3 lines).\n"
            "2. Break the explanation into clear sections with headings (### Section Name).\n"
            "3. Use tables where comparison or structure helps understanding.\n"
            "4. Use code blocks or formula boxes for equations, pseudocode, or programming examples.\n"
            "5. Use bullet points for key points.\n"
            "6. Include worked examples when possible.\n"
            "7. End with a concise summary or takeaway.\n"
            "8. Add citation references at the end (source + page).\n\n"
            "STYLE GUIDELINES:\n"
            "- Professional, calm, and student-friendly tone\n"
            "- Simple language but technically correct\n"
            "- No unnecessary verbosity\n"
            "- Clean formatting like a textbook + tutor combined\n\n"
            "OUTPUT FORMAT:\n"
            "### [Topic Title]\n"
            "[Short 2-3 line explanation]\n\n"
            "### Key Concepts\n"
            "- Bullet points...\n\n"
            "### Formula/Code (if applicable)\n"
            "```\n[formula or code]\n```\n\n"
            "### Example (if applicable)\n"
            "[Worked example]\n\n"
            "### Summary\n"
            "[Key takeaway]\n\n"
            "---\n"
            "**Sources:** [Document name, Page X]"
        )

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("system", "Course Materials:\n{context}"),
            ("system", "{study_plan}"),
            ("human", "{input}"),
        ])

        # 4. LCEL Chain
        chain = prompt | self.llm | StrOutputParser()
        
        try:
            response = chain.invoke({
                "input": question,
                "context": context_str if context_str else "No course materials uploaded yet.",
                "study_plan": study_plan_context if study_plan_context else "No study plan created yet."
            })
            return {
                "answer": response,
                "sources": list(unique_sources.values()),
                "has_study_plan": study_plan is not None
            }
        except Exception as e:
            return {"answer": f"Error: {str(e)}", "sources": []}

rag_pipeline = RAGPipeline()
