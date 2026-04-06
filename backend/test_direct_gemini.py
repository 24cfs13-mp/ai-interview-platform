import os
import google.generativeai as genai
from dotenv import load_dotenv

def test_direct():
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")
    genai.configure(api_key=api_key)
    
    # Check if we can list models again
    print("Listing models with direct SDK...")
    models = [m.name for m in genai.list_models()]
    print(f"Available: {models}")
    
    # Try to generate something with 2.5-flash
    model_name = "gemini-1.5-flash" # Use the plain name as seen in list
    if f"models/{model_name}" in models:
        try:
            print(f"Attempting generation with {model_name}...")
            model = genai.GenerativeModel(model_name)
            response = model.generate_content("Say hello.")
            print(f"SUCCESS: {response.text}")
        except Exception as e:
            print(f"FAILED direct SDK with {model_name}: {e}")
    else:
        print(f"ERROR: {model_name} NOT FOUND in list.")

if __name__ == "__main__":
    test_direct()
