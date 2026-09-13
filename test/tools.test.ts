import { describe, it, expect } from 'vitest';
import { toolRegistry, getTool, getAllTools } from '../src/lib/tools';

describe('Agent Tools Registry & Execution', () => {
  it('should register all expected tools with proper schemas and risk levels', () => {
    const tools = getAllTools();
    expect(tools.length).toBeGreaterThanOrEqual(5);

    const toolNames = Object.keys(toolRegistry);
    expect(toolNames).toContain('web_research');
    expect(toolNames).toContain('calculator');
    expect(toolNames).toContain('data_analyzer');
    expect(toolNames).toContain('document_generator');
    expect(toolNames).toContain('memory');
    expect(toolNames).toContain('human_approval');
  });

  it('calculator tool should evaluate mathematical expressions correctly', async () => {
    const calc = getTool('calculator');
    expect(calc).toBeDefined();

    const result = await calc!.execute({ expression: '100 * 0.45 + 15' });
    expect(result.result).toBe(60);
  });

  it('web_research tool should return curated student software evidence', async () => {
    const web = getTool('web_research');
    expect(web).toBeDefined();

    const result = await web!.execute({ query: 'productivity tools for student teams' });
    expect(result.status).toBe('success');
    expect(result.results.length).toBeGreaterThan(0);
  });

  it('data_analyzer tool should perform comparative ranking', async () => {
    const analyzer = getTool('data_analyzer');
    expect(analyzer).toBeDefined();

    const result = await analyzer!.execute({
      data: [
        { name: 'Tool A', cost: 0, score: 92 },
        { name: 'Tool B', cost: 10, score: 75 },
      ],
      operation: 'compare',
    });
    expect(result.status).toBe('success');
  });

  it('document_generator tool should synthesize structured Markdown documents', async () => {
    const docGen = getTool('document_generator');
    expect(docGen).toBeDefined();

    const result = await docGen!.execute({
      title: 'Final Decision Memo',
      sections: [{ heading: 'Summary', content: 'Evaluation complete.' }],
    });
    expect(result.status).toBe('success');
    expect(result.document).toContain('Final Decision Memo');
  });
});
