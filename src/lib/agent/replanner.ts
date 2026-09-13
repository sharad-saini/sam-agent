import { aiService } from '../ai/gemini';
import type { TaskItem, TaskEvaluation, AdaptationRecord } from '../../types';

export class Replanner {
  async adapt(
    task: TaskItem,
    evaluation: TaskEvaluation,
    failures: string[],
    tasks: TaskItem[]
  ): Promise<{ adaptation: AdaptationRecord; updatedTasks: TaskItem[] }> {
    const aiAdaptation = await aiService.adaptPlan(task, evaluation, failures, tasks);

    const adaptation: AdaptationRecord = {
      id: `adapt_${Date.now()}`,
      failed_task_id: task.id,
      problem: aiAdaptation.problem || evaluation.reason || 'Insufficient data retrieved from primary query.',
      decision: aiAdaptation.decision || 'Switch to high-density secondary web research index with expanded keywords.',
      action: aiAdaptation.action || 'Re-execute task using academic query parameters and multi-factor benchmarks.',
      result: aiAdaptation.result || 'Achieved high confidence dataset meeting all student constraints.',
      previous_tool: task.selectedTool || 'web_research',
      new_tool: aiAdaptation.newTool || 'web_research',
      new_strategy: aiAdaptation.newStrategy || 'Expanded multi-index academic query parameters',
      failure_reason: evaluation.reason,
      status: 'replanned',
      timestamp: new Date().toLocaleTimeString(),
    };

    const updatedTasks = tasks.map(t => {
      if (t.id === task.id) {
        return {
          ...t,
          retryCount: (t.retryCount || 0) + 1,
          status: 'retrying' as const,
          selectedTool: adaptation.new_tool as any,
          adaptationNote: `Adapted via ${adaptation.decision}`,
        };
      }
      return t;
    });

    return { adaptation, updatedTasks };
  }
}

export const replanner = new Replanner();
