import React from 'react';
import {
  X,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Play,
  Brain,
  Shield,
  RefreshCw,
  Cpu,
} from 'lucide-react';

interface LandingHeroModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunDemo: () => void;
}

export const LandingHeroModal: React.FC<LandingHeroModalProps> = ({
  isOpen,
  onClose,
  onRunDemo,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[90vh] rounded-2xl bg-[#0D1322] border border-cyan-500/30 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 font-mono font-black text-cyan-400">
              SAM
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                Self-operating AI Manager
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Built for the Agentic AI Hackathon
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300">
          {/* Main Hero Hook */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>THE AGENTIC PARADIGM SHIFT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Don’t just ask AI. <span className="text-cyan-400">Give it a goal.</span>
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed font-sans">
              SAM plans, acts, evaluates, adapts, and verifies — turning high-level objectives into completed, verified work through an autonomous digital operator loop.
            </p>
          </div>

          {/* Architectural Comparison Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Traditional Chatbot */}
            <div className="p-5 rounded-xl bg-slate-950/60 border border-rose-950/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-rose-400 font-mono font-bold text-xs mb-3">
                  <XCircle className="w-4 h-4" />
                  <span>TRADITIONAL AI CHATBOT</span>
                </div>
                <div className="font-mono text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 mb-3">
                  USER → PROMPT → TEXT ANSWER
                </div>
                <ul className="space-y-2 text-xs text-slate-400 font-sans">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400">✕</span>
                    <span>Passive conversational answering only</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400">✕</span>
                    <span>Forces user to manually coordinate every sub-step</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400">✕</span>
                    <span>Crashes or fabricates hallucinations on API error</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400">✕</span>
                    <span>No closed-loop verification or mathematical safety</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* SAM Autonomous Operator */}
            <div className="p-5 rounded-xl bg-cyan-950/20 border border-cyan-500/40 ring-1 ring-cyan-500/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-cyan-300 font-mono font-bold text-xs mb-3">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>SAM: SELF-OPERATING AI MANAGER</span>
                </div>
                <div className="font-mono text-[11px] text-cyan-300 bg-cyan-950/60 p-2.5 rounded-lg border border-cyan-800/60 mb-3 leading-snug">
                  GOAL → PLAN → TOOLS → ACT → OBSERVE → EVALUATE → ADAPT → VERIFY
                </div>
                <ul className="space-y-2 text-xs text-slate-200 font-sans">
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">✓</span>
                    <span>Autonomous multi-step goal execution with dependencies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">✓</span>
                    <span>Transparent tool selection with explicit "Why this tool?"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">✓</span>
                    <span>Self-healing adaptation when external APIs return errors</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">✓</span>
                    <span>Sandboxed code execution + Human-in-the-loop safety gate</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Hackathon Judging Highlights */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
              Hackathon Evaluation Checklist:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>OBSERVE Constraints</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>DECIDE & Select Tools</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>ACT with Telemetry</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>EVALUATE Success Criteria</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>ADAPT & Self-Heal</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>VERIFY Final Deliverable</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition cursor-pointer"
          >
            Explore Dashboard
          </button>

          <button
            onClick={() => {
              onClose();
              onRunDemo();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold font-mono transition cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Launch Hackathon Demo (1-Click)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
