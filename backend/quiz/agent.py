from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

from db.database import SessionLocal
from db.models import Topic, QuizAttempt

# --- Models ---
class QuizQuestion(BaseModel):
    id: int = Field(description="1-based index")
    type: str = Field(description="'multiple_choice' or 'short_answer'")
    question: str
    options: Optional[List[str]] = Field(description="Options for MCQ, null for short answer")
    correct_answer: str
    explanation: str

class Quiz(BaseModel):
    topic: str
    difficulty: str
    questions: List[QuizQuestion]

# --- Agent ---
class QuizAgent:
    def __init__(self):
        self.llm = None
    
    def generate_quiz(self, topic: str, difficulty: str = "medium"):
        from rag.retrieval import get_llm
        self.llm = get_llm()
        if not self.llm:
            return {"error": "API Key missing"}

        # 1. Retrieve Context
        from services.ingestion import ingestion_manager
        context = ""
        if ingestion_manager.vector_db:
             try:
                 # Use new similarity search
                 docs = ingestion_manager.similarity_search(topic, k=4)
                 context = "\n\n".join([d['content'] for d in docs])
             except Exception as e:
                 print(f"Retrieval error: {e}")
        
        if not context:
            context = "No specific documents found. Use general academic knowledge."

        # 2. Setup Parser
        from langchain_core.output_parsers import JsonOutputParser
        parser = JsonOutputParser(pydantic_object=Quiz)

        # 3. Prompt
        from langchain_core.prompts import ChatPromptTemplate
        system_prompt = (
            "You are a strict university professor. Generate a quiz to test mastery of the topic.\n"
            "Use the provided context to ensure questions are relevant to the course material.\n"
            f"Difficulty Level: {difficulty.upper()}\n"
            "Include:\n"
            "- 4 Multiple Choice Questions (with distinct options).\n"
            "- 1 Short Answer Question (conceptual).\n"
            "Provide clear explanations for every answer."
        )

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "Topic: {topic}\nContext:\n{context}\n\n{format_instructions}")
        ])

        chain = prompt | self.llm | parser
        
        try:
            quiz_data = chain.invoke({
                "topic": topic,
                "context": context[:3000],  # Context window safety
                "format_instructions": parser.get_format_instructions()
            })
            
            # 4. Save Attempt Placeholder to DB
            # We record that a quiz was generated for a topic. 
            # In a real app, we'd save the specific questions to a 'Quiz' table 
            # and a 'QuizAttempt' when submitted. For now, we'll log the event.
            self._log_quiz_generation(topic, difficulty)

            return quiz_data

        except Exception as e:
            print(f"Error generating quiz: {e}")
            return {"error": str(e)}

    def _log_quiz_generation(self, topic_name: str, difficulty: str):
        db = SessionLocal()
        try:
            # Check if topic exists, else create
            topic = db.query(Topic).filter(Topic.name == topic_name).first()
            if not topic:
                topic = Topic(name=topic_name)
                db.add(topic)
                db.commit()
                db.refresh(topic)
            
            # We don't have a 'Quiz' table in the simple schema, 
            # so we just ensure the topic is tracked. 
            # Actual result saving would happen on submission (POST /submit-quiz).
        except Exception as e:
            print(f"DB Logging error: {e}")
        finally:
            db.close()

    # In modern version, results are saved via mastery_service in routes/quiz.py
    pass

quiz_agent = QuizAgent()
