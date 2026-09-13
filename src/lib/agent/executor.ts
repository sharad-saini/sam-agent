import { toolRegistry } from '../tools';
import type { ToolExecutionRecord } from '../../types';

export class Executor {
  async executeTool(
    toolName: string,
    args: Record<string, any>,
    taskId: string
  ): Promise<ToolExecutionRecord> {
    const tool = toolRegistry[toolName] || toolRegistry.web_research;
    const startTime = Date.now();

    try {
      const output = await tool.execute(args || {});
      const durationMs = Date.now() - startTime;

      const isInsufficient = output && (output.status === 'insufficient' || output.insufficient === true);
      const isFailed = output && (output.status === 'error' || output.status === 'failed');

      return {
        id: `call_${Date.now()}`,
        task_id: taskId,
        tool: toolName as any,
        status: isFailed ? 'failed' : isInsufficient ? 'insufficient' : 'success',
        input: args,
        output,
        duration: durationMs,
        execution_time: durationMs,
        timestamp: new Date().toLocaleTimeString(),
      };
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      return {
        id: `call_${Date.now()}`,
        task_id: taskId,
        tool: toolName as any,
        status: 'failed',
        input: args,
        output: { error: err.message || 'Unknown tool execution error' },
        duration: durationMs,
        execution_time: durationMs,
        timestamp: new Date().toLocaleTimeString(),
      };
    }
  }
}

export const executor = new Executor();
