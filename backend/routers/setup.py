from fastapi import APIRouter
from typing import List
from pydantic import BaseModel

router = APIRouter()

class Protocol(BaseModel):
    id: str
    title: str
    icon: str
    desc: str

class ProtocolsResponse(BaseModel):
    protocols: List[Protocol]

@router.get("/protocols", response_model=ProtocolsResponse)
def get_protocols():
    return ProtocolsResponse(protocols=[
        {"id": "technical", "title": "Technical", "icon": "MonitorPlay", "desc": "Algorithms, Architecture & System Design"},
        {"id": "hr", "title": "HR", "icon": "Users", "desc": "Culture fit, core values & behavioral"},
        {"id": "managerial", "title": "Managerial", "icon": "Briefcase", "desc": "Leadership, conflict & strategy"}
    ])
