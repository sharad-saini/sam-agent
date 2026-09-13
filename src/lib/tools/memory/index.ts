export class AgentMemoryStore {
  private facts: string[] = [];
  private taskHistory: Record<string, any> = {};
  private keyValues: Record<string, any> = {};

  addFact(fact: string): void {
    if (!this.facts.includes(fact)) {
      this.facts.push(fact);
    }
  }

  getFacts(): string[] {
    return [...this.facts];
  }

  recordTaskResult(taskId: string, result: any): void {
    this.taskHistory[taskId] = {
      result,
      recordedAt: new Date().toISOString(),
    };
  }

  getTaskResult(taskId: string): any {
    return this.taskHistory[taskId]?.result;
  }

  set(key: string, value: any): void {
    this.keyValues[key] = value;
  }

  get(key: string): any {
    return this.keyValues[key];
  }

  clear(): void {
    this.facts = [];
    this.taskHistory = {};
    this.keyValues = {};
  }
}

export const globalMemoryStore = new AgentMemoryStore();

export const memoryTool = {
  name: 'memory',
  description: 'Persists and recalls state, user constraints, previous observations, and key facts across the agent lifecycle.',
  inputSchema: {
    type: 'object',
    properties: {
      action: { type: 'string', enum: ['store_fact', 'recall_facts', 'set', 'get'] },
      fact: { type: 'string' },
      key: { type: 'string' },
      value: { type: 'any' },
    },
    required: ['action'],
  },
  outputSchema: {
    type: 'object',
    properties: {
      status: { type: 'string' },
      facts: { type: 'array' },
      value: { type: 'any' },
    },
  },
  riskLevel: 'SAFE' as const,
  execute: async (input: { action: 'store_fact' | 'recall_facts' | 'set' | 'get'; fact?: string; key?: string; value?: any }) => {
    switch (input.action) {
      case 'store_fact':
        if (input.fact) {
          globalMemoryStore.addFact(input.fact);
        }
        return {
          status: 'success',
          action: 'store_fact',
          storedFact: input.fact,
          totalFacts: globalMemoryStore.getFacts().length,
        };
      case 'recall_facts':
        return {
          status: 'success',
          action: 'recall_facts',
          facts: globalMemoryStore.getFacts(),
        };
      case 'set':
        if (input.key) {
          globalMemoryStore.set(input.key, input.value);
        }
        return {
          status: 'success',
          key: input.key,
          saved: true,
        };
      case 'get':
        return {
          status: 'success',
          key: input.key,
          value: input.key ? globalMemoryStore.get(input.key) : null,
        };
      default:
        return {
          status: 'success',
          facts: globalMemoryStore.getFacts(),
        };
    }
  },
};
