import os
from dotenv import load_dotenv

load_dotenv()
os.environ["GEMINI_API_KEY"] = os.getenv("GEMINI_API_KEY", "")

from crewai import LLM

print("Testing gemini/gemini-1.5-flash with v1beta...")
os.environ["GEMINI_API_VERSION"] = "v1beta"

try:
    llm = LLM(model="gemini/gemini-1.5-flash")
    resp = llm.call(messages=[{"role": "user", "content": "Say hello"}])
    print("SUCCESS (v1beta):", resp)
except Exception as e:
    import traceback
    traceback.print_exc()

print("Testing gemini/gemini-1.5-flash-latest (no v1beta)...")
os.environ.pop("GEMINI_API_VERSION", None)

try:
    llm2 = LLM(model="gemini/gemini-1.5-flash-latest")
    resp2 = llm2.call(messages=[{"role": "user", "content": "Say hello"}])
    print("SUCCESS (latest):", resp2)
except Exception as e:
    import traceback
    traceback.print_exc()
