import type { TaskItem, ToolExecutionRecord, Observation } from '../../types';

export class Observer {
  observe(task: TaskItem, record: ToolExecutionRecord): Observation {
    const isSuccess = record.status === 'success';
    const isInsufficient = record.status === 'insufficient';

    let summary = '';
    let confidence = 0.92;
    const missingInfo: string[] = [];
    const usefulInfo: string[] = [];

    if (isInsufficient) {
      summary = `Execution of ${record.tool} returned insufficient results (${record.output?.results?.length || 0} items). Does not meet required 5-option sample threshold.`;
      confidence = 0.45;
      missingInfo.push('Comprehensive 5-option candidate set', 'Detailed offline latency metrics');
    } else if (!isSuccess) {
      summary = `Execution failed with error: ${record.output?.error || 'Unknown error'}`;
      confidence = 0.2;
      missingInfo.push('All required parameters and data fields');
    } else {
      summary = `Successfully executed ${record.tool}. Criteria met with verifiable parameters.`;
      confidence = 0.94;
      usefulInfo.push(`Validated output parameters for ${task.description}`);
    }

    return {
      taskId: task.id,
      task_id: task.id,
      tool: record.tool,
      summary,
      confidence,
      missingInformation: missingInfo,
      missing_information: missingInfo,
      usefulInformation: usefulInfo,
      useful_information: usefulInfo,
      unexpectedConditions: isInsufficient ? ['Data density below criteria threshold'] : [],
      status: isSuccess ? 'success' : isInsufficient ? 'insufficient' : 'failed',
      timestamp: new Date().toLocaleTimeString(),
    };
  }
}

export const observer = new Observer();
