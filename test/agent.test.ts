import { describe, it, expect } from 'vitest';
import { AgentOrchestrator } from '../src/lib/agent/agent';
import { db } from '../src/lib/db/database';

describe('AgentOrchestrator Full Agentic Lifecycle', () => {
  it('should execute end-to-end O-D-A-E-A-V loop with demo failure adaptation', async () => {
    const orchestrator = new AgentOrchestrator(
      'Research and compare the best productivity tools for a student team and recommend the best option.',
      true,
      { requireApproval: false } // autonomous execution test
    );

    const events: string[] = [];
    orchestrator.setCallbacks({
      onEvent: (evt) => {
        events.push(evt.type);
      },
    });

    const finalState = await orchestrator.run({ forceDemoFailures: true });

    // Verify terminal state
    expect(finalState.stage).toBe('COMPLETED');
    expect(finalState.status).toBe('COMPLETED');
    expect(finalState.finalResult).toBeDefined();
    expect(finalState.verification?.verified).toBe(true);

    // Verify self-healing adaptation occurred
    expect(finalState.hasAdapted).toBe(true);
    expect(finalState.adaptations.length).toBeGreaterThan(0);
    expect(finalState.stats.adaptationsCount).toBeGreaterThan(0);

    // Verify canonical events were emitted in proper sequence
    expect(events).toContain('GOAL_RECEIVED');
    expect(events).toContain('GOAL_ANALYZED');
    expect(events).toContain('PLAN_CREATED');
    expect(events).toContain('TASK_STARTED');
    expect(events).toContain('TOOL_SELECTED');
    expect(events).toContain('TOOL_EXECUTED');
    expect(events).toContain('OBSERVATION_CREATED');
    expect(events).toContain('EVALUATION_COMPLETED');
    expect(events).toContain('ADAPTATION_TRIGGERED');
    expect(events).toContain('TASK_COMPLETED');
    expect(events).toContain('VERIFICATION_STARTED');
    expect(events).toContain('VERIFICATION_COMPLETED');
    expect(events).toContain('GOAL_COMPLETED');

    // Verify database recorded full audit trail
    const audit = db.getRunAuditTrail(finalState.id);
    expect(audit).toBeDefined();
    expect(audit?.run.status).toBe('COMPLETED');
    expect(audit?.tasks.length).toBeGreaterThan(0);
    expect(audit?.toolCalls.length).toBeGreaterThan(0);
    expect(audit?.observations.length).toBeGreaterThan(0);
    expect(audit?.evaluations.length).toBeGreaterThan(0);
    expect(audit?.adaptations.length).toBeGreaterThan(0);
  }, 30000);

  it('should halt safely if human operator rejects sensitive authorization', async () => {
    const orchestrator = new AgentOrchestrator(
      'Authorize release and publish sensitive deployment',
      false,
      { requireApproval: true }
    );

    let approvalRequested = false;
    orchestrator.setCallbacks({
      onAwaitingApproval: (approvalReq) => {
        approvalRequested = true;
        // Operator rejects action
        setTimeout(() => {
          orchestrator.resolveApproval(false);
        }, 10);
      },
    });

    const finalState = await orchestrator.run();

    expect(approvalRequested).toBe(true);
    expect(finalState.status).toBe('FAILED');
  }, 30000);
});
