import { aiService } from '../ai/gemini';
import type { PlanData, GoalAnalysisData } from '../ai/schemas';

export class Planner {
  async createPlan(goal: string, analysis: GoalAnalysisData): Promise<PlanData> {
    const plan = await aiService.planTasks(goal, analysis);
    return plan;
  }
}

export const planner = new Planner();
