from fastapi import APIRouter, Depends
from pydantic import BaseModel
from planner.agent import planner_agent
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import StudyPlan
import json

router = APIRouter()

from typing import Optional, Any

class PlanRequest(BaseModel):
    goal: str
    exam_date: str
    hours_per_day: int
    weak_topics: Optional[str] = None

class SavePlanRequest(BaseModel):
    goal: str
    exam_date: str
    hours_per_day: int
    plan_data: Any  # The full plan object

@router.post("/plan")
async def generate_plan(request: PlanRequest):
    plan = planner_agent.generate_plan(
        goal=request.model_dump().get("goal"), # Access safe
        exam_date=request.exam_date, 
        hours_per_day=request.hours_per_day,
        weak_topics=request.weak_topics
    )
    return plan

@router.post("/plan/save")
async def save_plan(request: SavePlanRequest, db: Session = Depends(get_db)):
    """Save a generated study plan to the database."""
    # Deactivate any existing active plans
    db.query(StudyPlan).filter(StudyPlan.is_active == True).update({"is_active": False})
    
    # Create new plan
    new_plan = StudyPlan(
        goal=request.goal,
        exam_date=request.exam_date,
        hours_per_day=request.hours_per_day,
        plan_data=json.dumps(request.plan_data),
        is_active=True
    )
    db.add(new_plan)
    db.commit()
    db.refresh(new_plan)
    
    return {"status": "saved", "plan_id": new_plan.id}

@router.get("/plans")
async def list_plans(db: Session = Depends(get_db)):
    """List all saved study plans."""
    plans = db.query(StudyPlan).order_by(StudyPlan.created_at.desc()).all()
    result = []
    for p in plans:
        result.append({
            "id": p.id,
            "goal": p.goal,
            "exam_date": p.exam_date,
            "hours_per_day": p.hours_per_day,
            "created_at": p.created_at.isoformat() if p.created_at else None,
            "is_active": p.is_active
        })
    return result

@router.get("/plan/{plan_id}")
async def get_plan(plan_id: int, db: Session = Depends(get_db)):
    """Get a specific saved plan by ID."""
    plan = db.query(StudyPlan).filter(StudyPlan.id == plan_id).first()
    if not plan:
        return {"error": "Plan not found"}
    return {
        "id": plan.id,
        "goal": plan.goal,
        "exam_date": plan.exam_date,
        "hours_per_day": plan.hours_per_day,
        "plan_data": json.loads(plan.plan_data) if plan.plan_data else None,
        "created_at": plan.created_at.isoformat() if plan.created_at else None,
        "is_active": plan.is_active
    }

@router.delete("/plan/{plan_id}")
async def delete_plan(plan_id: int, db: Session = Depends(get_db)):
    """Delete a saved plan."""
    plan = db.query(StudyPlan).filter(StudyPlan.id == plan_id).first()
    if not plan:
        return {"error": "Plan not found"}
    db.delete(plan)
    db.commit()
    return {"status": "deleted", "plan_id": plan_id}
