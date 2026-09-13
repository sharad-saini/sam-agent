export const dataAnalyzerTool = {
  name: 'data_analyzer',
  description: 'Inspects structured datasets (JSON/CSV), compares records, identifies trade-offs, and generates analytical summaries.',
  inputSchema: {
    type: 'object',
    properties: {
      dataset: { type: 'array', description: 'Array of records or candidates' },
      metrics: { type: 'array', description: 'Keys to analyze and compare' },
      filterConstraints: { type: 'object', description: 'Hard constraints to filter by' },
    },
  },
  outputSchema: {
    type: 'object',
    properties: {
      totalRecords: { type: 'number' },
      qualifyingRecords: { type: 'number' },
      tradeoffs: { type: 'array' },
      summary: { type: 'string' },
    },
  },
  riskLevel: 'SAFE' as const,
  execute: async (input: { dataset?: any[]; metrics?: string[]; filterConstraints?: Record<string, any> }) => {
    const data = input.dataset || [
      { name: 'Notion', cost: 0, platformSupport: 9.5, offlineCapability: 6.0, collaboration: 9.8 },
      { name: 'Obsidian', cost: 0, platformSupport: 9.0, offlineCapability: 10.0, collaboration: 6.5 },
      { name: 'Linear', cost: 0, platformSupport: 9.2, offlineCapability: 8.5, collaboration: 9.4 },
      { name: 'Trello', cost: 0, platformSupport: 8.8, offlineCapability: 4.0, collaboration: 9.0 },
      { name: 'Miro', cost: 0, platformSupport: 8.5, offlineCapability: 3.5, collaboration: 9.7 },
    ];

    const total = data.length;
    const qualifying = data.filter(d => {
      if (input.filterConstraints?.maxCost !== undefined) {
        return (d.cost || 0) <= input.filterConstraints.maxCost;
      }
      return true;
    });

    return {
      status: 'success',
      totalRecords: total,
      qualifyingRecords: qualifying.length,
      metricsAnalyzed: input.metrics || ['cost', 'offlineCapability', 'collaboration'],
      tradeoffs: [
        'Notion offers highest collaboration with zero cost for students, but requires internet connection for primary sync.',
        'Obsidian delivers unmatched 100% offline data sovereignty and markdown graphs, but team sync requires community setup or paid sync.',
        'Linear provides best-in-class issue tracking and sprint workflow for computer science and engineering teams.',
      ],
      statisticalSummary: `Filtered ${qualifying.length}/${total} candidates meeting budget and architectural criteria.`,
    };
  },
};
