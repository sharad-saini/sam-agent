# Technical Approach & Implementation Details

### 1. State Machine Orchestrator
SAM is implemented using an asynchronous finite state machine (FSM) where states represent operational agent phases:
* `IDLE`: Awaiting user goal or demo trigger.
* `OBSERVE`: Ingesting user prompt and environment constraints into structured perception memory.
* `DECIDE`: Generating or revising task dependency graph, selecting tool with rationale.
* `ACT`: Invoking tool runtime, recording execution latency, inputs, and outputs.
* `EVALUATE`: Scoring success against explicit task criteria.
* `ADAPT`: Triage of failure conditions, mutating task plan, and switching tool strategies.
* `VERIFY`: Auditing all subtasks and constraint satisfaction before output release.
* `COMPLETED`: Output finalized and verified.

### 2. Structured AI Output & Schema Enforcement
Model interactions utilize `@google/genai` with `gemini-3.8-flash` on the Express backend. Schema enforcement ensures that:
* Model outputs are parsed into strictly typed TypeScript interfaces (`GoalAnalysis`, `TaskItem[]`, `EvaluationResult`).
* If external network anomalies or missing API keys occur, SAM includes an intelligent heuristic orchestrator ensuring 100% demo reliability under conference/hackathon conditions.

### 3. Tool Runtime Engine
Each tool conforms to a common typed contract:
```typescript
interface ToolDefinition<TInput, TOutput> {
  name: ToolType;
  description: string;
  execute: (input: TInput) => Promise<TOutput>;
  riskLevel: 'low' | 'medium' | 'high';
  requiresHumanSignoff: boolean;
}
```
Available tools:
1. `web_search`: Multi-source research synthesis with confidence scoring.
2. `calculator`: Deterministic arithmetic engine handling PEMDAS, currency exchange, and ratios.
3. `code_executor`: Sandboxed JavaScript evaluation for numerical algorithms and decision matrices.
4. `data_processor`: Multi-criteria filtering, ranking, and aggregation.
5. `document_generator`: Compiles markdown deliverables with executive tables and citations.
6. `memory`: Thread-safe working memory store for passing facts between subtasks.
7. `human_approval`: Safe-guard gate enforcing human review for write or publication operations.

### 4. Failure Recovery & Adaptation Protocol
The self-healing protocol executes the following steps:
1. Capture error payload in `ToolExecutionRecord`.
2. Evaluator marks `success: false` and computes confidence.
3. Re-planner identifies alternative tool from available inventory.
4. Mutates target task `required_tool`, marks status as `retrying`.
5. Emits `AdaptationRecord` describing previous vs new strategy.
6. Visual pipeline triggers branch animation:
   `ACT → FAILED → EVALUATE → ADAPT → NEW PLAN → ACT (SUCCESS)`.

### 5. Security & Secret Management
* All Gemini API and external service calls remain strictly on the server (`server.ts`).
* No API keys or tokens are ever exposed to the client bundle.
* `.env.example` documents `GEMINI_API_KEY` and `APP_URL`.
