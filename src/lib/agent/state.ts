import type {
  AgentWorkflowStage,
  AgentDetailedState,
  TaskItem,
  ToolExecutionRecord,
  Observation,
  AdaptationRecord,
  ApprovalRequest,
  FinalResult,
  VerificationResult,
  ExecutionStats,
  ActivityLogItem,
  GoalAnalysis,
} from '../../types';

export interface CentralAgentState {
  id: string;
  goal: string;
  stage: AgentWorkflowStage;
  status: AgentDetailedState;
  constraints: string[];
  desiredOutcome: string;
  successCriteria: string[];
  requiredCapabilities: string[];
  riskLevel: 'low' | 'medium' | 'high';

  plan: TaskItem[];
  tasks: TaskItem[];
  currentTaskId: string | null;

  observations: Observation[];
  toolCalls: any[];
  toolHistory: ToolExecutionRecord[];
  toolResults: ToolExecutionRecord[];

  failures: string[];
  adaptations: AdaptationRecord[];
  retryCount: number;

  approvals: ApprovalRequest[];
  approvalRequest: ApprovalRequest | null;

  memoryFacts: string[];
  finalResult: FinalResult | null;
  verification: VerificationResult | null;

  logs: ActivityLogItem[];
  stats: ExecutionStats;
  isDemo?: boolean;
}

export const VALID_TRANSITIONS: Record<AgentDetailedState, AgentDetailedState[]> = {
  IDLE: ['ANALYZING_GOAL'],
  ANALYZING_GOAL: ['PLANNING', 'FAILED'],
  PLANNING: ['SELECTING_TOOL', 'FAILED'],
  SELECTING_TOOL: ['EXECUTING', 'WAITING_FOR_APPROVAL', 'FAILED'],
  EXECUTING: ['OBSERVING', 'WAITING_FOR_APPROVAL', 'FAILED'],
  OBSERVING: ['EVALUATING', 'FAILED'],
  EVALUATING: ['SELECTING_TOOL', 'ADAPTING', 'VERIFYING', 'FAILED'],
  ADAPTING: ['REPLANNING', 'FAILED'],
  REPLANNING: ['SELECTING_TOOL', 'EXECUTING', 'FAILED'],
  WAITING_FOR_APPROVAL: ['EXECUTING', 'FAILED'],
  VERIFYING: ['COMPLETED', 'ADAPTING', 'FAILED'],
  COMPLETED: ['IDLE'],
  FAILED: ['IDLE', 'REPLANNING'],
};

export function canTransition(from: AgentDetailedState, to: AgentDetailedState): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}
