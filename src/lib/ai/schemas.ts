import { z } from 'zod';

export const ToolTypeSchema = z.enum([
  'web_search',
  'web_research',
  'calculator',
  'code_executor',
  'document_generator',
  'data_analyzer',
  'memory',
  'human_approval',
]);

export const RiskLevelSchema = z.enum(['low', 'medium', 'high']);

export const GoalAnalysisSchema = z.object({
  objective: z.string().min(1),
  constraints: z.array(z.string()).default([]),
  desiredOutcome: z.string().min(1),
  successCriteria: z.array(z.string()).min(1),
  requiredCapabilities: z.array(z.string()).default([]),
  riskLevel: RiskLevelSchema.default('low'),
  requiresApproval: z.boolean().default(false),
  estimatedSteps: z.number().int().positive().optional(),
});

export type GoalAnalysisData = z.infer<typeof GoalAnalysisSchema>;

export const TaskItemSchema = z.object({
  id: z.string(),
  description: z.string(),
  dependencies: z.array(z.string()).default([]),
  status: z.enum(['pending', 'running', 'completed', 'failed', 'retrying', 'awaiting_approval']).default('pending'),
  successCriteria: z.string(),
  toolCandidates: z.array(ToolTypeSchema).default([]),
  selectedTool: ToolTypeSchema.optional(),
  retryCount: z.number().int().nonnegative().default(0),
  duration: z.number().optional(),
  confidence: z.number().optional(),
  whyTool: z.string().optional(),
  adaptationNote: z.string().optional(),
});

export type TaskItemData = z.infer<typeof TaskItemSchema>;

export const PlanSchema = z.object({
  tasks: z.array(TaskItemSchema).min(1),
  rationale: z.string().optional(),
});

export type PlanData = z.infer<typeof PlanSchema>;

export const ToolSelectionSchema = z.object({
  selectedTool: ToolTypeSchema,
  reason: z.string().min(1),
  arguments: z.record(z.string(), z.any()).default({}),
  riskLevel: z.enum(['SAFE', 'READ_ONLY', 'REQUIRES_APPROVAL']).default('SAFE'),
});

export type ToolSelectionData = z.infer<typeof ToolSelectionSchema>;

export const ObservationSchema = z.object({
  taskId: z.string(),
  tool: ToolTypeSchema,
  status: z.enum(['success', 'failed', 'insufficient']),
  summary: z.string(),
  confidence: z.number().min(0).max(1),
  missingInformation: z.array(z.string()).default([]),
  usefulInformation: z.array(z.string()).default([]),
  unexpectedConditions: z.array(z.string()).default([]),
  timestamp: z.string(),
});

export type ObservationData = z.infer<typeof ObservationSchema>;

export const EvaluationSchema = z.object({
  success: z.boolean(),
  confidence: z.number().min(0).max(1),
  reason: z.string(),
  action: z.enum(['proceed', 'continue', 'retry', 'adapt']),
  satisfiesCriteria: z.boolean().default(true),
  timestamp: z.string().optional(),
});

export type EvaluationData = z.infer<typeof EvaluationSchema>;

export const AdaptationSchema = z.object({
  id: z.string(),
  failedTaskId: z.string(),
  problem: z.string(),
  decision: z.string(),
  action: z.string(),
  result: z.string(),
  previousTool: ToolTypeSchema.optional(),
  newTool: ToolTypeSchema.optional(),
  newStrategy: z.string().optional(),
  timestamp: z.string(),
  status: z.enum(['analyzed', 'replanned', 'retried', 'success']).default('success'),
});

export type AdaptationData = z.infer<typeof AdaptationSchema>;

export const VerificationCheckSchema = z.object({
  criterion: z.string(),
  passed: z.boolean(),
  detail: z.string().optional(),
});

export const VerificationSchema = z.object({
  verified: z.boolean(),
  confidence: z.number().min(0).max(1),
  checks: z.array(VerificationCheckSchema).min(1),
  summary: z.string().optional(),
  timestamp: z.string(),
});

export type VerificationData = z.infer<typeof VerificationSchema>;

export const FinalResultSchema = z.object({
  title: z.string(),
  executiveSummary: z.string(),
  sections: z.array(z.object({
    heading: z.string(),
    content: z.string(),
    items: z.array(z.string()).optional(),
  })).optional(),
  comparisonTable: z.object({
    headers: z.array(z.string()),
    rows: z.array(z.array(z.union([z.string(), z.number()]))),
  }).optional(),
  recommendations: z.array(z.string()),
  dataPoints: z.array(z.object({
    metric: z.string(),
    value: z.string(),
    source: z.string(),
  })).optional(),
  verificationNotes: z.array(z.string()).default([]),
  confidenceScore: z.number().optional(),
});

export type FinalResultData = z.infer<typeof FinalResultSchema>;
