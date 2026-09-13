import React from 'react';
import { RefreshCw, AlertTriangle, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import type { AdaptationRecord } from '../types';

interface AdaptationPanelProps {
  adaptations: AdaptationRecord[];
  isAdapting?: boolean;
}

export const AdaptationPanel: React.FC<AdaptationPanelProps> = ({ adaptations, isAdapting }) => {
  if (!adaptations || adaptations.length === 0) {
    return null;
  }

  return (
    <div
      id="sam-adaptation-panel"
      className="p-5 rounded-2xl bg-gradient-to-b from-amber-950/30 to-slate-900/60 border border-amber-500/40 shadow-xl shadow-amber-950/20 backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-top-4"
    >
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-amber-500/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <RefreshCw className={`w-5 h-5 ${isAdapting ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-amber-200 tracking-wide">
                Agent Adaptation &amp; Self-Healing Engine
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Autonomous strategy mutation triggered in response to runtime obstacle or deficit.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-amber-400/90 bg-amber-950/60 px-3 py-1.5 rounded-lg border border-amber-800/40">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>{adaptations.length} Event{adaptations.length > 1 ? 's' : ''} Detected</span>
        </div>
      </div>

      <div className="space-y-4">
        {adaptations.map((item, idx) => (
          <div
            key={item.id || idx}
            className="p-4 rounded-xl bg-slate-950/70 border border-amber-900/40 space-y-3 font-sans text-xs"
          >
            <div className="flex items-center justify-between text-slate-400 font-mono text-[11px] pb-2 border-b border-slate-800/70">
              <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <ShieldAlert className="w-3.5 h-3.5" />
                Target Task: {item.failed_task_id.toUpperCase()}
              </span>
              <span>{item.timestamp || 'Runtime'}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Problem */}
              <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/30">
                <div className="flex items-center gap-1.5 text-rose-300 font-semibold font-mono text-[11px] uppercase tracking-wider mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  Problem
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {item.problem || item.failure_reason || 'Insufficient or blocked tool results detected by Evaluator.'}
                </p>
              </div>

              {/* Decision */}
              <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-900/30">
                <div className="flex items-center gap-1.5 text-blue-300 font-semibold font-mono text-[11px] uppercase tracking-wider mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  Decision
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {item.decision || item.new_strategy || 'Mutate execution strategy and select alternative tool.'}
                </p>
              </div>

              {/* Action */}
              <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-900/30">
                <div className="flex items-center gap-1.5 text-amber-300 font-semibold font-mono text-[11px] uppercase tracking-wider mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Action
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {item.action || `Re-assign tool from ${item.previous_tool || 'prior tool'} to ${item.new_tool || 'alternative'} and re-invoke execution.`}
                </p>
              </div>

              {/* Result */}
              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/30">
                <div className="flex items-center gap-1.5 text-emerald-300 font-semibold font-mono text-[11px] uppercase tracking-wider mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Result
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {item.result || 'Obstacle resolved. Candidate evidence verified by evaluator, allowing pipeline to advance.'}
                </p>
              </div>
            </div>

            {/* Loop Visualizer */}
            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="text-slate-500">Autonomous Cycle:</span>
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">ACT</span>
                <ArrowRight className="w-3 h-3 text-slate-600" />
                <span className="px-2 py-0.5 rounded bg-rose-950/60 text-rose-400 border border-rose-900/40">FAILED</span>
                <ArrowRight className="w-3 h-3 text-slate-600" />
                <span className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-900/40">ADAPT</span>
                <ArrowRight className="w-3 h-3 text-slate-600" />
                <span className="px-2 py-0.5 rounded bg-blue-950/60 text-blue-400 border border-blue-900/40">NEW PLAN</span>
                <ArrowRight className="w-3 h-3 text-slate-600" />
                <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-900/40">SUCCESS</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
