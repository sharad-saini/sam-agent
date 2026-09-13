export interface AgentRunRecord {
  id: string;
  goal: string;
  status: string;
  created_at: string;
  updated_at: string;
  final_result?: any;
}

export interface TaskRecord {
  id: string;
  run_id: string;
  task_id: string;
  description: string;
  status: string;
  dependencies: string[];
  success_criteria: string;
  selected_tool?: string;
  retry_count: number;
}

export interface ToolCallRecord {
  id: string;
  run_id: string;
  task_id: string;
  tool_name: string;
  input: any;
  output: any;
  status: string;
  started_at: string;
  completed_at: string;
}

export interface ObservationRecord {
  id: string;
  run_id: string;
  task_id: string;
  summary: string;
  confidence: number;
  missing_information: string[];
  created_at: string;
}

export interface EvaluationRecord {
  id: string;
  run_id: string;
  task_id: string;
  success: boolean;
  confidence: number;
  reason: string;
  recommended_action: string;
  created_at: string;
}

export interface AdaptationDbRecord {
  id: string;
  run_id: string;
  task_id: string;
  problem: string;
  old_strategy: string;
  new_strategy: string;
  reason: string;
  created_at: string;
}

export interface ApprovalDbRecord {
  id: string;
  run_id: string;
  action: string;
  payload: any;
  status: string;
  created_at: string;
}

class DatabaseManager {
  private agentRuns: Map<string, AgentRunRecord> = new Map();
  private tasks: Map<string, TaskRecord[]> = new Map();
  private toolCalls: Map<string, ToolCallRecord[]> = new Map();
  private observations: Map<string, ObservationRecord[]> = new Map();
  private evaluations: Map<string, EvaluationRecord[]> = new Map();
  private adaptations: Map<string, AdaptationDbRecord[]> = new Map();
  private approvals: Map<string, ApprovalDbRecord[]> = new Map();

  // Reset database for tests and development
  clear(): void {
    this.agentRuns.clear();
    this.tasks.clear();
    this.toolCalls.clear();
    this.observations.clear();
    this.evaluations.clear();
    this.adaptations.clear();
    this.approvals.clear();
  }

  // Agent Runs
  saveRun(run: AgentRunRecord): void {
    this.agentRuns.set(run.id, { ...run, updated_at: new Date().toISOString() });
  }

  getRun(id: string): AgentRunRecord | undefined {
    return this.agentRuns.get(id);
  }

  getAllRuns(): AgentRunRecord[] {
    return Array.from(this.agentRuns.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  // Tasks
  saveTasks(runId: string, tasks: TaskRecord[]): void {
    this.tasks.set(runId, tasks);
  }

  getTasks(runId: string): TaskRecord[] {
    return this.tasks.get(runId) || [];
  }

  // Tool Calls
  addToolCall(call: ToolCallRecord): void {
    const list = this.toolCalls.get(call.run_id) || [];
    list.push(call);
    this.toolCalls.set(call.run_id, list);
  }

  getToolCalls(runId: string): ToolCallRecord[] {
    return this.toolCalls.get(runId) || [];
  }

  // Observations
  addObservation(obs: ObservationRecord): void {
    const list = this.observations.get(obs.run_id) || [];
    list.push(obs);
    this.observations.set(obs.run_id, list);
  }

  getObservations(runId: string): ObservationRecord[] {
    return this.observations.get(runId) || [];
  }

  // Evaluations
  addEvaluation(ev: EvaluationRecord): void {
    const list = this.evaluations.get(ev.run_id) || [];
    list.push(ev);
    this.evaluations.set(ev.run_id, list);
  }

  getEvaluations(runId: string): EvaluationRecord[] {
    return this.evaluations.get(runId) || [];
  }

  // Adaptations
  addAdaptation(ad: AdaptationDbRecord): void {
    const list = this.adaptations.get(ad.run_id) || [];
    list.push(ad);
    this.adaptations.set(ad.run_id, list);
  }

  getAdaptations(runId: string): AdaptationDbRecord[] {
    return this.adaptations.get(runId) || [];
  }

  // Approvals
  addApproval(appr: ApprovalDbRecord): void {
    const list = this.approvals.get(appr.run_id) || [];
    list.push(appr);
    this.approvals.set(appr.run_id, list);
  }

  getApprovals(runId: string): ApprovalDbRecord[] {
    return this.approvals.get(runId) || [];
  }

  // Full Relational Audit Trail Reconstruction (Section 17)
  getRunAuditTrail(runId: string): {
    run?: AgentRunRecord;
    tasks: TaskRecord[];
    toolCalls: ToolCallRecord[];
    observations: ObservationRecord[];
    evaluations: EvaluationRecord[];
    adaptations: AdaptationDbRecord[];
    approvals: ApprovalDbRecord[];
    summary: {
      totalTasks: number;
      totalToolCalls: number;
      totalObservations: number;
      totalEvaluations: number;
      totalAdaptations: number;
      totalApprovals: number;
    };
  } {
    const run = this.getRun(runId);
    const tasks = this.getTasks(runId);
    const toolCalls = this.getToolCalls(runId);
    const observations = this.getObservations(runId);
    const evaluations = this.getEvaluations(runId);
    const adaptations = this.getAdaptations(runId);
    const approvals = this.getApprovals(runId);

    return {
      run,
      tasks,
      toolCalls,
      observations,
      evaluations,
      adaptations,
      approvals,
      summary: {
        totalTasks: tasks.length,
        totalToolCalls: toolCalls.length,
        totalObservations: observations.length,
        totalEvaluations: evaluations.length,
        totalAdaptations: adaptations.length,
        totalApprovals: approvals.length,
      },
    };
  }
}

export const db = new DatabaseManager();

