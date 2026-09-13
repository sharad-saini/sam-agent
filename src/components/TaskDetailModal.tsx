import React from 'react';
import { X, CheckCircle2, AlertTriangle, Clock, RotateCw, Cpu, Brain, Shield } from 'lucide-react';
import type { TaskItem } from '../types';

interface TaskDetailModalProps {
  task: TaskItem | null;
  onClose: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onClose }) => {
  if (!task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl max-h-[85vh] rounded-2xl bg-[#0F172A] border border-slate-700/80 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
              {task.id.toUpperCase()}
            </span>
            <h3 className="font-bold text-base text-slate-100">{task.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs font-mono text-slate-300">
          {/* Status & Tool Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Status</span>
              <span className="font-bold text-slate-200 capitalize">{task.status}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Assigned Tool</span>
              <span className="font-bold text-cyan-400 capitalize">{(task.required_tool || task.selectedTool || 'tool').replace(/_/g, ' ')}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Duration</span>
              <span className="font-bold text-slate-200">{task.duration !== undefined ? `${task.duration}s` : 'N/A'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Retries</span>
              <span className="font-bold text-amber-400">{task.retryCount}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-bold">
              Task Specification
            </div>
            <p className="text-slate-300 font-sans leading-relaxed text-xs bg-slate-900/40 p-3 rounded-xl border border-slate-800">
              {task.description}
            </p>
          </div>

          {/* Why this tool */}
          {task.whyTool && (
            <div>
              <div className="text-[10px] text-cyan-400 uppercase tracking-wider mb-1 font-bold flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5" />
                <span>Tool Selection Rationale</span>
              </div>
              <p className="text-slate-300 font-sans italic text-xs bg-cyan-950/20 p-3 rounded-xl border border-cyan-900/40">
                "{task.whyTool}"
              </p>
            </div>
          )}

          {/* Evaluator Verdict */}
          {task.evaluation && (
            <div>
              <div className="text-[10px] text-purple-400 uppercase tracking-wider mb-1 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Evaluator Assessment</span>
              </div>
              <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-900/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold">
                    Success: {task.evaluation.success ? (
                      <span className="text-emerald-400">PASSED</span>
                    ) : (
                      <span className="text-rose-400">FAILED</span>
                    )}
                  </span>
                  <span className="text-purple-300">
                    Confidence: {(task.evaluation.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="text-slate-300 font-sans text-xs">
                  {task.evaluation.reason}
                </div>
                {task.evaluation.recommended_action && (
                  <div className="text-amber-300 text-[11px]">
                    Recommendation: {task.evaluation.recommended_action.toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Telemetry Record: Input & Output */}
          {task.executionRecord && (
            <div className="space-y-3">
              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-bold flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tool Input Payload</span>
                </div>
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 overflow-x-auto whitespace-pre-wrap max-h-40">
                  {JSON.stringify(task.executionRecord.input, null, 2)}
                </pre>
              </div>

              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-bold">
                  Tool Output Payload
                </div>
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 overflow-x-auto whitespace-pre-wrap max-h-56">
                  {JSON.stringify(task.executionRecord.output, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition cursor-pointer"
          >
            Close Telemetry
          </button>
        </div>
      </div>
    </div>
  );
};
