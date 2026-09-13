import { defaultResearchProvider } from './provider';

export const webResearchTool = {
  name: 'web_research',
  description: 'Gathers external web research, technical specifications, and benchmarks.',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Search term or technical topic' },
      forceInsufficient: { type: 'boolean', description: 'Simulate insufficient data for testing adaptation' },
    },
    required: ['query'],
  },
  outputSchema: {
    type: 'object',
    properties: {
      status: { type: 'string' },
      results: { type: 'array' },
      sources: { type: 'array' },
      latencyMs: { type: 'number' },
    },
  },
  riskLevel: 'READ_ONLY' as const,
  execute: async (input: { query: string; forceInsufficient?: boolean; forceFailure?: boolean }) => {
    return defaultResearchProvider.search(input.query, {
      forceInsufficient: input.forceInsufficient,
      forceFailure: input.forceFailure,
    });
  },
};
