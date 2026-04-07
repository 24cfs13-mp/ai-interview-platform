# HireAI Platform: Comprehensive Technical Workflow

This document outlines the complete, step-by-step workflow of the **Anti-Gravity (HireAI)** platform, detailing how data flows from the moment a candidate logs in until they download their final Post-Action Report (PDF). This is intended for team understanding, debugging, and future scaling.

---

## 1. Authentication & System Initialization
When a user launches the platform, the first barrier is authentication and hardware validation.

1.  **Google OAuth Sign-In:** The user authenticates via Google (`@react-oauth/google`). The frontend receives a Google identity token, decodes it (`jwt-decode`), and requests a secure platform-specific JWT from the Python/FastAPI backend.
2.  **Hardware Handshake (`/setup`):** Before entering the arena, the frontend requests access to the user's camera and microphone using standard WebRTC browser APIs. If access is denied, they cannot proceed.
3.  **Role & Company Selection:** The candidate is prompted to input or select the **Target Company Name** and the specific **Job Role** (often referred to as the Protocol). This data directly customizes the AI's behavior, ensuring the interview questions are tailored to the organization and position.
4.  **Interview Creation:** Upon clicking "Start", the frontend pushes a `POST /interview/start` request containing the chosen role/protocol and company name. 
5.  **Database Seeding:** The backend initializes a new document in the MongoDB `sessions` collection and creates the first context-aware "Hello, are you ready?" message in the `messages` collection.

---

## 2. Entering the Interview Arena
This is the core of the platform, combining the Cyber-Luxury UI with strict security protocols.

1.  **3D World Generation:** React Three Fiber (`@react-three/fiber`) loads a 3D environment (`Scene3D.jsx`) using Three.js to give the "Cyber-Luxury" aesthetic, wowing the user.
2.  **Activating Security Daemons:** 
    *   **Tab-switch Listener:** A `window.onblur` event listener tracks if the user changes tabs. If caught 3 times, it triggers a `SECURITY_VIOLATION` flag and immediately aborts the session.
    *   **Visual/Gaze Tracking:** A combination of Web APIs measures the stability of the candidate's focus. If the camera goes dark (e.g., covered shutter) or gaze breaks excessively, the system logs this.
3.  **Opening the Communication Channel:** The frontend loads the initial greeting from the database and renders it in the UI chat window.

---

## 3. The Multi-Agent Conversation Loop
This is the primary data exchange loop during the active interview.

1.  **Candidate Input:** The candidate speaks. The frontend (using the Web Speech API or manual text input) converts this input into text.
2.  **Packet Transmission:** The frontend sends a JSON payload containing the `session_id` and `candidate_text` to `POST /interview/message`.
3.  **Backend Processing & CrewAI Routing:**
    *   The backend saves the candidate's message to MongoDB.
    *   It fetches the entire history of the session and passes it to `services.ai_service.py`.
    *   **The Tri-Agent Pipeline:** The input is processed by a multi-agent system powered by CrewAI / LangChain & Gemini.
        *   **Lead Interviewer Agent:** Reads the history and candidate's answer to generate the *next logical question*.
        *   **Structural Evaluator Agent:** Assesses the specific technical accuracy and problem-solving strength of the candidate's last answer, logging "Scores".
        *   **Bias/Integrity Agent:** Monitors responses for potentially problematic phrasing or unfair bias, logging metadata warnings if triggered.
4.  **Response Delivery:** The backend saves the AI's response and all evaluation logs to MongoDB, then returns a JSON package to the frontend.
5.  **UI Update:** The React frontend displays the AI's text and dynamically updates underlying state vectors based on the logs.

---

## 4. Session Termination & Telemetry Upload
When the interview naturally ends, or if a security threshold is breached.

1.  **Finalizing the Session:** The frontend fires a `POST /api/.../metrics` (or `PUT /interview/{session_id}/metrics`) containing the final `average_gaze` tracking score and a `termination_reason` (`NORMAL` vs `SECURITY_VIOLATION`).
2.  **Database Lock:** The backend updates the session in MongoDB, locking in the physical metrics.
3.  **Routing:** The frontend forcibly reroutes the candidate to the `/results` page.

---

## 5. Post-Action Analysis (The AAR)
The platform evaluates the collected telemetrics to provide a finalized verdict.

1.  **Aggregating Data:** The frontend calls `GET /results/<session_id>`.
2.  **Mathematical Scoring Service:** The backend (`services/scoring_service.py`) calculates the exact Index Score out of 100:
    *   It parses all the Evaluator Agents' logs to calculate points for **Technical Depth**, **Communication**, and **Problem Solving** (capped at 100% each).
    *   It takes the average of these three components (accounting for 80% of the final Index).
    *   It applies the **Gaze Integrity Score** (accounting for the remaining 20%).
3.  **Security Caps enforced:** If the session terminated with a `SECURITY_VIOLATION` flag (e.g. they cheated), their maximum possible score is slammed to a hard cap of 40/100, regardless of technical perfection.
4.  **Rendering Results:** The backend saves this compiled `feedback_json` and `overall_score` object to MongoDB and returns it to the client.
5.  **Data Visualization & Export:** 
    *   React reads the JSON and populates the stunning red/orange neon progress bars.
    *   The candidate clicks "Download Data Packet". 
    *   The platform uses `html2canvas` to screenshot the DOM and `jsPDF` to compile a verifiable PDF report directly in the browser. 

---
*Created automatically for the internal team's architectural alignment.*
