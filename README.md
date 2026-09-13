# SAM — Self-operating AI Manager

> **Don't just ask AI. Give it a goal.**  
> An autonomous agentic AI system that plans, selects tools, executes actions, observes results, evaluates progress, adapts to failures, and verifies outcomes.

Built for the **Agentic AI Hackathon**.

---

## 1. Problem
Conventional AI assistants act as conversational chatbots. When given complex, multi-step real-world goals, they place the burden on the human user:
* The user must manually prompt each step.
* Chatbots guess answers without verifying them through real tool calls.
* When a tool or API fails (e.g. rate limit, unavailable source), chatbots halt or hallucinate plausible falsehoods.
* They lack closed-loop observation and self-healing adaptation.

## 2. Solution
**SAM (Self-operating AI Manager)** converts high-level objectives into verified multi-step actions. Rather than generating a one-shot response, SAM acts as an autonomous digital operator:
1. Deconstructs the goal into explicit constraints and success criteria.
2. Formulates an executable dependency-aware task plan.
3. Selects specialized tools with transparent rationale.
4. Executes actions and captures structured execution telemetry.
5. Observes tool results and evaluates whether criteria were met.
6. **Detects failures and autonomously re-plans alternative strategies.**
7. Enforces Human-in-the-Loop safety approval for sensitive operations.
8. Verifies all deliverables before declaring completion.

---

## 3. Agentic Workflow
The core loop demonstrated throughout SAM:

```
        +-----------------------------------------------+
        |              HIGH-LEVEL GOAL                  |
        +-----------------------+-----------------------+
                                |
                                v
        +-----------------------------------------------+
        |                   OBSERVE                     |
        |       Perceive objective & constraints        |
        +-----------------------+-----------------------+
                                |
                                v
        +-----------------------------------------------+
        |                    DECIDE                     |
        |        Formulate plan & select tools          |
        +-----------------------+-----------------------+
                                |
                                v
        +-----------------------------------------------+
        |                     ACT                       |
        |          Execute specialized tools            |
        +-----------------------+-----------------------+
                                |
                                v
        +-----------------------------------------------+
        |                   EVALUATE                    |
        |     Did this step achieve expectations?       |
        +-------+-------------------------------+-------+
                |                               |
        (Failed / Incomplete)               (Success)
                |                               |
                v                               v
        +---------------+               +---------------+
        |     ADAPT     |               |    VERIFY     |
        | Re-plan & retry               | Audit claims  |
        +-------+-------+               +-------+-------+
                |                               |
                +--------> [ Re-execute ]       v
                                        +---------------+
                                        | FINAL RESULT  |
                                        +---------------+
```

---

## 4. Architecture

```
+-------------------------------------------------------------------------------+
|                                  USER INTERFACE                               |
|   - Real-time Pipeline Visualizer (OBSERVE -> DECIDE -> ACT -> EVAL -> ADAPT) |
|   - Interactive Task Plan Panel with live state & retry counters              |
|   - Tool Telemetry Inspector (Web Search, Code, Calc, Data, Doc, Memory)      |
|   - Human-in-the-Loop Safety Authorization Modal                              |
|   - Verified Executive Deliverables & Analytics Dashboard                     |
+---------------------------------------+---------------------------------------+
                                        | REST / SSE Stream
                                        v
+-------------------------------------------------------------------------------+
|                        SAM AGENT CORE (Node.js / Express)                     |
|                                                                               |
|   [ Goal Analyzer ] -----> [ Dynamic Planner ] ------> [ Task Manager ]       |
|          |                                                    |               |
|          v                                                    v               |
|   [ Tool Selector ] -----> [ Executor Engine ] ------> [ Observer ]           |
|                                                               |               |
|                                                               v               |
|   [ Re-planner ] <-------- [ Evaluator ] ------------> [ Verifier ]           |
+---------------------------------------+---------------------------------------+
                                        |
                                        v
+-------------------------------------------------------------------------------+
|                           INTEGRATED TOOL LAYER                               |
|   🌐 Web Search      🧮 Calculator     💻 Code Executor (Sandbox)             |
|   📊 Data Processor  📄 Doc Generator  🧠 Working Memory                      |
|   🛡️ Human-in-the-Loop Safety Gate                                           |
+-------------------------------------------------------------------------------+
```

---

## 5. Key Features
* **Genuine Agentic Loop:** Real observation, planning, tool selection, evaluation, adaptation, and verification.
* **Deterministic Hackathon Demo Mode:** A 1-click end-to-end presentation scenario proving failure recovery (`FAILED → ANALYZED → REPLANNED → RETRIED → SUCCESS`).
* **Controlled Autonomy & Safety Gate:** Automatic pause and operator approval modal for sensitive or publication actions.
* **Dynamic Re-planning:** Automatic strategy switching when external APIs return errors or rate limits.
* **Live Tool Telemetry:** Inspect exact inputs, outputs, execution latencies, and confidence scores.
* **Algorithmic Rigor:** Sandboxed Code Execution and Calculator eliminate mathematical errors and LLM hallucinations.
* **Task History & Replay:** Inspect previous executions, durations, and adaptation timelines.

---

## 6. Tech Stack
* **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide React, Motion animations.
* **Backend:** Node.js, Express, tsx, esbuild.
* **AI Engine:** Google Gemini 3.8 Flash via `@google/genai` (with autonomous heuristic fallback for 100% demo reliability).
* **Execution & Tools:** In-process sandboxed JS runtime, math parser, data processing matrix, document generator.

---

## 7. Setup & Running Locally

### Prerequisites
* Node.js v18+ or v20+
* npm

### Installation
```bash
# Clone the repository
git clone <repo-url>
cd sam-agent

# Install dependencies
npm install
```

### Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure `.env` contains:
```env
GEMINI_API_KEY="your_api_key_here"
```
*(Note: SAM includes an autonomous demo engine that functions smoothly even in offline demo environments!)*

### Start the Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### Production Build
```bash
npm run build
npm start
```

---

## 8. Hackathon Demo Mode
To experience SAM's self-healing capabilities immediately:
1. Click the **[▶ Run Hackathon Demo]** button on the top bar.
2. Watch SAM:
   * Parse the collegiate team productivity goal.
   * Formulate a 5-step dependency plan.
   * Execute Task 1 via Web Search.
   * Encounter a simulated **HTTP 429 rate limit** on Task 2.
   * Detect failure via the Evaluator.
   * **Visibly re-plan and adapt** to a secondary web scraping tool.
   * Retry and achieve success.
   * Compute a Multi-Criteria Decision Matrix via Code Execution.
   * Request Human Approval before publishing.
   * Verify all constraints and display the final verified deliverable.

---

## 9. Security & Safety
* **Server-Side Key Isolation:** All Gemini API and external service requests are isolated to `server.ts`. No API secrets are exposed to the browser.
* **Permission Model:** Clear bifurcation between safe READ actions and sensitive WRITE actions.
* **Audit Trail:** Every execution step, input, output, and human signature is recorded in the execution log.

---

## 10. Future Scope
* **Autonomous Browser Interaction:** Headless Playwright integration for complex web form interactions.
* **Multi-Agent Swarm Collaboration:** Specialized subordinate agents (Research Agent, Code Critic, Financial Auditor) coordinated by SAM.
* **Persistent Cloud SQL / Firestore Integration:** Cross-device persistent state and enterprise team access control.
