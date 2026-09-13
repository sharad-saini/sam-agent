import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCw,
  Shield,
  Circle,
  HelpCircle,
  Search,
  Calculator,
  Code2,
  Database,
  FileText,
  Brain,
  ChevronRight,
} from 'lucide-react';
import type { TaskItem, ToolType } from '../types';

interface TaskPlanPanelProps {
  tasks: TaskItem[];
  currentTaskId: string | null;
  onSelectTask: (task: TaskItem) => void;
}

export const TaskPlanPanel: React.FC<TaskPlanPanelProps> = ({
  tasks,
  currentTaskId,
  onSelectTask,
}) => {
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const getToolIcon = (tool: ToolType) => {
    switch (tool) {
      case 'web_search':
        return <Search className="w-3.5 h-3.5 text-cyan-400" />;
      case 'calculator':
        return <Calculator className="w-3.5 h-3.5 text-emerald-400" />;
      case 'code_executor':
        return <Code2 className="w-3.5 h-3.5 text-amber-400" />;
      case 'data_processor':
        return <Database className="w-3.5 h-3.5 text-blue-400" />;
      case 'document_generator':
        return <FileText className="w-3.5 h-3.5 text-purple-400" />;
      case 'memory':
        return <Brain className="w-3.5 h-3.5 text-pink-400" />;
      case 'human_approval':
        return <Shield className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <HelpCircle className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getStatusBadge = (task: TaskItem) => {
    switch (task.status) {
      case 'completed':
        return (
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-mono font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>COMPLETED</span>
          </div>
        );
      case 'running':
        return (
          <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-mono font-semibold animate-pulse">
            <RotateCw className="w-4 h-4 animate-spin" />
            <span>RUNNING</span>
          </div>
        );
      case 'retrying':
        return (
          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-mono font-semibold animate-pulse">
            <RotateCw className="w-4 h-4 animate-spin text-amber-400" />
            <span>RETRYING (ADAPTING)</span>
          </div>
        );
      case 'failed':
        return (
          <div className="flex items-center gap-1.5 text-rose-400 text-xs font-mono font-medium">
            <AlertTriangle className="w-4 h-4" />
            <span>FAILED</span>
          </div>
        );
      case 'awaiting_approval':
        return (
          <div className="flex items-center gap-1.5 text-amber-300 text-xs font-mono font-medium bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/80 animate-pulse">
            <Shield className="w-3.5 h-3.5" />
            <span>AWAITING APPROVAL</span>
          </div>
        );
      case 'pending':
      default:
        return (
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-mono">
            <Circle className="w-3.5 h-3.5" />
            <span>PENDING</span>
          </div>
        );
    }
  };

  return (
    <div className="w-full bg-[#0E1526]/90 border border-slate-800/90 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono">
            Dynamic Task Plan
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
            {safeTasks.length} Subtasks
          </span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
          Click task to inspect execution telemetry
        </span>
      </div>

      {safeTasks.length === 0 ? (
        <div className="py-8 text-center text-slate-500 font-mono text-xs">
          No active plan generated yet. Enter a goal or click [Run Hackathon Demo] to initiate.
        </div>
      ) : (
        <div className="space-y-3">
          {safeTasks.map((task, idx) => {
            const isCurrent = currentTaskId === task.id;

            return (
              <div
                key={task.id}
                onClick={() => onSelectTask(task)}
                className={`group relative p-4 rounded-xl border transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-slate-900/95 border-cyan-500/80 ring-1 ring-cyan-500/40 shadow-lg shadow-cyan-500/5'
                    : task.status === 'completed'
                    ? 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                    : task.status === 'retrying'
                    ? 'bg-amber-950/20 border-amber-800/60'
                    : 'bg-slate-950/30 border-slate-900/80 text-slate-500'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      {task.id.toUpperCase()}
                    </span>
                    <h4 className="font-semibold text-sm text-slate-200 group-hover:text-cyan-300 transition">
                      {task.title}
                    </h4>
                  </div>
                  {getStatusBadge(task)}
                </div>

                <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                  {task.description}
                </p>

                {/* Footer Metadata */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono border-t border-slate-800/60 pt-2.5">
                  <div className="flex items-center gap-3">
                    {/* Tool Badge */}
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                      {getToolIcon(task.required_tool || task.selectedTool || 'web_search')}
                      <span className="capitalize">{(task.required_tool || task.selectedTool || 'web_search').replace(/_/g, ' ')}</span>
                    </div>

                    {/* Duration */}
                    {task.duration !== undefined && (
                      <div className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{task.duration}s</span>
                      </div>
                    )}

                    {/* Retries */}
                    {task.retryCount > 0 && (
                      <span className="text-amber-400 bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-800/60">
                        {task.retryCount} {task.retryCount === 1 ? 'Retry' : 'Retries'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-200 transition">
                    {task.whyTool && (
                      <span className="hidden md:inline text-[10px] text-slate-500 italic truncate max-w-xs">
                        "{task.whyTool}"
                      </span>
                    )}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
