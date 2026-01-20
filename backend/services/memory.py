from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from db.models import Topic, QuizAttempt, MasteryLog, Document
from datetime import datetime, timedelta

class LearningMemory:
    def get_learning_profile(self, db: Session, user_id: int = None):
        """
        Aggregates a complete persistent learning profile with real data.
        """
        # 1. Topic Mastery Status
        all_topics = db.query(Topic).all()
        weak_topics = [t for t in all_topics if 0 < t.current_mastery < 50]
        strong_topics = [t for t in all_topics if t.current_mastery >= 80]
        
        # 2. Key Stats
        total_docs = db.query(Document).count()
        total_quizzes = db.query(QuizAttempt).count()
        
        # Average Mastery (across all attempted topics)
        avg_mastery_res = db.query(func.avg(Topic.current_mastery)).filter(Topic.current_mastery > 0).scalar()
        avg_mastery = round(avg_mastery_res, 1) if avg_mastery_res else 0
        
        # 3. Recent Activity (last 7 days)
        recent_date = datetime.utcnow() - timedelta(days=7)
        recent_attempts = db.query(QuizAttempt).filter(
            QuizAttempt.date_taken >= recent_date
        ).order_by(desc(QuizAttempt.date_taken)).limit(5).all()

        # 4. Mastery Logs (for history chart)
        # We'll group by day for the last 7 days
        history = []
        for i in range(6, -1, -1):
            date = (datetime.utcnow() - timedelta(days=i)).date()
            # Find the average mastery reached on this day (or the latest log for that day)
            day_score = db.query(func.avg(MasteryLog.new_score)).filter(
                func.date(MasteryLog.timestamp) <= date
            ).scalar()
            
            history.append({
                "name": date.strftime("%a"),
                "score": round(day_score, 1) if day_score else (avg_mastery if i == 0 else 0)
            })

        # 5. Recent specific progress logs
        recent_logs = db.query(MasteryLog).order_by(desc(MasteryLog.timestamp)).limit(5).all()

        return {
            "stats": {
                "active_materials": total_docs,
                "total_quizzes": total_quizzes,
                "average_mastery": avg_mastery,
                "study_hours": f"{total_quizzes * 0.5}h" # Estimated based on quizzes
            },
            "weak_topics": [t.name for t in weak_topics][:5],
            "mastered_topics": [t.name for t in strong_topics],
            "progress_history": history,
            "topic_details": [
                {"name": t.name, "mastery": t.current_mastery} 
                for t in all_topics if t.current_mastery > 0
            ][:4],
            "recent_activity": [
                {
                    "topic": a.topic.name if a.topic else "Unknown",
                    "score": f"{a.score}/{a.total_questions}",
                    "date": a.date_taken.strftime("%b %d")
                } 
                for a in recent_attempts
            ],
            "recent_progress_logs": [
                f"{l.topic.name}: {int(l.old_score)}% -> {int(l.new_score)}%" 
                for l in recent_logs if l.topic
            ]
        }

learning_memory = LearningMemory()
