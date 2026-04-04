import os
import json
import logging
from datetime import datetime
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Properly set BOTH keys so LiteLLM and CrewAI can find them automatically
if GEMINI_API_KEY:
    os.environ["GOOGLE_API_KEY"] = GEMINI_API_KEY
    os.environ["GEMINI_API_KEY"] = GEMINI_API_KEY
    masked_key = f"{GEMINI_API_KEY[:6]}...{GEMINI_API_KEY[-4:]}" if len(GEMINI_API_KEY) > 10 else "INVALID"
    logger.info(f"Loaded GEMINI_API_KEY: {masked_key}")
else:
    logger.error("No GEMINI_API_KEY found in environment variables!")

try:
    from crewai import Agent, Task, Crew, Process
    # We NO LONGER import ChatGoogleGenerativeAI from langchain. 
    # CrewAI handles it natively via LiteLLM strings now.
    CREWAI_AVAILABLE = True
except ImportError as e:
    CREWAI_AVAILABLE = False
    logger.warning(f"CrewAI dependencies not found. Error: {e}")

def get_fallback_response(candidate_message: str, error_msg: str = None):
    logger.warning("Using AI fallback mode.")
    current_time = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    
    if not GEMINI_API_KEY or GEMINI_API_KEY == "your_gemini_api_key_here":
        msg = "I am the Fallback Agent. You have not pasted your GEMINI_API_KEY into the .env file yet!"
    else:
        err_txt = f" Execution Error: {error_msg}" if error_msg else ""
        msg = f"I am the Fallback Agent. Your GEMINI_API_KEY is detected, but there is an error: {err_txt}"
        
    return {
        "agent_response": msg,
        "score_delta": 0,
        "evaluator_logs": [
            {"timestamp": current_time, "level": "error", "message": f"[SYS] Fallback triggered. {error_msg if error_msg else ''}"}
        ],
        "metrics": []
    }

def process_candidate_message(candidate_message: str, conversation_history: list, recent_logs: list, resume_data: dict = None, company_name: str = "General"):
    if not GEMINI_API_KEY or GEMINI_API_KEY == "your_gemini_api_key_here" or not CREWAI_AVAILABLE:
        return get_fallback_response(candidate_message)
        
    transcript = "--- CONVERSATION TRANSCRIPT ---\n"
    for msg in conversation_history[-6:]:
        prefix = "Candidate" if msg.role == 'candidate' else "Interviewer"
        transcript += f"{prefix}: {msg.content}\n"
    transcript += f"Candidate: {candidate_message}\n-------------------------\n"

    try:
        # NEW CREWAI STANDARD: Just pass the provider/model string.
        # This completely bypasses the Pydantic validation error.
        # Upgraded to gemini-2.5-flash as 1.5 versions are no longer supported.
        llm_model = "gemini/gemini-2.5-flash"

        interviewer_agent = Agent(
            role='Interviewer Agent',
            goal=f'Conduct the technical interview for {company_name}, respond to the candidate naturally, and seamlessly formulate the next question.',
            backstory=f'You are a senior technical recruiter at {company_name}. Your job is purely to advance the conversation and ask the candidate relevant follow-up questions based on their answers. You MUST ask technical questions that are historically asked by {company_name}.',
            verbose=False,
            allow_delegation=False,
            llm=llm_model,
            max_rpm=10
        )

        evaluator_agent = Agent(
            role='Evaluator Agent',
            goal='Evaluate the candidate\'s latest answer for technical correctness, system design knowledge, and depth.',
            backstory='You are a strict technical grader. You do not speak to the candidate; you only evaluate their words and assign a score delta.',
            verbose=False,
            allow_delegation=False,
            llm=llm_model,
            max_rpm=10
        )

        bias_agent = Agent(
            role='Bias Detection Agent',
            goal='Analyze the candidate\'s latest answer for any implicit bias, unfairness, or inappropriate tone.',
            backstory='You are an AI ethics and compliance monitor. You ensure the candidate communicates respectfully and neutrally.',
            verbose=False,
            allow_delegation=False,
            llm=llm_model,
            max_rpm=10
        )
        
        json_compiler_agent = Agent(
            role='JSON Compiler',
            goal='Format the results of the Interviewer, Evaluator, and Bias agents into a strict JSON payload.',
            backstory='You are a backend server parser. You only output valid JSON.',
            verbose=False,
            allow_delegation=False,
            llm=llm_model,
            max_rpm=10
        )

        interview_task = Task(
            description=f'Read this transcript:\n{transcript}\nFormulate the exact response you will say to the candidate right now to continue the interview.',
            expected_output='A conversational string.',
            agent=interviewer_agent
        )

        evaluate_task = Task(
            description=f'''Read this transcript:\n{transcript}\nEvaluate the candidate\'s latest answer based on this exact rubric:
--- EVALUATION RUBRIC ---
[+4 to +5 Points] Exceptional: Highly optimized, identifies edge cases, deep system design knowledge.
[+2 to +3 Points] Solid: Technically correct, proper terminology, lacks deep optimization details.
[0 to +1 Points] Average: Surface-level, relies on buzzwords without explanation.
[-1 to -2 Points] Flawed: Minor factual errors, bad practices.
[-3 to -5 Points] Incorrect: Fundamental misunderstanding.
-------------------------
''',
            expected_output='Score: [X]. Justification: [Exact text from the rubric tier matched].',
            agent=evaluator_agent
        )

        bias_task = Task(
            description=f'Read this transcript:\n{transcript}\nCheck the candidate\'s latest answer for bias or tone issues. Output a single short sentence determining if bias exists.',
            expected_output='A short bias analysis string.',
            agent=bias_agent
        )

        compile_task = Task(
            description=f'''Take the outputs from the Interviewer, Evaluator, and Bias Detection agents and compile them EXACTLY into this JSON format:
{{
    "agent_response": "<Insert the Interviewer's exact response here>",
    "score_delta": <Insert the integer score delta from the Evaluator here>,
    "rubric_justification": "<Insert the exact justification sentence from the Evaluator here>",
    "evaluator_logs": [
        {{"timestamp": "{datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")}", "level": "info", "message": "[EVALUATOR] <Insert Evaluator's verdict here>"}},
        {{"timestamp": "{datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")}", "level": "warning", "message": "[BIAS_DETECT] <Insert Bias Detection verdict here>"}}
    ],
    "metrics": []
}}
Do NOT include markdown like ```json.
''',
            expected_output='Standard valid JSON.',
            agent=json_compiler_agent,
            context=[interview_task, evaluate_task, bias_task]
        )

        crew = Crew(
            agents=[interviewer_agent, evaluator_agent, bias_agent, json_compiler_agent],
            tasks=[interview_task, evaluate_task, bias_task, compile_task],
            process=Process.sequential,
            verbose=False,
            memory=False  # CRITICAL: Prevent CrewAI from attempting to initialize OpenAI embeddings.
            # Removed manager_llm as it is not needed for sequential processes and triggers validation checks.
        )

        result = crew.kickoff()
        output_str = str(result.raw if hasattr(result, 'raw') else result)
        
        # Strip out markdown formatting if the LLM includes it
        if output_str.startswith("```json"):
            output_str = output_str[7:]
        if output_str.startswith("```"):
            output_str = output_str[3:]
        if output_str.endswith("```"):
            output_str = output_str[:-3]
            
        output_str = output_str.strip()
        
        try:
            parsed_data = json.loads(output_str)
            if "agent_response" not in parsed_data:
                parsed_data["agent_response"] = "Good point. Let's move on to the next topic."
            if "score_delta" not in parsed_data:
                parsed_data["score_delta"] = 2
            if "rubric_justification" not in parsed_data:
                parsed_data["rubric_justification"] = "Score assigned based on standard evaluation."
            if "evaluator_logs" not in parsed_data:
                parsed_data["evaluator_logs"] = []
            if "metrics" not in parsed_data:
                parsed_data["metrics"] = []
                
            return parsed_data
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM JSON output from Crew: {output_str}. Error: {e}")
            return get_fallback_response(candidate_message, str(e))
            
    except Exception as e:
        import traceback
        with open("crewai_error.log", "w") as f:
            f.write(traceback.format_exc())
        logger.error(f"CrewAI orchestration error: {e}")
        return get_fallback_response(candidate_message, str(e))