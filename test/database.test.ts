import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../src/lib/db/database';

describe('DatabaseManager Audit Trail & Persistence', () => {
  beforeEach(() => {
    db.clear();
  });

  it('should persist a run and retrieve it', () => {
    const run = {
      id: 'test_run_1',
      goal: 'Audit system performance',
      status: 'COMPLETED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.saveRun(run);
    const retrieved = db.getRun('test_run_1');
    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe('test_run_1');
    expect(retrieved?.goal).toBe('Audit system performance');
  });

  it('should persist tasks, tool calls, observations, evaluations, and adaptations', () => {
    const runId = 'test_run_audit';

    db.saveRun({
      id: runId,
      goal: 'Run autonomous workflow',
      status: 'RUNNING',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    db.saveTasks(runId, [
      {
        id: `${runId}_task_1`,
        run_id: runId,
        task_id: 'task_1',
        description: 'Collect metrics',
        status: 'completed',
        dependencies: [],
        success_criteria: 'All metrics present',
        selected_tool: 'web_research',
        retry_count: 0,
      },
    ]);

    db.addToolCall({
      id: 'tc_1',
      run_id: runId,
      task_id: 'task_1',
      tool_name: 'web_research',
      input: { query: 'metrics' },
      output: { result: 'gathered' },
      status: 'success',
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    });

    db.addObservation({
      id: 'obs_1',
      run_id: runId,
      task_id: 'task_1',
      summary: 'Data collected with 95% confidence',
      confidence: 0.95,
      missing_information: [],
      created_at: new Date().toISOString(),
    });

    db.addEvaluation({
      id: 'eval_1',
      run_id: runId,
      task_id: 'task_1',
      success: true,
      confidence: 0.95,
      reason: 'Criteria fully satisfied',
      recommended_action: 'proceed',
      created_at: new Date().toISOString(),
    });

    db.addAdaptation({
      id: 'adapt_1',
      run_id: runId,
      task_id: 'task_1',
      problem: 'Initial query too broad',
      old_strategy: 'Broad search',
      new_strategy: 'Focused parametric search',
      reason: 'Refined parameters',
      created_at: new Date().toISOString(),
    });

    const auditTrail = db.getRunAuditTrail(runId);
    expect(auditTrail).toBeDefined();
    expect(auditTrail?.run.id).toBe(runId);
    expect(auditTrail?.tasks.length).toBe(1);
    expect(auditTrail?.toolCalls.length).toBe(1);
    expect(auditTrail?.observations.length).toBe(1);
    expect(auditTrail?.evaluations.length).toBe(1);
    expect(auditTrail?.adaptations.length).toBe(1);
    expect(auditTrail?.toolCalls[0].tool_name).toBe('web_research');
  });
});
