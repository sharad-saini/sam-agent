import { describe, it, expect } from 'vitest';
import {
  GoalAnalysisSchema,
  PlanSchema,
  ToolSelectionSchema,
  EvaluationSchema,
  AdaptationSchema,
  VerificationSchema,
  FinalResultSchema,
} from '../src/lib/ai/schemas';

describe('Structured AI Zod Schemas Validation', () => {
  it('should validate GoalAnalysisSchema successfully', () => {
    const valid = {
      constraints: ['Zero budget', 'Fast onboarding'],
      desiredOutcome: 'Select optimal tool',
      successCriteria: 'Recommendation justified with metrics',
      riskLevel: 'LOW',
    };
    const parsed = GoalAnalysisSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it('should validate PlanSchema successfully', () => {
    const valid = {
      tasks: [
        {
          id: 'task_1',
          description: 'Search tools',
          dependencies: [],
          status: 'pending',
          successCriteria: 'List 5 items',
          toolCandidates: ['web_research'],
          retryCount: 0,
        },
      ],
      rationale: 'Step-by-step',
    };
    const parsed = PlanSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it('should validate ToolSelectionSchema successfully', () => {
    const valid = {
      selectedTool: 'web_research',
      reason: 'Best for web data',
      arguments: { query: 'test' },
      riskLevel: 'SAFE',
    };
    const parsed = ToolSelectionSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it('should validate EvaluationSchema successfully', () => {
    const valid = {
      success: true,
      confidence: 0.95,
      reason: 'Outputs match criteria',
      action: 'proceed',
      satisfiesCriteria: true,
    };
    const parsed = EvaluationSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it('should validate AdaptationSchema successfully', () => {
    const valid = {
      problem: 'Query failed',
      remedy: 'Fallback to secondary source',
      modifiedTasks: [
        {
          id: 'task_2',
          description: 'Updated query',
          dependencies: [],
          status: 'pending',
          successCriteria: 'Pass',
          toolCandidates: ['web_research'],
          retryCount: 1,
        },
      ],
      reason: 'Recovery strategy',
    };
    const parsed = AdaptationSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it('should validate VerificationSchema successfully', () => {
    const valid = {
      verified: true,
      confidence: 0.94,
      checks: [
        { criterion: 'Zero cost verified', passed: true },
        { criterion: 'Comparison matrix present', passed: true },
      ],
      rationale: 'All constraints verified',
    };
    const parsed = VerificationSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it('should validate FinalResultSchema successfully', () => {
    const valid = {
      recommendedTool: 'Notion',
      summary: 'Best for collaborative documentation and free for students',
      decisionRationale: 'Meets zero budget and student plan features',
      comparisonMatrix: [
        { name: 'Notion', freeTier: true, score: 95 },
      ],
    };
    const parsed = FinalResultSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });
});
