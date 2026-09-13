import { webResearchTool } from './webResearch';
import { calculatorTool } from './calculator';
import { dataAnalyzerTool } from './dataAnalyzer';
import { documentGeneratorTool } from './documentGenerator';
import { memoryTool } from './memory';

export interface AgentTool {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
  outputSchema: Record<string, any>;
  riskLevel: 'SAFE' | 'READ_ONLY' | 'REQUIRES_APPROVAL';
  execute: (input: any) => Promise<any>;
}

export const toolRegistry: Record<string, AgentTool> = {
  web_research: webResearchTool,
  web_search: webResearchTool, // alias for backwards compatibility
  calculator: calculatorTool,
  data_analyzer: dataAnalyzerTool,
  document_generator: documentGeneratorTool,
  memory: memoryTool,
  human_approval: {
    name: 'human_approval',
    description: 'Human-in-the-loop permission gate for sensitive operations (file modifications, external submissions, publications).',
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string' },
        payload: { type: 'any' },
      },
    },
    outputSchema: {
      type: 'object',
      properties: {
        status: { type: 'string' },
        approved: { type: 'boolean' },
      },
    },
    riskLevel: 'REQUIRES_APPROVAL',
    execute: async (input: any) => {
      return {
        status: 'awaiting_human_approval',
        requiresApproval: true,
        action: input.action || 'Publishing finalized report',
        payload: input.payload,
      };
    },
  },
};

export function getTool(name: string): AgentTool | undefined {
  return toolRegistry[name];
}

export function getAllTools(): AgentTool[] {
  return Object.values(toolRegistry);
}
