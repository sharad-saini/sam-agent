import { goalAnalyzer } from './goalAnalyzer';
import { planner } from './planner';
import { taskManager } from './taskManager';
import { toolSelector } from './toolSelector';
import { executor } from './executor';
import { observer } from './observer';
import { evaluator } from './evaluator';
import { replanner } from './replanner';
import { verifier } from './verifier';
import { AGENT_POLICIES } from './policies';
import { defaultResearchProvider } from '../tools/webResearch/provider';
import { aiService } from '../ai/gemini';
import { db } from '../db/database';
import type {
  AgentState,
  AgentWorkflowStage,
  AgentDetailedState,
  TaskItem,
  ToolExecutionRecord,
  Observation,
  AdaptationRecord,
  ApprovalRequest,
  FinalResult,
  VerificationResult,
  AgentEvent,
  AgentConfig,
} from '../../types';

export interface AgentRunCallbacks {
  onEvent?: (event: AgentEvent) => void;
  onStateChange?: (state: AgentState) => void;
  onAwaitingApproval?: (approval: ApprovalRequest) => void;
}

export class AgentOrchestrator {
  private state: AgentState;
  private isPaused: boolean = false;
  private pendingApprovalResolve: ((approved: boolean) => void) | null = null;
  private callbacks: AgentRunCallbacks = {};
  private memoryFacts: string[] = [];

  constructor(initialGoal: string, isDemo: boolean = false, initialConfig?: Partial<AgentConfig>) {
    this.state = {
      id: `run_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      goal: initialGoal,
      stage: 'IDLE',
      status: 'IDLE',
      tasks: [],
      currentTaskId: null,
      activeTool: null,
      observations: [],
      toolCalls: [],
      toolHistory: [],
      toolResults: [],
      failures: [],
      hasAdapted: false,
      adaptations: [],
      retriesCount: 0,
      memoryFacts: [],
      config: {
        autonomy: 'autonomous',
        requireApproval: true,
        maxSteps: 20,
        maxRetries: 3,
        enabledTools: {
          web_research: true,
          calculator: true,
          data_analyzer: true,
          document_generator: true,
          memory: true,
          human_approval: true,
        },
        webAccess: true,
        codeExecution: true,
        ...initialConfig,
      },
      stats: {
        totalSteps: 0,
        toolsUsedCount: 0,
        retriesCount: 0,
        adaptationsCount: 0,
        elapsedTimeSeconds: 0,
        confidenceScore: 0.95,
      },
      logs: [],
      approvalRequest: null,
      finalResult: null,
      verification: null,
      isDemo,
    };
  }

  public getState(): AgentState {
    return { ...this.state };
  }

  public setCallbacks(callbacks: AgentRunCallbacks) {
    this.callbacks = callbacks;
  }

  private emit(type: any, payload: any) {
    const event: AgentEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
      type,
      payload,
    };

    if (this.callbacks.onEvent) {
      this.callbacks.onEvent(event);
    }
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange(this.getState());
    }
  }

  private updateStatus(stage: AgentWorkflowStage, detailedState: AgentDetailedState, message?: string) {
    this.state.stage = stage;
    this.state.status = detailedState;
    if (message) {
      this.state.logs.push({
        id: `log_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: stage === 'OBSERVE' ? 'observe' : stage === 'DECIDE' ? 'plan' : stage === 'ACT' ? 'execute' : stage === 'EVALUATE' ? 'evaluate' : stage === 'ADAPT' ? 'replan' : stage === 'VERIFY' ? 'verify' : 'system',
        message,
      });
    }
    this.emit('STATE_CHANGED', { stage, detailedState, message });
  }

  public async run(options?: { forceDemoFailures?: boolean }) {
    const startTime = Date.now();

    // Persist run in database (Section 17)
    db.saveRun({
      id: this.state.id,
      goal: this.state.goal,
      status: 'OBSERVE',
      created_at: new Date(startTime).toISOString(),
      updated_at: new Date(startTime).toISOString(),
    });

    this.emit('GOAL_RECEIVED', { goal: this.state.goal, runId: this.state.id });
    this.updateStatus('OBSERVE', 'ANALYZING_GOAL', `Perceiving goal: "${this.state.goal}"`);

    if (options?.forceDemoFailures || this.state.isDemo) {
      defaultResearchProvider.reset();
    }

    // 1. Goal Analysis (OBSERVE)
    const goalAnalysis = await goalAnalyzer.analyze(this.state.goal);
    this.state.constraints = goalAnalysis.constraints;
    this.state.desiredOutcome = goalAnalysis.desiredOutcome;
    this.state.successCriteria = goalAnalysis.successCriteria;
    this.state.riskLevel = goalAnalysis.riskLevel;

    this.state.logs.push({
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'goal',
      message: `Goal decomposed: ${goalAnalysis.constraints.length} constraints identified, risk level: ${goalAnalysis.riskLevel}`,
    });
    this.emit('GOAL_ANALYZED', goalAnalysis);

    // 2. Planning (DECIDE)
    this.updateStatus('DECIDE', 'PLANNING', 'Synthesizing DAG task execution plan');
    const plan = await planner.createPlan(this.state.goal, goalAnalysis);
    this.state.tasks = plan.tasks.map(t => ({
      id: t.id,
      title: t.description,
      description: t.description,
      required_tool: (t.selectedTool || t.toolCandidates?.[0] || 'web_research') as any,
      selectedTool: (t.selectedTool || t.toolCandidates?.[0] || 'web_research') as any,
      dependencies: t.dependencies || [],
      status: t.status || 'pending',
      success_criteria: t.successCriteria || '',
      successCriteria: t.successCriteria,
      toolCandidates: t.toolCandidates as any,
      retryCount: t.retryCount || 0,
    }));

    // Persist tasks in database
    db.saveTasks(this.state.id, this.state.tasks.map(t => ({
      id: `${this.state.id}_${t.id}`,
      run_id: this.state.id,
      task_id: t.id,
      description: t.description,
      status: t.status,
      dependencies: t.dependencies,
      success_criteria: t.successCriteria || '',
      selected_tool: t.selectedTool,
      retry_count: t.retryCount || 0,
    })));

    this.emit('PLAN_CREATED', plan);

    // Loop through tasks (O-D-A-E-A)
    while (!taskManager.isPlanComplete(this.state.tasks)) {
      if ((this.state.stats.totalSteps || 0) >= (this.state.config.maxSteps || AGENT_POLICIES.maxTotalSteps)) {
        this.updateStatus('FAILED', 'FAILED', 'Maximum step execution limit reached.');
        this.emit('SAFE_TERMINATION', { reason: 'Max steps exceeded' });
        return this.state;
      }

      const task = taskManager.getNextExecutableTask(this.state.tasks);
      if (!task) {
        if (taskManager.hasFailedTasksExceedingRetries(this.state.tasks, this.state.config.maxRetries || AGENT_POLICIES.maxRetriesPerTask)) {
          this.updateStatus('FAILED', 'FAILED', 'Task exceeded max retries limit.');
          this.emit('SAFE_TERMINATION', { reason: 'Max retries exceeded on task' });
          return this.state;
        }
        break;
      }

      this.state.currentTaskId = task.id;
      task.status = 'running';
      this.state.stats.totalSteps = (this.state.stats.totalSteps || 0) + 1;
      this.emit('TASK_STARTED', task);

      // 3. Tool Selection (DECIDE)
      this.updateStatus('DECIDE', 'SELECTING_TOOL', `Selecting optimal tool for task: ${task.description}`);
      const toolSelection = await toolSelector.selectTool(task, this.memoryFacts);
      task.selectedTool = toolSelection.selectedTool as any;
      task.required_tool = toolSelection.selectedTool as any;
      task.whyTool = toolSelection.reason;
      this.state.activeTool = toolSelection.selectedTool as any;
      this.emit('TOOL_SELECTED', { task, toolSelection });

      // Check Human Approval policy (DECIDE Safety Gate)
      if (
        this.state.config.requireApproval &&
        (toolSelection.riskLevel === 'REQUIRES_APPROVAL' || toolSelection.selectedTool === 'human_approval' || AGENT_POLICIES.isActionSensitive(toolSelection.selectedTool))
      ) {
        this.updateStatus('DECIDE', 'WAITING_FOR_APPROVAL', `Sensitive action requires human operator approval`);
        const approvalReq: ApprovalRequest = {
          id: `appr_${Date.now()}`,
          taskId: task.id,
          title: 'Human Safety Gate: Action Authorization',
          description: `Authorization required for sensitive action: ${toolSelection.selectedTool}`,
          action: 'Authorize Tool Execution',
          actionType: 'tool_execution',
          tool: toolSelection.selectedTool,
          parameters: toolSelection.arguments,
          payload: toolSelection.arguments,
          reason: 'Protects system boundaries and validates parameters prior to execution.',
          riskLevel: 'high',
          status: 'pending',
          timestamp: new Date().toLocaleTimeString(),
          requestedAt: new Date().toLocaleTimeString(),
        };

        this.state.approvalRequest = approvalReq;
        db.addApproval({
          id: approvalReq.id,
          run_id: this.state.id,
          action: approvalReq.action || 'Tool Authorization',
          payload: approvalReq.payload,
          status: 'pending',
          created_at: new Date().toISOString(),
        });

        this.emit('WAITING_APPROVAL', approvalReq);
        this.emit('APPROVAL_REQUIRED', approvalReq);

        // Wait for user approval
        const approved = await new Promise<boolean>(resolve => {
          this.pendingApprovalResolve = resolve;
          if (this.callbacks.onAwaitingApproval) {
            this.callbacks.onAwaitingApproval(approvalReq);
          }
        });

        if (!approved) {
          task.status = 'failed';
          this.state.approvalRequest = null;
          this.emit('APPROVAL_RESOLVED', { approved: false, taskId: task.id });
          this.updateStatus('FAILED', 'FAILED', 'Human operator rejected sensitive operation.');
          this.emit('SAFE_TERMINATION', { reason: 'Operator rejected sensitive action', taskId: task.id });
          return this.state;
        }

        this.emit('APPROVAL_RESOLVED', { approved: true, taskId: task.id });
        this.state.approvalRequest = null;
      }

      // 4. Execution (ACT)
      this.updateStatus('ACT', 'EXECUTING', `Executing ${task.selectedTool || task.required_tool}...`);
      const shouldForceInsufficient = Boolean(
        options?.forceDemoFailures &&
        task.id === 'task_2' &&
        task.retryCount === 0
      );

      const execRecord: ToolExecutionRecord = await executor.executeTool(
        task.selectedTool || task.required_tool || 'web_research',
        {
          query: task.description,
          forceInsufficient: shouldForceInsufficient,
        },
        task.id
      );

      this.state.toolHistory.push(execRecord);
      this.state.toolCalls = this.state.toolCalls || [];
      this.state.toolCalls.push(execRecord);
      this.state.stats.toolsUsedCount++;

      // Persist tool call in database
      db.addToolCall({
        id: `tc_${Date.now()}`,
        run_id: this.state.id,
        task_id: task.id,
        tool_name: execRecord.tool,
        input: execRecord.input,
        output: execRecord.output,
        status: execRecord.status,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      });

      this.emit('TOOL_EXECUTED', execRecord);
      this.emit('TOOL_COMPLETED', execRecord);

      // 5. Observation (OBSERVE)
      this.updateStatus('OBSERVE', 'OBSERVING', `Observing and structuring output from ${execRecord.tool}`);
      const observation: Observation = observer.observe(task, execRecord);
      this.state.observations = this.state.observations || [];
      this.state.observations.push(observation);

      // Persist observation in database
      db.addObservation({
        id: `obs_${Date.now()}`,
        run_id: this.state.id,
        task_id: task.id,
        summary: observation.summary,
        confidence: observation.confidence,
        missing_information: observation.missingInformation || [],
        created_at: new Date().toISOString(),
      });

      this.emit('OBSERVATION_CREATED', observation);
      this.emit('OBSERVATION_RECORDED', observation);

      // 6. Evaluation (EVALUATE)
      this.updateStatus('EVALUATE', 'EVALUATING', `Evaluating criteria and confidence for ${task.id}`);
      const evaluation = await evaluator.evaluate(task, execRecord, observation);

      // Persist evaluation in database
      db.addEvaluation({
        id: `eval_${Date.now()}`,
        run_id: this.state.id,
        task_id: task.id,
        success: evaluation.success,
        confidence: evaluation.confidence,
        reason: evaluation.reason,
        recommended_action: evaluation.action,
        created_at: new Date().toISOString(),
      });

      this.emit('EVALUATION_COMPLETED', { task, evaluation });
      this.emit('TASK_EVALUATED', { task, evaluation });

      if (evaluation.action === 'adapt' || !evaluation.success) {
        // Check retry limits
        if ((task.retryCount || 0) >= (this.state.config.maxRetries || AGENT_POLICIES.maxRetriesPerTask)) {
          task.status = 'failed';
          this.emit('TASK_FAILED', { task, reason: 'Exceeded maximum retry limit' });
          this.updateStatus('FAILED', 'FAILED', `Task ${task.id} exceeded max retries.`);
          this.emit('SAFE_TERMINATION', { reason: 'Max retries exceeded', taskId: task.id });
          return this.state;
        }

        // 7. Adaptation (ADAPT)
        this.updateStatus('ADAPT', 'ADAPTING', `Self-healing adaptation triggered: ${evaluation.reason}`);
        this.state.hasAdapted = true;
        this.state.stats.adaptationsCount++;
        this.state.retriesCount++;

        const { adaptation, updatedTasks } = await replanner.adapt(
          task,
          evaluation,
          this.state.failures || [],
          this.state.tasks
        );

        this.state.adaptations = this.state.adaptations || [];
        this.state.adaptations.push(adaptation);
        this.state.tasks = updatedTasks;

        // Persist adaptation in database
        db.addAdaptation({
          id: adaptation.id,
          run_id: this.state.id,
          task_id: task.id,
          problem: adaptation.problem,
          old_strategy: adaptation.decision,
          new_strategy: adaptation.action,
          reason: adaptation.result,
          created_at: new Date().toISOString(),
        });

        this.emit('ADAPTATION_TRIGGERED', { task, evaluation, adaptation });
        this.emit('PLAN_ADAPTED', adaptation);
        this.emit('PLAN_UPDATED', { adaptation, updatedTasks });
        this.emit('TASK_RETRIED', { task, retryCount: task.retryCount });

        // Immediate retry of the adapted task with resolved parameters
        this.updateStatus('DECIDE', 'REPLANNING', `Re-planning: ${adaptation.decision}`);
        continue;
      }

      // Task Passed
      task.status = 'completed';
      task.confidence = evaluation.confidence;
      this.state.logs.push({
        id: `log_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'completed',
        message: `Task ${task.id} successfully completed (confidence: ${Math.round(evaluation.confidence * 100)}%)`,
      });
      this.emit('TASK_COMPLETED', { task });
    }

    // 8. Verification (VERIFY)
    this.updateStatus('VERIFY', 'VERIFYING', 'Running final verification audit against initial constraints');
    this.emit('VERIFICATION_STARTED', { goal: this.state.goal, tasks: this.state.tasks });

    // Dynamically generate final result based on goal and observations
    const finalResult: FinalResult = await aiService.generateFinalResult(
      this.state.goal,
      this.state.observations || [],
      this.state.tasks
    );

    const verification: VerificationResult = await verifier.verify(
      this.state.goal,
      goalAnalysis.successCriteria,
      this.state.tasks,
      finalResult
    );

    finalResult.verification = verification;
    this.state.finalResult = finalResult;
    this.state.verification = verification;
    this.state.currentTaskId = null;
    this.state.activeTool = null;
    this.state.stats.elapsedTimeSeconds = Math.round((Date.now() - startTime) / 1000);
    this.state.stats.confidenceScore = verification.confidence;

    // Update run in database with final status and result
    db.saveRun({
      id: this.state.id,
      goal: this.state.goal,
      status: verification.verified ? 'COMPLETED' : 'FAILED',
      created_at: new Date(startTime).toISOString(),
      updated_at: new Date().toISOString(),
      final_result: finalResult,
    });

    this.emit('VERIFICATION_COMPLETED', verification);

    if (verification.verified) {
      this.updateStatus('COMPLETED', 'COMPLETED', 'Agent run completed and verified successfully.');
      this.emit('GOAL_COMPLETED', { finalResult, verification });
      this.emit('RUN_COMPLETED', { finalResult, verification });
    } else {
      this.updateStatus('FAILED', 'FAILED', 'Verification checks failed against constraints.');
      this.emit('SAFE_TERMINATION', { reason: 'Verification criteria unsatisfied' });
    }

    return this.state;
  }

  public resolveApproval(approved: boolean) {
    if (this.pendingApprovalResolve) {
      this.pendingApprovalResolve(approved);
      this.pendingApprovalResolve = null;
    }
  }
}

