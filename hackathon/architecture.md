# SAM Architecture Specification

### System Architecture Diagram

```
+-------------------------------------------------------------------------------+
|                                  USER / OPERATOR                              |
|   - Inputs high-level goal                                                    |
|   - Configures autonomy & tools                                               |
|   - Grants Human-in-the-loop safety approvals                                |
+---------------------------------------+---------------------------------------+
                                        |
                                        v
+-------------------------------------------------------------------------------+
|                           FRONTEND INTERFACE (React 19 + Tailwind)            |
|   * Dynamic Workflow Pipeline (OBSERVE -> DECIDE -> ACT -> EVALUATE -> ADAPT) |
|   * Live Task Manager Cards & State Indicator                                 |
|   * Real-Time Activity Log Stream                                             |
|   * Active Tool Execution Inspector & Status Badges                           |
|   * Human Safety Approval Modal                                               |
|   * Verified Executive Deliverable & Stats Dashboard                          |
+---------------------------------------+---------------------------------------+
                                        |  REST / Server-Sent Events (SSE)
                                        v
+-------------------------------------------------------------------------------+
|                    AGENT ORCHESTRATOR & SERVER CORE (Node / Express)          |
|                                                                               |
|   +-------------------+       +--------------------+       +--------------+   |
|   |   Goal Analyzer   | ----> |     Planner        | ----> | Task Manager |   |
|   |  - Objective      |       |  - Dependency Graph|       |  - Pending   |   |
|   |  - Constraints    |       |  - Subtask Specs   |       |  - Running   |   |
|   |  - Criteria       |       |  - Success Rules   |       |  - Retrying  |   |
|   +-------------------+       +--------------------+       +-------+------+   |
|                                                                    |          |
|                                                                    v          |
|   +-------------------+       +--------------------+       +--------------+   |
|   |   Tool Selector   | <---- |     Executor       | <---- |   Observer   |   |
|   |  - "Why this tool"|       |  - Telemetry logs  |       |  - Findings  |   |
|   |  - Routing        |       |  - Execution time  |       |  - Errors    |   |
|   +-------------------+       +--------------------+       +-------+------+   |
|                                                                    |          |
|                                                                    v          |
|   +-------------------+       +--------------------+       +--------------+   |
|   |    Re-planner     | <---- |    Evaluator       | ----> |   Verifier   |   |
|   |  - Failure triage |       |  - Success (T/F)   |       |  - All tasks |   |
|   |  - Strategy swap  |       |  - Confidence score|       |  - Citations |   |
|   |  - Self-healing   |       |  - Next Action     |       |  - Outcome   |   |
|   +-------------------+       +--------------------+       +--------------+   |
+---------------------------------------+---------------------------------------+
                                        |
                                        v
+-------------------------------------------------------------------------------+
|                        TOOLS & INTEGRATIONS SUBSYSTEM                         |
|                                                                               |
|   [🌐 Web Search]      [🧮 Calculator]       [💻 Code Executor]               |
|    - Verified data      - PEMDAS math         - Sandboxed JS runtime          |
|    - Real telemetry     - Currency / units    - Numerical algorithms          |
|                                                                               |
|   [📊 Data Processor]  [📄 Doc Generator]    [🛡️ Human Approval Gate]         |
|    - Multi-criteria     - Structured briefs   - Controlled autonomy           |
|    - Statistical sort   - Markdown artifacts  - Cryptographic safety check    |
|                                                                               |
|   [🧠 Working Memory]                                                         |
|    - Contextual fact store across execution loop                              |
+-------------------------------------------------------------------------------+
```

---

### Core Components Deep Dive

#### 1. Goal Analyzer
* Ingests natural-language prompts.
* Deconstructs into:
  - `goal`: Core objective statement.
  - `constraints`: Inviolable boundary conditions (e.g., pricing thresholds, time limits, platform support).
  - `desired_output`: Format of output expected.
  - `success_criteria`: Quantitative conditions required for task sign-off.
  - `risk_level`: Low, medium, or high operational risk.
  - `requires_approval`: Boolean enforcing human safety intervention.

#### 2. Planner & Task Manager
* Formulates directed acyclic graphs (DAGs) of tasks.
* Each task possesses:
  - `id`: Unique identifier (e.g. `task_1`).
  - `title` and `description`.
  - `required_tool`: Target tool matching requirements.
  - `dependencies`: Array of upstream prerequisite task IDs.
  - `status`: `pending`, `running`, `completed`, `failed`, `retrying`, `skipped`, or `awaiting_approval`.
  - `whyTool`: Justification visible to the user.

#### 3. Tool Selector & Execution Engine
* Never calls tools randomly.
* Matches task parameters to tool capability contracts.
* Captures standard execution telemetry:
  - Start timestamp, end timestamp, execution duration (ms).
  - Input payload, sanitized output payload.
  - Error stack and status code.

#### 4. Observer & Evaluator
* Analyzes tool output against task success criteria.
* Evaluator output schema:
  ```json
  {
    "task_id": "task_2",
    "success": false,
    "confidence": 0.22,
    "reason": "Primary Tool Directory API returned 429 Rate Limit.",
    "recommended_action": "replan"
  }
  ```

#### 5. Re-planner / Adaptation Engine
* Automatically invoked when `success === false` or `confidence < 0.60`.
* Identifies failure modality (API downtime, schema mismatch, insufficient results).
* Computes alternative route:
  - Swaps tool from `data_processor` to `web_search`.
  - Increments `retryCount`.
  - Updates task state to `retrying`.
  - Emits adaptation event to frontend.

#### 6. Final Verifier
* Evaluates all completed subtasks against initial goal constraints.
* Confirms no lingering failures or unapproved sensitive actions.
* Marks goal state as `COMPLETED`.
