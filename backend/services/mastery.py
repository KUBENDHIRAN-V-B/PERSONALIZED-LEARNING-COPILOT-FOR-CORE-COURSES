from sqlalchemy.orm import Session
from sqlalchemy import desc
from db.models import Topic, QuizAttempt, MasteryLog
from datetime import datetime

class MasteryService:
    def calculate_status(self, score: float) -> str:
        if score < 40:
            return "Weak"
        elif score < 75:
            return "Medium"
        else:
            return "Strong"

    def update_topic_mastery(self, db: Session, topic_id: int, score: float, total_questions: int, difficulty: str):
        """
        Updates the mastery score for a topic based on a new quiz result.
        Uses a weighted moving average where difficulty influences the weight.
        """
        topic = db.query(Topic).filter(Topic.id == topic_id).first()
        if not topic:
            return None

        # 1. Calculate percentage for this attempt
        attempt_score_pct = (score / total_questions) * 100 if total_questions > 0 else 0

        # 2. Log the attempt
        attempt = QuizAttempt(
            topic_id=topic_id,
            score=score,
            total_questions=total_questions,
            difficulty=difficulty,
            date_taken=datetime.utcnow()
        )
        db.add(attempt)
        
        # 3. Compute New Mastery Score
        # Weighting: Hard (1.2x), Medium (1.0x), Easy (0.8x)
        # Moving Average: New Score counts for 30% of mastery, old for 70% (stability)
        weights = {"hard": 1.2, "medium": 1.0, "easy": 0.8}
        weight = weights.get(difficulty.lower(), 1.0)
        
        normalized_performance = min(attempt_score_pct * weight, 100) # Cap at 100
        
        old_mastery = topic.current_mastery or 0.0
        
        # If it's the first attempt, mastery is just performance
        attempts_count = db.query(QuizAttempt).filter(QuizAttempt.topic_id == topic_id).count()
        if attempts_count == 0:
            new_mastery = normalized_performance
        else:
            # Alpha = 0.3 means recent attempts change the score by 30%
            alpha = 0.3
            new_mastery = (old_mastery * (1 - alpha)) + (normalized_performance * alpha)

        # 4. Update Topic & Log History
        topic.current_mastery = round(new_mastery, 2)
        
        log = MasteryLog(
            topic_id=topic_id,
            old_score=old_mastery,
            new_score=topic.current_mastery,
            timestamp=datetime.utcnow()
        )
        db.add(log)
        db.commit()
        db.refresh(topic)

        return {
            "topic": topic.name,
            "new_mastery": topic.current_mastery,
            "status": self.calculate_status(topic.current_mastery),
            "delta": round(topic.current_mastery - old_mastery, 2)
        }

    def get_weak_topics(self, db: Session, limit: int = 5):
        """Returns topics with 'Weak' or 'Medium' status, sorted by lowest mastery."""
        return db.query(Topic)\
            .filter(Topic.current_mastery < 75)\
            .order_by(Topic.current_mastery.asc())\
            .limit(limit)\
            .all()

mastery_service = MasteryService()
