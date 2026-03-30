import os
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# CrewAI forces OpenAI internally. We can hijack those calls using Google's OpenAI-compatible endpoint!
os.environ["OPENAI_API_KEY"] = GEMINI_API_KEY
os.environ["OPENAI_API_BASE"] = "https://generativelanguage.googleapis.com/v1beta/openai/"
os.environ["OPENAI_MODEL_NAME"] = "gemini-1.5-flash"

try:
    from crewai import Agent, Task, Crew, Process
    from langchain_google_genai import ChatGoogleGenerativeAI
    
    llm = ChatGoogleGenerativeAI(
        model="gemini-pro",
        google_api_key=GEMINI_API_KEY,
        temperature=0.3
    )

    interviewer_agent = Agent(
        role='Interviewer',
        goal='Ask a question.',
        backstory='You are a recruiter.',
        verbose=False,
        allow_delegation=False,
        llm=llm,
        function_calling_llm=llm
    )

    t = Task(
        description='Ask the candidate a short question.',
        expected_output='A short question.',
        agent=interviewer_agent
    )

    crew = Crew(
        agents=[interviewer_agent],
        tasks=[t],
        process=Process.sequential,
        verbose=False,
        memory=False,
        function_calling_llm=llm
    )

    print("Kicking off crew...")
    res = crew.kickoff()
    print("SUCCESS:", res)

except Exception as e:
    import traceback
    traceback.print_exc()
