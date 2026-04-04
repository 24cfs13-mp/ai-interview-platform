import json
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List
from bson import ObjectId

from database import get_db
from services.auth_service import get_current_user
from services.scoring_service import compute_results

router = APIRouter()

class ScoreMetric(BaseModel):
    label: str
    value: int

class ResultResponse(BaseModel):
    session_id: str
    candidate_name: str
    overall_score: int
    metrics: List[ScoreMetric]
    strengths: List[str]
    improvements: List[str]
    status: str
    gaze_score: int = 85

@router.get("/{session_id}", response_model=ResultResponse)
async def get_results(
    session_id: str, 
    db = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        session = await db.sessions.find_one({"_id": ObjectId(session_id), "user_id": current_user["id"]})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid session format")
        
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    result = await db.results.find_one({"session_id": session_id})
    
    if not result:
        result = await compute_results(db, session_id)
        await db.sessions.update_one({"_id": ObjectId(session_id)}, {"$set": {"status": "completed"}})
        
    feedback = json.loads(result["feedback_json"])

    return ResultResponse(
        session_id=session_id,
        candidate_name=current_user["name"],
        overall_score=int(result["overall_score"]),
        metrics=[
            ScoreMetric(label="Technical Depth", value=feedback.get("technical_depth", 0)),
            ScoreMetric(label="Communication", value=feedback.get("communication", 0)),
            ScoreMetric(label="Problem Solving", value=feedback.get("problem_solving", 0))
        ],
        strengths=feedback.get("strengths", []),
        improvements=feedback.get("areas_for_improvement", []),
        status="Finalized",
        gaze_score=feedback.get("gaze_score", 85)
    )
