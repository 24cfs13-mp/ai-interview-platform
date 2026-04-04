# HireAI: Gen-AI Interview Protocol // Architecture Overview

HireAI is a high-fidelity, AI-driven interview simulation and behavioral evaluation platform. It leverages a multi-agent backend architecture to provide real-time coaching, technical assessment, and security enforcement for high-stakes talent acquisition.

---

## 🛠️ Technology Stack

### **Frontend Architecture**
| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Core Framework** | React 18 (Vite) | High-performance, reactive UI state management. |
| **Styling Engine** | Vanilla CSS + Tailwind | Custom 'Cyber-Luxury' / Brutalist design system with high-contrast neons. |
| **Interaction** | Framer Motion | Dynamic micro-animations and physics-based transitions. |
| **Media Handling** | WebRTC & Canvas API | Real-time camera/microphone streaming and pixel-level shutter analysis. |
| **Speech-to-Text** | Web Speech API | Native browser-level voice transcription for low-latency feedback. |
| **Document Engine** | html2canvas + jsPDF | Client-side generation of high-fidelity Post-Action Reports (PDF). |

### **Backend Architecture**
| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **API Framework** | FastAPI (Python 3.11) | High-concurrency asyncio endpoints for real-time message processing. |
| **AI Orchestration** | CrewAI | Multi-agent framework managing Interviewer, Evaluator, and Bias nodes. |
| **Inference Engine** | Gemini 2.0 Flash | State-of-the-art LLM for natural dialogue and technical scoring. |
| **Persistence** | MongoDB | Document-based storage for session logs, bio-metrics, and results. |
| **Authentication** | JWT (PyJWT) | Secure, stateless authentication for candidates. |

---

## 🔒 Security & Integrity Suite

### **1. Tab-Switch Enforcement (Anti-Cheat)**
The platform implements a strict **3-Warning Protocol**. Using `window.onblur` listeners, the system detects when a candidate shifts focus to another tab or application. On the third violation, the session is **Automatically Terminated**, and a **SECURITY_VIOLATION** flag is persisted in the database.

### **2. AI Visual Vector Detector (Shutter Check)**
Using a hidden Canvas-based brightness analyzer, the platform detects if the candidate has a **physical shutter closed** or if the video feed is artificially black. The system pauses the interview with a `FEED_SILENT` alert until the visual feed is restored.

### **3. Gaze Stability Index**
A real-time behavioral metric that tracks user focus. It is hard-synced to hardware status; if the camera is disabled or the shutter is obscured, the Gaze Lock is forced to **0%**, impacting the final **Genuineness Index** in the report.

---

## 🚀 Key Features

*   **Cyber-Luxury UI**: A unique, high-contrast aesthetic designed to wow panels and provide a premium candidate experience.
*   **Post-Action Report (AAR)**: A comprehensive data packet including Performance Vectors (Tech, Communication, Architecture) and Behavioral Telemetry.
*   **Vocal Stress Analysis**: Real-time frequency analysis of the candidate's audio feed to detect stress spikes during complex questions.
*   **Multi-Agent Evaluation**: Response processing is handled by three specialized AI agents:
    1.  **Lead Interviewer**: Manages dialogue and follow-up questions.
    2.  **Structural Evaluator**: Scores responses based on technical accuracy.
    3.  **Bias Monitor**: Ensures the evaluation remains objective and inclusive.

---

## 📂 Project Structure

```text
hire-ai/
├── frontend/           # React (Vite) Application
│   ├── src/pages/      # Login, Setup, Interview Arena, Results
│   └── src/components/ # Bio-metric Meters, Modals, 3D Scences
└── backend/            # FastAPI Application
    ├── routers/        # Authentication, Interview, Results API
    ├── services/       # AI Logic (CrewAI), Scoring, DB Helpers
    └── database.py     # MongoDB Connection Configuration
```

---

> [!IMPORTANT]
> This platform is designed for **Presentation Mode**. All bio-metrics and security logs are fully functional and integrated with real-time hardware tracking for a live panel demonstration.
