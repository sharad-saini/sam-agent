import type { TaskItem } from '../../types';

export class TaskManager {
  getNextExecutableTask(tasks: TaskItem[]): TaskItem | null {
    const completedIds = new Set(tasks.filter(t => t.status === 'completed').map(t => t.id));

    // Find first task that is pending or retrying whose dependencies are all completed
    return tasks.find(t => {
      if (t.status !== 'pending' && t.status !== 'retrying') {
        return false;
      }
      if (!t.dependencies || t.dependencies.length === 0) {
        return true;
      }
      return t.dependencies.every(depId => completedIds.has(depId));
    }) || null;
  }

  isPlanComplete(tasks: TaskItem[]): boolean {
    return tasks.every(t => t.status === 'completed');
  }

  hasFailedTasksExceedingRetries(tasks: TaskItem[], maxRetries: number): boolean {
    return tasks.some(t => t.status === 'failed' && (t.retryCount || 0) >= maxRetries);
  }
}

export const taskManager = new TaskManager();
