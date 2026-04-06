import json
from bson import ObjectId
import re

async def compute_results(db, session_id: str) -> dict:
    # 1. Get session data (including hardware metrics like gaze)
    session = await db.sessions.find_one({"_id": ObjectId(session_id)})
    gaze_score = session.get("average_gaze", 0.0) if session else 0.0
    termination_reason = session.get("termination_reason", "NORMAL") if session else "NORMAL"

    # 2. Count actual candidate interaction
    candidate_msgs_cursor = db.messages.find({"session_id": session_id, "sender": "CANDIDATE"})
    candidate_msgs = await candidate_msgs_cursor.to_list(length=100)
    interaction_count = len(candidate_msgs)

    # 3. Retrieve evaluation logs across multiple categories
    log_cursor = db.messages.find({"session_id": session_id, "msg_type": "log"})
    logs = await log_cursor.to_list(length=1000)
    
    technical_total = 0.0
    comm_total = 0.0
    problem_total = 0.0
    deduction_count = 0
    feedback_segments = []
    
    for log in logs:
        content = log["content"]
        # Extract numeric score from AI strings like "[EVALUATOR] Score: +4. Justification:..."
        # or from formatted delta logs
        score_match = re.search(r'Score:\s*([+-]?\d+)', content)
        if score_match:
            val = float(score_match.group(1))
            
            # Simple weighting based on log source
            if "[EVALUATOR]" in content:
                technical_total += val
                problem_total += val * 0.8
            if "[BIAS_DETECT]" in content:
                # Deduct if bias or tone issues found (Bias agent typically returns warning levels)
                if log["sender"] == "warning":
                    comm_total -= 10
                    deduction_count += 1
            
            feedback_segments.append(content.split("Justification:")[-1].strip() if "Justification:" in content else content)

    # 4. Realistic Metric Calculation
    # We assume a standard interview has ~4-5 questions. 
    # Max points per question is +5. So MAX_SCORE ~ 25.
    MAX_EXPECTED_POINTS = 20.0
    
    # If interaction_count is 0, all scores should be 0.
    if interaction_count == 0:
        technical_depth = 0
        communication = 0
        problem_solving = 0
        overall_score = 0
        status = "INCOMPLETE"
        feedback_segments = ["System detected 0 responses from the candidate. Protocol terminated without data."]
    else:
        # Base Communication on interaction and lack of bias deductions
        communication_base = min(100, (interaction_count / 5.0) * 100) 
        communication = max(0, int(communication_base - (deduction_count * 15)))
        
        technical_depth = min(100, max(0, int((technical_total / MAX_EXPECTED_POINTS) * 100)))
        problem_solving = min(100, max(0, int((problem_total / MAX_EXPECTED_POINTS) * 100)))
        
        # Overall index is a weighted average of performance + behavior
        # Gaze/Behavioral integrity counts for 20% of the index
        performance_avg = (technical_depth + communication + problem_solving) / 3.0
        overall_score = round((performance_avg * 0.8) + (gaze_score * 0.2))
        status = "COMPLETED"

    # Handle security violations
    if termination_reason == "SECURITY_VIOLATION":
        overall_score = min(40, overall_score) # Cap score if security flag raised

    feedback_json = json.dumps({
        "technical_depth": technical_depth,
        "communication": communication,
        "problem_solving": problem_solving,
        "gaze_score": int(gaze_score),
        "strengths": feedback_segments[:2] if interaction_count > 0 else ["N/A"],
        "areas_for_improvement": feedback_segments[-1:] if interaction_count > 0 else ["No interaction recorded."],
        "key_metrics": [
            {"label": "Engagement level", "value": "High" if interaction_count > 3 else "Low"},
            {"label": "Protocol Status", "value": status}
        ]
    })
    
    result_doc = {
        "session_id": session_id,
        "overall_score": overall_score,
        "feedback_json": feedback_json,
        "status": status
    }
    
    await db.results.insert_one(result_doc)
    return result_doc
