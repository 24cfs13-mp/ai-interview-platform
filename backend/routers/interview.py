from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List
from bson import ObjectId

from database import get_db
from services.auth_service import get_current_user
from services.ai_service import process_candidate_message

router = APIRouter()

class StartRequest(BaseModel):
    protocol_id: str
    company_name: str = "General"

class StartResponse(BaseModel):
    session_id: str
    initial_message: str

class MessagePayload(BaseModel):
    session_id: str
    candidate_text: str

class EvaluatorLog(BaseModel):
    message: str
    type: str 

class MessageResponse(BaseModel):
    agent_response: str
    evaluator_logs: List[EvaluatorLog]

@router.post("/start", response_model=StartResponse)
async def start_interview(
    request: StartRequest, 
    db = Depends(get_db),
    current_user = Depends(get_current_user)
):
    session_doc = {
        "user_id": current_user["id"],
        "protocol_id": request.protocol_id,
        "company_name": request.company_name,
        "status": "active"
    }
    result = await db.sessions.insert_one(session_doc)
    session_id = str(result.inserted_id)
    
    initial_msg = f"Hello {current_user['name']}, welcome to the evaluation for the {request.protocol_id} role. Are you ready to begin?"
    
    await db.messages.insert_one({
        "session_id": session_id,
        "sender": "AI",
        "content": initial_msg,
        "msg_type": "text"
    })
    
    return StartResponse(
        session_id=session_id,
        initial_message=initial_msg
    )

@router.post("/message", response_model=MessageResponse)
async def process_message(
    payload: MessagePayload, 
    db = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        session = await db.sessions.find_one({"_id": ObjectId(payload.session_id), "user_id": current_user["id"]})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid session id format")
        
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    # 1. Save Candidate Message
    await db.messages.insert_one({
        "session_id": payload.session_id,
        "sender": "CANDIDATE",
        "content": payload.candidate_text,
        "msg_type": "text"
    })
    
    # 2. Process with AI Service
    cursor = db.messages.find({"session_id": payload.session_id, "msg_type": "text"}).sort("_id", 1)
    history_docs = await cursor.to_list(length=100)
    
    class MockMsg:
        def __init__(self, role, content):
            self.role = role
            self.content = content
    history = [MockMsg('candidate' if doc['sender'] == 'CANDIDATE' else 'agent', doc['content']) for doc in history_docs]
    
    company_name = session.get("company_name", "General")
    ai_data = process_candidate_message(payload.candidate_text, history, [], company_name=company_name)
    agent_resp = ai_data.get("agent_response", "Got it. Let's proceed.")
    logs = ai_data.get("evaluator_logs", [])
    
    # 3. Save AI Message
    await db.messages.insert_one({
        "session_id": payload.session_id,
        "sender": "AI",
        "content": agent_resp,
        "msg_type": "text"
    })
    
    # 4. Save Logs
    formatted_logs = []
    log_docs = []
    for log in logs:
        log_type = log.get("type", log.get("level", "info"))
        log_docs.append({
            "session_id": payload.session_id,
            "sender": log_type,
            "content": log["message"],
            "msg_type": "log"
        })
        formatted_logs.append(EvaluatorLog(message=log["message"], type=log_type))
        
    if log_docs:
        await db.messages.insert_many(log_docs)
    
    return MessageResponse(
        agent_response=agent_resp,
        evaluator_logs=formatted_logs
    )
