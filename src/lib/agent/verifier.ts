import { aiService } from '../ai/gemini';
import type { TaskItem, VerificationResult, FinalResult } from '../../types';

export class Verifier {
  async verify(
    goal: string,
    criteria: string[],
    tasks: TaskItem[],
    finalResult: FinalResult
  ): Promise<VerificationResult> {
    const aiVerification = await aiService.verifyResult(goal, criteria, tasks, finalResult);

    return {
      verified: aiVerification.verified,
      confidence: aiVerification.confidence,
      checks: aiVerification.checks.map(c => ({
        criterion: c.criterion,
        passed: c.passed,
        detail: c.detail,
      })),
      timestamp: new Date().toLocaleTimeString(),
    };
  }
}

export const verifier = new Verifier();
