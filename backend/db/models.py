from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    
    courses = relationship("Course", back_populates="user")
    quiz_attempts = relationship("QuizAttempt", back_populates="user")

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="courses")
    topics = relationship("Topic", back_populates="course")
    documents = relationship("Document", back_populates="course")

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    file_type = Column(String) 
    upload_date = Column(DateTime, default=datetime.utcnow)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True) # Optional linking
    
    course = relationship("Course", back_populates="documents")

class Topic(Base):
    __tablename__ = "topics"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    current_mastery = Column(Float, default=0.0) # 0-100 scale
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True)
    
    course = relationship("Course", back_populates="topics")
    quiz_attempts = relationship("QuizAttempt", back_populates="topic")
    mastery_logs = relationship("MasteryLog", back_populates="topic")

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Optional for now if no auth
    topic_id = Column(Integer, ForeignKey("topics.id"))
    score = Column(Float)
    total_questions = Column(Integer)
    difficulty = Column(String)
    date_taken = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="quiz_attempts")
    topic = relationship("Topic", back_populates="quiz_attempts")

class MasteryLog(Base):
    __tablename__ = "mastery_scores"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"))
    old_score = Column(Float)
    new_score = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow) # Track history
    
    topic = relationship("Topic", back_populates="mastery_logs")

class StudyPlan(Base):
    __tablename__ = "study_plans"

    id = Column(Integer, primary_key=True, index=True)
    goal = Column(String, index=True)
    exam_date = Column(String)
    hours_per_day = Column(Integer)
    plan_data = Column(Text)  # JSON string of the full plan
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
