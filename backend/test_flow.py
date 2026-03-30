import requests
import time

BASE_URL = "http://localhost:8000/api"

print("Starting E2E Backend Verification...")
# 1. Register User
print("-> Registering...")
r = requests.post(f"{BASE_URL}/auth/register", json={
    "email": "test@example.com",
    "name": "Test User",
    "password": "password123"
})
if r.status_code == 400:
    print("User already registered, logging in...")
    r = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "test@example.com",
        "password": "password123"
    })
    
data = r.json()
token = data.get("token")
print(f"Token obtained: {token[:15]}...")

headers = {"Authorization": f"Bearer {token}"}

# 2. Setup (No Auth needed initially usually, but let's check it works)
print("-> Fetching Setup Protocols...")
r = requests.get(f"{BASE_URL}/setup/protocols")
print("Protocols:", [p["title"] for p in r.json()["protocols"]])

# 3. Start Interview
print("-> Starting Interview...")
r = requests.post(f"{BASE_URL}/interview/start", headers=headers, json={
    "protocol_id": "technical"
})
session_id = r.json()["session_id"]
print(f"Session Started: {session_id}")
print(f"AI: {r.json()['initial_message']}")

# 4. Send Messages
messages = [
    "Yes, I am ready to begin.",
    "For state management, I prefer using Redux Toolkit or React Context API depending on complexity.",
    "I would use a microservices approach with Redis and Kafka for scale."
]

for msg in messages:
    print(f"\nCandidate: {msg}")
    r = requests.post(f"{BASE_URL}/interview/message", headers=headers, json={
        "session_id": session_id,
        "candidate_text": msg
    })
    print(f"AI: {r.json()['agent_response']}")
    time.sleep(1)
    
# 5. Fetch Results
print("\n-> Fetching Results...")
r = requests.get(f"{BASE_URL}/results/{session_id}", headers=headers)
res = r.json()
print(f"Overall Score: {res['overall_score']}")
print(f"Status: {res['status']}")
print(f"Metrics: {res['metrics']}")
print(f"Strengths: {res['strengths']}")
