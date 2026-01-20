import time
import asyncio
import os
from datetime import datetime
from typing import List

# Add parent dir to path to allow imports
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.ingestion import ingestion_manager
from quiz.agent import quiz_agent
from planner.agent import planner_agent
from rag.retrieval import rag_pipeline

class Evaluator:
    def __init__(self):
        self.results = {}
        print("Initializing Evaluator...")
        # Ensure VDB is loaded
        if ingestion_manager.vector_db is None:
            print("WARNING: Vector DB not loaded. Ingestion tests will fail.")
            try:
                ingestion_manager.load_vector_db()
                print("Vector DB loaded successfully.")
            except:
                print("Could not load Vector DB. Please upload documents first.")

    def timer(func):
        def wrapper(*args, **kwargs):
            start = time.time()
            result = func(*args, **kwargs)
            end = time.time()
            return result, end - start
        return wrapper

    @timer
    def eval_retrieval_accuracy(self, queries: List[str], expected_keywords: List[str]):
        """
        Simple Hit-Rate evaluation: Checks if retrieved chunks contain expected keywords.
        """
        hits = 0
        total = len(queries)
        
        print(f"\n--- Evaluating Retrieval Accuracy (N={total}) ---")
        for i, query in enumerate(queries):
            docs = ingestion_manager.similarity_search(query, k=3)
            # Check if ANY doc contains the expected keyword
            keyword = expected_keywords[i].lower()
            found = any(keyword in d['content'].lower() for d in docs)
            
            status = "HIT" if found else "MISS"
            print(f"Query: '{query}' | Expected: '{keyword}' | Result: {status}")
            if found:
                hits += 1
        
        accuracy = (hits / total) * 100
        print(f"Retrieval Accuracy: {accuracy:.2f}%")
        return accuracy

    @timer
    def eval_syllabus_coverage(self, syllabus_text: str):
        """
        Checks how much of a syllabus is 'covered' by the Vector DB.
        Uses similarity score threshold.
        """
        print(f"\n--- Evaluating Syllabus Coverage ---")
        lines = [l.strip() for l in syllabus_text.split('\n') if len(l) > 20] # Filter short lines
        if not lines:
            print("Syllabus text empty or too short.")
            return 0

        covered_count = 0
        threshold = 1.0 # L2 Distance. Lower is better. < 1.0 is usually a 'match'.

        for line in lines:
            # We use the raw method to get scores
            results = ingestion_manager.vector_db.similarity_search_with_score(line, k=1)
            if not results:
                continue
            
            score = results[0][1]
            is_covered = score < threshold
            print(f"Topic: '{line[:30]}...' | Score: {score:.2f} | {'Covered' if is_covered else 'Missing'}")
            
            if is_covered:
                covered_count += 1
        
        coverage = (covered_count / len(lines)) * 100
        print(f"Syllabus Coverage Score: {coverage:.2f}%")
        return coverage

    @timer
    def eval_quiz_quality(self, topic: str):
        """
        Checks structural validity and relevance of generated quiz.
        """
        print(f"\n--- Evaluating Quiz Quality for '{topic}' ---")
        quiz_data = quiz_agent.generate_quiz(topic, "medium")
        
        # 1. Structural Checks
        if "error" in quiz_data:
            print("Quiz Generation Failed:", quiz_data["error"])
            return False
            
        questions = quiz_data.get("questions", [])
        if len(questions) == 0:
            print("Fail: No questions generated.")
            return False
            
        # 2. Validity Checks
        valid_q = 0
        for q in questions:
            # Check for empty fields
            if q.get("question") and q.get("correct_answer") and q.get("explanation"):
                valid_q += 1
        
        validity_score = (valid_q / len(questions)) * 100
        print(f"Questions Generated: {len(questions)}")
        print(f"Structural Validity: {validity_score}%")
        
        return validity_score == 100

    @timer
    def eval_planner_logic(self, weak_topic: str):
        """
        Checks if the Planner actually prioritizes the weak topic.
        """
        print(f"\n--- Evaluating Planner Logic (Weak Topic: {weak_topic}) ---")
        plan = planner_agent.generate_plan(
            goal="Test Plan",
            exam_date="2025-12-01",
            hours_per_day=2,
            weak_topics=weak_topic
        )
        
        if "error" in plan:
            print("Planner Failed:", plan["error"])
            return False

        # Check if weak topic appears in the schedule
        found = False
        schedule = plan.get("schedule", [])
        for week in schedule:
            for day in week.get("daily_plan", []):
                if weak_topic.lower() in day.get("focus_topic", "").lower():
                    found = True
                    break
            if found: break
        
        print(f"Weak Topic '{weak_topic}' included in schedule: {found}")
        return found
    
    def run_all(self):
        print("Starting System Evaluation...")
        print("="*40)
        
        # 1. Retrieval Latency & Accuracy
        # (Assuming sample data is relevant to general CS if no docs uploaded)
        _, t_retrieval = self.eval_retrieval_accuracy(
            queries=["What is a binary tree?", "Explain sorting algorithms"],
            expected_keywords=["tree", "sort"]
        )
        
        # 2. Coverage
        # Using a dummy syllabus snippet
        sample_syllabus = """
        Unit I: Linear Data Structures
        Abstract Data Types (ADTs) – List ADT – array-based implementation
        """
        _, t_coverage = self.eval_syllabus_coverage(sample_syllabus)
        
        # 3. Quiz Quality
        _, t_quiz = self.eval_quiz_quality("Arrays")
        
        # 4. Planner Logic
        _, t_plan = self.eval_planner_logic("Recursion")
        
        print("\n" + "="*40)
        print("Performance Benchmark (Latency)")
        print(f"Retrieval (per batch): {t_retrieval:.2f}s")
        print(f"Coverage Analysis:     {t_coverage:.2f}s")
        print(f"Quiz Generation:       {t_quiz:.2f}s")
        print(f"Plan Generation:       {t_plan:.2f}s")
        print("="*40)

if __name__ == "__main__":
    e = Evaluator()
    e.run_all()
