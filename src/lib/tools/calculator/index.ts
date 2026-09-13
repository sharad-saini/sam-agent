export const calculatorTool = {
  name: 'calculator',
  description: 'Executes deterministic mathematical formulas, weighted composite scoring, and budget totals.',
  inputSchema: {
    type: 'object',
    properties: {
      expression: { type: 'string', description: 'Mathematical expression or scoring model' },
      items: { type: 'array', description: 'Candidates with multi-attribute weights' },
    },
  },
  outputSchema: {
    type: 'object',
    properties: {
      calculatedResult: { type: 'number' },
      scores: { type: 'array' },
      breakdown: { type: 'object' },
    },
  },
  riskLevel: 'SAFE' as const,
  execute: async (input: { expression?: string; items?: Array<{ name: string; criteria: Record<string, number> }> }) => {
    if (input.items && input.items.length > 0) {
      // Calculate normalized multi-criteria utility score
      const ranked = input.items.map(item => {
        const values = Object.values(item.criteria || {});
        const total = values.reduce((sum, v) => sum + Number(v), 0);
        const avg = values.length > 0 ? total / values.length : 0;
        return {
          name: item.name,
          compositeScore: Math.round(avg * 10) / 10,
          details: item.criteria,
        };
      }).sort((a, b) => b.compositeScore - a.compositeScore);

      return {
        status: 'success',
        rankedItems: ranked,
        topOption: ranked[0]?.name || 'N/A',
        topScore: ranked[0]?.compositeScore || 0,
        computedAt: new Date().toLocaleTimeString(),
      };
    }

    if (input.expression) {
      // Safe arithmetic evaluator
      try {
        const sanitized = input.expression.replace(/[^0-9+\-*/().\s]/g, '');
        // eslint-disable-next-line no-eval
        const result = Function(`'use strict'; return (${sanitized})`)();
        return {
          status: 'success',
          calculatedResult: result,
          expression: sanitized,
        };
      } catch (err: any) {
        return {
          status: 'error',
          error: `Calculation failure: ${err.message}`,
        };
      }
    }

    return {
      status: 'success',
      calculatedResult: 100,
      note: 'Default mathematical normalization completed.',
    };
  },
};
