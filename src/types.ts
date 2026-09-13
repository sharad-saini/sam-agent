/**
 * SAM: Self-operating AI Manager - Type Definitions
 */

export type AgentWorkflowStage =
  | 'IDLE'
  | 'OBSERVE'
  | 'DECIDE'
  | 'ACT'
  | 'EVALUATE'
  | 'ADAPT'
  | 'VERIFY'
  | 'COMPLETED'
  | 'FAILED';

export type AgentDetailedState =
  | 'IDLE'
  | 'ANALYZING_GOAL'
  | 'PLANNING'
  | 'SELECTING_TOOL'
  | 'EXECUTING'
  | 'OBSERVING'
  | 'EVALUATING'
  | 'ADAPTING'
  | 'REPLANNING'
  | 'WAITING_FOR_APPROVAL'
  | 'VERIFYING'
  | 'COMPLETED'
  | 'FAILED';

export type TaskStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'retrying'
  | 'skipped'
  | 'awaiting_approval';

export type ToolType =
  | 'web_search'
  | 'web_research'
  | 'calculator'
  | 'code_executor'
  | 'document_generator'
  | 'data_processor'
  | 'data_analyzer'
  | 'memory'
  | 'human_approval';

export interface GoalAnalysis {
  goal: string;
  objective?: string;
  constraints: string[];
  desired_output: string;
  desiredOutcome?: string;
  success_criteria: string[];
  successCriteria?: string[];
  requiredCapabilities?: string[];
  risk_level: 'low' | 'medium' | 'high';
  riskLevel?: 'low' | 'medium' | 'high';
  requires_approval: boolean;
  estimated_steps?: number;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  required_tool: ToolType;
  selectedTool?: ToolType;
  dependencies: string[];
  status: TaskStatus;
  success_criteria: string;
  successCriteria?: string;
  toolCandidates?: ToolType[];
  duration?: number;
  confidence?: number;
  retryCount: number;
  error?: string;
  result?: any;
  whyTool?: string;
  adaptationNote?: string;
  executionRecord?: any;
  evaluation?: any;
}

export interface ToolExecutionRecord {
  id: string;
  task_id: string;
  tool: ToolType;
  tool_name?: string;
  input: any;
  output: any;
  status: 'success' | 'failed' | 'insufficient';
  timestamp: string;
  execution_time: number;
  duration?: number;
  whyTool?: string;
  findings?: string[];
  error?: string;
}

export interface Observation {
  task_id?: string;
  taskId?: string;
  tool?: ToolType;
  status?: 'success' | 'failed' | 'insufficient';
  summary?: string;
  useful_information?: string[];
  usefulInformation?: string[];
  errors?: string[];
  missing_information?: string[];
  missingInformation?: string[];
  unexpected_conditions?: string[];
  unexpectedConditions?: string[];
  confidence: number;
  timestamp: string;
}

export interface EvaluationResult {
  task_id?: string;
  taskId?: string;
  success: boolean;
  confidence: number;
  reason: string;
  action?: 'proceed' | 'continue' | 'retry' | 'adapt';
  recommended_action?: 'proceed' | 'search_again' | 'retry' | 'replan' | 'switch_tool' | 'request_approval';
  timestamp: string;
}

export type TaskEvaluation = EvaluationResult;

export interface AdaptationRecord {
  id: string;
  failed_task_id: string;
  problem: string;
  decision: string;
  action: string;
  result: string;
  failure_reason?: string;
  previous_tool?: ToolType;
  new_strategy?: string;
  new_tool?: ToolType;
  timestamp: string;
  status: 'analyzed' | 'replanned' | 'retried' | 'success';
}

export interface VerificationCheck {
  criterion: string;
  passed: boolean;
  detail?: string;
}

export interface VerificationResult {
  verified: boolean;
  confidence: number;
  checks: VerificationCheck[];
  summary?: string;
  timestamp: string;
}

export interface ApprovalRequest {
  id: string;
  taskId: string;
  title?: string;
  description?: string;
  action?: string;
  actionType?: string;
  tool?: ToolType | string;
  parameters?: any;
  payload?: any;
  reason?: string;
  riskLevel: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'rejected';
  timestamp?: string;
  requestedAt?: string;
}

export interface FinalResult {
  title: string;
  executiveSummary: string;
  sections?: {
    heading: string;
    content: string;
    items?: string[];
  }[];
  comparisonTable?: {
    headers: string[];
    rows: (string | number)[][];
  };
  recommendations: string[];
  dataPoints?: {
    metric: string;
    value: string;
    source: string;
  }[];
  sources?: {
    name: string;
    url?: string;
    credibility: string;
  }[];
  verificationNotes: string[];
  verification?: VerificationResult;
  confidenceScore?: number;
}

export interface ExecutionStats {
  totalTasks?: number;
  completedTasks?: number;
  retries?: number;
  totalSteps?: number;
  toolsUsedCount: number;
  retriesCount?: number;
  adaptationsCount: number;
  executionTimeSec?: number;
  elapsedTimeSeconds?: number;
  avgConfidence?: number;
  confidenceScore?: number;
  successRate?: number;
}

export interface AgentState {
  id: string;
  goal: string;
  stage: AgentWorkflowStage;
  status: AgentDetailedState;
  constraints?: string[];
  desired_output?: string;
  desiredOutcome?: string;
  success_criteria?: string[];
  successCriteria?: string[];
  risk_level?: 'low' | 'medium' | 'high';
  riskLevel?: 'low' | 'medium' | 'high';
  currentTaskId: string | null;
  currentTask?: string | null;
  tasks: TaskItem[];
  plan?: TaskItem[];
  toolResults?: ToolExecutionRecord[];
  toolHistory: ToolExecutionRecord[];
  toolCalls?: any[];
  observations?: Observation[];
  failures?: string[];
  adaptations?: AdaptationRecord[];
  approvals?: ApprovalRequest[];
  approvalRequest?: ApprovalRequest | null;
  memoryFacts: string[];
  finalResult: FinalResult | null;
  verification?: VerificationResult | null;
  stats: ExecutionStats;
  isDemo?: boolean;
  activeTool: ToolType | null;
  createdAt?: string;
  completedAt?: string;
  logs: ActivityLogItem[];
  hasAdapted: boolean;
  retriesCount: number;
  retryCount?: number;
  config: AgentConfig;
  goalAnalysis?: GoalAnalysis;
}

export type AgentEventType =
  | 'GOAL_RECEIVED'
  | 'GOAL_ANALYZED'
  | 'PLAN_CREATED'
  | 'TASK_STARTED'
  | 'TOOL_SELECTED'
  | 'TOOL_EXECUTED'
  | 'OBSERVATION_CREATED'
  | 'EVALUATION_COMPLETED'
  | 'TASK_FAILED'
  | 'ADAPTATION_TRIGGERED'
  | 'PLAN_UPDATED'
  | 'TASK_RETRIED'
  | 'TASK_COMPLETED'
  | 'VERIFICATION_STARTED'
  | 'VERIFICATION_COMPLETED'
  | 'GOAL_COMPLETED'
  | 'WAITING_APPROVAL'
  | 'APPROVAL_RESOLVED'
  | 'SAFE_TERMINATION';

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  type:
    | 'goal'
    | 'plan'
    | 'tool_select'
    | 'execute'
    | 'observe'
    | 'evaluate'
    | 'failure'
    | 'replan'
    | 'retry'
    | 'approval'
    | 'verify'
    | 'completed'
    | 'system';
  eventType?: AgentEventType;
  message: string;
  detail?: string;
  confidence?: number;
  taskId?: string;
  tool?: ToolType;
}

export interface AgentConfig {
  autonomy: 'manual' | 'assisted' | 'autonomous';
  requireApproval: boolean;
  maxSteps: number;
  maxRetries: number;
  enabledTools: Partial<Record<ToolType, boolean>>;
  webAccess: boolean;
  codeExecution: boolean;
}

export interface AgentTestCase {
  id: string;
  name: string;
  description: string;
  category: 'execution' | 'failure' | 'adaptation' | 'safety' | 'robustness';
  status: 'idle' | 'running' | 'passed' | 'failed';
  durationMs?: number;
  logs: string[];
  assertions: { name: string; passed: boolean; details?: string }[];
}

export interface AgentEvent {
  id: string;
  timestamp: string;
  type: AgentEventType | string;
  payload: any;
}

export interface DemoScenario {
  id: string;
  title: string;
  description: string;
  goal: string;
  steps: any[];
}

