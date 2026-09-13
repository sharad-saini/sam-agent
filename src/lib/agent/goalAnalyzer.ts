import { aiService } from '../ai/gemini';
import type { GoalAnalysisData } from '../ai/schemas';

export class GoalAnalyzer {
  async analyze(goal: string): Promise<GoalAnalysisData> {
    const analysis = await aiService.analyzeGoal(goal);
    return analysis;
  }
}

export const goalAnalyzer = new GoalAnalyzer();
