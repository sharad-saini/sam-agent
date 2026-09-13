import React from 'react';
import { X, History, CheckCircle2, AlertTriangle, Play, Clock, ArrowRight } from 'lucide-react';
import type { AgentState } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: AgentState[];
  onLoadRun: (run: AgentState) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onLoadRun,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl max-h-[85vh] rounded-2xl bg-[#0F172A] border border-slate-700 shadow-2xl flex flex-col overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <History className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-base text-slate-100">Execution History</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-3">
          {history.length === 0 ? (
            <div className="py-12 text-center text-slate-500 font-mono text-xs">
              No previous agent runs recorded. Run a goal or the hackathon demo to create one.
            </div>
          ) : (
            history.map((run, idx) => (
              <div
                key={run.id || idx}
                onClick={() => {
                  onLoadRun(run);
                  onClose();
                }}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/60 transition cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="text-sm font-semibold text-slate-200 group-hover:text-cyan-300 transition line-clamp-1">
                    {run.goal}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs font-mono shrink-0">
                    {run.stage === 'COMPLETED' ? (
                      <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/80">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        COMPLETED
                      </span>
                    ) : (
                      <span className="text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/80">
                        {run.stage}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
                  <span>Tasks: {run.tasks?.length || 0}</span>
                  <span>Tools: {run.stats?.toolsUsedCount || 0}</span>
                  {(run.stats?.adaptationsCount || 0) > 0 && (
                    <span className="text-amber-400">
                      {run.stats?.adaptationsCount} Adaptation
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {run.stats?.executionTimeSec || 0}s
                  </span>
                  <div className="ml-auto text-cyan-400 flex items-center gap-1 text-[11px] group-hover:translate-x-0.5 transition">
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
