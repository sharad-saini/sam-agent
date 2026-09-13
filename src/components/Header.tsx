import React from 'react';
import {
  Play,
  RotateCcw,
  History,
  Settings,
  ShieldCheck,
  Zap,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import type { AgentWorkflowStage, AgentDetailedState } from '../types';

interface HeaderProps {
  stage: AgentWorkflowStage;
  detailedState?: AgentDetailedState;
  isExecuting: boolean;
  onRunDemo: () => void;
  onNewTask: () => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onOpenStory: () => void;
  onOpenTests: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  stage,
  detailedState,
  isExecuting,
  onRunDemo,
  onNewTask,
  onOpenHistory,
  onOpenSettings,
  onOpenStory,
  onOpenTests,
}) => {
  const getStatusBadge = () => {
    if (detailedState === 'WAITING_FOR_APPROVAL') {
      return (
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs font-mono font-semibold animate-pulse">
          <AlertTriangle className="w-3 h-3 text-rose-400" />
          WAITING FOR APPROVAL
        </div>
      );
    }
    if (detailedState === 'VERIFYING') {
      return (
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/50 text-teal-300 text-xs font-mono">
          <ShieldCheck className="w-3 h-3 text-teal-400" />
          VERIFYING AUDIT CHECKS
        </div>
      );
    }
    if (detailedState === 'REPLANNING' || detailedState === 'ADAPTING') {
      return (
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-mono animate-pulse">
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          ADAPTING &amp; RE-PLANNING
        </div>
      );
    }
    switch (stage) {
      case 'IDLE':
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            AGENT READY
          </div>
        );
      case 'OBSERVE':
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
            <Loader2 className="w-3 h-3 animate-spin" />
            OBSERVING GOAL
          </div>
        );
      case 'DECIDE':
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono">
            <Zap className="w-3 h-3 animate-bounce" />
            PLANNING & DECIDING
          </div>
        );
      case 'ACT':
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono">
            <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
            EXECUTING TOOLS
          </div>
        );
      case 'EVALUATE':
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono">
            <ShieldCheck className="w-3 h-3 animate-pulse" />
            EVALUATING RESULT
          </div>
        );
      case 'ADAPT':
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/40 text-rose-400 text-xs font-mono animate-pulse">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            RE-PLANNING & ADAPTING
          </div>
        );
      case 'VERIFY':
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-mono">
            <ShieldCheck className="w-3 h-3 text-teal-400" />
            VERIFYING GOAL
          </div>
        );
      case 'COMPLETED':
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            GOAL COMPLETED
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0B101B]/95 backdrop-blur px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
      {/* Brand & Tagline */}
      <div className="flex items-center gap-3.5">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 shadow-inner">
          <span className="font-mono font-black text-cyan-400 tracking-tighter text-lg">SAM</span>
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-bold text-slate-100 text-base tracking-tight font-sans">
              SAM
            </h1>
            <span className="hidden sm:inline-block text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60 font-mono">
              Self-operating AI Manager
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            Autonomous Goal Execution & Adaptation Core
          </p>
        </div>
      </div>

      {/* Live Status Indicator */}
      <div className="flex items-center gap-3">
        {getStatusBadge()}
      </div>

      {/* Quick Action Navigation */}
      <div className="flex items-center gap-2">
        <button
          id="btn-run-demo"
          onClick={onRunDemo}
          disabled={isExecuting}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 text-xs font-semibold tracking-wide transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400" />
          <span>Run Hackathon Demo</span>
        </button>

        <button
          id="btn-new-task"
          onClick={onNewTask}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-slate-100 text-xs font-medium transition cursor-pointer"
          title="Reset & Enter New Goal"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden md:inline">New Goal</span>
        </button>

        <button
          id="btn-story"
          onClick={onOpenStory}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-slate-100 text-xs font-medium transition cursor-pointer"
          title="View Agentic Story & Comparison"
        >
          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden lg:inline">Agent Story</span>
        </button>

        <button
          id="btn-tests"
          onClick={onOpenTests}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-700/60 text-cyan-300 hover:text-cyan-200 text-xs font-medium transition cursor-pointer"
          title="Run Automated Compliance Tests"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Tests</span>
        </button>

        <button
          id="btn-history"
          onClick={onOpenHistory}
          className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-400 hover:text-slate-200 transition cursor-pointer"
          title="View Past Task Runs"
        >
          <History className="w-4 h-4" />
        </button>

        <button
          id="btn-settings"
          onClick={onOpenSettings}
          className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-400 hover:text-slate-200 transition cursor-pointer"
          title="Configure Autonomy & Tools"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
