import sys
sys.path.append('.')
from services.ai_service import process_candidate_message

# Mock a simple message to trigger the pipeline
res = process_candidate_message(
    candidate_message="I would use Redux for state management.",
    conversation_history=[],
    recent_logs=[],
    resume_data={},
    company_name="Amazon"
)

print("\n--- RESULTS ---")
print(res)
