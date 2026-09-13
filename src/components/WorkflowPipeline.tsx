import React from 'react';
import {
  Eye,
  Brain,
  Cpu,
  CheckSquare,
  RefreshCw,
  ShieldCheck,
  CheckCircle,
  AlertOctagon,
  ArrowRight,
} from 'lucide-react';
import type { AgentWorkflowStage } from '../types';

interface WorkflowPipelineProps {
  currentStage: AgentWorkflowStage;
  hasAdapted: boolean;
  activeTaskId?: string | null;
  retriesCount: number;
}

export const WorkflowPipeline: React.FC<WorkflowPipelineProps> = ({
  currentStage,
  hasAdapted,
  activeTaskId,
  retriesCount,
}) => {
  const stages: {
    id: AgentWorkflowStage;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
  }[] = [
    {
      id: 'OBSERVE',
      label: 'OBSERVE',
      description: 'Perceive constraints & criteria',
      icon: Eye,
      accentColor: 'border-cyan-500 text-cyan-400 bg-cyan-500/10',
    },
    {
      id: 'DECIDE',
      label: 'DECIDE',
      description: 'Plan & select specialized tools',
      icon: Brain,
      accentColor: 'border-blue-500 text-blue-400 bg-blue-500/10',
    },
    {
      id: 'ACT',
      label: 'ACT',
      description: 'Execute tool actions',
      icon: Cpu,
      accentColor: 'border-amber-500 text-amber-400 bg-amber-500/10',
    },
    {
      id: 'EVALUATE',
      label: 'EVALUATE',
      description: 'Assess outcome against criteria',
      icon: CheckSquare,
      accentColor: 'border-purple-500 text-purple-400 bg-purple-500/10',
    },
    {
      id: 'ADAPT',
      label: 'ADAPT',
      description: 'Triage failure & self-heal plan',
      icon: RefreshCw,
      accentColor: 'border-rose-500 text-rose-400 bg-rose-500/10',
    },
    {
      id: 'VERIFY',
      label: 'VERIFY',
      description: 'Audit full goal completion',
      icon: ShieldCheck,
      accentColor: 'border-teal-500 text-teal-400 bg-teal-500/10',
    },
  ];

  const stageOrder: AgentWorkflowStage[] = [
    'OBSERVE',
    'DECIDE',
    'ACT',
    'EVALUATE',
    'ADAPT',
    'VERIFY',
    'COMPLETED',
  ];

  const currentIdx = stageOrder.indexOf(currentStage);

  return (
    <div className="w-full bg-[#0E1526]/90 border border-slate-800/90 rounded-2xl p-4 lg:p-5 shadow-sm">
      {/* Title & Loop Definition */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono">
            Autonomous Operational Pipeline
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 font-mono">
            O-D-A-E-A-V LOOP
          </span>
        </div>
        {hasAdapted && (
          <div className="flex items-center gap-2 text-xs font-mono text-rose-400 bg-rose-950/40 border border-rose-800/60 px-2.5 py-1 rounded-full animate-pulse">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
            <span>Autonomous Self-Healing Triggered ({retriesCount} Adaptation)</span>
          </div>
        )}
      </div>

      {/* Main Pipeline Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isActive = currentStage === stage.id;
          const isPassed = currentIdx > idx;
          const isCurrentOrPassed = isActive || isPassed;

          return (
            <div
              key={stage.id}
              className={`relative flex flex-col p-3 rounded-xl border transition-all duration-300 ${
                isActive
                  ? `${stage.accentColor} shadow-[0_0_15px_rgba(34,211,238,0.15)] ring-1 ring-cyan-400/40 scale-[1.02]`
                  : isPassed
                  ? 'bg-slate-900/80 border-slate-700/80 text-slate-300'
                  : 'bg-slate-950/50 border-slate-800/60 text-slate-500 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-semibold tracking-wider text-slate-400">
                  STEP 0{idx + 1}
                </span>
                <div
                  className={`p-1.5 rounded-lg ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : isPassed
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-slate-800/60 text-slate-500'
                  }`}
                >
                  {isPassed ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'animate-pulse' : ''}`} />
                  )}
                </div>
              </div>

              <div className="font-mono text-xs font-bold tracking-tight mb-0.5">
                {stage.label}
              </div>
              <div className="text-[11px] text-slate-400 leading-tight">
                {stage.description}
              </div>

              {/* Active Indicator Pulse */}
              {isActive && (
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-ping" />
              )}
            </div>
          );
        })}
      </div>

      {/* Adaptation Visual Flow Highlight */}
      {hasAdapted && (
        <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs font-mono bg-rose-950/20 p-2.5 rounded-xl border border-rose-900/30">
          <span className="font-bold text-rose-300 flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-rose-400 animate-spin" />
            Active Adaptation Path:
          </span>
          <div className="flex items-center gap-1.5 text-slate-300 flex-wrap">
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">ACT</span>
            <ArrowRight className="w-3 h-3 text-slate-500" />
            <span className="px-2 py-0.5 rounded bg-rose-950/80 border border-rose-800 text-rose-300 font-bold">
              FAILED (HTTP 429)
            </span>
            <ArrowRight className="w-3 h-3 text-slate-500" />
            <span className="px-2 py-0.5 rounded bg-purple-950/80 border border-purple-800 text-purple-300">
              EVALUATE
            </span>
            <ArrowRight className="w-3 h-3 text-slate-500" />
            <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800 text-amber-300 font-bold">
              ADAPT (Fallback Strategy)
            </span>
            <ArrowRight className="w-3 h-3 text-slate-500" />
            <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-bold">
              SUCCESS
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
