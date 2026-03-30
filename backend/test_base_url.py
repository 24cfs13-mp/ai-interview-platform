import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY", "")

from crewai import LLM

print("Testing explicitly with base_url v1beta...")
try:
    llm = LLM(
        model="google_genai/gemini-1.5-flash", 
        api_key=api_key
    )
    resp = llm.call(messages=[{"role": "user", "content": "Say hello"}])
    print("SUCCESS (google_genai provider):", resp)
except Exception as e:
    import traceback
    traceback.print_exc()

import os
os.environ["GEMINI_API_VERSION"] = "v1beta"
print("\nTesting explicitly with os.environ version...")
try:
    llm2 = LLM(
        model="gemini/gemini-1.5-flash", 
        api_key=api_key
    )
    resp2 = llm2.call(messages=[{"role": "user", "content": "Say hello"}])
    print("SUCCESS (os.environ v1beta):", resp2)
except Exception as e:
    import traceback
    traceback.print_exc()
