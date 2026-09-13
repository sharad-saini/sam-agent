import { aiService } from '../ai/gemini';
import { AGENT_POLICIES } from './policies';
import type { TaskItem, ToolExecutionRecord, Observation, TaskEvaluation } from '../../types';

export class Evaluator {
  async evaluate(
    task: TaskItem,
    record: ToolExecutionRecord,
    observation: Observation
  ): Promise<TaskEvaluation> {
    // If output explicitly marks insufficient or confidence below policy threshold
    if (observation.status === 'insufficient' || observation.confidence < AGENT_POLICIES.confidenceThreshold) {
      return {
        success: false,
        confidence: observation.confidence,
        reason: `Confidence (${Math.round(observation.confidence * 100)}%) below policy threshold (${Math.round(AGENT_POLICIES.confidenceThreshold * 100)}%). ${(observation.missingInformation || []).join(', ')}`,
        action: 'adapt',
        timestamp: new Date().toLocaleTimeString(),
      };
    }

    if (record.status === 'failed') {
      return {
        success: false,
        confidence: 0.2,
        reason: `Tool execution failed: ${record.output?.error || 'Unknown failure'}`,
        action: 'adapt',
        timestamp: new Date().toLocaleTimeString(),
      };
    }

    // Call structured AI evaluation
    const result = await aiService.evaluateResult(task, record.output, observation);
    return {
      success: result.success,
      confidence: result.confidence,
      reason: result.reason,
      action: result.action as any,
      timestamp: new Date().toLocaleTimeString(),
    };
  }
}

export const evaluator = new Evaluator();
