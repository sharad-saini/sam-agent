export const AGENT_POLICIES = {
  maxRetriesPerTask: 3,
  maxTotalSteps: 20,
  confidenceThreshold: 0.70,
  minCandidatesForComparison: 3,
  sensitiveTools: ['human_approval'],
  isActionSensitive: (toolName: string, actionType?: string): boolean => {
    if (toolName === 'human_approval') return true;
    if (actionType && ['publish', 'delete', 'overwrite', 'external_api_write'].includes(actionType)) {
      return true;
    }
    return false;
  },
};
