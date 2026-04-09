from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, setup, interview, results
from dotenv import load_dotenv
from database import ping_db # <-- Imported our new ping function

load_dotenv()

app = FastAPI(
    title="HireAI Backend",
    description="Enterprise multi-agent intelligent interview evaluation system API.",
    version="2.0.0"
)

# Run the DB check when server starts
@app.on_event("startup")
async def startup_event():
    await ping_db()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(setup.router, prefix="/api/setup", tags=["Setup"])
app.include_router(interview.router, prefix="/api/interview", tags=["Interview Arena"])
app.include_router(results.router, prefix="/api/results", tags=["Results Scorecard"])

@app.get("/")
def read_root():
    return {"status": "HireAI Backend API Operational (MongoDB + Gemini Enabled)"}