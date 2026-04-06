import os
import asyncio
from dotenv import load_dotenv
from services.ai_service import process_candidate_message

# Mock history
class Msg:
    def __init__(self, role, content):
        self.role = role
        self.content = content

async def test_agents():
    load_dotenv()
    print("Testing AI agents connection...")
    history = [Msg('agent', 'Hello! Can you tell me about your experience with React?')]
    response = process_candidate_message("I have 3 years of experience in React.", history, [])
    
    print("\n--- AGENT RESPONSE ---")
    print(response.get('agent_response'))
    print("\n--- EVALUATOR LOGS ---")
    for log in response.get('evaluator_logs', []):
        print(f"[{log['level']}] {log['message']}")
    
    if "agent_response" in response and "score_delta" in response:
        print("\n✅ AI AGENTS VERIFIED: Model responded and Evaluator scored.")
    else:
        print("\n❌ AI AGENTS FAILED: Response was incomplete or fallback triggered.")

if __name__ == "__main__":
    asyncio.run(test_agents())
