import { aiService } from '../ai/gemini';
import { toolRegistry } from '../tools';
import type { TaskItem } from '../../types';
import type { ToolSelectionData } from '../ai/schemas';

export class ToolSelector {
  async selectTool(task: TaskItem, memoryFacts: string[]): Promise<ToolSelectionData> {
    const availableTools = Object.keys(toolRegistry);
    const selection = await aiService.selectTool(task, availableTools, memoryFacts);
    return selection;
  }
}

export const toolSelector = new ToolSelector();
